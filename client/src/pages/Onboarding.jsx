import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { useUser } from "@clerk/clerk-react"
import axios from "axios"
import { FileText, Loader2, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

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

const countriesList = [
    "United States", "United Kingdom", "Canada", "Germany", "India", "Australia",
    "Remote", "France", "Netherlands", "Singapore", "Japan", "Brazil",
    "Sweden", "Switzerland", "Ireland", "Spain", "Italy"
]

const companiesList = [
    "Airbnb", "Dropbox", "Pinterest", "Reddit", "Twilio", "HubSpot",
    "Notion", "Zapier", "Asana", "Lyft", "Figma", "Cloudflare",
    "Postman", "Miro", "Mixpanel", "Stripe", "Coinbase", "Robinhood",
    "Instacart", "DoorDash", "Slack", "Zoom"
]

// Mapped for logic checks (Key = Keyword in Job Title/Desc, Value = Your Category)
const experienceLevelsList = {
    "intern": "Internship",
    "co-op": "Internship",
    "graduate": "Entry Level",
    "entry": "Entry Level",
    "junior": "Junior (1-3 yrs)",
    "associate": "Junior (1-3 yrs)",
    "mid": "Mid Level (3-5 yrs)",
    "senior": "Senior (5+ yrs)",
    "staff": "Senior (5+ yrs)",
    "principal": "Senior (5+ yrs)",
    "lead": "Lead / Manager",
    "manager": "Lead / Manager",
    "head": "Lead / Manager",
    "director": "Lead / Manager"
};

const experienceOptions = [...new Set(Object.values(experienceLevelsList))]

const jobTypesList = [
    "Full-time", "Part-time", "Contract", "Freelance", "Internship"
]

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

    // Close dropdown when clicking outside
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
    const [selectedRole, setSelectedRole] = useState("")
    const [selectedExperienceLevel, setSelectedExperienceLevel] = useState("")
    const [selectedJobTypes, setSelectedJobTypes] = useState([])
    const [selectedSkills, setSelectedSkills] = useState([])
    const [selectedCountries, setSelectedCountries] = useState([])
    const [selectedCompanies, setSelectedCompanies] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false);


    const toggleJobType = (type) => {
        if (selectedJobTypes.includes(type)) {
            setSelectedJobTypes(prev => prev.filter(t => t !== type))
        } else {
            setSelectedJobTypes(prev => [...prev, type])
        }
    }

    const toggleCountry = (country) => {
        if (selectedCountries.includes(country)) {
            setSelectedCountries(prev => prev.filter(c => c !== country))
        } else {
            setSelectedCountries(prev => [...prev, country])
        }
    }

    const toggleCompany = (company) => {
        if (selectedCompanies.includes(company)) {
            setSelectedCompanies(prev => prev.filter(c => c !== company))
        } else {
            setSelectedCompanies(prev => [...prev, company])
        }
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const data = new FormData();
        data.append('file', file);

        try {
            const response = await axios.post('http://localhost:5678/webhook-test/parse-resume', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Resume Parsed Data:", response.data);

            const payload = {
                ...response.data.resumeData,
                clerkId: user?.id,
                imageUrl: user?.imageUrl
            }

            const res = await axios.post(`${import.meta.env.VITE_SERVER_API}/api/user/user-profile`, payload)

            setSelectedRole(response.data.jobPreferences.selectedRole);
            setSelectedExperienceLevel(response.data.jobPreferences.selectedExperienceLevel);
            setSelectedJobTypes(response.data.jobPreferences.selectedJobTypes)
            setSelectedSkills(response.data.jobPreferences.selectedSkills)
            
        } catch (error) {
            console.error("Error parsing resume:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedRole || !selectedExperienceLevel || selectedJobTypes.length === 0) return

        setIsSubmitting(true)
        try {
            const onboardingData = {
                role: selectedRole,
                experienceLevel: selectedExperienceLevel,
                jobTypes: selectedJobTypes,
                skills: selectedSkills,
                countries: selectedCountries,
                companies: selectedCompanies
            }
            console.log("Onboarding Data:", onboardingData)

            if (user) {
                try {
                    await user.update({
                        unsafeMetadata: {
                            onboarded: true,
                            ...onboardingData
                        }
                    })
                } catch (err) {
                    console.warn("Could not update metadata:", err)
                }
            }
            await axios.post(`${import.meta.env.VITE_SERVER_API}/api/user/onboarding`, {
                clerkId: user.id,
                ...onboardingData
            })

            try {
                await axios.post('http://localhost:5678/webhook-test/get-filtered-jobs', {
                    userId: user.id,
                    ...onboardingData
                })
            } catch (webhookErr) {
                console.warn("Webhook failed:", webhookErr)
            }

            navigate("/dashboard")
        } catch (error) {
            console.error("Onboarding failed:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-5xl bg-white dark:bg-neutral-950 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-6 md:p-10 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-linear-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent mb-3">
                        Welcome, {user?.firstName || "there"}!
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Help us tailor your job feed by answering a few quick questions.
                    </p>
                </div>

                <div className="flex justify-end mb-4">
                    <input
                        type="file"
                        id="resume-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                    />
                    <label htmlFor="resume-upload">
                        <Button
                            type="button"
                            variant="outline"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 gap-2 cursor-pointer"
                            onClick={() => document.getElementById('resume-upload').click()}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <FileText className="h-4 w-4" />
                            )}
                            {isUploading ? "Parsing Resume..." : "Import from Resume"}
                        </Button>
                    </label>
                </div>

                <div className="space-y-8">
                    {/* Top Section: Role & Experience */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Desired Role <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={selectedRole}
                                onChange={setSelectedRole}
                                options={rolesList}
                                placeholder="Select a role"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Experience Level <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={selectedExperienceLevel}
                                onChange={setSelectedExperienceLevel}
                                options={experienceOptions}
                                placeholder="Select level"
                            />
                        </div>
                    </div>

                    {/* Job Types - Pills */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Job Type <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {jobTypesList.map((type) => {
                                const isSelected = selectedJobTypes.includes(type)
                                return (
                                    <button
                                        key={type}
                                        onClick={() => toggleJobType(type)}
                                        className={`
                                            px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                                            ${isSelected
                                                ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white shadow-sm"
                                                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"}
                                        `}
                                    >
                                        {type}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="h-px bg-neutral-100 dark:bg-neutral-800" />

                    {/* Multi-Select for Skills */}
                    <MultiSelect
                        label="Key Skills"
                        placeholder="Type to search skills (e.g. React, Python)..."
                        options={skillsList}
                        value={selectedSkills}
                        onChange={setSelectedSkills}
                    />

                    {/* Countries - Buttons */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Preferred Countries
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {countriesList.map((country) => {
                                const isSelected = selectedCountries.includes(country)
                                return (
                                    <button
                                        key={country}
                                        onClick={() => toggleCountry(country)}
                                        className={`
                                            px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border
                                            ${isSelected
                                                ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white shadow-sm"
                                                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"}
                                        `}
                                    >
                                        {country}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Companies - Buttons */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Target Companies
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {companiesList.map((company) => {
                                const isSelected = selectedCompanies.includes(company)
                                return (
                                    <button
                                        key={company}
                                        onClick={() => toggleCompany(company)}
                                        className={`
                                            px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border
                                            ${isSelected
                                                ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white shadow-sm"
                                                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"}
                                        `}
                                    >
                                        {company}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            size="lg"
                            onClick={handleSubmit}
                            disabled={!selectedRole || !selectedExperienceLevel || selectedJobTypes.length === 0 || isSubmitting}
                            className="w-full md:w-auto min-w-[200px]"
                        >
                            {isSubmitting ? "Saving..." : "Start Exploring Jobs"}
                        </Button>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-neutral-400 text-sm text-center">
                You can always update these preferences later in Settings.
            </p>
        </div>
    )
}

export default Onboarding
