
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Wallet, PieChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#6366F1'];

const cryptoIcons = {
  BTC: "₿",
  ETH: "Ξ",
  USDT: "₮",
  BNB: "BNB",
  SOL: "◎",
  ADA: "₳",
  XRP: "✕",
  DOT: "●"
};

export default function Portfolio() {
  const { data: holdings = [], isLoading: holdingsLoading } = useQuery({
    queryKey: ['crypto-holdings'],
    queryFn: () => base44.entities.CryptoHolding.list(),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.BankAccount.list(),
  });

  const totalCryptoValue = holdings.reduce((sum, h) => sum + (h.amount * h.purchase_price_usd), 0);
  const totalBankBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalPortfolio = totalCryptoValue + totalBankBalance;

  const portfolioData = [
    { name: 'Bank Accounts', value: totalBankBalance },
    { name: 'Crypto Holdings', value: totalCryptoValue }
  ];

  const cryptoChartData = holdings.map(h => ({
    name: h.cryptocurrency,
    value: h.amount * h.purchase_price_usd
  }));

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-purple-900 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-purple-200 mb-2">Portfolio Overview</h1>
          <p className="text-slate-600 dark:text-purple-300">Track your complete financial portfolio</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-blue-600 text-white border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-white/90 text-sm">Total Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold mb-2">
                ${totalPortfolio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-white/80 text-sm">All assets combined</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
            <CardHeader>
              <CardTitle className="text-slate-600 dark:text-purple-400 text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Bank Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-purple-200">
                ${totalBankBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-slate-500 dark:text-purple-300 text-sm mt-1">
                {((totalBankBalance / totalPortfolio) * 100).toFixed(1)}% of portfolio
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
            <CardHeader>
              <CardTitle className="text-slate-600 dark:text-purple-400 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Crypto Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-purple-200">
                ${totalCryptoValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-slate-500 dark:text-purple-300 text-sm mt-1">
                {((totalCryptoValue / totalPortfolio) * 100).toFixed(1)}% of portfolio
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
            <CardHeader>
              <CardTitle className="dark:text-purple-200">Portfolio Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
            <CardHeader>
              <CardTitle className="dark:text-purple-200">Crypto Holdings Value</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cryptoChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
            <CardHeader>
              <CardTitle className="dark:text-purple-200">Bank Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accounts.map(account => (
                  <div key={account.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-purple-800/30 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-purple-200">{account.account_name}</p>
                      <p className="text-sm text-slate-500 dark:text-purple-300 capitalize">{account.account_type}</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-purple-200">
                      ${account.balance.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
            <CardHeader>
              <CardTitle className="dark:text-purple-200">Crypto Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {holdings.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-purple-300">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-purple-600" />
                  <p>No crypto holdings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {holdings.map(holding => (
                    <div key={holding.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-800/30 dark:to-purple-900/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {cryptoIcons[holding.cryptocurrency]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-purple-200">{holding.cryptocurrency}</p>
                          <p className="text-sm text-slate-500 dark:text-purple-300">{holding.amount.toFixed(6)} coins</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900 dark:text-purple-200">
                          ${(holding.amount * holding.purchase_price_usd).toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-purple-300">
                          @${holding.purchase_price_usd.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
