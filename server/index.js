import cors from "cors";
import express from "express";
import userRoutes from "./routes/user.routes.js";
import jobRoutes from "./routes/jobs.routes.js";
import roadmapRoutes from "./routes/roadmap.routes.js";
import uploadRoutes from "./routes/upload.js";
import geminiRoutes from "./routes/geminiRoutes.js";
import connectxRoutes from "./routes/connectx.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/connectx", connectxRoutes);
app.use("/uploads", express.static("uploads"));

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
