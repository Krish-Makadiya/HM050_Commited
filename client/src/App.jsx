import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import JobPreferences from "./pages/Settings/JobPreferences";
import MyAccount from "./pages/Settings/MyAccount";
import MyProfile from "./pages/Settings/MyProfile";
import CourseSuggestions from "./pages/Careers/CourseSuggestions";
import AcceptedJobs from "./pages/Careers/AcceptedJobs";
import RejectedJobs from "./pages/Careers/RejectedJobs";
import Roadmaps from "./pages/Careers/Roadmaps";
import ATSScanner from "./pages/ResumeAI/ATSScanner";
import ResumeBuilder from "./pages/ResumeAI/ResumeBuilder";
import CoverLetters from "./pages/ResumeAI/CoverLetters";
import ResumeVersions from "./pages/ResumeAI/ResumeVersions";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />    

            <Route path="/onboarding" element={
                <ProtectedRoute>
                    <Onboarding />
                </ProtectedRoute>
            } />

            <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />

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

                <Route path="job-preferences" element={
                    <ProtectedRoute>
                        <JobPreferences />
                    </ProtectedRoute>
                } />

                <Route path="course-suggestions" element={
                    <ProtectedRoute>
                        <CourseSuggestions />
                    </ProtectedRoute>
                } />
                <Route path="accepted-jobs" element={
                    <ProtectedRoute>
                        <AcceptedJobs />
                    </ProtectedRoute>
                } />
                <Route path="rejected-jobs" element={
                    <ProtectedRoute>
                        <RejectedJobs />
                    </ProtectedRoute>
                } />
                <Route path="roadmaps" element={
                    <ProtectedRoute>
                        <Roadmaps />
                    </ProtectedRoute>
                } />


                <Route path="ats-scanner" element={
                    <ProtectedRoute>
                        <ATSScanner />
                    </ProtectedRoute>
                } />
                <Route path="resume-builder" element={
                    <ProtectedRoute>
                        <ResumeBuilder />
                    </ProtectedRoute>
                } />
                <Route path="cover-letters" element={
                    <ProtectedRoute>
                        <CoverLetters />
                    </ProtectedRoute>
                } />
                <Route path="resume-versions" element={
                    <ProtectedRoute>
                        <ResumeVersions />
                    </ProtectedRoute>
                } />
            </Route>
        </Routes>
    );
};

export default App;
