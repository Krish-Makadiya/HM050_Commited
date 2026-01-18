import Navbar from '../components/main/Navbar';
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, CheckCircle, Zap, Shield, Hexagon, Twitter, Github, MailIcon, PhoneIcon, MapPinIcon } from "lucide-react";
import { motion } from "framer-motion";
import { HeroGeometric } from '@/ui/shape-landing-hero';
import { LogoCloud } from '@/components/logo-cloud-3';
import { cn } from '@/lib/utils';
import { HeroSection } from '@/components/hero-section-2';
import { FeaturesSectionWithHoverEffects } from '@/components/feature-section-with-hover-effects';
import { StatsCounter } from '@/ui/stats-counter';
import { PricingWithChart } from '@/components/pricing-with-chart';
import { Footer } from '@/ui/footer';
import { Testimonial } from '@/ui/testimonial-card';
import { CTASection } from '@/ui/CTASection';
import { ContactCard } from '@/components/contact-card';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Button } from '@/ui/button';

const Landing = () => {
    const logos = [
        {
            src: "https://svgl.app/library/nvidia-wordmark-light.svg",
            alt: "Nvidia Logo",
        },
        {
            src: "https://svgl.app/library/supabase_wordmark_light.svg",
            alt: "Supabase Logo",
        },
        {
            src: "https://svgl.app/library/openai_wordmark_light.svg",
            alt: "OpenAI Logo",
        },
        {
            src: "https://svgl.app/library/turso-wordmark-light.svg",
            alt: "Turso Logo",
        },
        {
            src: "https://svgl.app/library/vercel_wordmark.svg",
            alt: "Vercel Logo",
        },
        {
            src: "https://svgl.app/library/github_wordmark_light.svg",
            alt: "GitHub Logo",
        },
        {
            src: "https://svgl.app/library/claude-ai-wordmark-icon_light.svg",
            alt: "Claude AI Logo",
        },
        {
            src: "https://svgl.app/library/clerk-wordmark-light.svg",
            alt: "Clerk Logo",
        },
    ];

    const testimonials = [
        {
            name: "Sarah Chen",
            role: "Senior Fullstack Developer",
            company: "Freelancer",
            rating: 5,
            image: "https://i.pravatar.cc/150?u=sarah",
            testimonial: "The auto-generated smart contracts gave me total peace of mind. I know exactly when and how much I'll get paid. No more chasing clients for invoices!"
        },
        {
            name: "Michael Ross",
            role: "CTO",
            company: "TechFlow Inc.",
            rating: 5,
            image: "https://i.pravatar.cc/150?u=michael",
            testimonial: "Hiring here is a breeze. The task-based roadmap feature ensures I only release funds when specific milestones are met. It's fair, transparent, and efficient."
        },
        {
            name: "Emily Rodriguez",
            role: "UI/UX Designer",
            company: "Freelancer",
            rating: 5,
            image: "https://i.pravatar.cc/150?u=emily",
            testimonial: "Getting my skills verified with badges boosted my profile visibility instantly. I received 3 project invites in my first week without even sending a proposal."
        },
        {
            name: "David Park",
            role: "Product Owner",
            company: "StartupX",
            rating: 5,
            image: "https://i.pravatar.cc/150?u=david",
            testimonial: "The best platform for finding specialized talent. The AI matching is spot on—I found a developer who had the exact niche experience I needed for my fintech app."
        }
    ]

    return (
        <div className="min-h-screen flex flex-col font-poppins selection:bg-light-primary selection:text-white dark:selection:bg-dark-primary">
            <Navbar />

            <HeroGeometric />

            <HeroSection />
            <LogoCloud logos={logos} />


            <FeaturesSectionWithHoverEffects />
            <StatsCounter />

            <PricingWithChart />

            <div className="py-20 lg:py-32 max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-light-primary-text dark:text-dark-primary-text mb-4">
                        Trusted by <span className="text-light-primary dark:text-dark-primary">Top Developers</span> and Innovative Companies
                    </h2>
                    <p className="text-lg text-light-secondary-text dark:text-dark-secondary-text max-w-2xl mx-auto">
                        Join thousands of freelancers and founders building the future together. See why they choose SoHired.
                    </p>
                </div>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                    {testimonials.map((testimonial) => (
                        <Testimonial key={testimonial.name} {...testimonial} />
                    ))}
                </div>
            </div>

            <div className="w-full h-[350px]">
                <CTASection />
            </div>

            <main className="relative flex w-full items-center justify-center py-20 bg-light-bg/50 dark:bg-black/20 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 md:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

                <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
                    <ContactCard
                        title="Let's talk"
                        description="Have questions about our AI features? Need help with your job search tracking? Our team is here to help you succeed."
                        contactInfo={[
                            {
                                icon: MailIcon,
                                label: 'Email Support',
                                value: 'support@sohired.com',
                            },
                            {
                                icon: PhoneIcon,
                                label: 'Call Us',
                                value: '+1 (555) 123-4567',
                            },
                            {
                                icon: MapPinIcon,
                                label: 'Headquarters',
                                value: 'San Francisco, CA',
                                className: 'col-span-2 sm:col-span-1',
                            }
                        ]}
                    >
                        <form className="w-full space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text ml-1">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        className="h-14 bg-light-bg/50 dark:bg-dark-bg/50 border-transparent focus:border-light-primary dark:focus:border-dark-primary focus:bg-white dark:focus:bg-dark-surface focus:ring-4 focus:ring-light-primary/10 dark:focus:ring-dark-primary/10 rounded-2xl transition-all duration-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text ml-1">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        className="h-14 bg-light-bg/50 dark:bg-dark-bg/50 border-transparent focus:border-light-primary dark:focus:border-dark-primary focus:bg-white dark:focus:bg-dark-surface focus:ring-4 focus:ring-light-primary/10 dark:focus:ring-dark-primary/10 rounded-2xl transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject" className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text ml-1">Subject</Label>
                                <Input
                                    id="subject"
                                    placeholder="Looking for partnership..."
                                    className="h-14 bg-light-bg/50 dark:bg-dark-bg/50 border-transparent focus:border-light-primary dark:focus:border-dark-primary focus:bg-white dark:focus:bg-dark-surface focus:ring-4 focus:ring-light-primary/10 dark:focus:ring-dark-primary/10 rounded-2xl transition-all duration-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message" className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text ml-1">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="How can we help you?"
                                    className="min-h-[160px] bg-light-bg/50 dark:bg-dark-bg/50 border-transparent focus:border-light-primary dark:focus:border-dark-primary focus:bg-white dark:focus:bg-dark-surface focus:ring-4 focus:ring-light-primary/10 dark:focus:ring-dark-primary/10 rounded-2xl resize-none p-5 transition-all duration-300"
                                />
                            </div>

                            <Button className="w-full h-14 text-lg font-bold bg-light-primary hover:bg-light-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover text-white rounded-full transition-all shadow-[0_10px_20px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-1">
                                Send Message
                            </Button>
                        </form>
                    </ContactCard>
                </div>
            </main>

            <Footer
                logo={"/logo-light-bnw.png"}
                brandName="SoHired"
                socialLinks={[
                    {
                        icon: <Twitter className="h-5 w-5" />,
                        href: "https://twitter.com",
                        label: "Twitter",
                    },
                    {
                        icon: <Github className="h-5 w-5" />,
                        href: "https://github.com",
                        label: "GitHub",
                    },
                ]}
                mainLinks={[
                    { href: "/products", label: "Products" },
                    { href: "/about", label: "About" },
                    { href: "/blog", label: "Blog" },
                    { href: "/contact", label: "Contact" },
                ]}
                legalLinks={[
                    { href: "/privacy", label: "Privacy" },
                    { href: "/terms", label: "Terms" },
                ]}
                copyright={{
                    text: "Â© 2026 SoHired",
                    license: "All rights reserved",
                }}
            />
        </div>
    );
}

export default Landing;
