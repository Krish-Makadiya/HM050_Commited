import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookOpen, MapPin, Building2, Calendar, Loader2, Sparkles, GraduationCap, CheckCircle2, Target } from 'lucide-react';
import { motion } from "framer-motion";

const CourseSuggestions = () => {
    const { user, isLoaded } = useUser();
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedJobs = async () => {
            if (!user) return;
            try {
                const response = await axios.get(`${import.meta.env.VITE_SERVER_API}/api/jobs/saved-jobs/${user.id}`);
                setSavedJobs(response.data);
            } catch (error) {
                console.error("Error fetching saved jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded) {
            fetchSavedJobs();
        }
    }, [user, isLoaded]);

    if (!isLoaded || loading) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-neutral-50 dark:bg-neutral-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const handleRoadmapGeneration = async (job) => {
        try {
            const skills = job.course_recommendations?.map(rec => rec.skill) || [];

            if (skills.length === 0) {
                console.warn("No skills found for roadmap generation");
                return;
            }

            const payload = {
                userId: user.id,
                jobId: job.id,
                skills: skills,
                context: `Roadmap for ${job.title} at ${job.companyName}`
            };

            const res = await axios.post('http://localhost:5678/webhook-test/get-roadmap', payload);
            console.log("Roadmap Generation Response:", res);
        } catch (error) {
            console.error("Error generating roadmap:", error);
        }
    }

    return (
        <div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-950 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-yellow-500" />
                        Career Growth & Learning Path
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400">
                        Upskill yourself based on your saved jobs and AI-powered recommendations.
                    </p>
                </div>

                {savedJobs.length === 0 ? (
                    <Card className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                            <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-full">
                                <BookOpen className="w-8 h-8 text-neutral-400" />
                            </div>
                            <h3 className="text-xl font-semibold">No saved jobs found</h3>
                            <p className="text-neutral-500 max-w-md">
                                Start by saving jobs from the dashboard to get personalized course recommendations.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid gap-8"
                    >
                        {savedJobs.map((job) => (
                            <motion.div key={job.id} variants={item}>
                                <Card className="overflow-hidden border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <div className="grid md:grid-cols-[1fr_2fr] gap-0">

                                        {/* Job Information Section */}
                                        <div className="p-6 border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 flex flex-col justify-between">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Badge variant="outline" className="w-fit mb-2 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                                        {job.companyName}
                                                    </Badge>
                                                    <h3 className="text-xl font-bold leading-tight text-neutral-900 dark:text-white">
                                                        {job.title}
                                                    </h3>
                                                </div>

                                                <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 shrink-0" />
                                                        <span>{job.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 shrink-0" />
                                                        <span>Saved on {new Date(job.savedAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Analysis Status</span>
                                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium text-sm">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span>Completed</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Skills Target</span>
                                                    <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-medium text-sm">
                                                        <Target className="w-4 h-4 text-primary" />
                                                        <span>{job.course_recommendations?.length || 0} Key Areas</span>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 mt-2">
                                                    <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-400 hover:text-primary transition-colors flex items-center gap-1">
                                                        View original posting <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                                <Button
                                                    onClick={() => handleRoadmapGeneration(job)}
                                                    variant="default"
                                                    className="col-span-2 w-full mt-2 bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 border-0 text-white shadow-md group/btn"
                                                >
                                                    <Sparkles className="w-4 h-4 mr-2 group-hover/btn:animate-spin" />
                                                    Generate Learning Roadmap
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Recommendations Section */}
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                <h4 className="font-semibold text-lg">Recommended Skills & Courses</h4>
                                            </div>

                                            {job.course_recommendations && job.course_recommendations.length > 0 ? (
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    {job.course_recommendations.map((rec, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="group flex flex-col justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 hover:border-purple-200 dark:hover:border-purple-900/50 hover:bg-white dark:hover:bg-neutral-800 transition-all duration-200"
                                                        >
                                                            <div className="space-y-2 mb-3">
                                                                <h5 className="font-medium text-neutral-900 dark:text-neutral-100 flex items-start justify-between gap-2">
                                                                    {rec.skill}
                                                                </h5>
                                                                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                                                                    {rec.reason}
                                                                </p>
                                                            </div>

                                                            <a
                                                                href={rec.udemy_search_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1.5 mt-auto group-hover:translate-x-1 transition-transform"
                                                            >
                                                                Find courses on Udemy
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 py-8">
                                                    <p>Processing recommendations...</p>
                                                    <p className="text-sm text-neutral-400">Check back later for AI insights.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default CourseSuggestions;