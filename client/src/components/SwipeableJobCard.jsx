import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Building2, Calendar, CircleCheckBig, CircleX, ExternalLink, Globe, MapPin, EyeOff } from "lucide-react";

export function SwipeableJobCard({ job, onSwipe, style }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-10, 10]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    // Background color based on swipe direction overlay
    const overlayRightOpacity = useTransform(x, [0, 200], [0, 0.5]);
    const overlayLeftOpacity = useTransform(x, [-200, 0], [0.5, 0]);

    const formatDate = (dateString) => {
        if (!dateString) return "Recently";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const getBudgetBreakdown = (budgetStr) => {
        const raw = parseFloat(budgetStr?.replace(/[^0-9.]/g, '') || 0);
        return {
            total: raw.toLocaleString(),
            main: (raw * 0.9).toLocaleString(),
            comp: (raw * 0.1).toLocaleString()
        };
    };

    const budget = getBudgetBreakdown(job.budget);

    const handleDragEnd = (event, info) => {
        const threshold = 150;
        if (info.offset.x > threshold) {
            onSwipe("right");
        } else if (info.offset.x < -threshold) {
            onSwipe("left");
        }
    };

    return (
        <motion.div
            style={{ x, rotate, opacity, ...style }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="absolute top-0 w-full h-full max-w-6xl cursor-grab active:cursor-grabbing perspective-1000"
        >
            <Card className="h-full w-full flex flex-col border bg-card shadow-2xl rounded-3xl overflow-hidden relative">
                {/* Swipe Indicators */}
                <motion.div style={{ opacity: overlayLeftOpacity }} className="absolute inset-0 bg-red-500/40 z-50 pointer-events-none flex items-center justify-start pl-32">
                    <CircleX className="w-80 h-80" color="red" />
                </motion.div>
                <motion.div style={{ opacity: overlayRightOpacity }} className="absolute inset-0 bg-green-500/40 z-50 pointer-events-none flex items-center justify-start pl-32">
                    <CircleCheckBig className="w-80 h-80" color="green" />
                </motion.div>

                <div className="flex flex-col xl:flex-row h-full">
                    {/* Left Side: Summary & Key Info */}
                    <CardHeader className="px-8 pt-8 pb-6 w-full xl:w-[45%] border-b xl:border-b-0 xl:border-r bg-neutral-50/80 dark:bg-neutral-900/50 backdrop-blur-md relative flex flex-col justify-between">
                        <div className="space-y-6">
                            {/* Header: Logo & Status */}
                            <div className="flex justify-between items-start">
                                <div className="h-16 w-16 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-100 dark:border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
                                    <Building2 className="w-8 h-8 text-neutral-400" />
                                </div>
                                <div className="flex gap-2 flex-wrap justify-end">
                                    {job.blindHiring && (
                                        <Badge variant="outline" className="rounded-full px-3 py-1 font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                            <EyeOff className="w-3 h-3" /> Blind Mode
                                        </Badge>
                                    )}
                                    <Badge variant="secondary" className="rounded-full px-3 py-1 font-medium bg-white dark:bg-neutral-800 shadow-xs">
                                        {job.type || "Freelance"}
                                    </Badge>
                                    <Badge className="rounded-full px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 border-none">
                                        {job.status || "Active"}
                                    </Badge>
                                </div>
                            </div>

                            {/* Title & Location */}
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-foreground leading-tight mb-3">
                                    {job.title}
                                </h1>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="w-4 h-4 shrink-0 text-indigo-500" />
                                    <span className="font-medium">{job.location || "Remote via SoHired"}</span>
                                    <span className="text-neutral-300 dark:text-neutral-700">•</span>
                                    <span className="text-sm">Posted {formatDate(job.postedAt || job.createdAt)}</span>
                                </div>
                            </div>

                            {/* Budget Card */}
                            <div className="bg-white dark:bg-neutral-950 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Globe className="w-24 h-24 text-indigo-500 transform translate-x-8 -translate-y-8" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total Project Budget</p>
                                    <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-4 tracking-tight">
                                        ${budget.total}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
                                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Project Fee (90%)</p>
                                            <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">${budget.main}</p>
                                        </div>
                                        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-3 border border-orange-100 dark:border-orange-900/30">
                                            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">Compensation (10%)</p>
                                            <p className="text-lg font-bold text-orange-900 dark:text-orange-100">${budget.comp}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Key Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium">Timeline</p>
                                        <p className="text-sm font-bold">{job.timeline || "TBD"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium">Applicants</p>
                                        <p className="text-sm font-bold">{job.applicantCount || 0} applied</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tech Stack Pills */}
                            <div className="flex flex-wrap gap-2">
                                {job.techStack?.split(',').map((tech, i) => (
                                    <Badge key={i} variant="outline" className="bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-normal">
                                        {tech.trim()}
                                    </Badge>
                                )) || <p className="text-sm text-muted-foreground">No specific stack listed.</p>}
                            </div>
                        </div>

                        <Button size="lg" className="w-full mt-6 gap-2 text-base font-bold h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-xl" onClick={() => onSwipe("right")}>
                            Apply for Project
                            <ExternalLink className="w-5 h-5" />
                        </Button>
                    </CardHeader>

                    {/* Right Side: Detailed Content */}
                    <CardContent
                        className="flex-1 w-full xl:w-[55%] overflow-y-auto p-8 bg-white dark:bg-neutral-950 custom-scrollbar"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <div className="max-w-none space-y-8">
                            {/* Description Section */}
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-neutral-900 dark:text-neutral-100">
                                    <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                                    Project Scope & Description
                                </h3>
                                <div
                                    className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-base space-y-4"
                                    dangerouslySetInnerHTML={{ __html: job.description || "<p>No description provided.</p>" }}
                                />
                            </div>

                            {/* Deliverables Section */}
                            {job.deliverables && (
                                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800">
                                    <h4 className="font-bold flex items-center gap-2 text-neutral-900 dark:text-neutral-100 mb-3">
                                        <CircleCheckBig className="w-5 h-5 text-emerald-500" />
                                        Expected Deliverables
                                    </h4>
                                    <p className="text-neutral-600 dark:text-neutral-400">{job.deliverables}</p>
                                </div>
                            )}

                            {/* Tasks / Milestones Section */}
                            {job.tasks && job.tasks.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-neutral-900 dark:text-neutral-100">
                                        <div className="w-1 h-6 bg-orange-500 rounded-full" />
                                        Tasks & Milestones
                                    </h3>
                                    <div className="grid gap-3">
                                        {job.tasks.map((task, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{task.description}</span>
                                                </div>
                                                <Badge variant="secondary" className="font-mono font-bold bg-neutral-100 dark:bg-neutral-800">
                                                    ${task.payout}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Dates Info Footer */}
                            {job.deadline && (
                                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-medium">Deadline: {formatDate(job.deadline)}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </div>
            </Card>
        </motion.div>
    );
}

