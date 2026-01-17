"use client";
import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

const Counter = ({ value, suffix = "", className }) => {
    const ref = useRef(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 60,
        stiffness: 100,
        duration: 3,
    });
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    useEffect(() => {
        springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = Intl.NumberFormat("en-US").format(
                    Math.floor(latest)
                ) + suffix;
            }
        });
    }, [springValue, suffix]);

    return <span ref={ref} className={className} />;
};

export const StatsCounter = () => {
    const stats = [
        { label: "Jobs Scraped", value: 12405, suffix: "" },
        { label: "Skill Gaps Closed", value: 850, suffix: "" },
        { label: "Hours Saved", value: 5000, suffix: "+" },
    ];

    return (
        <section className="w-full py-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="group relative flex flex-col items-center justify-center p-10 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-solid hover:border-light-primary/50 dark:hover:border-dark-primary/50 hover:bg-light-primary/[0.02] dark:hover:bg-dark-primary/[0.02] transition-all duration-300"
                        >
                            <div className="flex items-baseline gap-1 relative z-20">
                                <Counter
                                    value={stat.value}
                                    suffix={stat.suffix}
                                    className="text-6xl md:text-7xl font-bold tracking-tighter text-light-primary-text dark:text-dark-primary-text group-hover:scale-110 transition-transform duration-500 ease-out"
                                />
                            </div>
                            <p className="mt-4 text-sm font-medium text-light-secondary-text dark:text-dark-secondary-text uppercase tracking-widest group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors duration-300">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
