"use client"

import {
    Briefcase,
    GalleryVerticalEnd,
    Settings2,
    Users
} from "lucide-react"
import { useUser } from "@clerk/clerk-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/ui/sidebar"

// This is sample data.
const data = {
    user: {
        name: "User",
        email: "user@example.com",
        avatar: "",
    },
    navMain: [
        {
            title: "Work",
            url: "#",
            icon: Briefcase,
            items: [
                {
                    title: "Find Projects",
                    url: "/dashboard",
                },
                {
                    title: "My Proposals",
                    url: "/dashboard/my-proposals",
                },

                {
                    title: "Active Projects",
                    url: "/dashboard/active-projects",
                },
                {
                    title: "Video Intro",
                    url: "/dashboard/video-intro",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "My Account",
                    url: "/dashboard/my-account",
                },
                {
                    title: "My Profile",
                    url: "/dashboard/my-profile",
                },
                {
                    title: "My Insights",
                    url: "/dashboard/my-insights",
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }) {
    const { user } = useUser();
    const userRole = user?.unsafeMetadata?.role || "candidate";
    const companyName = user?.unsafeMetadata?.companyName || "My Organization";

    const recruiterNavMain = [
        {
            title: "Recruitment",
            url: "#",
            icon: Briefcase,
            items: [
                {
                    title: "Dashboard",
                    url: "/dashboard",
                },
                {
                    title: "Post a Job",
                    url: "/dashboard/recruiter/post-job",
                },
                {
                    title: "Manage Jobs",
                    url: "/dashboard/recruiter/manage-jobs",
                },
            ],
        },
        {
            title: "Candidates",
            url: "#",
            icon: Users,
            items: [
                {
                    title: "Proposals",
                    url: "/dashboard/recruiter/applications",
                },
                {
                    title: "Active Projects",
                    url: "/dashboard/recruiter/active-work",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "Company Profile",
                    url: "/dashboard/recruiter/profile",
                },
                {
                    title: "Account",
                    url: "/dashboard/my-account",
                },
            ],
        },
    ];

    const currentNavMain = userRole === 'Recruiter' ? recruiterNavMain : data.navMain;

    const userData = {
        name: user?.fullName || data.user.name,
        email: user?.primaryEmailAddress?.emailAddress || data.user.email,
        avatar: user?.imageUrl || data.user.avatar,
    };

    // Dynamic Team/Organization Display
    const currentTeams = userRole === 'recruiter' ? [
        {
            name: companyName,
            logo: Briefcase,
            plan: "Recruiter Workspace",
        }
    ] : [
        {
            name: "SoHired",
            logo: GalleryVerticalEnd,
            plan: "Job Seeker",
        }
    ];

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={currentTeams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={currentNavMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userData} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}

