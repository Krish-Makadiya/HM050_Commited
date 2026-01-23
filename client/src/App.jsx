import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleProtected from "./components/auth/RoleProtected";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import JobPreferences from "./pages/Settings/JobPreferences";
import MyAccount from "./pages/Settings/MyAccount";
import MyProfile from "./pages/Settings/MyProfile";

// Candidate Pages
import MyProposals from "./pages/Candidate/MyProposals";
import ActiveProjects from "./pages/Candidate/ActiveProjects";
import VideoIntro from "./pages/Candidate/VideoIntro";
import SubmitWork from "./pages/Candidate/SubmitWork";
import MyInsights from "./pages/Candidate/MyInsights";
import MyPortfolio from "./pages/Candidate/MyPortfolio";

// Recruiter Pages
import RecruiterDashboard from "./pages/Recruiter/RecruiterDashboard";
import PostJob from "./pages/Recruiter/PostJob";
import ManageJobs from "./pages/Recruiter/ManageJobs";
import Applications from "./pages/Recruiter/Applications";
import CompanyProfile from "./pages/Recruiter/CompanyProfile";
import ActiveWork from "./pages/Recruiter/ActiveWork";
import ProjectGenerator from "./pages/Recruiter/ProjectGenerator";
import { Toaster } from "sonner";

const App = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Landing />} />

                <Route path="/onboarding" element={
                    <ProtectedRoute>
                        <Onboarding />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard" element={<DashboardLayout />}>
                    {/* 
                        Index -> Main Dashboard 
                        Inside Dashboard.jsx, it checks role -> renders RecruiterDashboard or Candidate Swipe deck
                    */}
                    <Route index element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    {/* Common Protected Routes */}
                    <Route path="my-profile" element={
                        <ProtectedRoute>
                            <MyProfile />
                        </ProtectedRoute>
                    } />
                    <Route path="my-account" element={
                        <ProtectedRoute>
                            <MyAccount />
                        </ProtectedRoute>
                    } />
                    <Route path="my-insights" element={
                        <ProtectedRoute>
                            <MyInsights />
                        </ProtectedRoute>
                    } />

                    {/* 
                      ------------------------------------------
                      CANDIDATE ROUTES (Project Based)
                      ------------------------------------------
                    */}
                    <Route path="my-proposals" element={
                        <RoleProtected allowedRole="Candidate">
                            <MyProposals />
                        </RoleProtected>
                    } />
                    <Route path="active-projects" element={
                        <RoleProtected allowedRole="Candidate">
                            <ActiveProjects />
                        </RoleProtected>
                    } />
                    <Route path="submit-work/:projectId" element={
                        <RoleProtected allowedRole="Candidate">
                            <SubmitWork />
                        </RoleProtected>
                    } />
                    <Route path="video-intro" element={
                        <RoleProtected allowedRole="Candidate">
                            <VideoIntro />
                        </RoleProtected>
                    } />
                    <Route path="portfolio" element={
                        <RoleProtected allowedRole="Candidate">
                            <MyPortfolio />
                        </RoleProtected>
                    } />


                    {/* 
                      ------------------------------------------
                      RECRUITER ROUTES 
                      ------------------------------------------
                    */}
                    <Route path="recruiter/post-job" element={
                        <RoleProtected allowedRole="Recruiter">
                            <PostJob />
                        </RoleProtected>
                    } />
                    <Route path="recruiter/manage-jobs" element={
                        <RoleProtected allowedRole="Recruiter">
                            <ManageJobs />
                        </RoleProtected>
                    } />
                    <Route path="recruiter/applications" element={
                        <RoleProtected allowedRole="Recruiter">
                            <Applications />
                        </RoleProtected>
                    } />
                    <Route path="recruiter/active-work" element={
                        <RoleProtected allowedRole="Recruiter">
                            <ActiveWork />
                        </RoleProtected>
                    } />
                    <Route path="recruiter/profile" element={
                        <RoleProtected allowedRole="Recruiter">
                            <CompanyProfile />
                        </RoleProtected>
                    } />
                    <Route path="recruiter/project-generator" element={
                        <RoleProtected allowedRole="Recruiter">
                            <ProjectGenerator />
                        </RoleProtected>
                    } />

                </Route>
            </Routes>
            <Toaster />
        </>
    );
};

export default App;
