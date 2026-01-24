import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Calendar, Clock, DollarSign, Loader2, Building2, UploadCloud, Lock, PhoneOutgoing, PhoneMissed, Sparkles } from "lucide-react";
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import Vapi from "@vapi-ai/web";


const MyProposals = () => {
    const { user } = useUser();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitOpen, setSubmitOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [submissionLink, setSubmissionLink] = useState("");
    const [submissionDesc, setSubmissionDesc] = useState("");
    const [submissionImages, setSubmissionImages] = useState("");
    const [submissionNotes, setSubmissionNotes] = useState("");

    const [vapi, setVapi] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState([]);
    const [interviewModalOpen, setInterviewModalOpen] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const scrollRef = useRef(null);
    const transcriptRef = useRef([]);
    const interviewJobIdRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcript]);

    useEffect(() => {
        const fetchProposals = async () => {
            if (!user) return;
            try {
                const response = await axios.get(`${import.meta.env.VITE_SERVER_API}/api/jobs/applications/${user.id}`);
                setProposals(response.data.applications);
            } catch (error) {
                console.error("Error fetching proposals:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProposals();
    }, [user]);

    const handleOpenSubmit = (jobId) => {
        setSelectedJobId(jobId);
        setSubmitOpen(true);
    };

    const selectedProposal = proposals.find(p => p.jobId === selectedJobId);

    const handleSubmitWork = async () => {
        if (!selectedJobId || !submissionLink) return;
        try {
            await axios.post(`${import.meta.env.VITE_SERVER_API}/api/jobs/submit-work`, {
                jobId: selectedJobId,
                userId: user.id,
                submissionLink,
                description: submissionDesc,
                images: submissionImages.split(',').map(url => url.trim()).filter(url => url),
                additionalNotes: submissionNotes
            });

            // Update local state
            setProposals(prev => prev.map(p =>
                p.jobId === selectedJobId ? { ...p, status: "Work Submitted" } : p
            ));

            setSubmitOpen(false);
            setSubmissionLink("");
            setSubmissionDesc("");
            setSubmissionImages("");
            setSubmissionNotes("");
        } catch (error) {
            console.error("Error submitting work:", error);
            // Optionally add toast error here
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Shortlisted': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Shortlisted</Badge>;
            case 'Work Submitted': return <Badge className="bg-blue-500 hover:bg-blue-600">Work Submitted</Badge>;
            case 'Interview': return <Badge className="bg-purple-500 hover:bg-purple-600">Interview</Badge>;
            case 'Applied': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending Review</Badge>;
            case 'Rejected': return <Badge variant="destructive">Not Selected</Badge>;
            case 'Hired': return <Badge className="bg-green-600 hover:bg-green-700">Hired 🎉</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    useEffect(() => {
        const vapiInstance = new Vapi("9e20e004-ca55-4f96-819c-61fe4be9a71b");
        setVapi(vapiInstance);

        // Event listeners
        vapiInstance.on("call-start", () => {
            console.log("Call started");
            setIsConnected(true);
        });

        vapiInstance.on("call-end", () => {
            console.log("Call ended");
            setIsConnected(false);
            setIsSpeaking(false);

            // Trigger Analysis
            if (transcriptRef.current.length > 0 && interviewJobIdRef.current) {
                analyzeInterview();
            }
        });

        vapiInstance.on("speech-start", () => {
            console.log("Assistant started speaking");
            setIsSpeaking(true);
        });

        vapiInstance.on("speech-end", () => {
            console.log("Assistant stopped speaking");
            setIsSpeaking(false);
        });

        vapiInstance.on("message", (message) => {
            if (message.type === "transcript") {
                if (
                    message.type === "transcript" &&
                    message.transcriptType == "final"
                ) {
                    const newMsg = {
                        role: message.role,
                        text: message.transcript,
                    };

                    setTranscript((prev) => [...prev, newMsg]);
                    transcriptRef.current.push(newMsg);
                }
            }
        });

        vapiInstance.on("error", (error) => {
            console.error("Vapi error:", error);
        });

        return () => {
            vapiInstance?.stop();
        };
    }, []);

    const analyzeInterview = async () => {
        if (!interviewJobIdRef.current || !user) return;

        setAnalyzing(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_API}/api/jobs/${interviewJobIdRef.current}/applicants/${user.id}/analyze-interview`,
                { transcript: transcriptRef.current }
            );
            setAnalysisResult(response.data);
        } catch (error) {
            console.error("Analysis failed:", error);
            // toast.error("Failed to analyze interview");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleViewAnalysis = (proposal) => {
        setAnalysisResult({
            interviewScore: proposal.interviewScore,
            interviewSummary: proposal.interviewSummary,
            interviewStrengths: proposal.interviewStrengths,
            interviewWeaknesses: proposal.interviewWeaknesses,
        });
        setTranscript([]); // Or fetch stored transcript if available
        setInterviewModalOpen(true);
    };

    const startCall = (jobId) => {
        setTranscript([]);
        transcriptRef.current = [];
        setAnalysisResult(null);
        interviewJobIdRef.current = jobId;
        setInterviewModalOpen(true);
        if (vapi) {
            vapi.start("c883251f-3ff9-4a84-909c-17c6db653133");
        }
    };
    const endCall = () => {
        if (vapi) {
            vapi.stop();
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
        <div className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Proposals</h1>
                <p className="text-muted-foreground">Track the status of your submitted project proposals.</p>
            </div>

            {proposals.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <p>You haven't applied to any projects yet.</p>
                    <Button variant="link" asChild className="mt-2">
                        <a href="/dashboard">Find Projects</a>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {proposals.map((proposal) => {
                        // Check if submission is allowed: User is shortlisted AND Job is in Submission Status
                        const isSubmissionAllowed = proposal.status === 'Shortlisted' && (proposal.jobStatus === 'SubmissionOpen' || proposal.jobStatus === 'Closed');

                        return (
                            <Card key={proposal.jobId} className="flex flex-col hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        {getStatusBadge(proposal.status)}
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {proposal.sentDate ? formatDistanceToNow(new Date(proposal.sentDate), { addSuffix: true }) : 'Recently'}
                                        </span>
                                    </div>
                                    <CardTitle className="line-clamp-1 text-lg">{proposal.projectTitle}</CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> {proposal.company}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground"><DollarSign className="w-4 h-4" /> Bid Amount:</span>
                                        <span className="font-medium">{proposal.bidAmount}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /> Duration:</span>
                                        <span className="font-medium">{proposal.duration}</span>
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-0 flex flex-col gap-2">
                                    {proposal.status === 'Shortlisted' && (
                                        <>
                                            <Button
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                                                onClick={() => handleOpenSubmit(proposal.jobId)}
                                                disabled={!isSubmissionAllowed}
                                                title={!isSubmissionAllowed ? "Recruiter has not started submission phase yet" : "Submit your work"}
                                            >
                                                {isSubmissionAllowed ? <UploadCloud className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                {isSubmissionAllowed ? "Submit Proof of Work" : "Submission Locked"}
                                            </Button>
                                            <div className="w-full mt-4 flex justify-center">
                                                {proposal.interviewScore ? (
                                                    <button
                                                        className="flex gap-2 items-center bg-purple-100 hover:bg-purple-200 text-purple-800 border-none rounded-full px-5 py-3 text-base font-bold cursor-pointer transition-all duration-300 ease-in-out shadow-sm"
                                                        onClick={() => handleViewAnalysis(proposal)}
                                                    >
                                                        <Sparkles className="w-5 h-5" />
                                                        <p>View Interview Analysis</p>
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="flex gap-2 items-center bg-light-primary dark:bg-dark-primary text-white border-none rounded-full px-5 py-3 text-base font-bold cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out shadow-md"
                                                        onClick={() => startCall(proposal.jobId)}
                                                    >
                                                        <PhoneOutgoing className="w-5 h-5" />
                                                        <p>Talk to Assistant</p>
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {proposal.status === 'Work Submitted' && (
                                        <Button variant="outline" className="w-full" disabled>
                                            Under Review
                                        </Button>
                                    )}
                                    {(proposal.status === 'Interview') && (
                                        <Button className="w-full bg-purple-600 hover:bg-purple-700">Check Email for Details</Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Submit Proof of Work</DialogTitle>
                        <DialogDescription className="space-y-2">
                            <p>Upload your project files or provide a link to your repository/portfolio.</p>
                            {selectedProposal && selectedProposal.submissionTask && (
                                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-100 dark:border-blue-800 mt-2">
                                    <span className="font-semibold text-blue-800 dark:text-blue-200 block mb-1 text-xs uppercase tracking-wide">Recruiter's Task:</span>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300 italic">
                                        "{selectedProposal.submissionTask}"
                                    </p>
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="link" className="text-right">
                                Project Link
                            </Label>
                            <Input
                                id="link"
                                value={submissionLink}
                                onChange={(e) => setSubmissionLink(e.target.value)}
                                placeholder="https://github.com/..."
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="desc" className="text-right">
                            Description
                        </Label>
                        <Textarea
                            id="desc"
                            value={submissionDesc}
                            onChange={(e) => setSubmissionDesc(e.target.value)}
                            placeholder="Briefly describe your approach..."
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="images" className="text-right">
                            Image URLs
                        </Label>
                        <Input
                            id="images"
                            value={submissionImages}
                            onChange={(e) => setSubmissionImages(e.target.value)}
                            placeholder="Comma separated URLs..."
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">
                            Challenges/Notes
                        </Label>
                        <Textarea
                            id="notes"
                            value={submissionNotes}
                            onChange={(e) => setSubmissionNotes(e.target.value)}
                            placeholder="Any challenges faced or notes for the recruiter..."
                            className="col-span-3"
                        />
                    </div>
                    {/* </div> */}
                    <DialogFooter>
                        <Button type="submit" onClick={handleSubmitWork}>Submit for Review</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={interviewModalOpen} onOpenChange={(open) => {
                if (!open) endCall();
                setInterviewModalOpen(open);
            }}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Interview in Progress</DialogTitle>
                        <DialogDescription>
                            Speak clearly with the AI assistant. The conversation is being transcribed below.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center justify-center p-4">
                        <div className="w-full bg-white dark:bg-neutral-900 rounded-xl p-5 shadow-sm border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`${isSpeaking
                                            ? "bg-[#ff4444] animate-pulse"
                                            : "bg-[#12A594]"
                                            } w-3 h-3 rounded-full`}></div>
                                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                        {isSpeaking
                                            ? "Assistant Speaking..."
                                            : "Listening..."}
                                    </span>
                                </div>
                                <button
                                    onClick={endCall}
                                    className="bg-[#ff4444] hover:bg-red-600 flex gap-2 items-center text-white border-none rounded-md px-4 py-2 text-sm font-medium cursor-pointer transition-colors">
                                    <PhoneMissed className="w-4 h-4" />
                                    <p>End Call</p>
                                </button>
                            </div>

                            <div
                                ref={scrollRef}
                                className="h-[400px] overflow-y-auto mb-3 p-4 bg-[#f8f9fa] dark:bg-neutral-800 rounded-lg space-y-3">
                                {analyzing ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                                        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                                        <p className="text-neutral-500 animate-pulse">Analyzing interview performance...</p>
                                    </div>
                                ) : analysisResult ? (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="text-center space-y-2 border-b pb-4 dark:border-neutral-700">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 border-4 border-purple-500 text-purple-700 dark:text-purple-300 font-bold text-2xl">
                                                {analysisResult.interviewScore}
                                            </div>
                                            <h3 className="text-xl font-bold">Interview Analysis</h3>
                                            <p className="text-sm text-muted-foreground">{analysisResult.interviewSummary}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                                                    Strengths
                                                </h4>
                                                <ul className="text-sm space-y-1 list-disc pl-4 text-neutral-700 dark:text-neutral-300">
                                                    {analysisResult.interviewStrengths?.map((s, i) => (
                                                        <li key={i}>{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                                                    Improvements
                                                </h4>
                                                <ul className="text-sm space-y-1 list-disc pl-4 text-neutral-700 dark:text-neutral-300">
                                                    {analysisResult.interviewWeaknesses?.map((w, i) => (
                                                        <li key={i}>{w}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t dark:border-neutral-700">
                                            <h4 className="font-semibold text-sm mb-2 text-neutral-500 uppercase tracking-wider">Transcript</h4>
                                            <div className="max-h-40 overflow-y-auto space-y-2 text-xs text-neutral-600 dark:text-neutral-400 p-2 bg-neutral-100 dark:bg-neutral-900 rounded">
                                                {transcript.map((msg, i) => (
                                                    <p key={i}>
                                                        <span className="font-bold uppercase mr-1">{msg.role}:</span>
                                                        {msg.text}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : !isConnected && transcript.length > 0 ? (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg border-b pb-2">Interview Transcript</h3>
                                        <div className="space-y-2 text-sm">
                                            {transcript.map((msg, i) => (
                                                <p key={i} className="leading-relaxed">
                                                    <span className={`font-bold ${msg.role === 'assistant' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'} uppercase text-xs mr-2`}>
                                                        {msg.role}:
                                                    </span>
                                                    {msg.text}
                                                </p>
                                            ))}
                                            <p className="text-center text-muted-foreground text-xs pt-4">Waiting for analysis...</p>
                                        </div>
                                    </div>
                                ) : (
                                    transcript.length === 0 ? (
                                        <div className="flex h-full items-center justify-center text-neutral-500">
                                            <p>Conversation will appear here...</p>
                                        </div>
                                    ) : (
                                        transcript.map((msg, i) => (
                                            <div
                                                key={i}
                                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                                                    }`}>
                                                <div
                                                    className={`${msg.role === "user"
                                                        ? "bg-[#12A594] text-white"
                                                        : "bg-[#333] dark:bg-neutral-700 text-white"
                                                        } px-4 py-2 rounded-2xl text-sm max-w-[80%] shadow-sm`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default MyProposals;
