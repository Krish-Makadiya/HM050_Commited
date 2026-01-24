import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Loader2, ExternalLink, Sparkles, FileText, Briefcase, GraduationCap, EyeOff, ShieldCheck, Lock } from "lucide-react";
import WorkExperienceCard from '@/components/WorkExperienceCard';

const CandidateProfileModal = ({
    candidate,
    blindHiring,
    portfolio = [],
    loadingPortfolio = false
}) => {
    if (!candidate) return null;

    const isBlindModal = blindHiring && candidate.status !== 'Hired';

    return (
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Candidate Profile</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border">
                        {!isBlindModal && <AvatarImage src={candidate.imageUrl} />}
                        <AvatarFallback className={`text-lg ${isBlindModal ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}>
                            {isBlindModal ? <Lock className="w-8 h-8 text-muted-foreground/50" /> : (candidate.firstName?.[0] || "") + (candidate.lastName?.[0] || "")}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className={`text-2xl font-bold ${isBlindModal ? "text-muted-foreground blur-sm select-none" : ""}`}>
                            {isBlindModal ? "Anonymous Candidate" : `${candidate.firstName} ${candidate.lastName}`}
                        </h2>
                        <p className="text-muted-foreground">
                            {isBlindModal ? <span className="flex items-center gap-2 mt-1 text-sm"><EyeOff className="w-4 h-4" /> Contact Details Hidden</span> : candidate.email}
                        </p>
                        <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">{candidate.experienceLevel || "Experience Not Specified"}</Badge>
                            {!isBlindModal && candidate.resumeUrl && (
                                <a href={candidate.resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" /> Resume
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* AI Suitability Match Score */}
                {candidate.suitabilityScore !== undefined && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-blue-500" /> AI Compatibility Match
                            </h3>
                            <Badge className={`text-base px-3 py-1 ${candidate.suitabilityScore >= 80 ? "bg-green-600" :
                                candidate.suitabilityScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                                } hover:brightness-110`}>
                                {candidate.suitabilityScore}% Match
                            </Badge>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed italic">
                            "{candidate.suitabilityAnalysis}"
                        </p>
                    </div>
                )}

                {/* Summary */}
                {candidate.summary && (
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <FileText className="w-4 h-4" /> About
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                            {candidate.summary}
                        </p>
                    </div>
                )}

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {candidate.skills.map((skill, i) => (
                                <Badge key={i} variant="outline" className="px-3 py-1">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Verified Portfolio Section */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-500" /> Verified Portfolio
                    </h3>
                    {loadingPortfolio ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : portfolio.length > 0 ? (
                        <div className="space-y-4">
                            {portfolio.map((item, index) => (
                                <WorkExperienceCard
                                    key={item.proofId || index}
                                    {...item}
                                    {...item.content}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 border border-dashed rounded-lg bg-neutral-50/50 text-center text-sm text-muted-foreground">
                            No verified portfolio entries yet.
                        </div>
                    )}
                </div>

                {/* Work Experience */}
                {candidate.workExperience && candidate.workExperience.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Experience
                        </h3>
                        <div className="space-y-4">
                            {candidate.workExperience.map((exp, i) => (
                                <div key={i} className="border-l-2 border-neutral-200 dark:border-neutral-800 pl-4 pb-1">
                                    <h4 className="font-medium">{exp.role}</h4>
                                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                        <span>{exp.company}</span>
                                        <span>{exp.startDate} - {exp.endDate || "Present"}</span>
                                    </div>
                                    {exp.description && (
                                        <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-400">
                                            {exp.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {candidate.education && (candidate.education.institution || Array.isArray(candidate.education)) && (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" /> Education
                        </h3>
                        {isBlindModal ? (
                            <div className="flex items-center justify-center p-6 border border-dashed rounded-lg bg-neutral-50/50">
                                <p className="text-muted-foreground flex items-center gap-2 text-sm italic">
                                    <EyeOff className="w-4 h-4" /> Education details hidden in Blind Mode
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {Array.isArray(candidate.education) ? (
                                    candidate.education.map((edu, i) => (
                                        <div key={i} className="flex flex-col text-sm border p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                                            <span className="font-bold">{edu.institution}</span>
                                            <span className="text-muted-foreground">{edu.degree} • {edu.fieldOfStudy}</span>
                                            <span className="text-xs text-muted-foreground mt-1">{edu.startDate} - {edu.endDate}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col text-sm border p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                                        <span className="font-bold">{candidate.education.institution}</span>
                                        <span className="text-muted-foreground">{candidate.education.degree} • {candidate.education.fieldOfStudy}</span>
                                        <span className="text-xs text-muted-foreground mt-1">{candidate.education.startDate} - {candidate.education.endDate}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DialogContent>
    );
};

export default CandidateProfileModal;
