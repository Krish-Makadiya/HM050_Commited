import React, { useEffect, useRef } from "react";
import { NeatGradient } from "@firecms/neat";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
    const canvasRef = useRef(null);
    const gradientRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Define colors based on CSS variables

        // Light Mode now uses DARK/RICH colors for high impact
        const lightColors = [
            { color: '#0e0e0e', enabled: true }, // Slate 900
            { color: '#0e0e0e', enabled: true }, // Slate 900
            { color: '#0e0e0e', enabled: true }, // Slate 900
            { color: '#3151bf', enabled: true }, // Indigo 500
            { color: '#10b981', enabled: true }, // Emerald 500
        ];

        // Dark Mode now uses LIGHT/BRIGHT colors for high impact
        const darkColors = [
            { color: '#ffffff', enabled: true }, // White
            { color: '#ffffff', enabled: true }, // White
            { color: '#ffffff', enabled: true }, // White
            { color: '#3151bf', enabled: true }, // Indigo 500
            { color: '#10b981', enabled: true }, // Emerald 500
        ];

        const getThemeColors = () => {
            const isDark = document.documentElement.classList.contains('dark');
            return isDark ? darkColors : lightColors;
        };

        const config = {
            ref: canvasRef.current,
            colors: getThemeColors(),
            speed: 4,
            horizontalPressure: 4,
            verticalPressure: 5,
            waveFrequencyX: 2,
            waveFrequencyY: 3,
            waveAmplitude: 5,
            shadows: 0,
            highlights: 2,
            colorBrightness: 1,
            colorSaturation: 3,
            wireframe: false,
            colorBlending: 6,
            backgroundColor: '#ffffff',
            backgroundAlpha: 1,
            grainScale: 2,
            grainSparsity: 0,
            grainIntensity: 0.1,
            grainSpeed: 0,
            resolution: 1,
            yOffset: 0,
            yOffsetWaveMultiplier: 0.5,
            yOffsetColorMultiplier: 1,
            yOffsetFlowMultiplier: 0.5,
            flowDistortionA: 1.2,
            flowDistortionB: 2.4,
            flowScale: 1.5,
            flowEase: 0.41,
            flowEnabled: true, // Enable flow for more dynamic movement
            flowDuration: 2000,
            mouseDistortionStrength: 0.2,
            mouseDistortionRadius: 0.3,
            mouseDecayRate: 0.96,
            mouseDarken: 0.0, // Reduced darken
            enableProceduralTexture: false,
        };

        gradientRef.current = new NeatGradient(config);

        // Observer to handle theme changes dynamically
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (gradientRef.current) {
                        gradientRef.current.destroy();
                        config.colors = getThemeColors();
                        gradientRef.current = new NeatGradient(config);
                    }
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            if (gradientRef.current) gradientRef.current.destroy();
            observer.disconnect();
        };
    }, []);

    return (
        <div className="relative h-full w-full overflow-hidden">
            <canvas
                style={{
                    isolation: "isolate",
                    height: "100%",
                    width: "100%",
                }}
                ref={canvasRef}
                className="absolute inset-0 z-0"
            />

            {/* Inverted overlays: Darker overlay for light mode (which has dark bg) doesn't make sense, 
                actually we want detailed text legibility.
                
                Light Mode (Dark BG) -> Text White
                Dark Mode (Light BG) -> Text Dark
            */}
            <div className="absolute inset-0 bg-black/20 dark:bg-white/10 backdrop-blur-[1px] z-10" />

            <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white dark:text-gray-900 mb-6 drop-shadow-sm">
                    Ready to land your dream job?
                </h2>
                <p className="text-lg md:text-lg text-gray-200 dark:text-gray-800 max-w-2xl mb-8 font-medium drop-shadow-sm">
                    Join thousands of job seekers who are already using SoHired to accelerate their career.
                </p>
                <Button
                    size="lg"
                    className="bg-light-primary hover:bg-light-primary-hover dark:bg-dark-surface dark:text-white dark:hover:bg-black/80 text-white font-semibold text-md px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent dark:border-black/5"
                >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};