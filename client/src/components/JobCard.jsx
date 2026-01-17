import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Building2, Globe, ExternalLink } from "lucide-react";

export function JobCard({ job }) {
    const formatDate = (dateObj) => {
        if (!dateObj || !dateObj._seconds) return "Recently";
        return new Date(dateObj._seconds * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    return (
        <Card className="hover:shadow-md transition-shadow duration-300 group bg-card border-border/50">
            <CardHeader className="pb-3 p-4">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5">
                        <Badge variant="outline" className="w-fit mb-2 text-muted-foreground font-normal border-transparent bg-secondary/50 px-2">
                            Full Time
                        </Badge>
                        <h3 className="font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                            <Building2 className="w-4 h-4 text-primary/70" />
                            <span>{job.companyName}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 pb-4">
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(job.createdAt)}</span>
                    </div>
                    {job.language && (
                        <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            <span className="capitalize">{job.language}</span>
                        </div>
                    )}
                </div>

            </CardContent>

            <CardFooter className="pt-0">
                <Button className="w-full gap-2 font-medium shadow-sm" asChild>
                    <a href={job.link} target="_blank" rel="noopener noreferrer">
                        Apply Now
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </Button>
            </CardFooter>
        </Card>
    );
}
