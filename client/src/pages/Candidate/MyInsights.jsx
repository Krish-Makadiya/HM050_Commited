import React, { useEffect, useState, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Loader2, TrendingUp, DollarSign, Wallet, CheckCircle2, Briefcase, Calendar, PieChart as PieChartIcon, Activity } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { format, parseISO } from 'date-fns';

const MyInsights = () => {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [rawApplications, setRawApplications] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const response = await axios.get(`${import.meta.env.VITE_SERVER_API}/api/jobs/applications/${user.id}`);
                setRawApplications(response.data.applications);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const {
        stats,
        earningsData,
        statusData,
        payoutHistory
    } = useMemo(() => {
        let totalEarnings = 0;
        let pendingEarnings = 0;
        let completedProjects = 0;
        let activeProjects = 0;

        const timelineMap = {};
        const payouts = [];

        rawApplications.forEach(app => {
            // Status counts
            if (["Hired", "Work Submitted", "Completed"].includes(app.status)) {
                activeProjects++;
            }
            if (app.status === "Hired" && (app.taskProgress && Object.values(app.taskProgress).every(t => t.status === 'verified'))) {
                completedProjects++;
            }

            // Financial processing
            let budget = 0;
            if (app.bidAmount && typeof app.bidAmount === 'string') {
                const clean = app.bidAmount.replace(/[^0-9.]/g, '');
                budget = parseFloat(clean) || 0;
            } else if (typeof app.bidAmount === 'number') {
                budget = app.bidAmount;
            }

            if (budget > 0 && app.tasks && app.taskProgress) {
                app.tasks.forEach((task, index) => {
                    const progress = app.taskProgress[index];
                    const payoutStr = task.payout ? String(task.payout) : "0";
                    let amount = 0;

                    if (payoutStr.includes('%')) {
                        const payoutPercent = parseFloat(payoutStr.replace(/[^0-9.]/g, '')) / 100;
                        amount = budget * payoutPercent;
                    } else {
                        amount = parseFloat(payoutStr.replace(/[^0-9.]/g, '')) || 0;
                    }

                    if (progress?.status === 'verified') {
                        totalEarnings += amount;

                        // Add to timeline
                        const date = progress.updatedAt ? format(parseISO(progress.updatedAt), 'MMM dd') : 'Recent';
                        const month = progress.updatedAt ? format(parseISO(progress.updatedAt), 'MMM yyyy') : 'General';

                        timelineMap[month] = (timelineMap[month] || 0) + amount;

                        payouts.push({
                            id: `${app.id}-${index}`,
                            project: app.projectTitle,
                            task: task.description,
                            amount: amount,
                            date: progress.updatedAt ? new Date(progress.updatedAt) : new Date(),
                            status: "Released"
                        });
                    } else if (app.status === 'Hired') {
                        pendingEarnings += amount;
                    }
                });
            }
        });

        // Format chart data
        const earningsChartData = Object.keys(timelineMap).map(key => ({
            name: key,
            amount: timelineMap[key]
        })).sort((a, b) => new Date(a.name) - new Date(b.name)); // Rough sort, relies on date string parsing usually

        // Status Distribution
        const statusCounts = rawApplications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {});

        const statusChartData = Object.keys(statusCounts).map(key => ({
            name: key,
            value: statusCounts[key]
        }));

        payouts.sort((a, b) => b.date - a.date);

        return {
            stats: {
                totalEarnings,
                pendingEarnings,
                activeProjects,
                completionRate: activeProjects > 0 ? Math.round((completedProjects / activeProjects) * 100) : 0,
                totalApplications: rawApplications.length
            },
            earningsData: earningsChartData.length > 0 ? earningsChartData : [{ name: 'No Data', amount: 0 }],
            statusData: statusChartData,
            payoutHistory: payouts.slice(0, 5)
        };
    }, [rawApplications]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 w-[70vw] md:p-4 space-y-4 animate-in fade-in duration-500 mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">My Insights</h1>
                <p className="text-muted-foreground text-lg">Financial overview and project analytics.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-100 dark:border-green-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900 dark:text-green-100">${stats.totalEarnings.toLocaleString()}</div>
                        <p className="text-xs text-green-600/80 dark:text-green-400/80">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.pendingEarnings.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Locked in active milestones</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeProjects}</div>
                        <p className="text-xs text-muted-foreground">{stats.totalApplications} total applications</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completionRate}%</div>
                        <p className="text-xs text-muted-foreground">On-time delivery performance</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Earnings Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" /> Earnings History
                        </CardTitle>
                        <CardDescription>
                            Verified payouts over the last 12 months.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={earningsData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                                        formatter={(value) => [`$${value}`, 'Earnings']}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-primary" /> Application Status
                        </CardTitle>
                        <CardDescription>Current funnel breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center mt-2">
                            {statusData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-1.5 text-xs">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-muted-foreground">{entry.name} ({entry.value})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Payouts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" /> Recent Payouts
                    </CardTitle>
                    <CardDescription>History of verified task completions and funds released.</CardDescription>
                </CardHeader>
                <CardContent>
                    {payoutHistory.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No verified payouts yet. Complete tasks to earn!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {payoutHistory.map((payout, i) => (
                                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-100 dark:border-neutral-800 transition-all hover:shadow-sm">
                                    <div className="flex items-start gap-4 mb-2 sm:mb-0">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                            <DollarSign className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{payout.project}</p>
                                            <p className="text-xs text-muted-foreground">{payout.task}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end w-full sm:w-auto justify-between gap-1">
                                        <span className="font-bold text-green-600 dark:text-green-400">+ ${payout.amount.toLocaleString()}</span>
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

export default MyInsights;
