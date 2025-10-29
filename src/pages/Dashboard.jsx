
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Wallet, TrendingUp, Activity } from "lucide-react";

import AccountCard from "../components/dashboard/AccountCard";
import QuickActions from "../components/dashboard/QuickActions";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import CryptoPreview from "../components/dashboard/CryptoPreview";

export default function Dashboard() {
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.BankAccount.list(),
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 10),
  });

  const { data: cryptoHoldings = [], isLoading: cryptoLoading } = useQuery({
    queryKey: ['crypto-holdings'],
    queryFn: () => base44.entities.CryptoHolding.list(),
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalCryptoValue = cryptoHoldings.reduce((sum, h) => sum + (h.amount * h.purchase_price_usd), 0);
  const netWorth = totalBalance + totalCryptoValue;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome Back 👋
          </h1>
          <p className="text-slate-600 dark:text-white">Here's your financial overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-blue-100 text-sm mb-1">Net Worth</p>
                <h3 className="text-3xl font-bold">
                  ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-blue-100">Total assets value</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-600 dark:text-white text-sm mb-1">Bank Balance</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-white">{accounts.length} accounts</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-600 dark:text-white text-sm mb-1">Crypto Value</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${totalCryptoValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-white">{cryptoHoldings.length} holdings</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-600 dark:text-white text-sm mb-1">Transactions</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {transactions.length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-white">All time</p>
          </div>
        </div>

        <div className="mb-8">
          <QuickActions />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Your Accounts</h2>
          {accountsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Wallet className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-600 dark:text-white">No accounts yet. Create your first account to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <AccountCard 
                  key={account.id} 
                  account={account} 
                  totalBalance={totalBalance}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <RecentTransactions 
            transactions={transactions}
            isLoading={transactionsLoading}
          />
          <CryptoPreview 
            holdings={cryptoHoldings}
            isLoading={cryptoLoading}
          />
        </div>
      </div>
    </div>
  );
}
