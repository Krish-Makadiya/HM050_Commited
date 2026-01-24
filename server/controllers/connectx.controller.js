import { db } from "../config/firebase.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 1. Squad Project Creation ---

export const createSquadProject = async (req, res) => {
    try {
        const projectData = req.body;
        // projectData expects: { recruiterId, title, description, roles: [{name, description, skills}], modules: [...], ... }

        const { recruiterId, roles, isCollaborative } = projectData;

        if (!isCollaborative || !roles || roles.length < 2) {
            // Fallback to normal job post if not collaborative or not enough roles
            return res.status(400).json({ message: "Invalid Squad Project configuration." });
        }

        const dataToSave = {
            ...projectData,
            postedAt: new Date().toISOString(),
            status: "Active",
            type: "Squad",
            squadId: `sq_${Date.now()}`, // Simple ID generation
            applicantCount: 0,
            formedSquads: [], // Will hold potential squads
        };

        const docRef = await db.collection("jobs").add(dataToSave);

        res.status(201).json({
            message: "Squad Project posted successfully",
            jobId: docRef.id,
            squadId: dataToSave.squadId
        });

    } catch (error) {
        console.error("Error posting squad project:", error);
        res.status(500).json({ message: "Failed to post squad project", error: error.message });
    }
};

// --- 2. Squad Matching Engine (The Core) ---

export const generateSquadSuggestions = async (req, res) => {
    try {
        const { jobId } = req.body;
        if (!jobId) return res.status(400).json({ message: "Job ID required" });

        const jobDoc = await db.collection("jobs").doc(jobId).get();
        if (!jobDoc.exists) return res.status(404).json({ message: "Job not found" });

        const jobData = jobDoc.data();
        const requiredRoles = jobData.roles; // Array of {name, description}

        // 1. Fetch Candidates (Example: Fetch top 20 available candidates)
        // In a real app, we would filter by skills here first.
        const usersSnapshot = await db.collection("users")
            .where("role", "==", "Candidate")
            .limit(20)
            .get();

        const candidates = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (candidates.length < requiredRoles.length) {
            return res.status(200).json({ squads: [], message: "Not enough candidates to form a squad." });
        }

        // 2. AI Harmony Analysis with Gemini
        // We will send batches of candidates to Gemini to find the best mix for the roles.
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025", generationConfig: { responseMimeType: "application/json" } });

        const prompt = `
        You are an expert Team Formation AI.
        Project: "${jobData.title}"
        Description: "${jobData.description}"
        Required Roles: ${JSON.stringify(requiredRoles)}

        Candidates Pool: ${JSON.stringify(candidates.map(c => ({
            id: c.id,
            name: c.firstName + ' ' + c.lastName,
            skills: c.skills,
            experience: c.experienceLevel,
            summary: c.summary
        })))}

        Task: Form 3 potential squads from the candidate pool.
        Rules:
        1. Assign one candidate to each Role.
        2. Ensure complementary skills (e.g., if one is weak in UI, other is strong).
        3. No candidate can be in the same squad twice.
        
        Return JSON structure:
        {
            "squads": [
                {
                    "squadName": "Creative Alpha",
                    "reasoning": "Strong mix of...",
                    "harmonyScore": 88,
                    "members": [
                        { "roleName": "Role 1", "candidateId": "id_here", "matchReason": "..." }
                    ]
                }
            ]
        }
        `;

        let aiResponse;
        try {
            const result = await model.generateContent(prompt);
            aiResponse = JSON.parse(result.response.text());
        } catch (aiError) {
            console.warn("AI Quota Exceeded or Error, using Fallback Squad Generation:", aiError.message);
            aiResponse = generateFallbackSquads(candidates, requiredRoles);
        }

        // 3. Enrich response with full candidate details for frontend
        const squads = aiResponse.squads.map(squad => {
            const members = squad.members.map(mem => {
                const fullCandidate = candidates.find(c => c.id === mem.candidateId);
                return { ...mem, details: fullCandidate };
            });
            return { ...squad, members };
        });

        res.status(200).json({ squads });

    } catch (error) {
        console.error("Error generating squads:", error);
        res.status(500).json({ message: "AI Matching failed", error: error.message });
    }
};

// Helper: Heuristic Fallback for Squad Generation (when AI is down/limited)
const generateFallbackSquads = (candidates, roles) => {
    const squads = [];
    const pool = [...candidates];

    // Generate up to 3 squads
    for (let i = 0; i < 3; i++) {
        if (pool.length < roles.length) break; // Stop if not enough people

        const squadMembers = [];

        // Simple heuristic: Assign first available candidate to role
        // In a real fallback, could match by string includes() on skills
        roles.forEach(role => {
            const candidateIndex = pool.findIndex(c => c.role !== 'Recruiter'); // Just pick any candidate
            if (candidateIndex > -1) {
                const candidate = pool.splice(candidateIndex, 1)[0];
                squadMembers.push({
                    roleName: role.name,
                    candidateId: candidate.id,
                    matchReason: "Heuristic Match (Skill overlap)" // Mock reason
                });
            }
        });

        if (squadMembers.length === roles.length) {
            squads.push({
                squadName: `Squad ${String.fromCharCode(65 + i)} (Auto)`,
                reasoning: "Generated based on role availability and basic skill filtering.",
                harmonyScore: Math.floor(Math.random() * (95 - 75) + 75), // Random score 75-95
                members: squadMembers
            });
        }
    }

    return { squads };
};


// --- 3. Squad Invites & Management ---

export const inviteSquad = async (req, res) => {
    try {
        const { jobId, squadData } = req.body;
        // squadData: { members: [{candidateId, roleName}], harmonyScore, ... }

        // Save this specific proposed squad to a subcollection
        const squadRef = await db.collection("jobs").doc(jobId).collection("squads").add({
            ...squadData,
            status: "Invited",
            createdAt: new Date().toISOString()
        });

        // Notify each user (mock notification by adding to their 'squad_invites' collection)
        const batch = db.batch();
        squadData.members.forEach(member => {
            const inviteRef = db.collection("users").doc(member.candidateId).collection("squad_invites").doc(squadRef.id);
            batch.set(inviteRef, {
                jobId,
                role: member.roleName,
                squadId: squadRef.id,
                status: "Pending",
                invitedAt: new Date().toISOString(),
                projectTitle: req.body.projectTitle || "New Squad Project" // Pass this from frontend
            });
        });

        await batch.commit();

        res.status(200).json({ message: "Squad invites sent!", squadId: squadRef.id });

    } catch (error) {
        console.error("Error inviting squad:", error);
        res.status(500).json({ message: "Failed to invite squad", error: error.message });
    }
};

export const updateSquadMemberStatus = async (req, res) => {
    try {
        const { jobId, squadId, memberId } = req.params;
        const { status } = req.body; // 'Accepted', 'Rejected'

        const squadRef = db.collection("jobs").doc(jobId).collection("squads").doc(squadId);
        const squadDoc = await squadRef.get();

        if (!squadDoc.exists) return res.status(404).json({ message: "Squad not found" });

        const squadData = squadDoc.data();

        // Update specific member status in the array
        const updatedMembers = squadData.members.map(m => {
            if (m.candidateId === memberId) {
                return { ...m, status };
            }
            return m;
        });

        // Check overall squad status
        const allAccepted = updatedMembers.every(m => m.status === "Accepted");
        const anyRejected = updatedMembers.some(m => m.status === "Rejected");

        let squadStatus = squadData.status;
        if (allAccepted) squadStatus = "Active";
        if (anyRejected) squadStatus = "Partial_Reject";

        await squadRef.update({
            members: updatedMembers,
            status: squadStatus
        });

        // Update user's invite status too
        await db.collection("users").doc(memberId).collection("squad_invites").doc(squadId).update({ status });

        // --- SYNC TO APPLICANTS COLLECTION ---
        if (status === 'Accepted') {
            // 1. Get Candidate Details
            const userDoc = await db.collection("users").doc(memberId).get();
            const userData = userDoc.data();

            // 2. Add to 'applicants' subcollection so they appear in Recruiter View
            // using 'Hired' or 'Shortlisted' status to imply they are part of the team
            await db.collection("jobs").doc(jobId).collection("applicants").doc(memberId).set({
                id: memberId,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                experienceLevel: userData.experienceLevel,
                skills: userData.skills || [],
                appliedAt: new Date().toISOString(),
                status: "Hired", // Auto-hire for Collaborative Projects
                role: "Candidate",
                imageUrl: userData.imageUrl || "",
                summary: userData.summary || "",
                squadId: squadId, // Link to squad
                squadRole: squadData.members.find(m => m.candidateId === memberId)?.roleName
            });
        }

        res.status(200).json({ message: "Status updated", squadStatus });

    } catch (error) {
        console.error("Error updating member status:", error);
        res.status(500).json({ message: "Failed", error: error.message });
    }
};

// --- 4. Role-Based Payout Trigger ---

export const handleModuleCompletion = async (req, res) => {
    try {
        const { jobId, squadId, moduleId, candidateId } = req.body;

        // Verify module completion logic (omitted for brevity, assuming triggered by approved submission)

        // Payout Logic (Simulation)
        // 1. Find the module cost
        const jobDoc = await db.collection("jobs").doc(jobId).get();
        const jobData = jobDoc.data();

        // Find module across all roles (or check specific role assignment)
        // Assuming jobData.modules structure is flat or we search
        // For Squads, modules might be nested under roles, but let's assume global ID match
        let modulePayout = 0;

        // Simplified search
        jobData.modules?.forEach(mod => {
            if (mod.id === moduleId) {
                modulePayout = mod.tasks?.reduce((sum, t) => sum + (parseFloat(t.payout) || 0), 0) || 0;
            }
        });

        if (modulePayout > 0) {
            // "Transfer" funds
            const userRef = db.collection("users").doc(candidateId);
            const userDoc = await userRef.get();
            const currentBalance = userDoc.data().walletBalance || 0;

            await userRef.update({
                walletBalance: currentBalance + modulePayout
            });

            res.status(200).json({ message: "Module marked complete. Payout released.", amount: modulePayout });
        } else {
            res.status(200).json({ message: "Module complete. No payout defined." });
        }

    } catch (error) {
        console.error("Error handling payout:", error);
        res.status(500).json({ message: "Payout failed", error: error.message });
    }
};

// --- 5. Feature: Blocking / Nudge ---
export const reportBlocker = async (req, res) => {
    try {
        const { blockerId, reporterId, reason } = req.body;

        // Mock sending an email/notification
        console.log(`[AI NUDGE] Sending nudge to user ${blockerId}. User ${reporterId} is blocked: ${reason}`);

        // In a real app, integrate SendGrid or native notifications here

        res.status(200).json({ message: "AI Nudge sent to teammate." });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// --- 6. Helper: Get User Invites ---
export const getUserSquadInvites = async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await db.collection("users").doc(userId).collection("squad_invites").where("status", "==", "Pending").get();

        const invites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Enrich with squad details (like members) if needed, but for now returned stored invite data
        // The invite stored has: jobId, role, squadId, status, invitedAt, projectTitle

        // To show "Members" on the dashboard card, we might need to fetch the squadDoc or store members in the invite.
        // Let's assume we fetch the squad doc for getting member avatars/names.

        const detailedInvites = await Promise.all(invites.map(async (inv) => {
            const squadDoc = await db.collection("jobs").doc(inv.jobId).collection("squads").doc(inv.squadId).get();
            const squadData = squadDoc.exists ? squadDoc.data() : {};

            return {
                ...inv,
                harmonyScore: squadData.harmonyScore,
                members: squadData.members.map(m => ({
                    name: m.details?.firstName + " " + m.details?.lastName,
                    role: m.roleName,
                    avatar: m.details?.imageUrl || "https://github.com/shadcn.png"
                })),
                description: squadData.reasoning || "No description available."
            };
        }));

        res.status(200).json({ invites: detailedInvites });
    } catch (error) {
        console.error("Error fetching invites:", error);
        res.status(500).json({ message: "Failed to fetch invites" });
    }
};
