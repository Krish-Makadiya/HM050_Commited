
import { db } from "./config/firebase.js";

const debugPortfolio = async () => {
    console.log("Debugging Portfolio Data...");
    try {
        // Fetch all users
        const usersSnapshot = await db.collection("users").get();
        console.log(`Found ${usersSnapshot.size} users.`);

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();

            // Fetch workExperience subcollection
            const expSnapshot = await db.collection("users").doc(userId).collection("workExperience").get();

            if (!expSnapshot.empty) {
                console.log(`\nUser: ${userData.firstName} ${userData.lastName} (${userId})`);
                console.log(`- Has ${expSnapshot.size} verified portfolio entries.`);
                expSnapshot.docs.forEach(doc => {
                    console.log(`  > [${doc.id}] ${doc.data().jobTitle} (Status: ${doc.data().status})`);
                });
            }
        }
    } catch (error) {
        console.error("Debug failed:", error);
    }
};

debugPortfolio();
