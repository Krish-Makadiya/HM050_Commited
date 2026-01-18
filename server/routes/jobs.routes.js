import { Router } from "express";
import {
    getAllJobs,
    saveJobController,
    getSavedJobs,
    getPassedJobs,
    batchJobActions,
    postJobController,
    getRecruiterJobs,
    updateJobController,
    getAllAvailableJobs,
    applyJobController,
    getJobApplicantsController,
    updateApplicantStatusController,
    getCandidateApplicationsController,
    submitWorkController,
    analyzeSubmissionController,
} from "../controllers/jobs.controller.js";

const router = Router();

router.post("/post", postJobController);
router.post("/apply", applyJobController);
router.post("/submit-work", submitWorkController);
router.post("/update", updateJobController);
router.get("/posted/:recruiterId", getRecruiterJobs);
router.get("/feed/:clerkId", getAllAvailableJobs);
router.get("/:jobId/applicants", getJobApplicantsController);
router.patch(
    "/:jobId/applicants/:applicantId/analyze",
    analyzeSubmissionController,
);
router.patch(
    "/:jobId/applicants/:applicantId",
    updateApplicantStatusController,
);
router.get("/applications/:userId", getCandidateApplicationsController);
router.get("/:clerkId", getAllJobs);

router.post("/save-job/:clerkId", saveJobController);
router.post("/batch-actions/:clerkId", batchJobActions);
router.get("/saved-jobs/:clerkId", getSavedJobs);
router.get("/passed-jobs/:clerkId", getPassedJobs);

export default router;
