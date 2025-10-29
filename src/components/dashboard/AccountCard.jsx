
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingUp, TrendingDown } from "lucide-react";

export default function AccountCard({ account, totalBalance }) {
  const percentage = totalBalance > 0 ? ((account.balance / totalBalance) * 100).toFixed(1) : 0;
  const isPositive = account.balance > 0;

  const accountTypeColors = {
    checking: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
    savings: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
    investment: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-10" />
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {account.account_name}
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {account.account_number}
            </p>
            {(account.bsb || account.swift_bic) && (
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-2 space-y-0.5">
                {account.bsb && <p>BSB: {account.bsb}</p>}
                {account.swift_bic && <p>SWIFT/BIC: {account.swift_bic}</p>}
              </div>
            )}
          </div>
          <Badge variant="outline" className={`${accountTypeColors[account.account_type]} border`}>
            {account.account_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">
            ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-sm">{account.currency}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-slate-400" />
          )}
          <span className="text-slate-600 dark:text-slate-400">
            {percentage}% of total balance
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
