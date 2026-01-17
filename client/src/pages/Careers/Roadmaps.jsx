import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Map as MapIcon,
    ChevronRight,
    CheckCircle2,
    Clock,
    ArrowLeft,
    CheckCircle,
    Lock,
    Star,
    BookOpen,
    AlertCircle,
    ExternalLink,
    Trophy,
    Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ICON_MAP = {
    "CheckCircle": CheckCircle,
    "Lock": Lock,
    "Star": Star,
    "AlertCircle": AlertCircle
};

const Roadmaps = () => {
    const { user, isLoaded } = useUser();
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoadmap, setSelectedRoadmap] = useState(null);

    // Quiz State
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);

    useEffect(() => {
        const fetchRoadmaps = async () => {
            if (!user) return;
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_SERVER_API}/api/roadmaps/${user.id}`
                );
                setRoadmaps(response.data);
            } catch (error) {
                console.error("Error fetching roadmaps:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded) {
            fetchRoadmaps();
        }
    }, [user, isLoaded]);

    const handleStartQuiz = (stepIndex, questions) => {
        setCurrentStepIndex(stepIndex);
        setQuizQuestions(questions || []);
        setIsQuizOpen(true);
    };

    const handleQuizComplete = async (score) => {
        setIsQuizOpen(false);

        if (!selectedRoadmap || currentStepIndex === null) return;

        // Optimistic UI Update
        const updatedSteps = [...selectedRoadmap.steps];
        updatedSteps[currentStepIndex] = {
            ...updatedSteps[currentStepIndex],
            status: "Completed", // Matching user data casing if possible, or sticking to consistent lowercase
            quizScore: score
        };

        // Unlock next step
        if (currentStepIndex + 1 < updatedSteps.length) {
            updatedSteps[currentStepIndex + 1] = {
                ...updatedSteps[currentStepIndex + 1],
                status: "In Progress" // Or 'Not Started' -> 'In Progress'
            };
        }

        const updatedRoadmap = { ...selectedRoadmap, steps: updatedSteps };
        setSelectedRoadmap(updatedRoadmap);

        // Update main roadmaps list immediately
        setRoadmaps(prev => prev.map(r => r.id === selectedRoadmap.id ? updatedRoadmap : r));

        // Update Backend
        try {
            await axios.put(`${import.meta.env.VITE_SERVER_API}/api/roadmaps/${user.id}/${selectedRoadmap.id}/progress`, {
                stepIndex: currentStepIndex,
                status: "Completed",
                score: score
            });
            console.log("Progress updated successfully!");
        } catch (error) {
            console.error("Failed to update progress:", error);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    if (!isLoaded || loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)] w-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // --- Detail View Component (New SkillRoadmap Design) ---
    if (selectedRoadmap) {
        // Normalizing data from Firestore to UI expectations
        // User data sample: { link: "...", quiz: [...], status: "Not Started", stepNo: 1, subtopics: [...], title: "..." }
        const roadmapData = selectedRoadmap.steps?.map((step, index) => {
            // Determine status logic. Since user data says "Not Started", let's map:
            // "Not Started" -> locked (unless it's the first one, or prev is done)
            // "In Progress" -> in-progress
            // "Completed" -> completed
            let normalizedStatus = 'locked';

            // Allow DB value to override, otherwise default first to in-progress
            // Normalize status (case-insensitive)
            const s = (step.status || '').toLowerCase();
            if (s === 'completed') normalizedStatus = 'completed';
            else if (s === 'in progress') normalizedStatus = 'in-progress';
            else if (index === 0 && (!step.status || step.status === 'Not Started')) normalizedStatus = 'in-progress';

            // If previous is completed, current should be at least in-progress
            if (index > 0 && selectedRoadmap.steps[index - 1].status === 'Completed' && normalizedStatus === 'locked') {
                normalizedStatus = 'in-progress';
            }

            return {
                id: index,
                title: step.title,
                description: step.description || `Master ${step.title} to advance your career.`, // Fallback description
                status: normalizedStatus,
                skills: step.subtopics || step.topics || [],
                icon: (normalizedStatus === 'completed') ? CheckCircle : (normalizedStatus === 'in-progress' ? Star : Lock),
                resources: step.link ? [{ title: "Udemy Course", url: step.link }] : (step.resources || []),
                quiz: step.quiz || [], // Pass the quiz data
                score: step.quizScore
            };
        }) || [];

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 p-4 md:p-8 flex flex-col items-center overflow-hidden relative">
                <Button
                    variant="ghost"
                    onClick={() => setSelectedRoadmap(null)}
                    className="absolute top-4 left-4 z-50 gap-2 hover:bg-white/50 dark:hover:bg-black/50"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Roadmaps
                </Button>

                <QuizDialog
                    isOpen={isQuizOpen}
                    onOpenChange={setIsQuizOpen}
                    questions={quizQuestions}
                    onComplete={handleQuizComplete}
                />

                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-400 opacity-20 blur-[100px]" />
                </div>

                <div className="max-w-6xl w-full space-y-8 relative z-10 pt-12">
                    <div className="text-center space-y-4 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
                            <span className="text-indigo-600 dark:text-indigo-400">Skill-Gap</span> Roadmap
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                            {selectedRoadmap.roadmapTitle || "Your Personalized Learning Path"}
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-emerald-500 via-indigo-500 to-slate-200 dark:from-emerald-500 dark:via-indigo-500 dark:to-slate-800 -translate-x-1/2 hidden md:block" />
                        <div className="absolute left-[20px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-emerald-500 via-indigo-500 to-slate-200 dark:from-emerald-500 dark:via-indigo-500 dark:to-slate-800 -translate-x-1/2 md:hidden" />

                        <div className="space-y-8 md:space-y-16 relative z-10 pb-20">
                            {roadmapData.map((node, index) => (
                                <RoadmapNode
                                    key={node.id}
                                    node={node}
                                    index={index}
                                    onStartQuiz={() => handleStartQuiz(index, node.quiz)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    console.log(roadmaps);

    return (
        <div className="p-6 md:p-8 space-y-8 min-h-screen bg-neutral-50 dark:bg-neutral-950/50">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <MapIcon className="w-8 h-8 text-primary" />
                    My Learning Roadmaps
                </h1>
                <p className="text-muted-foreground text-lg">
                    Personalized step-by-step guides to help you master new skills.
                </p>
            </div>

            {roadmaps.length === 0 ? (
                <Card className="bg-muted/30 border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                        <div className="bg-background p-4 rounded-full shadow-sm">
                            <MapIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold">No roadmaps generated yet</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Go to Course Suggestions and generate a roadmap for a job!
                        </p>
                        <Button variant="default" asChild>
                            <a href="/dashboard/course-suggestions">View Courses</a>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {roadmaps.map((roadmap) => (
                        <motion.div key={roadmap.id} variants={item}>
                            <Card
                                className="h-full flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-border/50 group cursor-pointer relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-neutral-900 dark:to-neutral-950"
                                onClick={() => setSelectedRoadmap(roadmap)}
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 to-purple-500/80 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                <div className="absolute -right-12 -top-12 h-32 w-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />

                                <CardHeader className="space-y-4 pb-4 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                                            <MapIcon className="w-5 h-5" />
                                        </div>
                                        <Badge variant="secondary" className="font-medium bg-background/80 backdrop-blur border-border/50 shadow-sm">
                                            Remote
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                            {roadmap.roadmapTitle || "Untitled Roadmap"}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                                            {roadmap.context || roadmap.description || "Master new skills with this personalized learning path."}
                                        </CardDescription>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1 relative z-10">
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 p-2.5 rounded-lg border border-border/50">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span>{roadmap.steps?.length || 0} Steps</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 p-2.5 rounded-lg border border-border/50">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            <span>Self-paced</span>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-4 p-6 border-t bg-muted/5 relative z-10">
                                    <Button className="w-full gap-2 bg-background hover:bg-primary hover:text-primary-foreground text-foreground border shadow-sm group-hover:shadow-md transition-all duration-300" variant="outline">
                                        <span className="font-semibold">View Details</span>
                                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

// --- Quiz Dialog Component ---
const QuizDialog = ({ isOpen, onOpenChange, questions, onComplete }) => {
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setCurrentQuestionIdx(0);
            setAnswers({});
            setScore(null);
        }
    }, [isOpen]);

    const handleOptionSelect = (value) => {
        setAnswers(prev => ({ ...prev, [currentQuestionIdx]: value }));
    };

    const handleNext = () => {
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
        } else {
            calculateScore();
        }
    };

    const calculateScore = () => {
        let correctCount = 0;
        questions.forEach((q, idx) => {
            // Flexible matching: check against 'correct_answer' or 'correctAnswer' or string match
            // The AI might provide 'correct_answer' or 'answer'
            const correct = q.correct_answer || q.correctAnswer || q.answer;
            if (answers[idx] === correct) {
                correctCount++;
            }
        });
        const finalScore = Math.round((correctCount / questions.length) * 100);
        setScore(finalScore);
    };

    const handleFinish = () => {
        onComplete(score);
    };

    // Safety check for empty questions
    if (!questions || questions.length === 0) return null;
    const currentQuestion = questions[currentQuestionIdx];
    if (!currentQuestion) return null; // Defensive

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-neutral-200 dark:border-neutral-800"
            >
                <div className="p-6 space-y-6">
                    <div className="space-y-2 text-center">
                        <h2 className="text-2xl font-bold tracking-tight">
                            {score !== null ? "Quiz Completed!" : `Question ${currentQuestionIdx + 1}/${questions.length}`}
                        </h2>
                        <p className="text-muted-foreground">
                            {score !== null ? "Here is how you performed:" : "Select the best answer."}
                        </p>
                    </div>

                    {score === null ? (
                        <div className="space-y-4">
                            <div className="text-lg font-medium leading-relaxed">{currentQuestion.question_text || currentQuestion.question}</div>
                            <div className="grid gap-3">
                                {(currentQuestion.options || currentQuestion.answers || []).map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(option)}
                                        className={`w-full text-left p-4 rounded-lg border transition-all ${answers[currentQuestionIdx] === option
                                            ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-300 ring-1 ring-indigo-500"
                                            : "hover:bg-slate-50 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 space-y-4 animate-in zoom-in duration-300">
                            <Trophy className={`w-20 h-20 ${score >= 70 ? 'text-yellow-500 drop-shadow-lg' : 'text-slate-400'}`} />
                            <div className="text-5xl font-black tracking-tighter">{score}%</div>
                            <p className="text-center text-muted-foreground max-w-[200px]">
                                {score >= 70 ? "Great job! You've unlocked the next step." : "Keep learning and try again!"}
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3">
                    {score === null ? (
                        <Button onClick={handleNext} disabled={!answers[currentQuestionIdx]} className="w-full sm:w-auto">
                            {currentQuestionIdx === questions.length - 1 ? "Submit Answers" : "Next Question"}
                        </Button>
                    ) : (
                        <Button onClick={handleFinish} className="w-full sm:w-auto min-w-[120px]">
                            {score >= 70 ? "Continue" : "Close"}
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// --- Helper Component for Detail View ---
const RoadmapNode = ({ node, index, onStartQuiz }) => {
    const isEven = index % 2 === 0;
    const isCompleted = node.status === 'completed';
    const isInProgress = node.status === 'in-progress';
    const isLocked = node.status === 'locked';

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.1 }}
            className={`flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}
        >
            <div className="flex-1 w-full pl-12 md:pl-0">
                <Card className={`relative overflow-hidden transition-all duration-300 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm group ${isCompleted ? 'ring-1 ring-emerald-100 dark:ring-emerald-900' :
                    isInProgress ? 'ring-2 ring-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]' :
                        'opacity-70 grayscale-[0.5]'
                    }`}>
                    {(isCompleted || isInProgress) && (
                        <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20 ${isCompleted ? 'bg-emerald-400' : 'bg-indigo-400'
                            }`} />
                    )}

                    <CardHeader>
                        <div className="flex items-center justify-between mb-3">
                            <Badge variant="secondary" className={`px-3 py-1 font-semibold tracking-wide ${isCompleted ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200" :
                                isInProgress ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 animate-pulse" :
                                    "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                }`}>
                                {isCompleted ? "COMPLETED" : isInProgress ? "IN PROGRESS" : "LOCKED"}
                            </Badge>
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">STEP {String(index + 1).padStart(2, '0')}</span>
                        </div>
                        <CardTitle className={`text-xl md:text-2xl font-bold ${isInProgress ? 'text-indigo-950 dark:text-indigo-50' : 'text-slate-800 dark:text-slate-100'
                            }`}>{node.title}</CardTitle>
                        <CardDescription className="text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{node.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Subtopics / Skills */}
                            {node.skills && node.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {node.skills.map((skill, i) => (
                                        <Badge key={i} variant="outline" className={`text-xs py-1 px-2 border-slate-200 dark:border-slate-800 ${isCompleted ? 'bg-emerald-50/50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' :
                                            isInProgress ? 'bg-indigo-50/50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' :
                                                'bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400'
                                            }`}>
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Resources Section as Buttons */}
                            {node.resources && node.resources.length > 0 && (
                                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" /> Recommended Lectures
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {node.resources.map((res, i) => (
                                            <Button
                                                key={i}
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 h-9 border-slate-200 dark:border-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300 transition-colors"
                                                asChild
                                            >
                                                <a href={res.url} target="_blank" rel="noopener noreferrer">
                                                    <Play className="w-3.5 h-3.5 fill-current" />
                                                    {res.title || "Watch Lecture"}
                                                </a>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quiz / Action Buttons */}
                            {isInProgress && (
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all hover:scale-[1.02]"
                                    size="default"
                                    onClick={onStartQuiz}
                                    disabled={!node.quiz || node.quiz.length === 0}
                                >
                                    {node.quiz && node.quiz.length > 0 ? "Take Quick Test" : "No Quiz Available"}
                                    {node.quiz && node.quiz.length > 0 && <ChevronRight className="w-4 h-4 ml-2" />}
                                </Button>
                            )}
                            {isCompleted && (
                                <div className="space-y-2">
                                    <Button variant="ghost" className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-medium" size="default">
                                        <CheckCircle className="w-4 h-4 ml-2 mr-2" />
                                        Completed
                                    </Button>
                                    {node.score !== undefined && (
                                        <div className="text-center text-xs font-semibold text-emerald-600/70 uppercase tracking-widest">
                                            Score: {node.score}%
                                        </div>
                                    )}
                                </div>
                            )}
                            {isLocked && (
                                <Button variant="secondary" className="w-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed" size="default" disabled>
                                    <Lock className="w-4 h-4 ml-2 mr-2" />
                                    Unlock Previous Steps
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="absolute left-[20px] md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                <motion.div
                    whileHover={{ scale: 1.15 }}
                    className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center z-20 bg-white dark:bg-neutral-900 shadow-sm ${isCompleted ? 'border-emerald-500 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
                        isInProgress ? 'border-indigo-500 text-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.4)] ring-4 ring-indigo-50 dark:ring-indigo-900/30' :
                            'border-slate-300 text-slate-300 dark:border-slate-700 dark:text-slate-600'
                        }`}
                >
                    <node.icon className="w-6 h-6" strokeWidth={2.5} />
                </motion.div>
            </div>

            <div className="flex-1 hidden md:block" />
        </motion.div>
    );
};

export default Roadmaps;