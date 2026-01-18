import { db } from "../config/firebase.js";

export const onboardingController = async (req, res) => {
    try {
        const {
            role,
            experienceLevel,
            jobTypes,
            skills,
            companies,
            countries,
            clerkId,
            firstName,
            lastName,
            email,
            imageUrl,
        } = req.body;

        if (!clerkId) {
            return res.status(400).json({ message: "Clerk ID is required" });
        }

        await db.collection("users").doc(clerkId).set(
            {
                role,
                experienceLevel,
                jobTypes,
                skills,
                companies,
                countries,
                firstName,
                lastName,
                email,
                imageUrl,
            },
            { merge: true },
        );

        console.log("Onboarding Data:", {
            role,
            experienceLevel,
            firstName,
            lastName,
            email,
        });
        res.json({ message: "User onboarding successful" });
    } catch (error) {
        console.error("Error in onboarding:", error);
        res.status(500).json({ message: "Onboarding failed" });
    }
};

export const userProfileController = async (req, res) => {
    try {
        const data = req.body;
        const { clerkId } = data;

        if (!clerkId) {
            return res.status(400).json({ message: "Clerk ID is required" });
        }

        console.log("Saving User Profile Data for:", clerkId);

        // Save to Firestore 'users' collection with clerkId as document ID
        await db.collection("users").doc(clerkId).set(data, { merge: true });

        res.status(200).json({
            message: "User profile updated successfully",
            data: data,
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({
            message: "Failed to update user profile",
            error: error.message,
        });
    }
};

export const getUserProfileController = async (req, res) => {
    try {
        const { clerkId } = req.params;

        if (!clerkId) {
            return res.status(400).json({ message: "Clerk ID is required" });
        }

        const userDoc = await db.collection("users").doc(clerkId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: "User profile not found" });
        }

        res.status(200).json(userDoc.data());
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({
            message: "Failed to fetch user profile",
            error: error.message,
        });
    }
};
