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
        
        Generate 3 distinct project implementation options (e.g., MVP, Standard, Advanced).
        Structure the project into **Modules** (e.g. Frontend, Backend, Database, Infrastructure).
        
        For each option:
        - Estimate total hours.
        - Calculate budget at $30/hr.
        - Break down into 3-5 Modules.
        - For each Module, provide specific tasks.
        
        Return a valid JSON object with key "options" containing an array of 3 objects.
        Structure:
        {
            "options": [
                {
                    "title": "Option Title",
                    "type": "Contract", 
                    "description": "Description",
                    "techStack": "React, Node, etc",
                    "timeline": "e.g. 1 Month",
                    "totalHours": 100,
                    "budget": 3000,
                    "modules": [
                        {
                            "title": "Module 1: Frontend",
                            "description": "UI implementation",
                            "estimatedHours": 20,
                            "tasks": [
                                { "description": "Login Page", "payout": 300 },
                                { "description": "Dashboard", "payout": 300 }
                            ]
                        }
                    ]
                }
            ]
        }
        Ensure sum of module task payouts roughly equals budget.
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

export const generateRoleBasedJobDetails = async (req, res) => {
  try {
    const { projectIdea } = req.body;

    if (!projectIdea) {
      return res.status(400).json({ error: "Project idea is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
    const prompt = `You are an expert technical architect and squad lead.
            User Idea: "${projectIdea}"
            
            Generate 2 distinct collaborative project plans (e.g., MVP Squad, Full-Scale Squad).
            Unlike standard jobs, this MUST be split into **Roles** (2-3 distinct roles).
            
            For each plan:
            1. Define 2-3 Roles (e.g., Frontend Lead, Backend Architect, UI/UX Designer).
            2. Split the work into Modules, and ASSIGN each module to a specific Role.
            
            Return a valid JSON object with key "options".
            Structure:
            {
                "options": [
                    {
                        "title": "Option Title",
                        "description": "...",
                        "totalBudget": 5000,
                        "timeline": "2 Months",
                        "roles": [
                            { 
                                "name": "Frontend Developer", 
                                "description": "Responsible for UI...", 
                                "skills": ["React", "Tailwind"] 
                            },
                            { 
                                "name": "Backend Developer", 
                                "description": "API...", 
                                "skills": ["Node.js", "Firebase"] 
                            }
                        ],
                        "modules": [
                            {
                                "title": "Module 1: Auth & User Profile",
                                "description": "Setup authentication...",
                                "assignedRole": "Backend Developer",
                                "tasks": [
                                    { "description": "Setup Clerk", "payout": 200 }
                                ]
                            },
                            {
                                "title": "Module 2: Dashboard UI",
                                "description": "Main layouts...",
                                "assignedRole": "Frontend Developer",
                                "tasks": [
                                    { "description": "Sidebar", "payout": 300 }
                                ]
                            }
                        ]
                    }
                ]
            }
            Do not include markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(cleanText);
    res.json(data);

  } catch (error) {
    console.error("Error generating role-based details:", error);
    res.status(500).json({ error: "Failed to generate squad details" });
  }
};

export const analyzeTeamHarmony = async (req, res) => {
  // This is a dedicated endpoint for ad-hoc analysis if needed, 
  // though the main logic is in connectx.controller.js
  // We can keep this empty or implementation specific logic if we want to decouple.
  res.status(501).json({ message: "Not implemented yet, use connectx controller." });
};
