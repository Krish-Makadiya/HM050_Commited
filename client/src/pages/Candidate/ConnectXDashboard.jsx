import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Sparkles, Users, UserPlus, CheckCircle2, XCircle, Zap, ShieldCheck, Target } from "lucide-react";
import { toast } from "sonner";
import axios from 'axios';

const ConnectXDashboard = () => {
    const { user } = useUser();
    const [invites, setInvites] = useState([]);
    const [activeSquads, setActiveSquads] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Real Invites
    useEffect(() => {
        if (!user) return;

        const fetchInvites = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_SERVER_API}/api/connectx/user-invites/${user.id}`);
                setInvites(response.data.invites || []);
                setActiveSquads(response.data.activeSquads || []);
            } catch (error) {
                console.error("Failed to fetch invites:", error);
                // toast.error("Could not load invitations."); // Optional: Don't spam error if just empty
            } finally {
                setLoading(false);
            }
        };

        fetchInvites();
    }, [user]);

    const handleAccept = async (invite) => {
        try {
            await axios.post(`${import.meta.env.VITE_SERVER_API}/api/connectx/squads/${invite.jobId}/${invite.squadId}/members/${user.id}/status`, {
                status: 'Accepted'
            });
            toast.success("Squad Invite Accepted! You have joined the team.");
            // Remove from local list or move to "Active" section (for now remove)
            setInvites(invites.filter(i => i.id !== invite.id));
        } catch (error) {
            console.error("Error accepting invite:", error);
            toast.error("Failed to accept invite.");
        }
    };

    const handleReject = (inviteId) => {
        toast("Invite declined.");
        setInvites(invites.filter(i => i.id !== inviteId));
    };

    return (
        <div className="flex h-full w-full bg-neutral-50 dark:bg-neutral-950 overflow-hidden min-h-screen">
            <div className="w-full h-full relative p-6 md:p-10 overflow-auto">
                {/* Standard Project Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-50 dark:opacity-5 pointer-events-none" />

                <div className="max-w-7xl mx-auto space-y-10 relative z-10">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                                Connect<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">X</span>
                                <span className="text-lg font-medium text-muted-foreground ml-2 tracking-widest font-mono">BETA</span>
                            </h1>
                            <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                                Your hub for collaborative squad projects. Join dream teams formed by AI matching.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full shadow-sm">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm font-medium text-foreground">AI Harmony Engine: Active</span>
                        </div>
                    </div>

                    {/* Invites Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <UserPlus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Squad Invitations</h2>
                            {invites.length > 0 && <Badge className="bg-indigo-600 hover:bg-indigo-700">{invites.length} Pending</Badge>}
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {[1, 2].map(i => <div key={i} className="h-64 bg-neutral-100 dark:bg-neutral-900 rounded-3xl animate-pulse" />)}
                            </div>
                        ) : invites.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 border-dashed">
                                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-foreground">No Pending Invites</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mt-2">Your profile is visible to the Harmony Engine. We'll find you a squad soon.</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {invites.map((invite) => (
                                    <Card key={invite.id} className="group relative overflow-hidden border-neutral-200 dark:border-neutral-800 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                                        <CardHeader className="pb-4">
                                            <div className="flex justify-between items-start">
                                                <Badge variant="outline" className="border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 mb-2">Invitation</Badge>
                                                <div className="flex items-center gap-1 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-xs font-bold border border-green-200 dark:border-green-800">
                                                    <Zap className="w-3 h-3" /> {invite.harmonyScore}% Compatibility
                                                </div>
                                            </div>
                                            <CardTitle className="text-xl font-bold leading-tight text-foreground">{invite.projectTitle}</CardTitle>
                                            <CardDescription className="font-medium text-purple-600 dark:text-purple-400">Role: {invite.role}</CardDescription>
                                        </CardHeader>

                                        <CardContent className="space-y-6">
                                            <p className="text-sm text-muted-foreground line-clamp-2">{invite.description}</p>

                                            <div>
                                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Squad Mates</h4>
                                                <div className="flex items-center -space-x-3">
                                                    {invite.members.map((m, idx) => (
                                                        <div key={idx} className="relative group/member">
                                                            <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-neutral-900 object-cover bg-neutral-200" />
                                                            <div className="absolute bottom-0 left-10 hidden group-hover/member:block bg-neutral-900 text-white text-xs p-2 rounded w-max z-20 shadow-lg">
                                                                <p className="font-bold">{m.name}</p>
                                                                <p className="text-neutral-300">{m.role}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-white dark:border-neutral-900 flex items-center justify-center text-xs text-muted-foreground font-bold">
                                                        You
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="grid grid-cols-2 gap-3 pt-2">
                                            <Button variant="outline" className="w-full text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20" onClick={() => handleReject(invite.id)}>
                                                <XCircle className="w-4 h-4 mr-2" /> Decline
                                            </Button>
                                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20" onClick={() => handleAccept(invite)}>
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Accept
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Active Squads */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Active Missions</h2>
                        </div>
                        {activeSquads.length === 0 ? (
                            <div className="bg-white/50 dark:bg-white/5 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center backdrop-blur-sm">
                                <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No active squad missions in progress.</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {activeSquads.map((squad) => (
                                    <Card key={squad.id} className="group relative overflow-hidden border-teal-200 dark:border-teal-800 shadow-xl hover:shadow-2xl transition-all duration-300">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500" />
                                        <CardHeader className="pb-4">
                                            <div className="flex justify-between items-start">
                                                <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700">Active Mission</Badge>
                                                <div className="flex items-center gap-1 text-green-700 font-bold text-xs bg-green-50 px-2 py-1 rounded border border-green-200">
                                                    <Zap className="w-3 h-3" /> {squad.harmonyScore}% Harmony
                                                </div>
                                            </div>
                                            <CardTitle className="text-xl font-bold leading-tight mt-2">{squad.projectTitle}</CardTitle>
                                            <CardDescription className="font-medium text-teal-600">Role: {squad.role}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-sm text-muted-foreground line-clamp-2">{squad.description}</p>
                                            <div>
                                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Team</h4>
                                                <div className="flex items-center -space-x-3">
                                                    {squad.members.map((m, idx) => (
                                                        <img key={idx} src={m.avatar} title={`${m.name} (${m.role})`} className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900" />
                                                    ))}
                                                </div>
                                            </div>
                                            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" onClick={() => window.location.href = `/dashboard`}>
                                                Go to Work Dashboard
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>

                </div>
            </div>
        </div>
    );
};

export default ConnectXDashboard;
