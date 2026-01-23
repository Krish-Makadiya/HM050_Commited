import { Router } from "express";
import {
    getUserProfileController,
    onboardingController,
    userProfileController,
    getWorkExperienceController,
} from "../controllers/user.controller.js";

const router = Router();

router.post("/onboarding", onboardingController);
router.post("/user-profile", userProfileController);
router.get("/user-profile/:clerkId", getUserProfileController);
router.get("/work-experience/:clerkId", getWorkExperienceController);

export default router;
