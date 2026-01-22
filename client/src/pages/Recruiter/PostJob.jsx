import React, { useState, useEffect } from 'react';
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Select } from "@/ui/select";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar } from "@/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, DollarSign, Clock, Code2, FileText, UploadCloud, Trash2, Plus } from "lucide-react";
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { Checkbox } from "@/ui/checkbox";

const PostJob = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useUser();
    const [date, setDate] = useState();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [jobId, setJobId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        timeline: "",
        type: "",
        techStack: "",
        description: "",
        budget: "",
        deliverables: "",
        blindHiring: false
    });

    const [tasks, setTasks] = useState([{ description: "", payout: "" }]);

    useEffect(() => {
        // Check if we are in Edit Mode
        if (location.state && location.state.job) {
            const { job } = location.state;
            setIsEditMode(true);
            setJobId(job.id || job.jobId); // Handle possible ID field names
            setFormData({
                title: job.title || "",
                timeline: job.timeline || "",
                type: job.type || "",
                techStack: job.techStack || "",
                description: job.description || "",
                budget: job.budget || "",
                deliverables: job.deliverables || "",
                blindHiring: job.blindHiring || false
            });
            if (job.deadline) {
                setDate(new Date(job.deadline));
            }
            if (job.tasks && Array.isArray(job.tasks)) {
                setTasks(job.tasks);
            }
        }
    }, [location.state]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSelectChange = (value, id) => {
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleTaskChange = (index, field, value) => {
        const newTasks = [...tasks];
        newTasks[index][field] = value;
        setTasks(newTasks);
    };

    const addTask = () => {
        setTasks([...tasks, { description: "", payout: "" }]);
    };

    const removeTask = (index) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    const handleSubmit = async (status = "Active") => {
        if (!formData.title || !formData.description || !formData.timeline || !formData.techStack) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                recruiterId: user?.id,
                ...formData,
                tasks: tasks,
                deadline: date ? date.toISOString() : null,
                status: status,
                // Only update postedAt if it's a new post or if we want to refresh it. 
                // For edits, we might want to keep original or update 'updatedAt'.
                // Keeping it simple for now.
                postedAt: isEditMode ? undefined : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (isEditMode && jobId) {
                // Update existing job
                await axios.post(`${import.meta.env.VITE_SERVER_API}/api/jobs/update`, {
                    jobId: jobId,
                    ...payload
                });
            } else {
                // Create new job
                await axios.post(`${import.meta.env.VITE_SERVER_API}/api/jobs/post`, payload);
            }

            navigate("/dashboard/recruiter/manage-jobs");
        } catch (error) {
            console.error("Error posting/updating job:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent text-muted-foreground transition-colors hover:text-foreground" onClick={() => navigate(-1)}>← Back to Dashboard</Button>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400">
                        {isEditMode ? "Edit Project" : "Post a Project"}
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        {isEditMode ? "Update your project details below." : "Define your requirements to find the perfect developer."}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Project Details</CardTitle>
                            <CardDescription>Tell us the core requirements of the project.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-base">Project Title <span className="text-red-500">*</span></Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Build a Responsive E-commerce Dashboard"
                                    className="h-12 text-lg"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-base">Description & Scope <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="description"
                                    className="min-h-[200px] resize-y text-base p-4 leading-relaxed"
                                    placeholder="Outline the project goals, key features, and any specific design or functional requirements..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="techStack" className="text-base flex items-center gap-2">
                                    <Code2 className="w-4 h-4 text-muted-foreground" />
                                    Tech Stack Required <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="techStack"
                                    placeholder="e.g. React, Node.js, PostgreSQL, AWS"
                                    value={formData.techStack}
                                    onChange={handleInputChange}
                                />
                                <p className="text-xs text-muted-foreground">Separate technologies with commas.</p>
                            </div>

                            <div className="flex items-start space-x-3 p-4 border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg">
                                <Checkbox
                                    id="blindHiring"
                                    checked={formData.blindHiring}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, blindHiring: checked }))}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label
                                        htmlFor="blindHiring"
                                        className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-indigo-900 dark:text-indigo-100"
                                    >
                                        Enable Blind Hiring Mode
                                    </Label>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        Mask candidate personal details (Name, Email, etc.) to delete bias. Information is revealed only upon hiring.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Logistics & Compensation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="timeline" className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        Estimated Timeline <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={["Less than 1 Week", "1-2 Weeks", "2-4 Weeks", "1-3 Months", "3+ Months"]}
                                        placeholder="Select duration"
                                        value={formData.timeline}
                                        onChange={(val) => handleSelectChange(val, "timeline")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type" className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                        Employment Type <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={["Contract", "Freelance", "Full-time", "Part-time", "Internship"]}
                                        placeholder="Select type"
                                        value={formData.type}
                                        onChange={(val) => handleSelectChange(val, "type")}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="budget" className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                                        Total Budget
                                    </Label>
                                    <Input
                                        id="budget"
                                        placeholder="e.g. 5000"
                                        value={formData.budget}
                                        onChange={handleInputChange}
                                        type="number"
                                        min="0"
                                    />
                                    <p className="text-xs text-muted-foreground">Enter the total project budget.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="mainBudget" className="text-muted-foreground">Main Budget (90%)</Label>
                                        <Input
                                            id="mainBudget"
                                            value={formData.budget ? `$${((parseFloat(formData.budget) || 0) * 0.90).toFixed(2)}` : ''}
                                            readOnly
                                            className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="compensationBudget" className="text-muted-foreground">Compensation Budget (10%)</Label>
                                        <Input
                                            id="compensationBudget"
                                            value={formData.budget ? `$${((parseFloat(formData.budget) || 0) * 0.10).toFixed(2)}` : ''}
                                            readOnly
                                            className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 flex flex-col">
                                    <Label className="mb-2 flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                        Submission Deadline
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={`w-full justify-start text-left font-normal h-10 ${!date && "text-muted-foreground"}`}
                                            >
                                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deliverables" className="flex items-center gap-2">
                                        <UploadCloud className="w-4 h-4 text-muted-foreground" />
                                        Expected Deliverables
                                    </Label>
                                    <Input
                                        id="deliverables"
                                        placeholder="e.g. GitHub Repo, Figma Link, Hosted URL"
                                        value={formData.deliverables}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Project Tasks & Milestones</CardTitle>
                            <CardDescription>Break down the project into key tasks and their payout values.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {tasks.map((task, index) => (
                                <div key={index} className="flex gap-4 items-start">
                                    <div className="flex-1 space-y-2">
                                        <Label>Task Description</Label>
                                        <Input
                                            placeholder="e.g. Design Home Page"
                                            value={task.description}
                                            onChange={(e) => handleTaskChange(index, "description", e.target.value)}
                                        />
                                    </div>
                                    <div className="w-1/3 space-y-2">
                                        <Label>Payout</Label>
                                        <Input
                                            placeholder="$100"
                                            value={task.payout}
                                            onChange={(e) => handleTaskChange(index, "payout", e.target.value)}
                                        />
                                    </div>
                                    {tasks.length > 1 && (
                                        <Button variant="ghost" size="icon" className="mt-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeTask(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button variant="outline" onClick={addTask} className="mt-2 w-full gap-2 border-dashed">
                                <Plus className="w-4 h-4" /> Add Another Task
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Preview / Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 sticky top-6">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {isEditMode ? "Update Project" : "Publish Project"}
                            </CardTitle>
                            <CardDescription>
                                {isEditMode ? "Save your changes to update the listing." : "Review and launch your project to the marketplace."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Your project will be visible to all verified candidates.</li>
                                    <li>You can edit details after posting.</li>
                                    <li>Proposals will appear in your dashboard immediately.</li>
                                </ul>
                            </div>
                            <div className="pt-4 flex flex-col gap-3">
                                <Button
                                    size="lg"
                                    className="w-full font-semibold shadow-lg shadow-primary/20"
                                    onClick={() => handleSubmit("Active")}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditMode ? "Save Changes" : "Post Project Now")}
                                </Button>
                                {!isEditMode && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => handleSubmit("Draft")}
                                        disabled={isSubmitting}
                                    >
                                        Save as Draft
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    );
};

export default PostJob;
