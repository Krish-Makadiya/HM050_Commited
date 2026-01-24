import express from "express";
import {
    createSquadProject,
    generateSquadSuggestions,
    inviteSquad,
    updateSquadMemberStatus,
    handleModuleCompletion,
    reportBlocker,
    getUserSquadInvites
} from "../controllers/connectx.controller.js";

import { generateRoleBasedJobDetails } from "../controllers/geminiController.js";

const router = express.Router();

router.post("/create-project", createSquadProject);
router.post("/generate-squads", generateSquadSuggestions);
router.post("/invite", inviteSquad);
router.post("/squads/:jobId/:squadId/members/:memberId/status", updateSquadMemberStatus);
router.post("/module-complete", handleModuleCompletion);
router.post("/report-blocker", reportBlocker);
router.get("/user-invites/:userId", getUserSquadInvites);

// AI Helper Route specific to Squads
router.post("/ai/plan", generateRoleBasedJobDetails);

export default router;
