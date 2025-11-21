'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import {
  CalendarIcon,
  TrendingUp,
  Clock,
  Target,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';

interface ProductivityReport {
  id: string;
  date: string;
  summary: string;
  productive_hours: number;
  top_activities: Array<{ category: string; percentage: number; hours: number }>;
  insights: string[];
  recommendations: string[];
}

export default function MyProductivityPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [report, setReport] = useState<ProductivityReport | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchReport(selectedDate);
  }, [selectedDate]);

  async function fetchReport(date: Date) {
    setLoading(true);

    try {
      const dateStr = format(date, 'yyyy-MM-dd');

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return;
      }

      const { data, error } = await supabase
        .from('productivity_reports')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('date', dateStr)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = not found
        console.error('Error fetching report:', error);
        setReport(null);
        return;
      }

      setReport(data);
    } catch (error) {
      console.error('Error:', error);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      coding: 'bg-blue-500',
      email: 'bg-green-500',
      meeting: 'bg-purple-500',
      documentation: 'bg-yellow-500',
      research: 'bg-orange-500',
      social_media: 'bg-pink-500',
      idle: 'bg-gray-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Productivity Timeline</h1>
        <p className="text-muted-foreground">
          AI-generated daily insights to help you stay productive
        </p>
      </div>

      {/* Date Selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'MMMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} />
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              onClick={() => setSelectedDate(new Date())}
              disabled={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
            >
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading your productivity report...</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !report && (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Report Available</h3>
            <p className="text-muted-foreground">
              Your productivity report for {format(selectedDate, 'MMMM d, yyyy')} is being generated.
              <br />
              Check back tomorrow morning!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Report */}
      {!loading && report && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Daily Summary</CardTitle>
                  <CardDescription>{format(new Date(report.date), 'EEEE, MMMM d, yyyy')}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{report.productive_hours.toFixed(1)}h</div>
                  <p className="text-sm text-muted-foreground">Productive Hours</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{report.summary}</p>
            </CardContent>
          </Card>

          {/* Top Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Top Activities
              </CardTitle>
              <CardDescription>How you spent your time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.top_activities.map((activity, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {activity.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {activity.hours.toFixed(1)} hours
                        </span>
                      </div>
                      <span className="text-sm font-semibold">{activity.percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getCategoryColor(activity.category)}`}
                        style={{ width: `${activity.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          {report.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Insights
                </CardTitle>
                <CardDescription>Patterns and achievements from today</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {report.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Recommendations
                </CardTitle>
                <CardDescription>Actionable tips for tomorrow</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {report.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                          {index + 1}
                        </span>
                      </div>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
