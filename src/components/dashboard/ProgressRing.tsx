'use client';

import { GlassCard } from '../ui/glass-card';
import { useEffect, useState } from 'react';

interface ProgressRingProps {
    progress: number; // 0-100
    label: string;
    color?: string;
}

export function ProgressRing({ progress, label, color = '#667eea' }: ProgressRingProps) {
    const [offset, setOffset] = useState(0);
    const size = 128;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        const progressOffset = circumference - (progress / 100) * circumference;
        setOffset(progressOffset);
    }, [progress, circumference]);

    return (
        <GlassCard hover className="flex flex-col items-center justify-center">
            <div className="relative">
                <svg className="transform -rotate-90" width={size} height={size}>
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="url(#gradient)"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#667eea" />
                            <stop offset="100%" stopColor="#764ba2" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{progress}%</span>
                </div>
            </div>
            <p className="text-sm text-white/70 mt-4">{label}</p>
        </GlassCard>
    );
}
