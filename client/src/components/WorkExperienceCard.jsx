import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { ChevronDown, ChevronUp, CheckCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WorkExperienceCard = ({
    projectTitle,
    aiScore,
    tags = [],
    verifiedDate,
    abstract,
    breakdown,
    proofId
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Color coding for AI Score
    const getScoreColor = (score) => {
        if (score >= 85) return "from-emerald-400 to-green-500 shadow-emerald-500/20";
        if (score >= 50) return "from-amber-400 to-orange-500 shadow-amber-500/20";
        return "from-rose-400 to-red-500 shadow-red-500/20";
    };

    return (
        <Card className="group relative overflow-hidden border-0 bg-white/5 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:shadow-3xl hover:bg-white/10 dark:bg-black/40">
            {/* Ambient Lighting Effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-700" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all duration-700" />

            <CardHeader className="relative z-10 pb-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                                {projectTitle}
                            </CardTitle>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50 dark:border-blue-500/20 shadow-sm backdrop-blur-md">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span className="text-[10px] font-bold tracking-wider text-blue-700 dark:text-blue-300 uppercase">Verified via FairLink</span>
                            </div>
                        </div>
                        <CardDescription className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Verified on {new Date(verifiedDate).toLocaleDateString()}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                            <span className="font-mono opacity-70">ID: {proofId?.slice(0, 8)}...</span>
                        </CardDescription>
                    </div>

                    <div className={`
                        flex flex-col items-center justify-center min-w-[100px] px-4 py-2 rounded-xl 
                        bg-gradient-to-br ${getScoreColor(aiScore)} 
                        text-white shadow-lg transform transition-transform group-hover:scale-105
                    `}>
                        <span className="text-xs font-medium text-white/90 uppercase tracking-widest">Tech Score</span>
                        <span className="text-2xl font-black tracking-tight">{aiScore}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    {tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="px-3 py-1 bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </CardHeader>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <CardContent className="relative z-10 pt-4 pb-6 space-y-6">
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-2" />

                            <div className="grid md:grid-cols-1 gap-6">
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                                        <span className="w-1.5 h-4 rounded-full bg-blue-500" />
                                        Executive Abstract
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed p-4 bg-gray-50/80 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner">
                                        {abstract}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                                        <span className="w-1.5 h-4 rounded-full bg-purple-500" />
                                        Technical Deep Dive
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap p-4 bg-gray-50/80 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner font-mono text-[13px]">
                                        {breakdown}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className="relative z-10 flex justify-center items-center py-2 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-black/20 cursor-pointer border-t border-white/5 group-hover:bg-gray-50/30 dark:group-hover:bg-white/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {isExpanded ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <ChevronUp className="w-4 h-4" /> Collapse Details
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs font-medium text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300">
                        <ChevronDown className="w-4 h-4" /> View Technical Assessment
                    </div>
                )}
            </div>
        </Card>
    );
};

export default WorkExperienceCard;
