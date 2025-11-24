import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
    return (
        <div
            className={cn(
                'glass rounded-xl p-6',
                hover && 'glass-hover cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    );
}
