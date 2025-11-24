import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatsCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down';
}

export function StatsCard({ icon: Icon, label, value, change, trend }: StatsCardProps) {
    return (
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
                        <p className="text-3xl font-bold text-charcoal mb-2 font-heading">{value}</p>
                        {change && trend && (
                            <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                <span>{change}</span>
                            </div>
                        )}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-forest-50 flex items-center justify-center text-forest-600">
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
