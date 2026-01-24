import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Clock, CheckCircle2, AlertCircle, Loader2, Building2, User, FileText, UserPlus, RefreshCcw, ArrowRight } from "lucide-react";
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { toast } from "sonner";
import { Progress } from "@/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";

const ActiveWork = () => {
    const { user } = useUser();
    const [engagements, setEngagements] = useState([]);
    const [loading, setLoading] = useState(true);
    // New state for Review Dialog
    const [reviewState, setReviewState] = useState(null); // { engagement, task, globalIndex, candidateNote }
    const [feedback, setFeedback] = useState("");
    
    // Switch Candidate State
    const [switchState, setSwitchState] = useState(null); // { engagement, module }
    const [availableCandidates, setAvailableCandidates] = useState([]);
    const [switchLoading, setSwitchLoading] = useState(false);

    useEffect(() => {
        const fetchActiveWork = async () => {
            if (!user) return;
            try {
                const response = await axios.get(`${import.meta.env.VITE_SERVER_API}/api/jobs/active-work/${user.id}`);
                setEngagements(response.data.activeEngagements);
            } catch (error) {
                console.error("Error fetching active work:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveWork();

    }, [user]);

    useEffect(() => {
        if (switchState) {
            const fetchCandidates = async () => {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_SERVER_API}/api/jobs/${switchState.engagement.jobId}/applicants`);
                    // Filter candidates: exclude current one, include Shortlisted/Applied
                    const candidates = response.data.applicants.filter(app => 
                        app.id !== switchState.engagement.id && 
                        (app.status === 'Shortlisted' || app.status === 'Applied') 
                    );
                    setAvailableCandidates(candidates);
                } catch (error) {
                    console.error("Error fetching candidates:", error);
                    toast.error("Failed to fetch available candidates");
                }
            };
            fetchCandidates();
        }
    }, [switchState]);

    const handleSwitchCandidate = async (newCandidateId) => {
        if (switchLoading) return;
        setSwitchLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_SERVER_API}/api/jobs/${switchState.engagement.jobId}/switch-candidate`, {
                jobId: switchState.engagement.jobId,
                oldCandidateId: switchState.engagement.id,
                newCandidateId
            });
            toast.success("Candidate switched successfully. Module reopened for new candidate.");
            setSwitchState(null);
            
            // Refresh Active Work List
            const response = await axios.get(`${import.meta.env.VITE_SERVER_API}/api/jobs/active-work/${user.id}`);
            setEngagements(response.data.activeEngagements);
        } catch (error) {
            console.error("Error switching candidate:", error);
            toast.error("Failed to switch candidate");
        } finally {
            setSwitchLoading(false);
        }
    };

    const openReviewDialog = (engagement, task, globalIndex) => {
        const candidateNote = engagement.taskProgress?.[globalIndex]?.submissionNote || "";
        setReviewState({ engagement, task, globalIndex, candidateNote });
        setFeedback(engagement.taskProgress?.[globalIndex]?.feedback || ""); // Load existing feedback if any (optional)
    };

    const handleVerifyTask = async (jobId, applicantId, taskIndex, status = 'verified') => {
        try {
            await axios.patch(`${import.meta.env.VITE_SERVER_API}/api/jobs/${jobId}/applicants/${applicantId}/tasks`, {
                taskIndex,
                status, // 'verified' or 'changes_requested'
                feedback: feedback // Send feedback
            });

            // Update local state
            setEngagements(prev => prev.map(eng => {
                if (eng.id === applicantId && eng.jobId === jobId) {
                    const updatedProgress = { ...eng.taskProgress };
                    updatedProgress[taskIndex] = {
                        ...updatedProgress[taskIndex],
                        status,
                        feedback: feedback
                    };
                    return { ...eng, taskProgress: updatedProgress };
                }
                return eng;
            }));

            toast.success(status === 'verified' ? "Task verified successfully" : "Requested changes for task");
            setReviewState(null);
            setFeedback("");
        } catch (error) {
            console.error("Error updating task:", error);
            toast.error("Failed to update task status");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Active Contracts</h1>
                <p className="text-muted-foreground text-lg">Manage ongoing projects and verify candidate milestones.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {engagements.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl bg-neutral-50 dark:bg-neutral-900/50">
                        <User className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                        <h3 className="text-xl font-medium text-foreground">No active contracts yet</h3>
                        <p className="max-w-md mx-auto mt-2">Once you hire candidates or start the submission phase, their progress will appear here.</p>
                    </div>
                ) : (
                    engagements.map((engagement) => {
                        const tasks = engagement.tasks || [];
                        const completedCount = Object.values(engagement.taskProgress || {}).filter(t => t.status === 'verified').length;
                        const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

                        return (
                            <Card key={`${engagement.jobId}-${engagement.id}`} className="overflow-hidden border-l-4 border-l-purple-600 shadow-sm hover:shadow-md transition-all">
                                <CardHeader className="bg-neutral-50/50 dark:bg-neutral-900/20 pb-4">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 border">
                                                <AvatarImage src={engagement.candidateImage} />
                                                <AvatarFallback>{engagement.candidateName[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-xl">{engagement.jobTitle}</CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <User className="w-3.5 h-3.5" />
                                                    <span className="font-medium text-foreground">{engagement.candidateName}</span>
                                                    <Badge variant="secondary" className="ml-2 text-xs">{engagement.status}</Badge>
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs text-muted-foreground">Started {formatDistanceToNow(new Date(engagement.appliedAt), { addSuffix: true })}</span>
                                            <Badge variant="outline" className="bg-white dark:bg-black">ID: {engagement.id.slice(0, 8)}</Badge>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-6 space-y-6">
                                    {/* Progress */}
                                    {/* <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Milestone Progress</span>
                                            <span className="text-muted-foreground">{completedCount} / {tasks.length} Verified</span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                    </div> */}

                                    {/* Task List / Module List */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                                            <CheckCircle2 className="w-4 h-" /> Project Modules & Milestones
                                        </h4>
                                        <div className="grid gap-3">
                                            {/* Support for Modular Structure */}
                                            {engagement.modules ? (
                                                engagement.modules
                                                    .filter(module => !engagement.squadRole || !module.assignedRole || module.assignedRole === engagement.squadRole) // Show if no role assigned OR matches squad role
                                                    .map((module, mIdx) => {
                                                        // Calculate Module Progress
                                                        let moduleTotalTasks = module.tasks.length;
                                                        let moduleVerifiedTasks = 0;
                                                        let moduleStartIndex = 0;

                                                        // Calculate global index start for this module
                                                        for (let i = 0; i < mIdx; i++) {
                                                            moduleStartIndex += engagement.modules[i].tasks.length;
                                                        }

                                                        // Check verification status for tasks in this module
                                                        for (let t = 0; t < moduleTotalTasks; t++) {
                                                            if (engagement.taskProgress?.[moduleStartIndex + t]?.status === 'verified') {
                                                                moduleVerifiedTasks++;
                                                            }
                                                        }

                                                        const moduleProgress = moduleTotalTasks > 0 ? (moduleVerifiedTasks / moduleTotalTasks) * 100 : 0;

                                                        return (
                                                            <div key={mIdx} className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                                                                <div className="bg-neutral-50 dark:bg-neutral-800/50 px-4 py-3 border-b flex flex-col gap-2">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <h5 className="font-semibold text-sm">{module.title}</h5>
                                                                            <p className="text-xs text-muted-foreground">{module.description}</p>
                                                                        </div>
                                                                        <div className="text-xs font-medium text-muted-foreground">
                                                                            Deadline: {module.deadline ? new Date(module.deadline).toLocaleDateString() : 'N/A'}
                                                                        </div>
                                                                    </div>
                                                                    {/* Module Progress Bar */}
                                                                    <div className="flex items-center gap-2">
                                                                        <Progress value={moduleProgress} className="h-1.5 flex-1" />
                                                                        <span className="text-xs text-muted-foreground font-medium">{Math.round(moduleProgress)}%</span>
                                                                    </div>
                                                                    {moduleProgress < 100 && (
                                                                        <Button 
                                                                            size="sm" 
                                                                            className="h-7 text-xs ml-2 gap-1 animate-in fade-in zoom-in bg-green-600 hover:bg-green-700 text-white"
                                                                            onClick={() => setSwitchState({ engagement, module })}
                                                                        >
                                                                            <UserPlus className="w-3 h-3" />
                                                                            Switch Candidate
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                                <div className="p-3 space-y-2">
                                                                    {module.tasks.map((task, tIdx) => {
                                                                        const globalIndex = moduleStartIndex + tIdx;
                                                                        const taskState = engagement.taskProgress?.[globalIndex]?.status;
                                                                        const isSubmitted = taskState === 'submitted';
                                                                        const isVerified = taskState === 'verified';
                                                                        const isChangesRequested = taskState === 'changes_requested';

                                                                        return (
                                                                            <div key={tIdx} className={`flex items-center justify-between p-3 rounded-md border text-sm ${isSubmitted ? 'bg-yellow-50 border-yellow-200' : isChangesRequested ? 'bg-red-50 border-red-200' : 'bg-card border-border'}`}>
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isVerified ? 'bg-green-500 border-green-500 text-white' : 'border-neutral-300'}`}>
                                                                                        {isVerified && <CheckCircle2 className="w-3 h-3" />}
                                                                                    </div>
                                                                                    <div className="flex flex-col">
                                                                                        <span className={isVerified ? 'line-through text-muted-foreground' : ''}>{task.description}</span>
                                                                                        {isChangesRequested && <span className="text-xs text-red-600 font-medium">Changes Requested</span>}
                                                                                    </div>
                                                                                </div>

                                                                                <div>
                                                                                    {isVerified ? (
                                                                                        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Verified</Badge>
                                                                                    ) : isSubmitted ? (
                                                                                        <Button
                                                                                            size="sm"
                                                                                            className="h-7 text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200"
                                                                                            onClick={() => openReviewDialog(engagement, task, globalIndex)}
                                                                                        >
                                                                                            Review
                                                                                        </Button>
                                                                                    ) : isChangesRequested ? (
                                                                                        <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">Revising</Badge>
                                                                                    ) : <span className="text-muted-foreground text-xs italic">Pending</span>}
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                            ) : (
                                                /* FALLBACK FOR LEGACY FLAT TASKS */
                                                tasks.map((task, idx) => {
                                                    const taskState = engagement.taskProgress?.[idx]?.status;
                                                    const isSubmitted = taskState === 'submitted';
                                                    const isVerified = taskState === 'verified';
                                                    const isChangesRequested = taskState === 'changes_requested';

                                                    return (
                                                        <div key={idx} className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${isSubmitted ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800' : isChangesRequested ? 'bg-red-50 border-red-200' : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800'}`}>
                                                            <div className="flex items-start gap-3">
                                                                <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${isVerified ? 'bg-green-500 border-green-500 text-white' : 'border-neutral-300'}`}>
                                                                    {isVerified && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                                </div>
                                                                <div>
                                                                    <p className={`text-sm font-medium ${isVerified ? 'line-through text-muted-foreground' : ''}`}>{task.description}</p>
                                                                    <span className="text-xs text-muted-foreground">Payout: {task.payout}</span>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                {isVerified ? (
                                                                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Verified</Badge>
                                                                ) : isSubmitted ? (
                                                                    <Button
                                                                        size="sm"
                                                                        className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200"
                                                                        onClick={() => openReviewDialog(engagement, task, idx)}
                                                                    >
                                                                        Review & Verify
                                                                    </Button>
                                                                ) : isChangesRequested ? (
                                                                    <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">Requested Changes</Badge>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground italic">Not started</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    {/* Final Submission Info */}
                                    {engagement.status === 'Work Submitted' && (
                                        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                                                    <FileText className="w-5 h-5" />
                                                    <span className="font-semibold">Final Project Submitted</span>
                                                </div>
                                                <Button size="sm" variant="outline" onClick={() => window.location.href = `/dashboard/recruiter/applications?job=${engagement.jobId}`}>
                                                    View Submission
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Review Dialog */}
            <Dialog open={!!reviewState} onOpenChange={(open) => !open && setReviewState(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Task</DialogTitle>
                        <DialogDescription>Review the candidate's work and provide feedback.</DialogDescription>
                    </DialogHeader>

                    {reviewState && (
                        <div className="py-2 space-y-4">
                            <div className="p-4 bg-muted/50 rounded-lg border">
                                <p className="font-medium text-sm mb-1">Task Description:</p>
                                <p className="text-muted-foreground text-sm">{reviewState.task.description}</p>
                            </div>

                            {reviewState.candidateNote && (
                                <div className="p-4 bg-blue-50 text-blue-900 rounded-lg border border-blue-100">
                                    <p className="font-semibold text-xs mb-1">Candidate Note:</p>
                                    <p className="text-sm">{reviewState.candidateNote}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Recruiter Feedback (Optional):</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Provide feedback or request changes..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleVerifyTask(reviewState.engagement.jobId, reviewState.engagement.id, reviewState.globalIndex, 'changes_requested')}>
                            Request Changes
                        </Button>
                        <Button onClick={() => handleVerifyTask(reviewState.engagement.jobId, reviewState.engagement.id, reviewState.globalIndex, 'verified')} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Verify
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Switch Candidate Dialog */}
            <Dialog open={!!switchState} onOpenChange={(open) => !open && setSwitchState(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-red-600" />
                            Switch Candidate & Reopen Module
                        </DialogTitle>
                        <DialogDescription>
                            The current candidate missed the deadline for <strong>{switchState?.module?.title}</strong>. 
                            Select a shortlisted candidate to replace them and restart the module.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                        {availableCandidates.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                                <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p>No other shortlisted candidates available.</p>
                            </div>
                        ) : (
                            availableCandidates.map((candidate) => (
                                <div key={candidate.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={candidate.imageUrl} />
                                            <AvatarFallback>{candidate.firstName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">{candidate.firstName} {candidate.lastName}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="outline" className="text-[10px] h-4 px-1">{candidate.status}</Badge>
                                                <span className="text-xs text-muted-foreground">Match: {candidate.suitabilityScore}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        variant="default"
                                        className="gap-2"
                                        onClick={() => handleSwitchCandidate(candidate.id)}
                                        disabled={switchLoading}
                                    >
                                        {switchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                        Select
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSwitchState(null)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ActiveWork;