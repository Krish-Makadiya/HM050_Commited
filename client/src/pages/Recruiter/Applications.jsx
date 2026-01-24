import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Select } from "@/ui/select";
import { Search, Filter, MoreHorizontal, Mail, Calendar, Loader2, ExternalLink, FileText, CheckCircle2, Sparkles, Briefcase, GraduationCap, EyeOff, Lock, ShieldCheck, Zap, Users } from "lucide-react";
import { Input } from "@/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui/dialog";
import { DialogTrigger } from '@radix-ui/react-dialog';
import WorkExperienceCard from '@/components/WorkExperienceCard';
import CandidateProfileModal from './CandidateProfileModal';

const Applications = () => {
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get("job");
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [jobStatus, setJobStatus] = useState("Active");
    const [blindHiring, setBlindHiring] = useState(false);
    const [analyzing, setAnalyzing] = useState({});
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [candidatePortfolio, setCandidatePortfolio] = useState([]);
    const [loadingPortfolio, setLoadingPortfolio] = useState(false);
    const [selectedInterviewCandidate, setSelectedInterviewCandidate] = useState(null);

    // ConnectX State
    const [isCollaborative, setIsCollaborative] = useState(false);
    const [squadSuggestions, setSquadSuggestions] = useState([]);
    const [loadingSquads, setLoadingSquads] = useState(false);

    useEffect(() => {
        if (selectedCandidate) {
            const fetchPortfolio = async () => {
                setLoadingPortfolio(true);
                try {
                    const response = await axios.get(`${import.meta.env.VITE_SERVER_API}/api/user/work-experience/${selectedCandidate.id}`);
                    setCandidatePortfolio(response.data.workExperience || []);
                } catch (error) {
                    console.error("Failed to fetch candidate portfolio", error);
                    setCandidatePortfolio([]);
                } finally {
                    setLoadingPortfolio(false);
                }
            };
            fetchPortfolio();
        } else {
            setCandidatePortfolio([]);
        }
    }, [selectedCandidate]);

    useEffect(() => {
        const fetchApplicants = async () => {
            if (!jobId) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_SERVER_API}/api/jobs/${jobId}/applicants`);
                setCandidates(response.data.applicants);
                setJobStatus(response.data.jobStatus);
                setBlindHiring(response.data.jobData?.blindHiring || false);
                setIsCollaborative(response.data.jobData?.isCollaborative || false); // Check flag


                // If submission opens, default to showing shortlisted/submitted
                if (response.data.jobStatus === "SubmissionOpen" || response.data.jobStatus === "Closed") {
                    setStatusFilter("Shortlisted");
                }
            } catch (error) {
                console.error("Error fetching applicants:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplicants();
    }, [jobId]);

    useEffect(() => {
        if (isCollaborative && jobId) {
            const fetchSquads = async () => {
                setLoadingSquads(true);
                try {
                    const res = await axios.post(`${import.meta.env.VITE_SERVER_API}/api/connectx/generate-squads`, { jobId });
                    setSquadSuggestions(res.data.squads || []);
                } catch (err) {
                    console.error("Failed to fetch squads:", err);
                } finally {
                    setLoadingSquads(false);
                }
            };
            fetchSquads();
        }
    }, [isCollaborative, jobId]);

    const handleInviteSquad = async (squad) => {
        try {
            await axios.post(`${import.meta.env.VITE_SERVER_API}/api/connectx/invite`, {
                jobId,
                squadData: squad,
                projectTitle: "Collaborative Project Invitation" // Ideally fetch title
            });
            toast.success("Squad invited successfully!");
            // Optionally remove from list or mark invited
        } catch (error) {
            console.error("Error inviting squad:", error);
            toast.error("Failed to invite squad.");
        }
    };


    const handleStatusUpdate = async (applicantId, newStatus) => {
        try {
            await axios.patch(`${import.meta.env.VITE_SERVER_API}/api/jobs/${jobId}/applicants/${applicantId}`, {
                status: newStatus
            });
            // Update local state
            setCandidates(prev => prev.map(c =>
                c.id === applicantId ? { ...c, status: newStatus } : c
            ));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleGenerateInsight = async (candidateId) => {
        setAnalyzing((prev) => ({ ...prev, [candidateId]: true }));
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_SERVER_API}/api/jobs/${jobId}/applicants/${candidateId}/analyze`
            );
            const { score, summary, pros } = response.data;

            // Update local state
            setCandidates((prev) =>
                prev.map((c) =>
                    c.id === candidateId
                        ? { ...c, aiScore: score, aiSummary: summary, aiPros: pros, aiAnalyzedAt: new Date().toISOString() }
                        : c
                )
            );
            toast.success("AI Insight Generated!");
        } catch (error) {
            console.error("Error generating insight:", error);
            toast.error("Failed to generate insight.");
        } finally {
            setAnalyzing((prev) => ({ ...prev, [candidateId]: false }));
        }
    };

    const handleJobAction = async (action, task = "") => {
        // action: "SubmissionOpen", "Closed"
        try {
            await axios.post(`${import.meta.env.VITE_SERVER_API}/api/jobs/update`, {
                jobId: jobId,
                status: action,
                submissionTask: task // Send the task description to backend
            });
            setJobStatus(action);
            if (action === "SubmissionOpen") {
                setStatusFilter("Shortlisted");
                alert("Submission phase started. Candidates can now submit proof of work.");
            } else {
                alert("Job status updated.");
            }
        } catch (error) {
            console.error("Error updating job status:", error);
        }
    }

    const filteredCandidates = candidates.filter(c => {
        if (statusFilter === "All") return true;
        // Logic for "Shortlisted View" -> Show Shortlisted OR Work Submitted OR Interview OR Hired
        // If filter is specific, match specific.
        // But for "Submission Phase", user might want to see who IS shortlisted to track submissions.
        if (statusFilter === "Shortlisted") {
            return ["Shortlisted", "Work Submitted", "Interview", "Hired"].includes(c.status);
        }
        return c.status === statusFilter;
    }).sort((a, b) => {
        // Custom Priority Sort: Hired > Interview > Work Submitted > Shortlisted > Applied > Rejected
        const priority = {
            "Hired": 6,
            "Interview": 5,
            "Work Submitted": 4,
            "Shortlisted": 3,
            "Applied": 1,
            "Rejected": 0
        };
        return (priority[b.status] || 0) - (priority[a.status] || 0);
    });

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!jobId) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold">Please select a job to view applications.</h1>
                <p className="text-muted-foreground">Go to Manage Jobs and click "View Applicants".</p>
            </div>
        )
    }


    // --- Render View ---

    // 2. STANDARD VIEW (Merged with Collaborative)
    const isSubmissionPhase = jobStatus === "SubmissionOpen" || jobStatus === "Closed";

    return (
        <div className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        {isCollaborative && <Sparkles className="w-8 h-8 text-purple-500" />}
                        {isCollaborative ? "Squads & Applications" : "Applications"}
                    </h1>
                    <div className="text-muted-foreground flex items-center gap-2 mt-1">
                        Status: <Badge variant={isSubmissionPhase ? "default" : "outline"}>{jobStatus}</Badge>
                    </div>
                    {isCollaborative && (
                        <p className="text-muted-foreground mt-1 text-sm">
                            ConnectX Intelligence has formed potential squads. Accepted members appear in the list below.
                        </p>
                    )}
                    {blindHiring && (
                        <Badge variant="outline" className="mt-2 bg-purple-50 text-purple-700 border-purple-200 gap-1 w-fit">
                            <EyeOff className="w-3 h-3" /> Blind Hiring Mode
                        </Badge>
                    )}
                </div>

                <div className="flex gap-2">
                    {jobStatus === "Active" && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-black hover:bg-neutral-800 text-white">
                                    Start Submission Phase
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Start Submission Phase</DialogTitle>
                                    <DialogDescription>
                                        Define the task or project details for the candidates. They will see this instruction when they submit their work.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Task Instructions</label>
                                        <textarea
                                            id="submissionTaskInput"
                                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="E.g., Please create a Figma mockup for the login page based on our branding guidelines..."
                                        />
                                    </div>
                                    <Button
                                        onClick={() => {
                                            const task = document.getElementById("submissionTaskInput").value;
                                            handleJobAction("SubmissionOpen", task);
                                        }}
                                        className="w-full"
                                    >
                                        Activate Submission Phase
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                    {jobStatus === "SubmissionOpen" && (
                        <Button variant="destructive" onClick={() => handleJobAction("Closed")}>
                            Close Job
                        </Button>
                    )}
                </div>
            </div>

            {/* SQUAD SECTION (Conditionally Rendered) */}
            {isCollaborative && (
                <div className="mb-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" /> AI Squad Suggestions
                    </h2>
                    {loadingSquads ? (
                        <div className="flex justify-center py-10 bg-neutral-50 dark:bg-neutral-900/30 rounded-lg">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                        </div>
                    ) : squadSuggestions.length === 0 ? (
                        <div className="text-center py-10 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-dashed">
                            <p className="text-muted-foreground">No squads formed yet. Waiting for more eligible candidates.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {squadSuggestions.map((squad, idx) => (
                                <Card key={idx} className="border-purple-200 dark:border-purple-800 shadow-lg">
                                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 flex justify-between items-center border-b border-purple-100 dark:border-purple-800">
                                        <h3 className="font-bold">Suggestion #{idx + 1}: {squad.squadName}</h3>
                                        <Badge className="bg-green-100 text-green-700 border-green-200">
                                            {squad.harmonyScore}% Harmony
                                        </Badge>
                                    </div>
                                    <CardContent className="p-4 space-y-4">
                                        <p className="text-sm italic text-muted-foreground">"{squad.reasoning}"</p>
                                        <div className="space-y-2">
                                            {squad.members.map((member, i) => (
                                                <div key={i} className="flex items-center gap-3 p-2 rounded bg-neutral-50 dark:bg-neutral-900">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={member.details?.imageUrl} />
                                                        <AvatarFallback>{member.details?.firstName?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="font-semibold">{member.details?.firstName} {member.details?.lastName}</span>
                                                            <Badge variant="outline" className="text-[10px]">{member.roleName}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => handleInviteSquad(squad)}>
                                            <Mail className="w-3 h-3 mr-2" /> Invite Squad
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                    <div className="my-8 border-t border-neutral-200 dark:border-neutral-800" />
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search candidates..."
                        className="pl-8"
                    />
                </div>
                <div className="flex gap-2">
                    <Select
                        options={["All", "Applied", "Shortlisted", "Work Submitted", "Interview", "Rejected", "Hired"]}
                        value={[statusFilter]}
                        onChange={(val) => setStatusFilter(val[0])}
                        placeholder="Filter Status"
                        className="w-[180px]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredCandidates.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">No applicants found.</div>
                ) : (
                    filteredCandidates.map((candidate) => {
                        const isBlind = blindHiring && candidate.status !== 'Hired';
                        return (
                            <Card key={candidate.id} className={`transition-all hover:shadow-md ${candidate.status === 'Work Submitted' ? 'border-blue-200 bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            {!isBlind && <AvatarImage src={candidate.imageUrl} alt={candidate.firstName} />}
                                            <AvatarFallback className={isBlind ? "bg-neutral-100 dark:bg-neutral-800" : ""}>
                                                {isBlind ? <Lock className="w-6 h-6 text-muted-foreground/50" /> : (candidate.firstName?.[0] || "") + (candidate.lastName?.[0] || "")}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 text-center md:text-left space-y-1">
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                                <h3 className={`text-xl font-bold ${isBlind ? "text-muted-foreground italic font-medium blur-sm select-none" : ""}`}>
                                                    {isBlind ? "Anonymous Candidate" : `${candidate.firstName} ${candidate.lastName}`}
                                                </h3>
                                                {candidate.suitabilityScore !== undefined && (
                                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold shadow-sm border ${candidate.suitabilityScore >= 80 ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                                        candidate.suitabilityScore >= 50 ? "bg-amber-100 text-amber-700 border-amber-200" :
                                                            "bg-rose-100 text-rose-700 border-rose-200"
                                                        }`} title="AI Suitability Score">
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        {candidate.suitabilityScore}% Match
                                                    </div>
                                                )}
                                                {candidate.status === 'Hired' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                                {isBlind && <span className="text-xs px-2 py-0.5 bg-neutral-100 border border-neutral-200 rounded-full text-muted-foreground flex items-center gap-1"><EyeOff className="w-3 h-3" /> Blind</span>}
                                            </div>

                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                Applied {formatDistanceToNow(new Date(candidate.appliedAt), { addSuffix: true })}
                                            </p>
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                                                <Badge variant="outline" className={
                                                    candidate.status === 'Applied' ? 'text-blue-500 border-blue-200' :
                                                        candidate.status === 'Shortlisted' ? 'text-emerald-500 border-emerald-200' :
                                                            candidate.status === 'Work Submitted' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                                candidate.status === 'Rejected' ? 'text-red-500 border-red-200' :
                                                                    candidate.status === 'Interview' ? 'text-purple-500 border-purple-200' :
                                                                        candidate.status === 'Hired' ? 'bg-green-100 text-green-700 border-green-200' :
                                                                            'text-orange-500 border-orange-200'
                                                }>{candidate.status}</Badge>

                                                {/* Display Skills - Simplified for cleaner UI in submission view */}
                                                {!isSubmissionPhase && candidate.skills && candidate.skills.slice(0, 3).map((skill, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* SUBMISSION UI */}
                                            {candidate.submissionLink && (
                                                <div className="mt-4 bg-white dark:bg-black p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm max-w-2xl">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="w-4 h-4 text-blue-500" />
                                                            <span className="font-semibold text-sm">Proof of Work Submitted</span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">{candidate.submissionDate ? formatDistanceToNow(new Date(candidate.submissionDate), { addSuffix: true }) : ''}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                                        {candidate.submissionDescription || "No description provided."}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" className="h-8 gap-2 text-primary hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-950" onClick={() => window.open(candidate.submissionLink, '_blank')}>
                                                            <ExternalLink className="w-3 h-3" /> View Project
                                                        </Button>
                                                    </div>

                                                    {/* AI Insight Section */}
                                                    <div className="mt-3 border-t border-dashed border-neutral-200 dark:border-neutral-800 pt-3">
                                                        {candidate.aiScore ? (
                                                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900 rounded-lg p-3">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                                                        <span className="font-semibold text-sm text-purple-900 dark:text-purple-100">AI Scorecard</span>
                                                                    </div>
                                                                    <Badge className={`${candidate.aiScore >= 8 ? "bg-green-500 hover:bg-green-600" :
                                                                        candidate.aiScore >= 5 ? "bg-yellow-500 hover:bg-yellow-600" :
                                                                            "bg-red-500 hover:bg-red-600"
                                                                        } text-white border-0`}>
                                                                        {candidate.aiScore}/10
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-neutral-700 dark:text-neutral-300 mb-2 italic leading-normal">"{candidate.aiSummary}"</p>
                                                                {candidate.aiPros && (
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {candidate.aiPros.map((pro, idx) => (
                                                                            <span key={idx} className="text-[10px] font-medium px-2 py-0.5 bg-white/60 dark:bg-black/40 rounded-full text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                                                                                + {pro}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="w-full text-xs h-7 gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                                                                onClick={() => handleGenerateInsight(candidate.id)}
                                                                disabled={analyzing[candidate.id]}
                                                            >
                                                                {analyzing[candidate.id] ? (
                                                                    <>
                                                                        <Loader2 className="w-3 h-3 animate-spin" /> Analyzing...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Sparkles className="w-3 h-3" /> Generate AI Insight
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 flex-col sm:flex-row">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedCandidate(candidate)}
                                            >
                                                View Profile
                                            </Button>

                                            {candidate.interviewScore !== undefined && (
                                                <Button
                                                    size="sm"
                                                    className="bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200"
                                                    onClick={() => setSelectedInterviewCandidate(candidate)}
                                                >
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    View Interview
                                                </Button>
                                            )}

                                            {/* Actions based on Phases */}
                                            {/* Phase 1: Initial (Job is Active) - Only Shortlisting allowed */}
                                            {jobStatus === 'Active' && candidate.status === 'Applied' && (
                                                <Button
                                                    size="sm"
                                                    className="bg-black hover:bg-neutral-800 text-white"
                                                    onClick={() => handleStatusUpdate(candidate.id, "Shortlisted")}
                                                >
                                                    Shortlist
                                                </Button>
                                            )}

                                            {/* Phase 2: Submission/Selection (Job Phase Changed) - Hiring allowed */}
                                            {(jobStatus === 'SubmissionOpen' || jobStatus === 'Closed') && (
                                                <>
                                                    {/* Allow Hire if they are in a relevant status like Work Submitted or even Shortlisted if checking manually */}
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => handleStatusUpdate(candidate.id, "Hired")}
                                                    >
                                                        Hire
                                                    </Button>
                                                </>
                                            )}

                                            {/* Reject is always an option via Icon, or if Shortlist is primary action, maybe 'x' icon next to it */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleStatusUpdate(candidate.id, "Rejected")}
                                                title="Reject"
                                            >
                                                <span className="sr-only">Reject</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x w-4 h-4"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Candidate Profile Modal */}
            <Dialog open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Candidate Profile</DialogTitle>
                    </DialogHeader>
                    {selectedCandidate && (() => {
                        const isBlindModal = blindHiring && selectedCandidate.status !== 'Hired';
                        return (
                            <div className="space-y-6">
                                {/* Header Info */}
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-20 w-20 border">
                                        {!isBlindModal && <AvatarImage src={selectedCandidate.imageUrl} />}
                                        <AvatarFallback className={`text-lg ${isBlindModal ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}>
                                            {isBlindModal ? <Lock className="w-8 h-8 text-muted-foreground/50" /> : (selectedCandidate.firstName?.[0] || "") + (selectedCandidate.lastName?.[0] || "")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className={`text-2xl font-bold ${isBlindModal ? "text-muted-foreground blur-sm select-none" : ""}`}>
                                            {isBlindModal ? "Anonymous Candidate" : `${selectedCandidate.firstName} ${selectedCandidate.lastName}`}
                                        </h2>
                                        <p className="text-muted-foreground">
                                            {isBlindModal ? <span className="flex items-center gap-2 mt-1 text-sm"><EyeOff className="w-4 h-4" /> Contact Details Hidden</span> : selectedCandidate.email}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="secondary">{selectedCandidate.experienceLevel || "Experience Not Specified"}</Badge>
                                            {!isBlindModal && selectedCandidate.resumeUrl && (
                                                <a href={selectedCandidate.resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                                    <ExternalLink className="w-3 h-3" /> Resume
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* AI Suitability Match Score */}
                                {selectedCandidate.suitabilityScore !== undefined && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-blue-500" /> AI Compatibility Match
                                            </h3>
                                            <Badge className={`text-base px-3 py-1 ${selectedCandidate.suitabilityScore >= 80 ? "bg-green-600" :
                                                selectedCandidate.suitabilityScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                                                } hover:brightness-110`}>
                                                {selectedCandidate.suitabilityScore}% Match
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed italic">
                                            "{selectedCandidate.suitabilityAnalysis}"
                                        </p>
                                    </div>
                                )}

                                {/* Interview Analysis */}
                                {selectedCandidate.interviewScore !== undefined && (
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-100 dark:border-purple-900 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-purple-500" /> AI Interview Analysis
                                            </h3>
                                            <Badge className={`text-base px-3 py-1 ${selectedCandidate.interviewScore >= 80 ? "bg-purple-600" :
                                                selectedCandidate.interviewScore >= 50 ? "bg-amber-500" : "bg-red-500"
                                                } hover:brightness-110`}>
                                                {selectedCandidate.interviewScore}/100 Score
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed italic mb-3">
                                            "{selectedCandidate.interviewSummary}"
                                        </p>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="font-semibold block mb-1">Strengths</span>
                                                <ul className="list-disc pl-3">
                                                    {selectedCandidate.interviewStrengths?.map((s, i) => <li key={i}>{s}</li>)}
                                                </ul>
                                            </div>
                                            <div>
                                                <span className="font-semibold block mb-1">Weaknesses</span>
                                                <ul className="list-disc pl-3">
                                                    {selectedCandidate.interviewWeaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                                                </ul>
                                            </div>
                                        </div>

                                        {selectedCandidate.interviewTranscript && (
                                            <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="w-full text-xs h-6">View Transcript</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-lg">
                                                        <DialogHeader>
                                                            <DialogTitle>Interview Transcript</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="h-[300px] overflow-y-auto bg-neutral-100 p-2 rounded text-xs space-y-2">
                                                            {selectedCandidate.interviewTranscript.map((msg, i) => (
                                                                <p key={i}>
                                                                    <span className="font-bold uppercase mr-1">{msg.role}:</span>
                                                                    {msg.text}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Summary */}
                                {selectedCandidate.summary && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> About
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                                            {selectedCandidate.summary}
                                        </p>
                                    </div>
                                )}

                                {/* Skills */}
                                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" /> Skills
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCandidate.skills.map((skill, i) => (
                                                <Badge key={i} variant="outline" className="px-3 py-1">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Verified Portfolio Section */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-blue-500" /> Verified Portfolio
                                    </h3>
                                    {loadingPortfolio ? (
                                        <div className="flex items-center justify-center p-4">
                                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : candidatePortfolio.length > 0 ? (
                                        <div className="space-y-4">
                                            {candidatePortfolio.map((item, index) => (
                                                <WorkExperienceCard
                                                    key={item.proofId || index}
                                                    {...item}
                                                    {...item.content}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 border border-dashed rounded-lg bg-neutral-50/50 text-center text-sm text-muted-foreground">
                                            No verified portfolio entries yet.
                                        </div>
                                    )}
                                </div>

                                {/* Work Experience */}
                                {selectedCandidate.workExperience && selectedCandidate.workExperience.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <Briefcase className="w-4 h-4" /> Experience
                                        </h3>
                                        <div className="space-y-4">
                                            {selectedCandidate.workExperience.map((exp, i) => (
                                                <div key={i} className="border-l-2 border-neutral-200 dark:border-neutral-800 pl-4 pb-1">
                                                    <h4 className="font-medium">{exp.role}</h4>
                                                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                                        <span>{exp.company}</span>
                                                        <span>{exp.startDate} - {exp.endDate || "Present"}</span>
                                                    </div>
                                                    {exp.description && (
                                                        <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-400">
                                                            {exp.description}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Education */}
                                {selectedCandidate.education && (selectedCandidate.education.institution || Array.isArray(selectedCandidate.education)) && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4" /> Education
                                        </h3>
                                        {isBlindModal ? (
                                            <div className="flex items-center justify-center p-6 border border-dashed rounded-lg bg-neutral-50/50">
                                                <p className="text-muted-foreground flex items-center gap-2 text-sm italic">
                                                    <EyeOff className="w-4 h-4" /> Education details hidden in Blind Mode
                                                </p>
                                            </div>
                                        ) : (
                                            Array.isArray(selectedCandidate.education) ? (
                                                selectedCandidate.education.map((edu, i) => (
                                                    <div key={i} className="flex flex-col text-sm border p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                                                        <span className="font-bold">{edu.institution}</span>
                                                        <span className="text-muted-foreground">{edu.degree} • {edu.fieldOfStudy}</span>
                                                        <span className="text-xs text-muted-foreground mt-1">{edu.startDate} - {edu.endDate}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex flex-col text-sm border p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                                                    <span className="font-bold">{selectedCandidate.education.institution}</span>
                                                    <span className="text-muted-foreground">{selectedCandidate.education.degree} • {selectedCandidate.education.fieldOfStudy}</span>
                                                    <span className="text-xs text-muted-foreground mt-1">{selectedCandidate.education.startDate} - {selectedCandidate.education.endDate}</span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* AI Interview Analysis Modal */}
            <Dialog open={!!selectedInterviewCandidate} onOpenChange={(open) => !open && setSelectedInterviewCandidate(null)}>
                <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>AI Interview Analysis</DialogTitle>
                        <DialogDescription>
                            Review the automated technical interview results for {selectedInterviewCandidate?.firstName} {selectedInterviewCandidate?.lastName}.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedInterviewCandidate && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-4 space-y-2 border-b">
                                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 font-bold text-3xl ${selectedInterviewCandidate.interviewScore >= 80 ? "bg-green-100 border-green-500 text-green-700" :
                                    selectedInterviewCandidate.interviewScore >= 50 ? "bg-amber-100 border-amber-500 text-amber-700" :
                                        "bg-red-100 border-red-500 text-red-700"
                                    }`}>
                                    {selectedInterviewCandidate.interviewScore}
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">Technical Score</span>
                            </div>

                            <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
                                <h4 className="font-semibold text-sm mb-2 text-primary flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> AI Summary
                                </h4>
                                <p className="text-sm italic text-muted-foreground leading-relaxed">
                                    "{selectedInterviewCandidate.interviewSummary}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Strengths
                                    </h4>
                                    <ul className="text-sm space-y-1 list-disc pl-4 text-neutral-600 dark:text-neutral-300">
                                        {selectedInterviewCandidate.interviewStrengths?.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> Weaknesses
                                    </h4>
                                    <ul className="text-sm space-y-1 list-disc pl-4 text-neutral-600 dark:text-neutral-300">
                                        {selectedInterviewCandidate.interviewWeaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                                    </ul>
                                </div>
                            </div>

                            {selectedInterviewCandidate.interviewTranscript && (
                                <div className="pt-4 border-t">
                                    <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">Interview Transcript</h4>
                                    <div className="h-48 overflow-y-auto bg-neutral-100 dark:bg-neutral-950 p-3 rounded-md text-xs space-y-3">
                                        {selectedInterviewCandidate.interviewTranscript.map((msg, i) => (
                                            <p key={i}>
                                                <span className={`font-bold uppercase mr-1 ${msg.role === 'assistant' ? 'text-blue-600' : 'text-green-600'}`}>{msg.role}:</span>
                                                {msg.text}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default Applications;
