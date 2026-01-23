import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Loader2, ShieldCheck } from "lucide-react";
import WorkExperienceCard from '@/components/WorkExperienceCard';
import axios from 'axios';

const MyPortfolio = () => {
    const { user } = useUser();
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPortfolio = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_SERVER_API}/api/user/work-experience/${user.id}`);
                setPortfolio(response.data.workExperience || []);
            } catch (error) {
                console.error("Failed to fetch portfolio", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, [user]);

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Verified Portfolio</h1>
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        AI Verified
                    </Badge>
                </div>
                <p className="text-muted-foreground text-lg">
                    Your portable proof of work. These projects have been verified by recruiters and analyzed by FairLink AI.
                </p>
            </div>

            {loading ? (
                <div className="flex h-60 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : portfolio.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {portfolio.map((item, index) => (
                        <WorkExperienceCard
                            key={item.proofId || index}
                            {...item}
                            {...item.content} // Spread content (abstract, breakdown, tags)
                        />
                    ))}
                </div>
            ) : (
                <Card className="bg-dashed border-2 border-dashed border-neutral-200 dark:border-neutral-800 bg-transparent">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            <ShieldCheck className="w-8 h-8 text-neutral-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-medium text-foreground">No verified work yet</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Complete projects and get them verified by recruiters to build your portable portfolio.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default MyPortfolio;
