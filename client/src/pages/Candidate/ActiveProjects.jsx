import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/ui/dialog";
import { Input } from "@/ui/input";
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import { Checkbox } from "@/ui/checkbox";
import { Clock, FileCheck, UploadCloud, Loader2, DollarSign, MessageCircle, Send, FileText, Calendar, Building2, Info } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from "@/ui/scroll-area";
import { Separator } from "@/ui/separator";

const mockTasks = [
    { description: "Initial Research & Wireframing", payout: "20%" },
    { description: "Frontend Development", payout: "40%" },
    { description: "Backend Integration", payout: "40%" },
];

const ProjectCard = ({ project, onViewContract, onOpenChat }) => {
    const navigate = useNavigate();
    const tasks = project.tasks && project.tasks.length > 0 ? project.tasks : mockTasks;

    // Initialize task completion state (default to false unless status implies done)
    const [completedTasks, setCompletedTasks] = useState(
        new Array(tasks.length).fill(project.status === 'Work Submitted' || project.status === 'Hired')
    );

    const handleTaskToggle = (index) => {
        const newCompleted = [...completedTasks];
        newCompleted[index] = !newCompleted[index];
        setCompletedTasks(newCompleted);
    };

    const allTasksCompleted = completedTasks.every(Boolean);

    return (
        <Card className="overflow-hidden border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6 space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight">{project.projectTitle}</h2>
                            <Badge variant="outline" className={
                                project.status === 'Hired' ? "border-green-200 text-green-700 bg-green-50" :
                                    "border-indigo-200 text-indigo-700 bg-indigo-50"
                            }>
                                {project.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            <span className="font-medium">{project.company}</span>
                            <span>•</span>
                            <span className="text-xs">ID: {project.id.slice(0, 8)}</span>
                        </div>
                    </div>

                    {/* Meta Data */}
                    <div className="flex flex-wrap gap-4 text-sm bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span className="text-muted-foreground">Started: </span>
                            <span className="font-medium">{project.sentDate ? formatDistanceToNow(new Date(project.sentDate), { addSuffix: true }) : 'Recently'}</span>
                        </div>
                        <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 self-center hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-muted-foreground">Budget: </span>
                            <span className="font-medium">{project.bidAmount}</span>
                        </div>
                    </div>

                    {/* Todo List / Tasks */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                            <FileCheck className="w-4 h-4" /> Project Tasks & Milestones
                        </h4>
                        <div className="space-y-2 border rounded-lg p-2 bg-white dark:bg-black">
                            {tasks.map((task, i) => (
                                <div key={i} className="flex items-start space-x-3 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-md transition-colors">
                                    <Checkbox
                                        id={`task-${project.id}-${i}`}
                                        checked={completedTasks[i]}
                                        onCheckedChange={() => handleTaskToggle(i)}
                                    />
                                    <div className="grid gap-1.5 leading-none flex-1">
                                        <label
                                            htmlFor={`task-${project.id}-${i}`}
                                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${completedTasks[i] ? 'line-through text-muted-foreground' : ''}`}
                                        >
                                            {task.description}
                                        </label>
                                        <p className="text-xs text-muted-foreground">
                                            Payout Release: {task.payout}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground px-1">
                            <span>{completedTasks.filter(Boolean).length} of {tasks.length} tasks completed</span>
                            <span>{Math.round((completedTasks.filter(Boolean).length / tasks.length) * 100)}% Progress</span>
                        </div>
                        <Progress value={(completedTasks.filter(Boolean).length / tasks.length) * 100} className="h-2" />
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="bg-neutral-50 dark:bg-neutral-900/40 p-6 flex flex-col gap-3 min-w-[260px] border-t md:border-t-0 md:border-l justify-center">
                    <Button
                        className={`w-full gap-2 transition-all ${allTasksCompleted ? "animate-pulse" : "opacity-80"}`}
                        onClick={() => navigate(`/dashboard/submit-work/${project.jobId}`)}
                        disabled={!allTasksCompleted}
                    >
                        {allTasksCompleted ? <UploadCloud className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                        {allTasksCompleted ? "Submit Final Work" : "Complete All Tasks"}
                    </Button>

                    <p className="text-[10px] text-center text-muted-foreground leading-tight px-2">
                        {allTasksCompleted
                            ? "All tasks checked. You can now submit your work for review."
                            : "Please mark all tasks as completed to unlock submission."}
                    </p>

                    <Separator className="my-2" />

                    <Button variant="outline" className="w-full gap-2" onClick={() => onOpenChat(project)}>
                        <MessageCircle className="w-4 h-4" /> Chat Recruiter
                    </Button>
                    <Button variant="ghost" className="w-full gap-2" onClick={() => onViewContract(project)}>
                        <FileText className="w-4 h-4" /> View Contract
                    </Button>
                </div>
            </div>
        </Card>
    );
};

const ActiveProjects = () => {
    const { user } = useUser();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dialog States
    const [chatOpen, setChatOpen] = useState(false);
    const [contractOpen, setContractOpen] = useState(false);
    const [activeProject, setActiveProject] = useState(null);

    // Chat logic
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([
        { sender: 'recruiter', text: "Hi there! Let me know if you have any questions about the milestones." }
    ]);

    useEffect(() => {
        const fetchActiveProjects = async () => {
            if (!user) return;
            try {
                const response = await axios.get(`${import.meta.env.VITE_SERVER_API}/api/jobs/applications/${user.id}`);
                const allApps = response.data.applications;
                const activeApps = allApps.filter(app => ["Hired", "Work Submitted", "Shortlisted", "Interview"].includes(app.status));

                const projectsWithTasks = activeApps.map(app => ({
                    ...app,
                    tasks: app.tasks || [],
                }));

                setProjects(projectsWithTasks);
            } catch (error) {
                console.error("Error fetching active projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveProjects();
    }, [user]);

    const handleOpenChat = (project) => {
        setActiveProject(project);
        setChatOpen(true);
    };

    const handleViewContract = (project) => {
        setActiveProject(project);
        setContractOpen(true);
    };

    const sendMessage = () => {
        if (!messageInput.trim()) return;
        setMessages([...messages, { sender: 'me', text: messageInput }]);
        setMessageInput("");
        setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'recruiter', text: "Thanks for the update! I'll review it shortly." }]);
        }, 1500);
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
                <h1 className="text-3xl font-bold tracking-tight">Active Projects</h1>
                <p className="text-muted-foreground text-lg">Manage your ongoing freelance contracts and track progress.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-xl border border-dashed">
                        <div className="p-4 bg-muted rounded-full mb-4">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold">No active projects</h3>
                        <p className="text-muted-foreground mt-2 max-w-md text-center">You haven't been hired for any projects yet. Keep applying to jobs!</p>
                        <Button variant="default" asChild className="mt-6">
                            <a href="/dashboard">Find Work</a>
                        </Button>
                    </div>
                ) : (
                    projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onOpenChat={handleOpenChat}
                            onViewContract={handleViewContract}
                        />
                    ))
                )}
            </div>

            {/* Chat Dialog */}
            <Dialog open={chatOpen} onOpenChange={setChatOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-primary" />
                            Chat with {activeProject?.company}
                        </DialogTitle>
                        <DialogDescription>Direct message connection provided by SoHired.</DialogDescription>
                    </DialogHeader>
                    <div className="h-[400px] flex flex-col border rounded-lg bg-neutral-50 dark:bg-neutral-900/50 mt-2">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-neutral-800 border rounded-bl-none'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-background border-t">
                            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                                <Input
                                    placeholder="Type your message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Contract Dialog */}
            <Dialog open={contractOpen} onOpenChange={setContractOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="w-6 h-6 text-primary" /> Project Contract
                        </DialogTitle>
                        <DialogDescription>
                            Official agreement for {activeProject?.projectTitle}
                        </DialogDescription>
                    </DialogHeader>

                    {activeProject && (
                        <ScrollArea className="flex-1 px-6 py-2">
                            <div className="space-y-6 text-sm">
                                <section className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs text-muted-foreground uppercase font-bold">Client</span>
                                            <p className="font-medium text-base">{activeProject.company}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground uppercase font-bold">Freelancer</span>
                                            <p className="font-medium text-base">{user?.fullName || "You"}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground uppercase font-bold">Start Date</span>
                                            <p>{activeProject.sentDate ? new Date(activeProject.sentDate).toLocaleDateString() : "Immediate"}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground uppercase font-bold">Total Budget</span>
                                            <p className="font-mono">{activeProject.bidAmount}</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-2">
                                    <h4 className="font-semibold text-lg border-b pb-1">Scope of Work</h4>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {activeProject.description || "The freelancer agrees to deliver the milestones as outlined in the initial job posting. All work must be original and meet the quality standards of the client."}
                                    </p>
                                </section>

                                <section className="space-y-2">
                                    <h4 className="font-semibold text-lg border-b pb-1">Milestones & Deliverables</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                        {(activeProject.tasks && activeProject.tasks.length > 0 ? activeProject.tasks : mockTasks).map((task, i) => (
                                            <li key={i}>
                                                <span className="font-medium text-foreground">{task.description}</span> - <span className="text-xs bg-muted px-2 py-0.5 rounded">{task.payout} Payout</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="space-y-2">
                                    <h4 className="font-semibold text-lg border-b pb-1">Terms & Conditions</h4>
                                    <p className="text-xs text-muted-foreground text-justify">
                                        1. <strong>Confidentiality:</strong> Both parties agree to keep all project details confidential.<br />
                                        2. <strong>Payment:</strong> Payment will be released upon successful completion of milestones as verified by the client.<br />
                                        3. <strong>Termination:</strong> This contract may be terminated by either party with 7 days written notice, subject to payment for work already completed.<br />
                                        4. <strong>Ownership:</strong> Upon full payment, all intellectual property rights for the deliverables shall transfer to the Client.
                                    </p>
                                </section>
                            </div>
                        </ScrollArea>
                    )}

                    <DialogFooter className="p-6 pt-2 border-t mt-4 flex justify-between sm:justify-between items-center bg-muted/10">
                        <p className="text-[10px] text-muted-foreground">
                            Digital Signature ID: {activeProject?.id}
                        </p>
                        <Button onClick={() => setContractOpen(false)}>Close Contract</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ActiveProjects;
