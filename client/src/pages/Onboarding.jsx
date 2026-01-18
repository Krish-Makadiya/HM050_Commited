import { Badge } from "@/ui/badge"
import { Button } from "@/ui/button"
import { Select } from "@/ui/select"
import { Input } from "@/ui/input"
import { Textarea } from "@/ui/textarea"
import { useUser } from "@clerk/clerk-react"
import axios from "axios"
import { X, Briefcase, User, Loader2, Globe, MapPin, Building2 } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/ui/card"

const rolesList = [
    "Frontend Developer", "Backend Developer", "Fullstack Developer",
    "Mobile Developer", "DevOps Engineer", "UI/UX Designer",
    "Data Scientist", "Product Manager", "Software Engineer",
    "Machine Learning Engineer", "Cybersecurity Analyst", "Data Engineer",
    "SRE", "Cloud Architect", "AI Engineer", "System Administrator",
    "Network Engineer", "QA Engineer"
]

const skillsList = [
    "React", "Vue", "Angular", "Node.js", "Python", "Java", "Go",
    "Rust", "Docker", "Kubernetes", "AWS", "Figma", "TypeScript",
    "TailwindCSS", "PostgreSQL", "MongoDB", "C++", "C#", "Azure",
    "GCP", "GraphQL", "Next.js", "Redis", "Terraform", "Linux",
    "Git", "Jenkins", "SQL", "NoSQL", "Swift", "Kotlin", "Flutter",
    "React Native"
]

// New lists for Recruiters
const industryList = [
    "Technology", "Finance", "Healthcare", "Education", "E-commerce",
    "Consulting", "Media", "Logistics", "Energy", "Manufacturing",
    "Real Estate", "Non-Profit", "Other"
];

const companySizeList = [
    "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"
];


const MultiSelect = ({ options, value, onChange, placeholder, label }) => {
    const [query, setQuery] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef(null)

    const filteredOptions = useMemo(() => {
        return options.filter(option =>
            option.toLowerCase().includes(query.toLowerCase()) &&
            !value.includes(option)
        )
    }, [options, query, value])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = (option) => {
        onChange([...value, option])
        setQuery("")
    }

    const handleRemove = (option) => {
        onChange(value.filter(item => item !== option))
    }

    return (
        <div className="space-y-2 w-full" ref={containerRef}>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>
            <div
                className="relative flex min-h-[42px] w-full flex-wrap items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white focus-within:ring-2 focus-within:ring-neutral-950 focus-within:ring-offset-2 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:focus-within:ring-neutral-300 transition-shadow duration-200"
                onClick={() => setIsOpen(true)}
            >
                {value.length > 0 && value.map((item) => (
                    <Badge key={item} variant="secondary" className="hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                        {item}
                        <button
                            className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleRemove(item)
                                }
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                            }}
                            onClick={() => handleRemove(item)}
                        >
                            <X className="h-3 w-3 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50" />
                        </button>
                    </Badge>
                ))}

                <input
                    className="flex-1 bg-transparent outline-none placeholder:text-neutral-400 min-w-[100px]"
                    placeholder={value.length === 0 ? placeholder : ""}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                />
            </div>

            {isOpen && (filteredOptions.length > 0 || query) && (
                <div className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-neutral-200 bg-white text-neutral-950 shadow-md animate-in fade-in-0 zoom-in-95 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50">
                    <div className="p-1">
                        {filteredOptions.length === 0 ? (
                            <p className="p-2 text-sm text-neutral-500 text-center">No results found.</p>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option}
                                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                    onClick={() => handleSelect(option)}
                                >
                                    {option}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

const Onboarding = () => {
    const { user } = useUser()
    const navigate = useNavigate()

    const [step, setStep] = useState('role-selection');
    const [userType, setUserType] = useState(''); // 'Candidate' | 'Recruiter'
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Candidate State
    const [selectedRole, setSelectedRole] = useState("")
    const [selectedSkills, setSelectedSkills] = useState([])

    // Recruiter State
    const [companyName, setCompanyName] = useState("");
    const [companyWebsite, setCompanyWebsite] = useState("");
    const [companyIndustry, setCompanyIndustry] = useState("");
    const [companySize, setCompanySize] = useState("");
    const [companyBio, setCompanyBio] = useState("");
    const [companyLocation, setCompanyLocation] = useState("");


    const handleRoleSelect = (role) => {
        setUserType(role);
        setStep('details');
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            let backendPayload = {};
            const finalRole = userType === 'Candidate' ? 'Candidate' : 'Recruiter';

            if (userType === 'Candidate') {
                if (!selectedRole) return;

                backendPayload = {
                    role: finalRole,
                    jobTitle: selectedRole,
                    skills: selectedSkills,
                    experienceLevel: "Entry Level",
                    jobTypes: ["Contract", "Freelance"],
                    companies: [],
                    countries: []
                };

            } else {
                if (!companyName || !companyIndustry) return;

                backendPayload = {
                    role: finalRole,
                    companyName,
                    website: companyWebsite,
                    industry: companyIndustry,
                    companySize: companySize,
                    bio: companyBio,
                    location: companyLocation
                };
            }

            // 1. Update Clerk Metadata
            if (user) {
                try {
                    await user.update({
                        unsafeMetadata: {
                            onboarded: true,
                            role: finalRole,
                            ...(userType === 'Candidate' ? {} : { companyName })
                        }
                    })
                } catch (err) {
                    console.warn("Could not update metadata:", err)
                }
            }

            // 2. Save Detailed Profile to Backend
            await axios.post(`${import.meta.env.VITE_SERVER_API}/api/user/onboarding`, {
                clerkId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.primaryEmailAddress?.emailAddress,
                imageUrl: user.imageUrl,
                ...backendPayload
            })

            // Redirect
            navigate("/dashboard")
        } catch (error) {
            console.error("Onboarding failed:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (step === 'role-selection') {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center p-4 md:p-8">
                <div className="text-center mb-10 space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight">Welcome to SoHired</h1>
                    <p className="text-muted-foreground text-lg">How would you like to use the platform?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                    <Card
                        className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300 group relative overflow-hidden h-[300px] flex items-center justify-center p-6 bg-white dark:bg-neutral-950"
                        onClick={() => handleRoleSelect('Candidate')}
                    >
                        <CardContent className="flex flex-col items-center text-center gap-6 z-10">
                            <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <User className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold">I am a Developer / Designer</h3>
                                <p className="text-muted-foreground">Find projects, submit proposals, and get hired.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300 group relative overflow-hidden h-[300px] flex items-center justify-center p-6 bg-white dark:bg-neutral-950"
                        onClick={() => handleRoleSelect('Recruiter')}
                    >
                        <CardContent className="flex flex-col items-center text-center gap-6 z-10">
                            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <Briefcase className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold">I am Hiring</h3>
                                <p className="text-muted-foreground">Post requirements and connect with talent.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-2xl bg-white dark:bg-neutral-950 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-6 md:p-10 animate-in fade-in zoom-in duration-500">
                <Button variant="ghost" className="mb-6 px-0 hover:bg-transparent text-muted-foreground" onClick={() => setStep('role-selection')}>← Back</Button>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-linear-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent mb-3">
                        {userType === 'Candidate' ? "Your Profile" : "Organization Details"}
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        {userType === 'Candidate' ? "Tell us about your expertise to match you with the right projects." : "Tell us about your company to attract the best talent."}
                    </p>
                </div>

                {userType === 'Candidate' ? (
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Primary Role <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={selectedRole}
                                onChange={setSelectedRole}
                                options={rolesList}
                                placeholder="Select your main role"
                            />
                        </div>

                        <MultiSelect
                            label="Core Skills / Tech Stack"
                            placeholder="Type to search skills..."
                            options={skillsList}
                            value={selectedSkills}
                            onChange={setSelectedSkills}
                        />

                        <div className="pt-4 flex justify-end">
                            <Button
                                size="lg"
                                onClick={handleSubmit}
                                disabled={!selectedRole || isSubmitting}
                                className="w-full md:w-auto min-w-[200px]"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : "Complete Setup"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Company Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        placeholder="e.g. Acme Inc."
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Website
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        placeholder="https://acme.com"
                                        value={companyWebsite}
                                        onChange={(e) => setCompanyWebsite(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Industry <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={companyIndustry}
                                    onChange={setCompanyIndustry}
                                    options={industryList}
                                    placeholder="Select Industry"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Company Size
                                </label>
                                <Select
                                    value={companySize}
                                    onChange={setCompanySize}
                                    options={companySizeList}
                                    placeholder="Select Size"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Headquarters / Location
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder="e.g. San Francisco, CA"
                                    value={companyLocation}
                                    onChange={(e) => setCompanyLocation(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                About Company
                            </label>
                            <Textarea
                                placeholder="Briefly describe your company's mission and culture..."
                                className="min-h-[100px]"
                                value={companyBio}
                                onChange={(e) => setCompanyBio(e.target.value)}
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button
                                size="lg"
                                onClick={handleSubmit}
                                disabled={!companyName || !companyIndustry || isSubmitting}
                                className="w-full md:w-auto min-w-[200px]"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : "Create Workspace"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Onboarding
