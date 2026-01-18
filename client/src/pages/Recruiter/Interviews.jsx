import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Button } from "@/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import { Clock, CheckCircle2, MoreVertical, Loader2, MessageCircle, FileText, Briefcase, ExternalLink, Calendar, Send } from "lucide-react";
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Input } from "@/ui/input";
import { ScrollArea } from "@/ui/scroll-area";
import { Separator } from "@/ui/separator";

// Mock tasks until backend integration is complete
const mockTasks = [
    { description: "Initial Research & Wireframing", payout: "20%", completed: true },
    { description: "Frontend Development", payout: "40%", completed: true },
    { description: "Backend Integration", payout: "40%", completed: false },
];

const ActiveProjectsRecruiter = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null); // For Sheet details
    const [chatOpen, setChatOpen] = useState(false);
    const [chatCandidate, setChatCandidate] = useState(null);
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([]);


    useEffect(() => {
        const fetchTrackedProjects = async () => {
            if (!user) return;
            // Fetch jobs posted by recruiter, then finding Hired/Active candidates
            try {
                // 1. Get My Jobs
                const jobsRes = await axios.get(`${import.meta.env.VITE_SERVER_API}/api/jobs/recruiter/${user.id}`);
                const myJobs = jobsRes.data.jobs;

                // 2. For each job, get applicants who are active
                // This is N+1 but necessary without a specialized endpoint. Optimization can come later.
                const activeContracts = [];

                await Promise.all(myJobs.map(async (job) => {
                    try {
                        const appsRes = await axios.get(`${import.meta.env.VITE_SERVER_API}/api/jobs/${job._id}/applicants`);
                        const applicants = appsRes.data.applicants;

                        const hiredOrActive = applicants.filter(app =>
                            ["Hired", "Work Submitted", "Shortlisted", "Interview"].includes(app.status)
                        );

                        hiredOrActive.forEach(app => {
                            activeContracts.push({
                                id: app.id, // Application ID
                                jobId: job._id,
                                jobTitle: job.title,
                                company: job.companyName,
                                candidateName: `${app.firstName} ${app.lastName}`,
                                candidateEmail: app.email,
                                candidateImage: app.imageUrl,
                                status: app.status,
                                appliedAt: app.appliedAt,
                                progress: app.status === 'Hired' ? 100 : (app.status === 'Work Submitted' ? 80 : (app.status === 'Interview' ? 40 : 10)),
                                tasks: app.tasks || mockTasks // Use mock if backend doesn't return
                            });
                        });
                    } catch (err) {
                        console.error(`Failed to fetch applicants for job ${job._id}`, err);
                    }
                }));

                setProjects(activeContracts);
            } catch (error) {
                console.error("Error fetching recruiter projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrackedProjects();
    }, [user]);

    const openChat = (project) => {
        setChatCandidate(project);
        setMessages([{ sender: 'candidate', text: `Hello! I have a question about the ${project.jobTitle} project.` }]); // Mock initial message
        setChatOpen(true);
    };

    const sendMessage = () => {
        if (!messageInput.trim()) return;
        setMessages([...messages, { sender: 'me', text: messageInput }]);
        setMessageInput("");
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Active Projects</h1>
                    <p className="text-muted-foreground">Track progress of your hired candidates and ongoing contracts.</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/dashboard/recruiter/post-job')}>
                    <Briefcase className="w-4 h-4 mr-2" /> Post New Job
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                        <Briefcase className="w-10 h-10 mx-auto opacity-20 mb-3" />
                        <p className="font-medium">No active projects found.</p>
                        <p className="text-sm">Candidates you hire will appear here.</p>
                    </div>
                ) : (
                    projects.map((project) => (
                        <Card key={project.id} className="cursor-pointer hover:shadow-md transition-all group overflow-hidden border-l-4 border-l-primary/40">
                            <CardContent className="p-0">
                                {/* Header Section */}
                                <div className="p-6 pb-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{project.jobTitle}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>Active since {project.appliedAt ? formatDistanceToNow(new Date(project.appliedAt)) : "recent"}</span>
                                            </div>
                                        </div>
                                        <Badge variant={
                                            project.status === 'Hired' ? 'default' :
                                                project.status === 'Work Submitted' ? 'secondary' : 'outline'
                                        }>
                                            {project.status}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-lg">
                                        <Avatar className="h-10 w-10 border shadow-sm">
                                            <AvatarImage src={project.candidateImage} />
                                            <AvatarFallback>{project.candidateName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-medium truncate">{project.candidateName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{project.candidateEmail}</p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); openChat(project); }}>
                                            <MessageCircle className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                {/* Progress Section */}
                                <div className="p-6 pt-4 space-y-3 bg-neutral-50 dark:bg-neutral-900/10">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-muted-foreground">Project Progress</span>
                                        <span className="text-primary">{project.progress}%</span>
                                    </div>
                                    <Progress value={project.progress} className="h-2" />

                                    <Button className="w-full mt-2" variant="outline" onClick={() => setSelectedProject(project)}>
                                        View Milestones
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Project Details Sheet */}
            <Sheet open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
                <SheetContent className="sm:max-w-md w-full">
                    <SheetHeader>
                        <SheetTitle>Project Tracking</SheetTitle>
                        <SheetDescription>monitor tasks and deliverables.</SheetDescription>
                    </SheetHeader>

                    {selectedProject && (
                        <div className="mt-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16 border-2 border-primary/10">
                                        <AvatarImage src={selectedProject.candidateImage} />
                                        <AvatarFallback>{selectedProject.candidateName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-lg">{selectedProject.candidateName}</h3>
                                        <p className="text-sm text-muted-foreground">{selectedProject.jobTitle}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" className="flex-1" onClick={() => navigate(`/dashboard/recruiter/applications?job=${selectedProject.jobId}`)}>
                                        <ExternalLink className="w-4 h-4 mr-2" /> View Application
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { setChatCandidate(selectedProject); setChatOpen(true); }}>
                                        <MessageCircle className="w-4 h-4 mr-2" /> Message
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Milestones
                                </h4>
                                <ScrollArea className="h-[300px] pr-4">
                                    <div className="space-y-3">
                                        {selectedProject.tasks.map((task, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                                                <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center ${task.completed ? "bg-green-500 border-green-500" : "border-muted-foreground"}`}>
                                                    {task.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className={`text-sm font-medium leading-none ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                                                        {task.description}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Payout: {task.payout}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Chat Dialog */}
            <Dialog open={chatOpen} onOpenChange={setChatOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" /> Chat with {chatCandidate?.candidateName?.split(' ')[0]}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="h-[300px] flex flex-col border rounded-md p-4 bg-muted/20">
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-neutral-800 border'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Type a message..."
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <Button size="icon" onClick={sendMessage}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ActiveProjectsRecruiter;

