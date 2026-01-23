
import { db } from "./config/firebase.js";

const deepDebug = async () => {
    console.log("Starting Deep Debug...");
    try {
        const jobsSnapshot = await db.collection("jobs").get();
        console.log(`Total Jobs: ${jobsSnapshot.size}`);

        for (const jobDoc of jobsSnapshot.docs) {
            const jobData = jobDoc.data();
            const allTasks = jobData.tasks || [];
            if (allTasks.length === 0) continue;

            const applicantsSnapshot = await db.collection("jobs").doc(jobDoc.id).collection("applicants").get();

            applicantsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const progress = data.taskProgress || {};

                // Check verification manually
                let allVerified = true;
                const statusList = [];
                for (let i = 0; i < allTasks.length; i++) {
                    const s = progress[i]?.status;
                    statusList.push(s);
                    if (s !== "verified" && s !== "Accepted") allVerified = false;
                }

                if (allVerified) {
                    console.log(`[MATCH] User ${doc.id} on Job "${jobData.title}" IS fully verified.`);
                    console.log(`   - Statuses: ${JSON.stringify(statusList)}`);

                    // Check if entry exists
                    db.collection("users").doc(doc.id).collection("workExperience").get().then(snap => {
                        console.log(`   - WorkExp Docs found: ${snap.size}`);
                        if (snap.size > 0) {
                            snap.docs.forEach(d => console.log(`     -> ID: ${d.id}, RefJob: ${d.data().jobTitle}`));
                        } else {
                            console.log("   - WARNING: SHOULD EXIST BUT DOES NOT.");
                        }
                    });

                } else {
                    // console.log(`[Miss ] User ${doc.id} on Job "${jobData.title}" - Not verified. Statuses: ${JSON.stringify(statusList)}`);
                }
            });
        }
    } catch (e) {
        console.error(e);
    }
};

deepDebug();
