import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Select } from "@/ui/select";
import { Search, Filter, MoreHorizontal, Mail, Calendar, Loader2, ExternalLink, FileText, CheckCircle2, XCircle, ChevronDown, Sparkles } from "lucide-react";
import { Input } from "@/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/ui/sheet";
import { formatDistanceToNow } from 'date-fns';
import { toast } from "sonner";
import { ScrollArea } from "@/ui/scroll-area";


const Applications = () => {
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get("job");
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [jobStatus, setJobStatus] = useState("Active");
    const [analyzing, setAnalyzing] = useState({});
    const [selectedCandidate, setSelectedCandidate] = useState(null);

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
        <div className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen bg-neutral-50/50 dark:bg-black/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        Project Submissions
                    </h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        Status: <Badge variant={isSubmissionPhase ? "default" : "outline"} className={isSubmissionPhase ? "bg-blue-600 hover:bg-blue-700" : ""}>{jobStatus}</Badge>
                        <span className="text-neutral-300 dark:text-neutral-700">|</span>
                        <span>{filteredCandidates.length} Candidates</span>
                    </p>
                </div>

                <div className="flex gap-2">
                    {jobStatus === "Active" && (
                        <Button
                            className="bg-black hover:bg-neutral-800 text-white shadow-lg shadow-black/20 dark:shadow-white/10"
                            onClick={() => handleJobAction("SubmissionOpen")}
                        >
                            <span className="mr-2">🚀</span> Start Submission Phase
                        </Button>
                    )}
                    {jobStatus === "SubmissionOpen" && (
                        <Button variant="destructive" onClick={() => handleJobAction("Closed")} className="shadow-lg shadow-red-500/20">
                            Close Job
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name or skills..."
                        className="pl-10 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 placeholder:text-muted-foreground"
                    />
                </div>
                <div className="w-[1px] bg-neutral-200 dark:bg-neutral-800 hidden sm:block"></div>
                <div className="flex gap-2 items-center">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select
                        options={["All", "Applied", "Shortlisted", "Work Submitted", "Interview", "Rejected", "Hired"]}
                        value={[statusFilter]}
                        onChange={(val) => setStatusFilter(val[0])}
                        placeholder="Filter Status"
                        className="w-[180px] border-0 focus:ring-0 shadow-none bg-transparent"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCandidates.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
                        <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-full mb-4">
                            <Search className="h-8 w-8 text-neutral-400" />
                        </div>
                        <p className="font-medium">No candidates found matching your criteria.</p>
                    </div>
                ) : (
                    filteredCandidates.map((candidate) => (
                        <Card
                            key={candidate.id}
                            onClick={() => setSelectedCandidate(candidate)}
                            className={`group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-neutral-200 dark:border-neutral-800 ${candidate.status === 'Work Submitted'
                                ? 'bg-gradient-to-br from-white to-blue-50/30 dark:from-neutral-900 dark:to-blue-900/10 border-blue-200/50 dark:border-blue-800/30'
                                : 'bg-white dark:bg-neutral-900'
                                }`}
                        >
                            <div className="p-6 space-y-4">
                                {/* Header: User Info */}
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-white dark:border-neutral-800 shadow-sm ring-2 ring-neutral-100 dark:ring-neutral-800">
                                        <AvatarImage src={candidate.imageUrl} alt={candidate.firstName} />
                                        <AvatarFallback className="bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-600 font-medium">
                                            {(candidate.firstName?.[0] || "") + (candidate.lastName?.[0] || "")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {candidate.firstName} {candidate.lastName}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Applied {formatDistanceToNow(new Date(candidate.appliedAt))} ago
                                        </p>
                                    </div>
                                    <div className="ml-auto">
                                        {candidate.status === 'Hired' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div>
                                    <Badge variant="outline" className={`w-full justify-center py-1 font-normal ${candidate.status === 'Applied' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                                        candidate.status === 'Shortlisted' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                                            candidate.status === 'Work Submitted' ? 'text-indigo-600 bg-indigo-50 border-indigo-200 shadow-inner' :
                                                candidate.status === 'Rejected' ? 'text-red-600 bg-red-50 border-red-200' :
                                                    candidate.status === 'Interview' ? 'text-purple-600 bg-purple-50 border-purple-200' :
                                                        candidate.status === 'Hired' ? 'text-green-600 bg-green-50 border-green-200' :
                                                            'text-orange-600 bg-orange-50 border-orange-200'
                                        }`}>
                                        {candidate.status}
                                    </Badge>
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
                                    <div className="bg-neutral-50 dark:bg-neutral-950 rounded-lg p-3 text-sm text-neutral-600 dark:text-neutral-400 min-h-[80px] border border-neutral-100 dark:border-neutral-800 text-ellipsis overflow-hidden relative">
                                        {candidate.submissionDescription ? (
                                            <>
                                                <p className="line-clamp-3 leading-relaxed">{candidate.submissionDescription}</p>
                                                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-neutral-50 dark:from-neutral-950 to-transparent"></div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-1 opacity-60">
                                                <span className="text-xs italic">No submission yet</span>
                                            </div>
                                        )}
                                    </div>
                                    {candidate.submissionLink && (
                                        <p className="text-xs text-blue-500 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Project Link Attached
                                        </p>
                                    )}
                                </div>

                                {/* Footer Action */}
                                <div className="pt-2">
                                    <Button variant="ghost" className="w-full text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 h-8">
                                        View Details <ExternalLink className="w-3 h-3 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Candidate Details Sheet */}
            <Sheet open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
                <SheetContent className="sm:max-w-xl w-full flex flex-col h-full bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 p-0 sm:p-0 gap-0">
                    {selectedCandidate && (
                        <>
                            {/* Sheet Header with candidate overview */}
                            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-20 w-20 border-4 border-white dark:border-neutral-900 shadow-md">
                                        <AvatarImage src={selectedCandidate.imageUrl} />
                                        <AvatarFallback className="text-xl bg-neutral-200 text-neutral-600">
                                            {(selectedCandidate.firstName?.[0] || "") + (selectedCandidate.lastName?.[0] || "")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1 pt-1">
                                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">{selectedCandidate.firstName} {selectedCandidate.lastName}</h2>
                                        <p className="text-neutral-500 flex items-center gap-2 text-sm">
                                            <Mail className="w-3.5 h-3.5" /> {selectedCandidate.email}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="secondary" className="bg-white dark:bg-neutral-800 border-neutral-200">{selectedCandidate.status}</Badge>
                                            <span className="text-xs text-muted-foreground py-1">Applied {formatDistanceToNow(new Date(selectedCandidate.appliedAt))} ago</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <ScrollArea className="flex-1">
                                <div className="p-6 space-y-8">
                                    {/* Submission Section */}
                                    <section>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Project Submission
                                        </h3>

                                        {selectedCandidate.submissionLink || selectedCandidate.submissionDescription ? (
                                            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl p-5 space-y-4">
                                                {selectedCandidate.submissionDescription && (
                                                    <div className="space-y-2">
                                                        <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Evaluator's Notes / Description</h4>
                                                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                                                            {selectedCandidate.submissionDescription}
                                                        </p>
                                                    </div>
                                                )}

                                                {selectedCandidate.submissionLink && (
                                                    <div className="pt-2">
                                                        <Button
                                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 gap-2"
                                                            onClick={() => window.open(selectedCandidate.submissionLink, '_blank')}
                                                        >
                                                            <ExternalLink className="w-4 h-4" /> Open Project Link
                                                        </Button>
                                                        <p className="text-center text-xs text-muted-foreground mt-2">
                                                            Submitted {selectedCandidate.submissionDate ? formatDistanceToNow(new Date(selectedCandidate.submissionDate), { addSuffix: true }) : ''}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl text-muted-foreground">
                                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p>No project submission has been uploaded yet.</p>
                                            </div>
                                        )}
                                    </section>

                                    {/* Skills Section */}
                                    {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                                        <section>
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Skills</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedCandidate.skills.map((skill, i) => (
                                                    <Badge key={i} variant="outline" className="text-sm py-1 px-3 border-neutral-300 dark:border-neutral-700">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Actions Section */}
                                    <section className="pt-4 border-t border-neutral-100 dark:border-neutral-900">
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedCandidate.status === 'Work Submitted' && (
                                                <>
                                                    <Button
                                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => {
                                                            handleStatusUpdate(selectedCandidate.id, "Hired");
                                                            setSelectedCandidate({ ...selectedCandidate, status: "Hired" });
                                                        }}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Hire Candidate
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={() => {
                                                            handleStatusUpdate(selectedCandidate.id, "Interview");
                                                            setSelectedCandidate({ ...selectedCandidate, status: "Interview" });
                                                        }}
                                                    >
                                                        Schedule Interview
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </ScrollArea>

                            {/* Sheet Footer Actions */}
                            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex justify-between items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full">
                                            Change Status <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuItem onClick={() => { handleStatusUpdate(selectedCandidate.id, "Shortlisted"); setSelectedCandidate({ ...selectedCandidate, status: "Shortlisted" }); }}> Move to Shortlisted</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { handleStatusUpdate(selectedCandidate.id, "Interview"); setSelectedCandidate({ ...selectedCandidate, status: "Interview" }); }}>Move to Interview</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { handleStatusUpdate(selectedCandidate.id, "Hired"); setSelectedCandidate({ ...selectedCandidate, status: "Hired" }); }}>Mark as Hired</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => { handleStatusUpdate(selectedCandidate.id, "Rejected"); setSelectedCandidate({ ...selectedCandidate, status: "Rejected" }); }}>Reject Application</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="shrink-0"
                                    onClick={() => {
                                        handleStatusUpdate(selectedCandidate.id, "Rejected");
                                        setSelectedCandidate({ ...selectedCandidate, status: "Rejected" });
                                    }}
                                    title="Reject"
                                >
                                    <XCircle className="w-4 h-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Applications;
