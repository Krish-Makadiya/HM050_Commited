import { db } from "./config/firebase.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const backfillPortfolio = async () => {
    console.log("Starting Portfolio Backfill (Robust Mode)...");

    try {
        const jobsSnapshot = await db.collection("jobs").get();

        for (const jobDoc of jobsSnapshot.docs) {
            const jobData = jobDoc.data();
            const jobId = jobDoc.id;
            const allTasks = jobData.tasks || [];

            if (allTasks.length === 0) continue;

            const applicantsSnapshot = await db.collection("jobs").doc(jobId).collection("applicants").get();

            for (const applicantDoc of applicantsSnapshot.docs) {
                const applicantId = applicantDoc.id;
                const applicantData = applicantDoc.data();
                const taskProgress = applicantData.taskProgress || {};

                // Check if ALL tasks are verified
                let allVerified = true;
                for (let i = 0; i < allTasks.length; i++) {
                    const taskStatus = taskProgress[i]?.status;
                    // Robust check for different casing or terms used
                    if (taskStatus !== "verified" && taskStatus !== "Accepted") {
                        allVerified = false;
                        break;
                    }
                }

                if (allVerified) {
                    console.log(`Found fully verified candidate: ${applicantId} for Job: ${jobData.title}`);

                    // NEW: Ensure status is Completed if not already
                    if (applicantData.status !== "Completed") {
                        console.log(" - Updating status to Completed...");
                        await db.collection("jobs").doc(jobId).collection("applicants").doc(applicantId).update({
                            status: "Completed",
                            completedAt: new Date().toISOString()
                        });
                    }

                    // Check if Work Experience already exists (Robust ID check)
                    const workExpId = `exp_${jobId}`;
                    const expDoc = await db.collection("users").doc(applicantId).collection("workExperience").doc(workExpId).get();

                    if (expDoc.exists) {
                        console.log(" - Portfolio entry already exists. Skipping.");
                        continue;
                    }

                    console.log(" - Generating missing Portfolio Entry...");

                    // Generate AI Content
                    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                    const model = genAI.getGenerativeModel({
                        model: "gemini-2.0-flash", // Using 2.0 as requested
                        generationConfig: { responseMimeType: "application/json" },
                    });

                    const tasksSummary = allTasks.map((t, i) => `Task ${i + 1}: ${t.description || t.title || "Task"}`).join("\n");
                    const projectBrief = `
                        Project Title: ${jobData.title}
                        Description: ${jobData.description}
                        Tasks Completed:
                        ${tasksSummary}
                        Tech Stack: ${jobData.skills ? jobData.skills.join(", ") : "N/A"}
                    `;

                    const prompt = `
                        You are a Senior Technical Recruiter. Analyze this finalized project brief and the developer's solution. 
                        Generate a JSON object with:
                        - abstract: A 2-sentence summary for non-technical HR managers.
                        - breakdown: A detailed technical summary of the architecture and stack used.
                        - tags: An array of technical skill tags.
                        
                        STRICT PRIVACY RULE: You must anonymize the output. Remove all company names, private repository links, internal project IDs, and sensitive business logic. Focus purely on technical achievement.

                        Project Brief:
                        ${projectBrief}
                    `;

                    let aiWorkData = {
                        abstract: "Verified project implementation demonstrating full stack proficiency.",
                        breakdown: "Implemented core features including authentication, database integration, and UI responsiveness. deployed successfully.",
                        tags: ["React", "Node.js", "Firebase", "Full Stack"]
                    };

                    try {
                        console.log(" - Calling Gemini...");
                        const result = await model.generateContent(prompt);
                        const responseText = result.response.text();
                        try {
                            aiWorkData = JSON.parse(responseText);
                        } catch (e) {
                            console.error(" - JSON Parse Failed, using fallback.");
                        }
                    } catch (err) {
                        console.error(" - AI Generation failed:", err.message);
                        console.log(" - Using fallback content.");
                    }

                    // Save to Firestore with deterministic ID
                    const workExperienceEntry = {
                        proofId: `proof_${jobId}_${Date.now()}`,
                        jobId: jobId, // Reference
                        jobTitle: jobData.title,
                        aiScore: applicantData.aiScore || 85,
                        verifiedDate: new Date().toISOString(),
                        status: "Verified by FairLink AI",
                        content: {
                            abstract: aiWorkData.abstract,
                            breakdown: aiWorkData.breakdown,
                            tags: aiWorkData.tags
                        }
                    };

                    console.log(` - Writing to users/${applicantId}/workExperience/${workExpId}`);
                    await db.collection("users").doc(applicantId).collection("workExperience").doc(workExpId).set(workExperienceEntry);
                    console.log(" - Success! Entry created.");
                }
            }
        }
        console.log("Backfill complete.");
    } catch (error) {
        console.error("Backfill failed:", error);
    }
};

backfillPortfolio();
