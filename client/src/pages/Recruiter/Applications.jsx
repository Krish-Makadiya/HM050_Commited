import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Select } from "@/ui/select";
import { Search, Filter, MoreHorizontal, Mail, Calendar, Loader2, ExternalLink, FileText, CheckCircle2, PlayCircle, Sparkles } from "lucide-react";
import { Input } from "@/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { toast } from "sonner"; // Assuming sonner is installed or handle alert

const Applications = () => {
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get("job");
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [jobStatus, setJobStatus] = useState("Active");

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

    const handleJobAction = async (action) => {
        // action: "SubmissionOpen", "Closed"
        try {
            await axios.post(`${import.meta.env.VITE_SERVER_API}/api/jobs/update`, {
                jobId: jobId,
                status: action
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
    });
    
    // --- SMART RANKING LOGIC ---
    // Simulate AI score if not present
    const rankedCandidates = filteredCandidates.map(c => ({
        ...c,
        matchScore: c.matchScore || Math.floor(Math.random() * (98 - 70) + 70), // Mock score between 70-98
        hasVideo: Math.random() > 0.5 // Mock video availability
    })).sort((a, b) => b.matchScore - a.matchScore); // Sort by highest score

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

    const isSubmissionPhase = jobStatus === "SubmissionOpen" || jobStatus === "Closed";

    return (
        <div className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
                    <p className="text-muted-foreground">
                        Status: <Badge variant={isSubmissionPhase ? "default" : "outline"}>{jobStatus}</Badge>
                    </p>
                </div>

                <div className="flex gap-2">
                    {jobStatus === "Active" && (
                        <Button
                            className="bg-black hover:bg-neutral-800 text-white"
                            onClick={() => handleJobAction("SubmissionOpen")}
                        >
                            Start Submission Phase
                        </Button>
                    )}
                    {jobStatus === "SubmissionOpen" && (
                        <Button variant="destructive" onClick={() => handleJobAction("Closed")}>
                            Close Job
                        </Button>
                    )}
                </div>
            </div>

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
                {rankedCandidates.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">No applicants found.</div>
                ) : (
                    rankedCandidates.map((candidate) => (
                        <Card key={candidate.id} className={`transition-all hover:shadow-md ${candidate.status === 'Work Submitted' ? 'border-blue-200 bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={candidate.imageUrl} alt={candidate.firstName} />
                                        <AvatarFallback>{(candidate.firstName?.[0] || "") + (candidate.lastName?.[0] || "")}</AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 text-center md:text-left space-y-1">
                                        <div className="flex items-center justify-center md:justify-start gap-2">
                                            <h3 className="text-lg font-semibold">{candidate.firstName} {candidate.lastName}</h3>
                                            {candidate.status === 'Hired' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" />
                                                {candidate.matchScore}% Match
                                            </Badge>
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
                                                <Button size="sm" variant="outline" className="h-8 gap-2 text-primary hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-950" onClick={() => window.open(candidate.submissionLink, '_blank')}>
                                                    <ExternalLink className="w-3 h-3" /> View Project
                                                </Button>
                                            </div>
                                        )}

                                        {/* VIDEO INTRO UI */}
                                        {candidate.hasVideo && (
                                            <div className="mt-2">
                                                <Button variant="ghost" size="sm" className="gap-2 text-pink-600 hover:text-pink-700 hover:bg-pink-50" onClick={() => {
                                                    // DEMO MODE: Always play the latest uploaded video
                                                    const videoUrl = `${import.meta.env.VITE_SERVER_API}/uploads/video-demo.webm`; 
                                                    // Check if it exists or just play it (browser handles 404)
                                                    window.open(videoUrl, '_blank');
                                                    toast.info(`Playing ${candidate.firstName}'s video pitch...`);
                                                }}>
                                                    <PlayCircle className="w-4 h-4" /> Watch Video Pitch
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 flex-col sm:flex-row">
                                        {/* Quick Actions for Submission Phase */}
                                        {candidate.status === 'Work Submitted' && (
                                            <>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusUpdate(candidate.id, "Hired")}>
                                                    Hire
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(candidate.id, "Interview")}>
                                                    Interview
                                                </Button>
                                            </>
                                        )}

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(candidate.id, "Shortlisted")}>Shortlist</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(candidate.id, "Interview")}>Move to Interview</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(candidate.id, "Hired")}>Hire</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleStatusUpdate(candidate.id, "Rejected")}>Reject Application</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Applications;
