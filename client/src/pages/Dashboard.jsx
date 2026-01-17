import { SwipeableJobCard } from "@/components/SwipeableJobCard";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { RefreshCcw, Sparkles, Target, Users, Zap } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";

const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [page, setPage] = useState(1);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const swipeQueue = useRef([]);
    const { user } = useUser();

    const flushSwipes = useCallback(async () => {
        if (!user || swipeQueue.current.length === 0) return;

        const actionsToProcess = [...swipeQueue.current];
        swipeQueue.current = []; // Clear queue immediately to avoid duplicates

        try {
            await axios.post(`${import.meta.env.VITE_SERVER_API}/api/jobs/batch-actions/${user.id}`, {
                actions: actionsToProcess
            });
            console.log("Batched swipes processed:", actionsToProcess.length);
        } catch (error) {
            console.error("Error processing batched swipes:", error);
            // Optional: re-queue failed items if needed
        }
    }, [user]);

    useEffect(() => {
        return () => {
            if (swipeQueue.current.length > 0) {
                flushSwipes();
            }
        };
    }, [flushSwipes]);

    const fetchJobs = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_SERVER_API}/api/jobs/${user.id}`, {
                params: { page, limit: 5 }
            });
            console.log(response);
            if (response.status === 200) {
                if (page === 1) {
                    setJobs(response.data.jobs);
                    setCurrentIndex(0);
                } else {
                    setJobs(prev => [...prev, ...response.data.jobs]);
                }
            }
        }
        catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [page, user]);

    useEffect(() => {
        if (user) {
            fetchJobs();
        }
    }, [fetchJobs, user]);

    const handleSwipe = async (direction, job) => {
        if (direction === "right") {
            console.log("👉 Swiped Right on:", job);

            const staticData = {
                firstName: "Krish",
                lastName: "Makadiya",
                email: "krishmakadiya2005@gmail.com",
                phone: "9876543210",
                location: "Kolhapur, Maharashtra, India", // Matches Greenhouse location search

                // Custom Fields identified
                linkedin: "https://www.linkedin.com/in/krish-makadiya/",
                website: "https://krish-makadiya.vercel.app/",

                // Demographics & Custom Questions
                // Note: These need to match the specific dropdown text exactly
                sponsorship: "No", // "Will you now or in the future require sponsorship..."
                howDidYouHear: "Other",
                gender: "Male", // "Gender Identity"

                // Checkbox boolean
                consent: true // "Demographic Data Consent"
            };

            if (window.chrome && chrome.runtime) {
                // 3. Send the message
                chrome.runtime.sendMessage("iobcmkfkokblfjghlmlemaoabgloijlk", {
                    action: "TRIGGER_AUTOFILL",
                    url: job.link,
                    payload: staticData
                }, (response) => {
                    console.log("Extension responded:", response);
                });
            } else {
                alert("Extension not installed!");
            }



            // 4. Save job immediately (Right Swipe)
            try {
                await axios.post(`${import.meta.env.VITE_SERVER_API}/api/jobs/save-job/${user.id}`, job);
                console.log("Job saved successfully");
            } catch (error) {
                console.error("Error saving job:", error);
            }

            try {
                const payload = {
                    jobDescription: job.description,
                    jobId: job.id,
                    userId: user.id,
                    skills: ["JavaScript", "React", "Node.js", "MongoDB", "Express"] // Static skills for testing
                };
                const res = await axios.post('http://localhost:5678/webhook/2777d0a3-1580-45a4-bf2c-d9bcf07f6afb', payload);
                console.log("AI Recommendations:", res.data);
            } catch (error) {
                console.error("Error fetching AI recommendations:", error);
            }
        } else {
            console.log("Swiped Left (Passed):", job.title);
            swipeQueue.current.push({
                jobId: job.id,
                action: "pass",
                jobData: job
            });
            if (swipeQueue.current.length >= 5) {
                flushSwipes();
            }
        }

        // Advance to next card
        setCurrentIndex((prev) => prev + 1);

        // If running low on cards, fetch next page
        if (currentIndex > jobs.length - 5 && !loading) {
            setPage(p => p + 1);
        }
    };

    const resetDeck = () => {
        setPage(1);
        setCurrentIndex(0);
        fetchJobs(); // Re-fetch page 1
    };

    const currentJob = jobs[currentIndex];

    const cardStack = jobs.slice(currentIndex, currentIndex + 2).reverse();

    return (
        <div className="flex h-full w-full bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
            <div className="w-full h-full relative flex items-center justify-center bg-neutral-100 dark:bg-neutral-950 p-6">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-50 dark:opacity-5" />

                <div className="relative w-full max-w-7xl aspect-3/4 xl:aspect-auto xl:h-full xl:max-h-[800px] flex items-center justify-center z-10">
                    <AnimatePresence>
                        {jobs.length > 0 && currentIndex < jobs.length ? (
                            cardStack.map((job, index) => {
                                const isCurrent = job.id === currentJob.id;
                                return (
                                    <SwipeableJobCard
                                        key={job.id}
                                        job={job}
                                        onSwipe={(dir) => handleSwipe(dir, job)}
                                        style={{
                                            zIndex: isCurrent ? 10 : 0,
                                            scale: isCurrent ? 1 : 0.95,
                                            y: isCurrent ? 0 : 20,
                                        }}
                                    />
                                )
                            })
                        ) : (
                            <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
                                <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800">
                                    <h2 className="text-2xl font-bold">All caught up!</h2>
                                    <p className="text-muted-foreground">No more jobs to show at the moment.</p>
                                    <Button onClick={resetDeck} className="mt-4 gap-2">
                                        <RefreshCcw className="w-4 h-4" />
                                        Start Over
                                    </Button>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

export default Dashboard