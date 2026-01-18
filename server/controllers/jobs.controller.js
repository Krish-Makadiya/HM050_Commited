import { db } from "../config/firebase.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const getAllJobs = async (req, res) => {
    try {
        const { clerkId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const countSnapshot = await db
            .collection("users")
            .doc(clerkId)
            .collection("job")
            .count()
            .get();
        const totalJobs = countSnapshot.data().count;

        const snapshot = await db
            .collection("users")
            .doc(clerkId)
            .collection("job")
            .orderBy("updatedAt", "desc")
            .limit(limit)
            .offset(offset)
            .get();

        const jobs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json({
            jobs,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalJobs / limit),
                totalJobs,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const saveJobController = async (req, res) => {
    try {
        const { clerkId } = req.params;
        let jobId = req.body.jobId || req.body.id;

        if (!jobId) {
            return res.status(400).json({ message: "Job ID is required" });
        }

        jobId = String(jobId);
        // In case the frontend sends more job details, we can spread them.
        // For now, we'll store the jobId and the timestamp.
        const jobData = {
            jobId,
            savedAt: new Date().toISOString(),
            ...req.body, // include other properties if sent
        };

        // Reference the specific job document in the 'saved_jobs' subcollection
        // Using set() with merge: true prevents overwriting if we just want to update,
        // but also creates if it doesn't exist. Using jobId as doc ID avoids duplicates directly.
        await db
            .collection("users")
            .doc(clerkId)
            .collection("saved_jobs")
            .doc(jobId)
            .set(jobData, { merge: true });

        // Remove from the main 'job' subcollection so it doesn't show up again
        await db
            .collection("users")
            .doc(clerkId)
            .collection("job")
            .doc(jobId)
            .delete();

        return res.status(200).json({ message: "Job saved successfully" });
    } catch (error) {
        console.error("Error saving job:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getSavedJobs = async (req, res) => {
    try {
        const { clerkId } = req.params;
        const snapshot = await db
            .collection("users")
            .doc(clerkId)
            .collection("saved_jobs")
            .orderBy("savedAt", "desc")
            .get();

        const savedJobs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json(savedJobs);
    } catch (error) {
        console.error("Error fetching saved jobs:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getPassedJobs = async (req, res) => {
    try {
        const { clerkId } = req.params;
        const snapshot = await db
            .collection("users")
            .doc(clerkId)
            .collection("passed_jobs")
            .orderBy("passedAt", "desc")
            .get();

        const passedJobs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json(passedJobs);
    } catch (error) {
        console.error("Error fetching passed jobs:", error);
        res.status(500).json({ message: error.message });
    }
};

export const batchJobActions = async (req, res) => {
    try {
        const { clerkId } = req.params;
        const { actions } = req.body; // Array of { jobId, action, jobData }

        if (!Array.isArray(actions) || actions.length === 0) {
            return res.status(200).json({ message: "No actions to process" });
        }

        const batch = db.batch();
        const userRef = db.collection("users").doc(clerkId);

        actions.forEach((item) => {
            const { jobId, action, jobData } = item;
            if (!jobId) return;

            // Define references
            const mainJobRef = userRef.collection("job").doc(jobId);

            if (action === "save") {
                const docRef = userRef.collection("saved_jobs").doc(jobId);
                const data = {
                    jobId,
                    savedAt: new Date().toISOString(),
                    ...jobData,
                };
                batch.set(docRef, data, { merge: true });
            } else if (action === "pass") {
                const docRef = userRef.collection("passed_jobs").doc(jobId);
                const data = {
                    jobId,
                    passedAt: new Date().toISOString(),
                    ...jobData, // Optional: store job data for passed jobs too
                };
                batch.set(docRef, data, { merge: true });
            }

            // Remove from the main 'jobs' subcollection so it doesn't show up again
            batch.delete(mainJobRef);
        });

        await batch.commit();

        res.status(200).json({ message: "Batch actions processing completed" });
    } catch (error) {
        console.error("Error processing batch actions:", error);
        res.status(500).json({ message: error.message });
    }
};

export const postJobController = async (req, res) => {
    try {
        const jobData = req.body;
        const { recruiterId, title, description, status } = jobData;

        if (!recruiterId || !title || !description) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Add server-side timestamp just in case
        const dataToSave = {
            ...jobData,
            postedAt: jobData.postedAt || new Date().toISOString(),
            createdAt: new Date().toISOString(),
            status: status || "Active", // Default to Active if not provided
            applicantCount: 0,
            applicants: [],
        };

        const docRef = await db.collection("jobs").add(dataToSave);

        res.status(201).json({
            message: "Job posted successfully",
            jobId: docRef.id,
        });
    } catch (error) {
        console.error("Error posting job:", error);
        res.status(500).json({
            message: "Failed to post job",
            error: error.message,
        });
    }
};

export const getRecruiterJobs = async (req, res) => {
    try {
        const { recruiterId } = req.params;
        console.log(recruiterId);
        if (!recruiterId) {
            return res
                .status(400)
                .json({ message: "Recruiter ID is required" });
        }

        const snapshot = await db
            .collection("jobs")
            .where("recruiterId", "==", recruiterId)
            // .orderBy("createdAt", "desc") // Requires index, doing in-memory sort for now
            .get();

        const jobs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // In-memory sort
        jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error fetching recruiter jobs:", error);
        res.status(500).json({
            message: "Failed to fetch jobs",
            error: error.message,
        });
    }
};

export const updateJobController = async (req, res) => {
    try {
        const { jobId, ...jobData } = req.body;

        if (!jobId) {
            return res
                .status(400)
                .json({ message: "Job ID is required for update" });
        }

        // Add server-side timestamp for update
        const dataToUpdate = {
            ...jobData,
            updatedAt: new Date().toISOString(),
        };

        await db.collection("jobs").doc(jobId).update(dataToUpdate);

        res.status(200).json({
            message: "Job updated successfully",
            jobId: jobId,
        });
    } catch (error) {
        console.error("Error updating job:", error);
        res.status(500).json({
            message: "Failed to update job",
            error: error.message,
        });
    }
};

export const getAllAvailableJobs = async (req, res) => {
    try {
        const { clerkId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // Fetch "Active" jobs from the global 'jobs' collection
        // Not filtering by clerkId strictly, but ideally we exclude the user's previously interacted jobs
        // For now, simpler implementation: Fetch all active jobs
        const snapshot = await db
            .collection("jobs")
            .where("status", "==", "Active")
            // .orderBy("createdAt", "desc") // May require index
            .limit(limit)
            .get();

        let jobs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Fetch company/recruiter details for each job
        const recruiterIds = [
            ...new Set(jobs.map((job) => job.recruiterId).filter(Boolean)),
        ];

        if (recruiterIds.length > 0) {
            const recruiterDocsPromise = recruiterIds.map((id) =>
                db.collection("users").doc(id).get(),
            );
            const recruiterDocs = await Promise.all(recruiterDocsPromise);

            const recruitersMap = {};
            recruiterDocs.forEach((doc) => {
                if (doc.exists) {
                    recruitersMap[doc.id] = doc.data();
                }
            });

            // Merge recruiter data into jobs
            jobs = jobs.map((job) => {
                const recruiter = recruitersMap[job.recruiterId];
                if (recruiter) {
                    return {
                        ...job,
                        companyName:
                            recruiter.companyName ||
                            `${recruiter.firstName || ""} ${recruiter.lastName || ""}`.trim() ||
                            job.companyName ||
                            "Confidential",
                        companyLogo:
                            recruiter.companyLogo ||
                            recruiter.imageUrl ||
                            job.companyLogo ||
                            "",
                        recruiterLocation: recruiter.location || "",
                        location:
                            job.location || recruiter.location || "Remote",
                        companyDetails: recruiter,
                    };
                }
                return job;
            });
        }

        // In-memory sort if needed, or rely on future index
        jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({ jobs });
    } catch (error) {
        console.error("Error fetching available jobs:", error);
        res.status(500).json({
            message: "Failed to fetch jobs",
            error: error.message,
        });
    }
};

export const applyJobController = async (req, res) => {
    try {
        const { jobId, userId } = req.body;

        if (!jobId || !userId) {
            return res
                .status(400)
                .json({ message: "Job ID and User ID are required" });
        }

        // 1. Fetch Candidate Profile (ensure latest data)
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: "User profile not found" });
        }
        const userData = userDoc.data();

        // 2. Add to Job's Applicants Subcollection
        const applicantRef = db
            .collection("jobs")
            .doc(jobId)
            .collection("applicants")
            .doc(userId);

        const applicationData = {
            candidateId: userId,
            appliedAt: new Date().toISOString(),
            status: "Applied", // Initial status
            // Snapshot of profile at time of application
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            imageUrl: userData.imageUrl || "",
            skills: userData.skills || [],
            experienceLevel: userData.experienceLevel || "",
            resumeUrl: userData.resume || "", // Assuming resume field
            ...userData, // include other fields if necessary
        };

        await applicantRef.set(applicationData, { merge: true });

        // 3. Record Application in User's Document (For MyProposals)
        await db
            .collection("users")
            .doc(userId)
            .collection("applied_jobs")
            .doc(jobId)
            .set(
                {
                    jobId,
                    appliedAt: new Date().toISOString(),
                },
                { merge: true },
            );

        // 4. Increment Applicant Count on Job Document
        const jobRef = db.collection("jobs").doc(jobId);
        const jobDoc = await jobRef.get();
        if (jobDoc.exists) {
            const currentCount = jobDoc.data().applicantCount || 0;
            await jobRef.update({ applicantCount: currentCount + 1 });
        }

        res.status(200).json({ message: "Application submitted successfully" });
    } catch (error) {
        console.error("Error applying for job:", error);
        res.status(500).json({
            message: "Failed to apply for job",
            error: error.message,
        });
    }
};

export const getJobApplicantsController = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Fetch Job Status
        const jobDoc = await db.collection("jobs").doc(jobId).get();
        const jobStatus = jobDoc.exists ? jobDoc.data().status : "Active";

        const snapshot = await db
            .collection("jobs")
            .doc(jobId)
            .collection("applicants")
            .orderBy("appliedAt", "desc") // May require index
            .get();

        const applicants = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json({ applicants, jobStatus });
    } catch (error) {
        console.error("Error fetching applicants:", error);
        res.status(500).json({
            message: "Failed to fetch applicants",
            error: error.message,
        });
    }
};

export const updateApplicantStatusController = async (req, res) => {
    try {
        const { jobId, applicantId } = req.params;
        const { status } = req.body; // e.g., "Shortlisted", "Rejected", "Round 2"

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        await db
            .collection("jobs")
            .doc(jobId)
            .collection("applicants")
            .doc(applicantId)
            .update({
                status: status,
                updatedAt: new Date().toISOString(),
            });

        res.status(200).json({
            message: `Applicant status updated to ${status}`,
        });
    } catch (error) {
        console.error("Error updating applicant status:", error);
        res.status(500).json({
            message: "Failed to update status",
            error: error.message,
        });
    }
};

export const getCandidateApplicationsController = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Get List of Applied Job IDs
        const appliedJobsSnapshot = await db
            .collection("users")
            .doc(userId)
            .collection("applied_jobs")
            .orderBy("appliedAt", "desc")
            .get();

        const applications = await Promise.all(
            appliedJobsSnapshot.docs.map(async (doc) => {
                const { jobId } = doc.data();

                // 2. Fetch Job Details (Title, Company, etc.)
                const jobDoc = await db.collection("jobs").doc(jobId).get();
                let jobData = {};
                if (jobDoc.exists) {
                    jobData = jobDoc.data();

                    // Fetch company/recruiter details if needed for company name
                    if (jobData.recruiterId) {
                        const recruiterDoc = await db
                            .collection("users")
                            .doc(jobData.recruiterId)
                            .get();
                        if (recruiterDoc.exists) {
                            const recruiter = recruiterDoc.data();
                            jobData.companyName =
                                recruiter.companyName ||
                                `${recruiter.firstName || ""} ${recruiter.lastName || ""}`.trim() ||
                                "Confidential";
                            jobData.companyLogo =
                                recruiter.companyLogo ||
                                recruiter.imageUrl ||
                                "";
                        }
                    }
                }

                // 3. Fetch Latest Application Status
                const applicantDoc = await db
                    .collection("jobs")
                    .doc(jobId)
                    .collection("applicants")
                    .doc(userId)
                    .get();

                const applicantData = applicantDoc.exists
                    ? applicantDoc.data()
                    : {};

                return {
                    id: jobId,
                    jobId,
                    projectTitle: jobData.title || "Unknown Project",
                    company: jobData.companyName || "Unknown Company",
                    sentDate: applicantData.appliedAt,
                    status: applicantData.status || "Applied",
                    bidAmount: jobData.budget || "N/A", // Showing budget as proxy for bid/project value
                    duration: jobData.timeline || "N/A",
                    jobStatus: jobData.status || "Active",
                    tasks: jobData.tasks || [],
                    userId: userId,
                };
            }),
        );

        res.status(200).json({ applications });
    } catch (error) {
        console.error("Error fetching candidate applications:", error);
        res.status(500).json({
            message: "Failed to fetch applications",
            error: error.message,
        });
    }
};

export const submitWorkController = async (req, res) => {
    try {
        const { jobId, userId, submissionLink, description } = req.body;

        if (!jobId || !userId || !submissionLink) {
            return res.status(400).json({
                message: "Job ID, User ID, and Submission Link are required",
            });
        }

        await db
            .collection("jobs")
            .doc(jobId)
            .collection("applicants")
            .doc(userId)
            .update({
                submissionLink,
                submissionDescription: description || "",
                submissionDate: new Date().toISOString(),
                status: "Work Submitted",
            });

        res.status(200).json({ message: "Work submitted successfully" });
    } catch (error) {
        console.error("Error submitting work:", error);
        res.status(500).json({
            message: "Failed to submit work",
            error: error.message,
        });
    }
};

export const analyzeSubmissionController = async (req, res) => {
    try {
        const { jobId, applicantId } = req.params;

        if (!jobId || !applicantId) {
            return res.status(400).json({ message: "Job ID and Applicant ID are required" });
        }

        // 1. Fetch Job and Applicant Data
        const jobRef = db.collection("jobs").doc(jobId);
        const applicantRef = jobRef.collection("applicants").doc(applicantId);

        const [jobDoc, applicantDoc] = await Promise.all([
            jobRef.get(),
            applicantRef.get()
        ]);

        if (!jobDoc.exists) return res.status(404).json({ message: "Job not found" });
        if (!applicantDoc.exists) return res.status(404).json({ message: "Applicant not found" });

        const jobData = jobDoc.data();
        const applicantData = applicantDoc.data();

        // 2. Prepare Gemini Prompt
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        You are an expert technical recruiter and lead designer. Analyze the provided project submission against the company's requirements.
        
        Job Title: ${jobData.title}
        Job Description: ${jobData.description}
        Skills Required: ${jobData.skills ? jobData.skills.join(", ") : "N/A"}

        Applicant Submission:
        Link: ${applicantData.submissionLink}
        Description: ${applicantData.submissionDescription}

        Evaluate for technical alignment, creativity, and adherence to timelines (if mentioned).
        
        Return a CLEAN JSON object with:
        - score: Integer (1-10)
        - summary: Exactly 2 sentences explaining the score.
        - pros: A list of 2 key strengths.
        `;

        // 3. Call Gemini
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const aiAnalysis = JSON.parse(responseText);

        // 4. Save to Firestore
        await applicantRef.update({
            aiScore: aiAnalysis.score,
            aiSummary: aiAnalysis.summary,
            aiPros: aiAnalysis.pros,
            aiAnalyzedAt: new Date().toISOString()
        });

        // 5. Respond
        res.status(200).json(aiAnalysis);

    } catch (error) {
        console.error("Error analyzing submission:", error);
        res.status(500).json({
            message: "AI Analysis failed",
            error: error.message
        });
    }
};