import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Building2, Calendar, CircleCheckBig, CircleX, ExternalLink, Globe, MapPin } from "lucide-react";

export function SwipeableJobCard({ job, onSwipe, style }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-10, 10]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    // Background color based on swipe direction overlay
    const overlayRightOpacity = useTransform(x, [0, 200], [0, 0.5]);
    const overlayLeftOpacity = useTransform(x, [-200, 0], [0.5, 0]);

    const formatDate = (dateObj) => {
        if (!dateObj || !dateObj._seconds) return "Recently";
        return new Date(dateObj._seconds * 1000).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    };

    const handleDragEnd = (event, info) => {
        console.log(event);
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
                    <CardHeader className="px-8 pt-8 pb-6 w-full xl:w-1/2 border-b xl:border-b-0 xl:border-r bg-neutral-50/50 dark:bg-neutral-900/50 relative">
                        <div className="flex flex-col h-full justify-between gap-8">
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="h-24 w-24 rounded-full bg-white dark:bg-neutral-800 p-2 shadow-md  flex items-center justify-center overflow-hidden shrink-0">
                                        {job.companyLogo ? (
                                            <img
                                                src={job.companyLogo}
                                                alt={job.companyName}
                                                className="w-full h-full object-cover    rounded-full"
                                            />
                                        ) : (
                                            <Building2 className="w-10 h-10 text-neutral-400" />
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge variant="secondary" className="rounded-full px-4 py-1.5 font-medium">
                                            Full Time
                                        </Badge>
                                        {job.language && (
                                            <Badge variant="outline" className="rounded-full px-4 py-1.5 capitalize border-primary/20 text-primary bg-primary/5">
                                                {new Intl.DisplayNames(['en'], { type: 'language' }).of(job.language) || job.language}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-primary font-bold text-lg mb-1">
                                            <span className="tracking-tight">{job.companyName}</span>
                                        </div>
                                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-[0.95]">
                                            {job.title}
                                        </h1>
                                    </div>

                                    <div className="flex flex-col gap-3 text-muted-foreground text-base">
                                        <div className="flex items-center gap-2.5">
                                            <MapPin className="w-5 h-5 shrink-0 text-neutral-500" />
                                            <span className="font-medium">{job.location}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 shrink-0" />
                                                <span>Posted {formatDate(job.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                                                <span>Updated {formatDate(job.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button size="lg" className="w-full gap-2 text-base font-bold h-14 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all rounded-xl" asChild>
                                <a href={job.link} target="_blank" rel="noopener noreferrer">
                                    Apply Now
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent
                        className="flex-1 w-full xl:w-1/2 overflow-y-auto p-8 bg-white dark:bg-neutral-950 custom-scrollbar"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <div className="prose dark:prose-invert max-w-none">
                            <div
                                className="text-muted-foreground leading-relaxed text-lg [&>h3]:text-foreground [&>h3]:font-bold [&>h3]:mt-6 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>p]:mb-4"
                                dangerouslySetInnerHTML={{ __html: job.description || "<p>No description provided.</p>" }}
                            />

                            <div className="mt-12 grid grid-cols-1 gap-4">
                                <div className="p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border-none">
                                    <h4 className="font-bold mb-3 flex items-center gap-2 text-lg">
                                        <Globe className="w-5 h-5 text-indigo-500" />
                                        Company Culture
                                    </h4>
                                    <p className="text-muted-foreground">
                                        Join a team that values innovation, collaboration, and personal growth.
                                        We offer a dynamic work environment with opportunities to make a real impact.
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border-none">
                                    <h4 className="font-bold mb-3 flex items-center gap-2 text-lg">
                                        <Building2 className="w-5 h-5 text-emerald-500" />
                                        Benefits & Perks
                                    </h4>
                                    <ul className="text-muted-foreground list-disc list-inside space-y-2">
                                        <li>Competitive salary and equity</li>
                                        <li>Comprehensive health coverage</li>
                                        <li>Flexible working hours</li>
                                        <li>Remote-first culture</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </motion.div>
    );
}
