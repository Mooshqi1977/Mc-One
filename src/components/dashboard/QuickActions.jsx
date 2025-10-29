import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Repeat, TrendingUp, CreditCard, Plus, ArrowLeftRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickActions() {
  return (
    <Card className="border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to={createPageUrl("Accounts")}>
            <Button
              variant="outline"
              className="h-24 w-full flex-col gap-2 hover:scale-105 transition-transform duration-200 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-500 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-white dark:group-hover:text-white">New Account</span>
            </Button>
          </Link>

          <Link to={createPageUrl("Transactions")}>
            <Button
              variant="outline"
              className="h-24 w-full flex-col gap-2 hover:scale-105 transition-transform duration-200 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 hover:border-green-300 dark:hover:border-green-500 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <ArrowLeftRight className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-white dark:group-hover:text-white">Transfer</span>
            </Button>
          </Link>

          <Link to={createPageUrl("CryptoExchange")}>
            <Button
              variant="outline"
              className="h-24 w-full flex-col gap-2 hover:scale-105 transition-transform duration-200 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 hover:border-purple-300 dark:hover:border-purple-500 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-white dark:group-hover:text-white">Buy Crypto</span>
            </Button>
          </Link>

          <Link to={createPageUrl("Cards")}>
            <Button
              variant="outline"
              className="h-24 w-full flex-col gap-2 hover:scale-105 transition-transform duration-200 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 hover:border-orange-300 dark:hover:border-orange-500 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-white dark:group-hover:text-white">View Cards</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}