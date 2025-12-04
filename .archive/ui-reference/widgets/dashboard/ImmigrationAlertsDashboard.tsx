'use client';

/**
 * Immigration Alerts Dashboard Widget
 *
 * Displays immigration alerts with priority indicators and urgency color coding.
 * Shows visa expiry dates, action needed, and allows quick actions.
 */

import React from 'react';
import { Shield, AlertTriangle, Clock, User, ChevronRight, Bell, CheckCircle2, Eye, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface Alert {
  id: string;
  consultantId: string;
  alertType: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  alertDate: string;
}

interface ImmigrationAlertsData {
  alerts: Alert[];
  summary: {
    red: number;
    orange: number;
    yellow: number;
    green: number;
    black: number;
  };
}

function getSeverityConfig(severity: string): {
  bg: string;
  text: string;
  border: string;
  icon: React.ElementType;
  label: string;
} {
  switch (severity) {
    case 'critical':
      return {
        bg: 'bg-error-50',
        text: 'text-error-700',
        border: 'border-error-200',
        icon: AlertTriangle,
        label: 'CRITICAL',
      };
    case 'warning':
      return {
        bg: 'bg-warning-50',
        text: 'text-warning-700',
        border: 'border-warning-200',
        icon: Clock,
        label: 'WARNING',
      };
    default:
      return {
        bg: 'bg-charcoal-50',
        text: 'text-charcoal-700',
        border: 'border-charcoal-200',
        icon: Bell,
        label: 'INFO',
      };
  }
}

function AlertItem({ alert }: { alert: Alert }) {
  const config = getSeverityConfig(alert.severity);
  const Icon = config.icon;
  const alertDate = new Date(alert.alertDate);
  const daysUntil = Math.ceil((alertDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200",
      config.bg, config.border,
      "hover:shadow-sm"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
        alert.severity === 'critical' && "bg-error-100 text-error-600",
        alert.severity === 'warning' && "bg-warning-100 text-warning-600",
        alert.severity === 'info' && "bg-charcoal-200 text-charcoal-600"
      )}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
            alert.severity === 'critical' && "bg-error-200 text-error-700",
            alert.severity === 'warning' && "bg-warning-200 text-warning-700",
            alert.severity === 'info' && "bg-charcoal-200 text-charcoal-700"
          )}>
            {config.label}
          </span>
          {daysUntil <= 30 && (
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              daysUntil <= 7 ? "bg-error-200 text-error-700" :
              daysUntil <= 14 ? "bg-warning-200 text-warning-700" :
              "bg-charcoal-200 text-charcoal-700"
            )}>
              {daysUntil <= 0 ? 'OVERDUE' : `${daysUntil}d remaining`}
            </span>
          )}
        </div>

        <p className={cn("text-sm font-medium mb-1", config.text)}>
          {alert.message}
        </p>

        <p className="text-xs text-charcoal-500">
          Due: {alertDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-white/50"
          title="View Details"
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-white/50 text-success-600"
          title="Mark Resolved"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-white/50 text-charcoal-400"
          title="Dismiss"
        >
          <XCircle className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function SummaryBadge({ count, color, label }: { count: number; color: string; label: string }) {
  if (count === 0) return null;

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
      color
    )}>
      <span className={cn(
        "w-2 h-2 rounded-full",
        label === 'Critical' && "bg-error-500",
        label === 'Warning' && "bg-warning-500",
        label === 'Info' && "bg-charcoal-400"
      )} />
      {count} {label}
    </div>
  );
}

export function ImmigrationAlertsDashboard({ definition, data, context }: SectionWidgetProps) {
  const alertsData = data as ImmigrationAlertsData | undefined;
  const isLoading = context?.isLoading;

  const alerts = alertsData?.alerts || [];
  const summary = alertsData?.summary || { red: 0, orange: 0, yellow: 0, green: 0, black: 0 };
  const totalAlerts = summary.red + summary.orange + summary.yellow;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rust-100 rounded-lg animate-pulse" />
            <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shadow-sm",
              totalAlerts > 0 ? "bg-gradient-to-br from-rust-500 to-rust-600" : "bg-gradient-to-br from-success-500 to-success-600"
            )}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                {(typeof definition.title === 'string' ? definition.title : 'Immigration Alerts') || 'Immigration Alerts'}
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                {totalAlerts > 0 ? `${totalAlerts} alerts require attention` : 'All immigration statuses healthy'}
              </p>
            </div>
          </div>
          <Link
            href="/employee/bench/immigration"
            className="text-xs font-medium text-forest-600 hover:text-forest-700 flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Summary badges */}
        {totalAlerts > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <SummaryBadge count={summary.red} color="bg-error-50 text-error-700" label="Critical" />
            <SummaryBadge count={summary.orange} color="bg-warning-50 text-warning-700" label="Warning" />
            <SummaryBadge count={summary.yellow} color="bg-charcoal-100 text-charcoal-700" label="Info" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success-600" />
            </div>
            <p className="text-sm font-medium text-charcoal-600">
              No immigration alerts
            </p>
            <p className="text-xs text-charcoal-400 mt-1">
              All consultant visa statuses are healthy
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ImmigrationAlertsDashboard;
