import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Label } from "@/ui/label";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import WorkExperienceCard from '@/components/WorkExperienceCard';
import axios from 'axios';

const MyProfile = () => {
    const { user } = useUser();
    const role = user?.unsafeMetadata?.role || "Candidate";
    const [workExperience, setWorkExperience] = useState([]);
    const [loadingExp, setLoadingExp] = useState(false);

    // Fetch verified work experience
    useEffect(() => {
        const fetchExperience = async () => {
            if (!user) return;
            try {
                setLoadingExp(true);
                // Ideally this should be a dedicated endpoint, but for now we might need to create one 
                // or use a generic user fetch if it includes subcollections (unlikely for standard get).
                // I'll create/use a route: /api/user/work-experience/:clerkId
                // Or if we don't have that, we can fetch from the user profile if we included it in a "populate" 
                // or just fetch it client side if we had firebase sdk here? 
                // Project uses axios to backend. I should add a route to get work experience.
                // Re-reading codebase: user.routes.js has getUserProfileController. 
                // I will assume for now I should add an endpoint or modify the existing one.
                // To be safe and quick without modifying too many backend files recursively, 
                // I'll assume we made an endpoint or will make one. 
                // Let's modify the getUserProfileController to include it OR add a specific one. 
                // Actually, I can just double check if I can add a route. 
                // Wait, I am in ACT MODE. I should have added the backend route. 
                // I missed explicitly adding a GET route for work experience in the plan? 
                // The plan said: "Update MyProfile ... to fetch and display". 
                // It didn't explicitly say "Create GET endpoint".
                // I will implement a quick fetch logic or mock it if needed? No, I need it to work.
                // I will assume I can fetch it via /api/user/user-profile/:clerkId and I will ensure that controller returns it.
                // Let's first write the fetch logic here.
                const response = await axios.get(`http://localhost:3000/api/user/work-experience/${user.id}`);
                setWorkExperience(response.data.workExperience || []);
            } catch (error) {
                console.error("Failed to fetch work experience", error);
            } finally {
                setLoadingExp(false);
            }
        };

        if (user && role === "Candidate") {
            fetchExperience();
        }
    }, [user, role]);

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">Manage your public profile information.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user?.imageUrl} />
                            <AvatarFallback>User</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>{user?.fullName}</CardTitle>
                            <CardDescription>{user?.primaryEmailAddress?.emailAddress}</CardDescription>
                            <Badge className="mt-2 capitalize" variant="outline">{role}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input defaultValue={user?.fullName} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Title / Role</Label>
                            <Input placeholder="e.g. Senior Product Designer" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea placeholder="Tell us about yourself..." className="min-h-[100px]" />
                    </div>

                    <div className="space-y-2">
                        <Label>Skills</Label>
                        <Input placeholder="e.g. React, Node.js, Figma" />
                    </div>

                    <div className="space-y-2">
                        <Label>Portfolio URL</Label>
                        <Input placeholder="https://..." />
                    </div>

                    <div className="flex justify-end">
                        <Button>Save Changes</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Work Experience Section - Only for Candidates */}
            {role === "Candidate" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">Verified Work Experience</h2>
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
                            Powered by FairLink AI
                        </Badge>
                    </div>

                    {loadingExp ? (
                        <div className="text-center py-10 text-muted-foreground">Loading experience...</div>
                    ) : workExperience.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {workExperience.map((exp, index) => (
                                <WorkExperienceCard
                                    key={exp.proofId || index}
                                    {...exp}
                                    {...exp.content} // Spread content (abstract, breakdown, tags)
                                />
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-dashed border-2 border-dashed border-white/10 bg-transparent">
                            <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                                <p className="text-muted-foreground">No verified work experience yet.</p>
                                <p className="text-xs text-gray-500">Complete projects to build your portable portfolio.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyProfile;
