import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, Plus, Check, Save } from 'lucide-react';
import { toast } from 'sonner';

const ProjectGenerator = () => {
    const [projectIdea, setProjectIdea] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleGenerate = async () => {
        if (!projectIdea.trim()) {
            toast.error("Please enter a project idea.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/gemini/milestones', {
                projectIdea
            });
            setResult(response.data);
            toast.success("Milestones generated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate milestones.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    AI Project Generator
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Describe your raw idea, and let AI structure it into technical milestones for you.
                </p>
            </div>

            <div className="space-y-4">
                <textarea
                    value={projectIdea}
                    onChange={(e) => setProjectIdea(e.target.value)}
                    placeholder="e.g. I want a clothing store website where people can customize t-shirts..."
                    className="w-full min-h-[150px] p-4 text-base border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 resize-none transition-all"
                />
                
                <div className="flex justify-end">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Milestones"}
                    </button>
                </div>
            </div>

            {result && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                            {result.projectTitle}
                        </h2>
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                            {result.techStack?.map((tech, index) => (
                                <span key={index} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Suggested Milestones</h3>
                        <div className="grid gap-4">
                            {result.milestones?.map((milestone, index) => (
                                <div key={index} className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-sm group">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-sm">
                                                    {index + 1}
                                                </span>
                                                <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                                                    {milestone.title}
                                                </h4>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 ml-11 leading-relaxed">
                                                {milestone.description}
                                            </p>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-2 mt-2 md:mt-0">
                                            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">
                                                {milestone.estimatedHours}h est.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectGenerator;
