'use client';

import * as React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AlertItem } from '../types';

interface AlertsBannerCardProps {
  title?: string;
  alerts: AlertItem[];
  maxVisible?: number;
  onAcknowledge?: (alert: AlertItem) => void;
  onAlertClick?: (alert: AlertItem) => void;
  className?: string;
}

const ALERT_CONFIG = {
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
    badgeClass: 'bg-yellow-100 text-yellow-800',
  },
  critical: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    badgeClass: 'bg-red-100 text-red-800',
  },
};

const ALERT_TYPE_LABELS: Record<AlertItem['type'], string> = {
  immigration: 'Immigration',
  bench: 'Bench',
  sla: 'SLA',
  compliance: 'Compliance',
  deadline: 'Deadline',
};

export function AlertsBannerCard({
  title = 'Alerts',
  alerts,
  maxVisible = 5,
  onAcknowledge,
  onAlertClick,
  className,
}: AlertsBannerCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  // Filter out acknowledged alerts
  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  // Separate by severity
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');
  const warningAlerts = activeAlerts.filter((a) => a.severity === 'warning');

  // Displayed alerts
  const displayedAlerts = expanded
    ? activeAlerts
    : activeAlerts.slice(0, maxVisible);

  const hasMore = activeAlerts.length > maxVisible;

  if (activeAlerts.length === 0) {
    return (
      <Card className={cn('bg-green-50 border-green-200', className)}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Check className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">All Clear</p>
            <p className="text-xs text-green-600">No active alerts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {criticalAlerts.length > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {criticalAlerts.length} Critical
            </Badge>
          )}
          {warningAlerts.length > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800">
              {warningAlerts.length} Warning
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayedAlerts.map((alert) => {
            const config = ALERT_CONFIG[alert.severity];
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border',
                  config.bgColor,
                  config.borderColor,
                  onAlertClick && 'cursor-pointer hover:opacity-90'
                )}
                onClick={() => onAlertClick?.(alert)}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn('text-xs', config.badgeClass)}>
                      {ALERT_TYPE_LABELS[alert.type]}
                    </Badge>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-charcoal-900 mt-1">
                    {alert.title}
                  </p>
                  {alert.description && (
                    <p className="text-xs text-charcoal-600 mt-0.5">
                      {alert.description}
                    </p>
                  )}
                  {alert.entityLink && (
                    <a
                      href={alert.entityLink}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View details
                    </a>
                  )}
                </div>
                {onAcknowledge && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAcknowledge(alert);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Expand/collapse */}
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show {activeAlerts.length - maxVisible} more alerts
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default AlertsBannerCard;
