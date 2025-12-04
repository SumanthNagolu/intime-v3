'use client';

/**
 * Client Health Alerts Widget
 *
 * Shows alerts for client accounts that need attention:
 * - At-risk accounts
 * - Accounts not contacted in 30+ days
 * - Accounts with declining NPS
 */

import React from 'react';
import { AlertTriangle, Building2, Clock, TrendingDown, ChevronRight, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface AlertItem {
  id: string;
  accountId: string;
  accountName: string;
  alertType: 'at_risk' | 'no_contact' | 'declining_nps';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  daysSinceContact?: number;
  npsChange?: number;
}

interface ClientHealthData {
  alerts: AlertItem[];
  atRiskCount: number;
  noContactIn30Days: number;
  decliningNPS: number;
}

const SEVERITY_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  critical: { icon: AlertTriangle, color: 'text-error-600', bgColor: 'bg-error-50' },
  warning: { icon: Clock, color: 'text-warning-600', bgColor: 'bg-warning-50' },
  info: { icon: TrendingDown, color: 'text-charcoal-500', bgColor: 'bg-charcoal-50' },
};

function AlertRow({ alert }: { alert: AlertItem }) {
  const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
  const Icon = config.icon;

  return (
    <Link
      href={`/employee/recruiting/accounts/${alert.accountId}`}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-colors group",
        config.bgColor,
        "hover:ring-2 hover:ring-offset-1",
        alert.severity === 'critical' && "hover:ring-error-200",
        alert.severity === 'warning' && "hover:ring-warning-200",
        alert.severity === 'info' && "hover:ring-charcoal-200"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
        alert.severity === 'critical' && "bg-error-100",
        alert.severity === 'warning' && "bg-warning-100",
        alert.severity === 'info' && "bg-charcoal-100"
      )}>
        <Icon className={cn("w-4 h-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Building2 className="w-3 h-3 text-charcoal-400" />
          <p className="text-sm font-medium text-charcoal-900 truncate">
            {alert.accountName}
          </p>
        </div>
        <p className={cn("text-xs truncate", config.color)}>
          {alert.message}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-charcoal-300 group-hover:text-charcoal-500 transition-colors shrink-0" />
    </Link>
  );
}

export function ClientHealthAlerts({ definition, data, context }: SectionWidgetProps) {
  const healthData = data as ClientHealthData | undefined;
  const isLoading = context?.isLoading;
  const showOnlyAtRisk = definition.componentProps?.showOnlyAtRisk as boolean;
  const maxItems = (definition.componentProps?.maxItems as number) || 5;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-warning-100 rounded-lg animate-pulse" />
            <div className="h-5 w-40 bg-charcoal-100 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-charcoal-50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  let alerts = healthData?.alerts || [];
  if (showOnlyAtRisk) {
    alerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'warning');
  }
  alerts = alerts.slice(0, maxItems);

  const totalAlerts = (healthData?.atRiskCount || 0) +
                      (healthData?.noContactIn30Days || 0) +
                      (healthData?.decliningNPS || 0);

  if (alerts.length === 0) {
    return (
      <Card className="border-charcoal-100">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-success-600" />
            </div>
            <CardTitle className="text-base font-heading font-semibold text-charcoal-900">
              Client Relationship Alerts
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-success-600 font-medium">All clients healthy</p>
            <p className="text-xs text-charcoal-400 mt-1">
              No accounts need immediate attention
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-warning-600" />
            </div>
            <div>
              <CardTitle className="text-base font-heading font-semibold text-charcoal-900">
                {typeof definition.title === 'string' ? definition.title : 'Client Relationship Alerts'}
              </CardTitle>
              <p className="text-xs text-charcoal-500">
                {totalAlerts} {totalAlerts === 1 ? 'account' : 'accounts'} need attention
              </p>
            </div>
          </div>
          <Link
            href="/employee/recruiting/accounts?filter=at_risk"
            className="text-xs font-semibold text-forest-600 hover:text-forest-700"
          >
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-2">
          {alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ClientHealthAlerts;
