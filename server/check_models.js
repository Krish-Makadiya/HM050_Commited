import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function check() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        const names = data.models ? data.models.map(m => m.name) : [];
        fs.writeFileSync("models.json", JSON.stringify(names, null, 2));
        console.log("Written to models.json");
    } catch (e) { console.error(e); }
}
check();
