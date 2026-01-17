import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Building2, Calendar, ExternalLink, Globe, MapPin, Share2 } from "lucide-react";

export function JobDetail({ job }) {
    if (!job) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a job to view details
            </div>
        );
    }

    const formatDate = (dateObj) => {
        if (!dateObj || !dateObj._seconds) return "Recently";
        return new Date(dateObj._seconds * 1000).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    };

    return (
        <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-6 border-b">
                <div className="flex flex-col md:flex-row justify-between gap-6 md:items-start">
                    <div className="space-y-4 flex-1">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="rounded-full px-4 py-1">
                                    Full Time
                                </Badge>
                                {job.language && (
                                    <Badge variant="outline" className="rounded-full px-4 py-1 capitalize">
                                        {job.language}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                {job.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground text-base">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5" />
                                    <span className="font-medium text-foreground">{job.companyName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    <span>{job.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    <span>Posted {formatDate(job.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[200px]">
                        <Button size="lg" className="w-full gap-2 text-base" asChild>
                            <a href={job.link} target="_blank" rel="noopener noreferrer">
                                Apply Now
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </Button>
                        <Button variant="outline" size="lg" className="w-full gap-2">
                            <Share2 className="w-4 h-4" />
                            Share Job
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto px-0 py-8">
                <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-xl font-semibold mb-4">About the Role</h3>
                    <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-lg">
                        {job.description || "No description provided."}
                    </div>

                    {/* Placeholder for richer content sections if available in future */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl bg-secondary/30 border border-border/50">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary" />
                                Company Culture
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Join a team that values innovation, collaboration, and personal growth.
                                We offer a dynamic work environment with opportunities to make a real impact.
                            </p>
                        </div>
                        <div className="p-6 rounded-xl bg-secondary/30 border border-border/50">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                Benefits & Perks
                            </h4>
                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                <li>Competitive salary and equity</li>
                                <li>Comprehensive health coverage</li>
                                <li>Flexible working hours</li>
                                <li>Remote-first culture</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
