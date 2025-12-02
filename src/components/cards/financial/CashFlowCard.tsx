'use client';

import * as React from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '../types';

interface CashFlowCardProps {
  currentCash: number;
  accountsReceivable: number;
  accountsPayable: number;
  netPosition?: number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function CashFlowCard({
  currentCash,
  accountsReceivable,
  accountsPayable,
  netPosition,
  trend,
  className,
}: CashFlowCardProps) {
  const calculatedNetPosition = netPosition ?? (currentCash + accountsReceivable - accountsPayable);
  const isPositive = calculatedNetPosition >= 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Cash Flow</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current Cash Position */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Wallet className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-charcoal-500">Current Cash</p>
            <p className="text-2xl font-bold text-charcoal-900">
              {formatCurrency(currentCash)}
            </p>
          </div>
        </div>

        {/* AR / AP */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Accounts Receivable */}
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700">AR (Receivable)</span>
            </div>
            <p className="text-lg font-semibold text-green-800">
              {formatCurrency(accountsReceivable)}
            </p>
          </div>

          {/* Accounts Payable */}
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
              <span className="text-xs text-red-700">AP (Payable)</span>
            </div>
            <p className="text-lg font-semibold text-red-800">
              {formatCurrency(accountsPayable)}
            </p>
          </div>
        </div>

        {/* Net Position */}
        <div className={cn(
          'p-3 rounded-lg border',
          isPositive
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-charcoal-500 mb-0.5">Net Position</p>
              <p className={cn(
                'text-xl font-bold',
                isPositive ? 'text-green-700' : 'text-red-700'
              )}>
                {isPositive ? '+' : ''}{formatCurrency(calculatedNetPosition)}
              </p>
            </div>
            {trend && (
              <div className={cn(
                'p-2 rounded-full',
                trend === 'up' ? 'bg-green-100' : trend === 'down' ? 'bg-red-100' : 'bg-charcoal-100'
              )}>
                {trend === 'up' ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : trend === 'down' ? (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                ) : null}
              </div>
            )}
          </div>
          <p className="text-xs text-charcoal-500 mt-2">
            Cash + AR - AP = Net Position
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default CashFlowCard;
