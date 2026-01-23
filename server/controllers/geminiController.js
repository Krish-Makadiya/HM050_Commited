import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateMilestones = async (req, res) => {
  try {
    const { projectIdea } = req.body;

    if (!projectIdea) {
      return res.status(400).json({ error: "Project idea is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
    const prompt = `You are an expert project manager and technical lead.
    A recruiter wants to build a project based on this idea: "${projectIdea}".
    Target audience: Non-technical recruiter looking for technical candidates.
    Goal: Generate a list of concrete technical project milestones to build this.
    
    Please provide a response in valid JSON format with the following structure:
    {
        "projectTitle": "Suggested specific title",
        "techStack": ["List", "of", "technologies"],
        "milestones": [
            {
                "title": "Milestone Title",
                "description": "Detailed description of what to do",
                "estimatedHours": "integer"
            }
        ]
    }
    Do not include markdown formatting (like \`\`\`json) in the response, just the raw JSON string.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Cleanup if markdown is present despite instructions
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let milestonesData;
    try {
      milestonesData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return res.status(500).json({ error: "Failed to parse API response" });
    }

    res.json(milestonesData);
  } catch (error) {
    console.error("Error generating milestones:", error);
    res.status(500).json({ error: "Failed to generate milestones" });
  }
};

export const generateJobDetails = async (req, res) => {
  try {
    const { projectIdea } = req.body;

    if (!projectIdea) {
      return res.status(400).json({ error: "Project idea is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
    const prompt = `You are an expert technical project manager.
        User Idea: "${projectIdea}"
        
        Generate 3 distinct project implementation options (e.g., MVP, Standard, Advanced) based on this idea.
        For each option, estimate the number of hours required.
        Calculate the budget based on a rate of $30/hour.
        
        Return a valid JSON object with the key "options" containing an array of 3 objects.
        Structure:
        {
            "options": [
                {
                    "title": "Short catchy title (e.g. MVP)",
                    "type": "Contract", 
                    "description": "Professional job description",
                    "techStack": "React, Node, etc (comma separated string)",
                    "timeline": "e.g. 1-2 Weeks",
                    "totalHours": 50,
                    "budget": 1500,
                    "tasks": [
                        {
                            "description": "Task description",
                            "hours": 10,
                            "payout": 300
                        }
                    ]
                }
            ]
        }
        Ensure "budget" is approximately "totalHours" * 30.
        Ensure sum of task payouts equals budget.
        Do not include markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let data;
    try {
      data = JSON.parse(cleanText);
    } catch (e) {
      console.error("JSON Parse Error", e);
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    res.json(data);

  } catch (error) {
    console.error("Error generating job details:", error);
    res.status(500).json({ error: "Failed to generate job details" });
  }
};
