import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Repeat, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function RecentTransactions({ transactions, isLoading }) {
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case 'withdrawal': return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case 'transfer': return <Repeat className="w-5 h-5 text-blue-500" />;
      default: return <ArrowUpRight className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Recent Transactions
          </CardTitle>
          <Link to={createPageUrl("Transactions")}>
            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-white dark:hover:bg-slate-700 dark:hover:text-white">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-300">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-100 dark:border-slate-600"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white capitalize">
                      {transaction.transaction_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {format(new Date(transaction.created_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.transaction_type === 'deposit' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.transaction_type === 'deposit' ? '+' : '-'}
                    ${transaction.amount.toFixed(2)}
                  </p>
                  <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}