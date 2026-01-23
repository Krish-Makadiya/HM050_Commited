import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Button } from "@/ui/button";
import { PlusCircle, Users, Briefcase, FileText, CheckCircle2, TrendingUp, DollarSign, Wallet, Activity, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { format, parseISO } from 'date-fns';

const RecruiterDashboard = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [activeWork, setActiveWork] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const [jobsRes, activeWorkRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_SERVER_API}/api/jobs/posted/${user.id}`),
                    axios.get(`${import.meta.env.VITE_SERVER_API}/api/jobs/active-work/${user.id}`)
                ]);

                setJobs(jobsRes.data);
                setActiveWork(activeWorkRes.data.activeEngagements);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    const stats = useMemo(() => {
        const activeJobs = jobs.filter(j => j.status === 'Active').length;
        const totalApplications = jobs.reduce((acc, job) => acc + (job.applicantCount || 0), 0);

        let totalSpent = 0;
        let pendingCommitment = 0;
        const payouts = [];

        activeWork.forEach(engagement => {
            // Calculate financials based on tasks
            if (engagement.tasks && engagement.taskProgress) {
                // Determine budget
                // Ideally this should come from the engagement or job data directly if passed
                // For now, let's assume we can derive it or need a budget field in engagement
                // Simplified: We'll sum up task payouts if available in tasks array
                engagement.tasks.forEach((task, index) => {
                    // Extract numeric payout
                    // Extract numeric payout
                    const payoutStr = String(task.payout || "0");
                    const payoutAmount = parseFloat(payoutStr.replace(/[^0-9.]/g, '')) || 0;
                    const progress = engagement.taskProgress?.[index];

                    if (progress?.status === 'verified') {
                        totalSpent += payoutAmount;
                        payouts.push({
                            id: `${engagement.id}-${index}`,
                            project: engagement.jobTitle,
                            candidate: engagement.candidateName,
                            task: task.description,
                            amount: payoutAmount,
                            date: progress.updatedAt ? new Date(progress.updatedAt) : new Date(),
                            status: "Paid"
                        });
                    } else if (engagement.status === 'Hired' || engagement.status === 'Work Submitted') {
                        pendingCommitment += payoutAmount;
                    }
                });
            }
        });

        // Revenue History Chart Data
        const revenueMap = {};
        payouts.forEach(p => {
            const month = format(p.date, 'MMM yyyy');
            revenueMap[month] = (revenueMap[month] || 0) + p.amount;
        });

        const revenueChartData = Object.keys(revenueMap).map(key => ({
            name: key,
            amount: revenueMap[key]
        })).sort((a, b) => new Date(a.name) - new Date(b.name));

        if (revenueChartData.length === 0) {
            revenueChartData.push({ name: format(new Date(), 'MMM yyyy'), amount: 0 });
        }

        // Funnel Data
        // Approximations based on available data
        const interviewed = activeWork.filter(e => e.status === 'Interview').length;
        const hired = activeWork.filter(e => ["Hired", "Work Submitted", "Completed"].includes(e.status)).length;

        // We don't have exact 'Shortlisted' count easily without fetching all applicants, 
        // using activeWork length as a proxy for 'In Progress' candidates

        // For chart, we'll simple showing status distribution of ACTIVE engagements
        const statusCounts = activeWork.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {});

        const funnelData = Object.keys(statusCounts).map(key => ({
            name: key,
            value: statusCounts[key]
        }));

        return {
            activeJobs,
            totalApplications,
            totalSpent,
            pendingCommitment,
            payouts: payouts.sort((a, b) => b.date - a.date),
            revenueChartData,
            funnelData,
            interviewsScheduled: interviewed,
            hires: hired
        };
    }, [jobs, activeWork]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[90rem] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Recruiter Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Overview of your hiring pipeline and project expenses.</p>
                </div>
                <Button onClick={() => navigate("/dashboard/recruiter/post-job")} className="gap-2 shadow-lg shadow-primary/20">
                    <PlusCircle className="w-4 h-4" />
                    Post New Project
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Jobs</CardTitle>
                        <Briefcase className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.activeJobs}</div>
                        <p className="text-xs text-blue-600/80 dark:text-blue-400/80">Currently accepting proposals</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalApplications}</div>
                        <p className="text-xs text-muted-foreground">Across all job postings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalSpent.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Verified & Paid out</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Committed Budget</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.pendingCommitment.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Locked in active contracts</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue/Spending History */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" /> Project Spending Analysis
                        </CardTitle>
                        <CardDescription>
                            Historical breakdown of funds released for completed milestones.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.revenueChartData}>
                                    <defs>
                                        <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        formatter={(value) => [`$${value}`, 'Spent']}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Pipeline Status */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" /> Candidate Pipeline
                        </CardTitle>
                        <CardDescription>Status of active engagements.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
                            {stats.funnelData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.funnelData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {stats.funnelData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-muted-foreground p-4">
                                    No active candidates currently.
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center mt-2">
                            {stats.funnelData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-1.5 text-xs">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-muted-foreground">{entry.name} ({entry.value})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Financial History / Recent Payouts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" /> Financial History
                    </CardTitle>
                    <CardDescription>Recent payouts made to candidates for verified task completions.</CardDescription>
                </CardHeader>
                <CardContent>
                    {stats.payouts.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No recent transactions found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.payouts.slice(0, 5).map((payout, i) => (
                                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-100 dark:border-neutral-800 transition-all hover:shadow-sm">
                                    <div className="flex items-start gap-4 mb-2 sm:mb-0">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                            <DollarSign className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{payout.project}</p>
                                            <p className="text-xs text-muted-foreground">To: {payout.candidate} • {payout.task}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end w-full sm:w-auto justify-between gap-1">
                                        <span className="font-bold text-green-600 dark:text-green-400">- ${payout.amount.toLocaleString()}</span>
                                        <span className="text-xs text-muted-foreground">{format(payout.date, 'MMM dd, yyyy')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RecruiterDashboard;
