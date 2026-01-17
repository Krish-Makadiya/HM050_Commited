import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  XCircle,
  MapPin,
  Calendar,
  Building2,
  ExternalLink,
  BookOpen,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";

const RejectedJobs = () => {
  const { user, isLoaded } = useUser();
  const [rejectedJobs, setRejectedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRejectedJobs = async () => {
      if (!user) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_API}/api/jobs/passed-jobs/${user.id}`
        );
        setRejectedJobs(response.data);
      } catch (error) {
        console.error("Error fetching rejected jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchRejectedJobs();
    }
  }, [user, isLoaded]);

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

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen bg-neutral-50 dark:bg-neutral-950/50">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <XCircle className="w-8 h-8 text-destructive" />
          Rejected Jobs
        </h1>
        <p className="text-muted-foreground text-lg">
          Jobs you've passed on. Changed your mind? You can still apply.
        </p>
      </div>

      {rejectedJobs.length === 0 ? (
        <Card className="bg-muted/30 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="bg-background p-4 rounded-full shadow-sm">
              <XCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No rejected jobs</h3>
            <p className="text-muted-foreground max-w-sm">
              You haven't passed on any jobs yet.
            </p>
            <Button onClick={() => navigate("/dashboard")} variant="default">
              Browse Jobs
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
          {rejectedJobs.map((job) => (
            <motion.div key={job.id} variants={item}>
              <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border-border/60 group opacity-90 hover:opacity-100">
                <CardHeader className="space-y-4 pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1">
                      <Badge variant="outline" className="mb-2 w-fit border-destructive/20 text-destructive bg-destructive/5">
                        {job.jobType || "Passed"}
                      </Badge>
                      <CardTitle className="leading-snug line-clamp-2 text-xl group-hover:text-primary transition-colors">
                        {job.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <Building2 className="w-4 h-4 text-primary/80" />
                        {job.companyName}
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-white dark:bg-neutral-800 p-2 shadow-sm border border-neutral-100 dark:border-neutral-700 flex items-center justify-center overflow-hidden shrink-0 opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={job.companyName}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-neutral-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 shrink-0 text-muted-foreground/70" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 shrink-0 text-muted-foreground/70" />
                      <span>
                        Passed {new Date(job.passedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {job.description && (
                    <div className="max-h-[4.5em] overflow-hidden relative">
                      <p className="text-sm text-muted-foreground/80 line-clamp-3 mt-2" dangerouslySetInnerHTML={{ __html: job.description }} />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-4 border-t bg-muted/20 flex flex-col gap-3">
                  <div className="w-full flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      asChild
                    >
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Still Apply <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  </div>

                  <Button
                    variant="default"
                    className="w-full bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all border-0"
                    onClick={() => navigate("/dashboard/course-suggestions")}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Get Course Recommendations
                    <Sparkles className="w-3.5 h-3.5 ml-1 text-yellow-300 animate-pulse" />
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

export default RejectedJobs;