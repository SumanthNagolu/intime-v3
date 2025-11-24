import { GlassCard } from '../ui/glass-card';
import { CheckCircle2, BookOpen, Trophy, Clock, type LucideIcon } from 'lucide-react';

interface Activity {
    id: string;
    title: string;
    time: string;
    icon: LucideIcon;
}

const recentActivities: Activity[] = [
    {
        id: '1',
        title: 'Completed "Guidewire Basics" Module',
        time: '2 hours ago',
        icon: CheckCircle2,
    },
    {
        id: '2',
        title: 'Started "PolicyCenter Overview"',
        time: '5 hours ago',
        icon: BookOpen,
    },
    {
        id: '3',
        title: 'Earned "Fast Learner" Badge',
        time: 'Yesterday',
        icon: Trophy,
    },
    {
        id: '4',
        title: 'Completed Quiz with 95%',
        time: '2 days ago',
        icon: CheckCircle2,
    },
];

export function ActivityFeed() {
    return (
        <GlassCard hover={false}>
            <h3 className="text-xl font-semibold mb-4 text-white">Recent Activity</h3>
            <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                    <div
                        key={activity.id}
                        className="flex gap-4 animate-slide-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="w-10 h-10 rounded-full glass flex items-center justify-center flex-shrink-0">
                            <activity.icon className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white/90 text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-white/50 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {activity.time}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
