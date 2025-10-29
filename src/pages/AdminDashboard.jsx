import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Settings,
  BarChart3,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
      setIsAdmin(userData?.role === 'admin');
    }).catch(() => {
      window.location.href = createPageUrl("Dashboard");
    });
  }, []);

  const { data: users = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: isAdmin,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['all-accounts'],
    queryFn: () => base44.entities.BankAccount.list(),
    enabled: isAdmin,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['all-transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 100),
    enabled: isAdmin,
  });

  const { data: cryptoHoldings = [] } = useQuery({
    queryKey: ['all-crypto-holdings'],
    queryFn: () => base44.entities.CryptoHolding.list(),
    enabled: isAdmin,
  });

  const { data: creditCards = [] } = useQuery({
    queryKey: ['all-credit-cards'],
    queryFn: () => base44.entities.CreditCard.list(),
    enabled: isAdmin,
  });

  const { data: loanApplications = [] } = useQuery({
    queryKey: ['all-loan-applications'],
    queryFn: () => base44.entities.LoanApplication.list(),
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 dark:border-red-800 bg-white dark:bg-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
              <p className="text-slate-600 dark:text-slate-300 text-center mb-6">
                You need administrator privileges to access this page.
              </p>
              <Link to={createPageUrl("Dashboard")}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalCryptoValue = cryptoHoldings.reduce((sum, h) => sum + (h.amount * h.purchase_price_usd), 0);
  const pendingLoans = loanApplications.filter(l => l.status === 'pending').length;
  const recentTransactions = transactions.slice(0, 10);

  const adminCards = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "blue",
      link: createPageUrl("UserManagement")
    },
    {
      title: "Total Accounts",
      value: accounts.length,
      icon: Database,
      color: "green",
      link: createPageUrl("DataManagement")
    },
    {
      title: "Total Balance",
      value: `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "purple",
      link: createPageUrl("DataManagement")
    },
    {
      title: "Crypto Holdings",
      value: cryptoHoldings.length,
      icon: TrendingUp,
      color: "orange",
      link: createPageUrl("DataManagement")
    },
    {
      title: "Credit Cards",
      value: creditCards.length,
      icon: CreditCard,
      color: "pink",
      link: createPageUrl("DataManagement")
    },
    {
      title: "Pending Loans",
      value: pendingLoans,
      icon: Clock,
      color: "yellow",
      link: createPageUrl("DataManagement")
    },
  ];

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    pink: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
    yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-purple-900 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          </div>
          <p className="text-slate-600 dark:text-purple-200">System overview and management tools</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {adminCards.map((card, index) => (
            <Link key={index} to={card.link}>
              <Card className="border-slate-200 dark:border-purple-700 shadow-md hover:shadow-lg transition-all cursor-pointer bg-white dark:bg-purple-900/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-purple-200 mb-1">{card.title}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[card.color]}`}>
                      <card.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-purple-200">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to={createPageUrl("UserManagement")}>
                <Button className="w-full h-20 flex-col gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                  <Users className="w-6 h-6" />
                  Manage Users
                </Button>
              </Link>
              <Link to={createPageUrl("DataManagement")}>
                <Button className="w-full h-20 flex-col gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
                  <Database className="w-6 h-6" />
                  Manage Data
                </Button>
              </Link>
              <Link to={createPageUrl("Settings")}>
                <Button className="w-full h-20 flex-col gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">
                  <Settings className="w-6 h-6" />
                  System Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <Card className="border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-purple-200">
                <Activity className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <p className="text-center py-8 text-slate-500 dark:text-purple-300">No transactions yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-purple-800/30 rounded-lg border border-slate-200 dark:border-purple-700"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white capitalize">
                          {transaction.transaction_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-purple-300">
                          {format(new Date(transaction.created_date), 'MMM d, yyyy h:mm a')}
                        </p>
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
                        <Badge variant="outline" className="text-xs dark:bg-purple-800/50 dark:text-purple-200 dark:border-purple-600">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-purple-200">
                <BarChart3 className="w-5 h-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-slate-900 dark:text-white">Database</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">Operational</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-slate-900 dark:text-white">Authentication</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">Operational</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-slate-900 dark:text-white">API Services</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">Operational</Badge>
                </div>

                {pendingLoans > 0 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <span className="font-medium text-slate-900 dark:text-white">Pending Loan Applications</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300">{pendingLoans}</Badge>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 dark:border-purple-700">
                  <p className="text-sm text-slate-600 dark:text-purple-200">
                    <strong>Total System Value:</strong> ${(totalBalance + totalCryptoValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-purple-300 mt-1">
                    Last updated: {format(new Date(), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}