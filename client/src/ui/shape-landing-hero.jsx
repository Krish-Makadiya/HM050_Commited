"use client";;
import { motion, AnimatePresence } from "framer-motion";
import { Circle, Globe, Zap, Command, Cpu, Hexagon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";


function ElegantShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    gradient = "from-white/[0.08]"
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: -150,
                rotate: rotate - 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
                rotate: rotate,
            }}
            transition={{
                duration: 2.4,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96],
                opacity: { duration: 1.2 },
            }}
            className={cn("absolute", className)}>
            <motion.div
                animate={{
                    y: [0, 15, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                style={{
                    width,
                    height,
                }}
                className="relative">
                <div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-r to-transparent",
                        gradient,
                        "backdrop-blur-[2px] border-2 border-light-primary-text/[0.15] dark:border-dark-primary-text/[0.15]",
                        "shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
                        "after:absolute after:inset-0 after:rounded-full",
                        "after:bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.2),transparent_70%)] dark:after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
                    )} />
            </motion.div>
        </motion.div>
    );
}

function RotatingLogo() {
    const logos = ["/companies/airbnb.jpeg", "/companies/discord.png", "/companies/dropbox.png", "/companies/hubspot.jpeg", "/companies/pintrest.jpeg", "/companies/slack.jpeg", "/companies/stripe.jpeg", "/companies/twitch.jpeg", "/companies/zoom.png"];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % logos.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const Logo = logos[index];

    return (
        <span className="inline-flex items-center justify-center w-[0.8em] h-[0.8em] mx-[0.02em] align-top relative top-[0.1em]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <img src={logos[index]} alt="" className="w-[2em] rounded-full" />
                </motion.div>
            </AnimatePresence>
        </span>
    );
}

function HeroGeometric({
    badge = "In Development",
    title1 = "Don't just apply.",
    title2 = "Get SoHired."
}) {
    const fadeUpVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                delay: 0.5 + i * 0.2,
                ease: [0.25, 0.4, 0.25, 1],
            },
        }),
    };

    return (
        <div
            className="relative min-h-screen w-full flex items-center justify-center overflow-hidden ">
            <div className="absolute inset-0 overflow-hidden">
                <ElegantShape
                    delay={0.3}
                    width={600}
                    height={140}
                    rotate={12}
                    gradient="from-indigo-500/[0.15]"
                    className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]" />

                <ElegantShape
                    delay={0.5}
                    width={500}
                    height={120}
                    rotate={-15}
                    gradient="from-rose-500/[0.15]"
                    className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]" />

                <ElegantShape
                    delay={0.4}
                    width={300}
                    height={80}
                    rotate={-8}
                    gradient="from-violet-500/[0.15]"
                    className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]" />

                <ElegantShape
                    delay={0.6}
                    width={200}
                    height={60}
                    rotate={20}
                    gradient="from-amber-500/[0.15]"
                    className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]" />

                <ElegantShape
                    delay={0.7}
                    width={150}
                    height={40}
                    rotate={-25}
                    gradient="from-cyan-500/[0.15]"
                    className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]" />
            </div>
            <div className="relative z-10 container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        custom={0}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-light-primary-text/[0.03] dark:bg-dark-primary-text/[0.03] border border-light-primary-text/[0.08] dark:border-dark-primary-text/[0.08] mb-8 md:mb-12">
                        <Circle className="h-[10px] w-[10px] fill-red-500" />
                        <span className="text-sm text-light-secondary-text dark:text-dark-secondary-text tracking-wide">
                            {badge}
                        </span>
                    </motion.div>

                    <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
                        <h1
                            className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
                            <span
                                className="bg-clip-text text-transparent bg-gradient-to-b from-light-primary-text to-light-primary-text/80 dark:from-dark-primary-text dark:to-dark-primary-text/80">
                                {title1}
                            </span>
                            <br />
                            <span
                                className={cn(
                                    "bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-light-primary-text/90 to-rose-300 dark:from-indigo-300 dark:via-dark-primary-text/90 dark:to-rose-300"
                                )}>
                                {title2 === "Get SoHired." ? (
                                    <>
                                        Get S<RotatingLogo />Hired.
                                    </>
                                ) : (
                                    title2
                                )}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
                        <p
                            className="text-base sm:text-lg md:text-xl text-light-secondary-text/80 dark:text-dark-secondary-text/80 mb-8 leading-relaxed font-light tracking-wide max-w-3xl mx-auto px-4">
                            Your AI agent that auto-applies to jobs, identifies your skill gaps, and preps you for interviews. Stop guessing and start working.
                        </p>
                    </motion.div>
                </div>
            </div>
            <div
                className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/80 pointer-events-none dark:from-[#030303] dark:via-transparent dark:to-[#030303]/80" />
        </div>
    );
}

export { HeroGeometric }
