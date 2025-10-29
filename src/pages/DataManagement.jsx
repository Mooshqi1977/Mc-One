
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Database,
  Building2,
  CreditCard,
  TrendingUp,
  FileText,
  AlertCircle,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function DataManagement() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("accounts");

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
      setIsAdmin(userData?.role === 'admin');
    }).catch(() => {
      window.location.href = createPageUrl("Dashboard");
    });
  }, []);

  const { data: accounts = [] } = useQuery({
    queryKey: ['all-accounts'],
    queryFn: () => base44.entities.BankAccount.list('-created_date'),
    enabled: isAdmin,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['all-transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date'),
    enabled: isAdmin,
  });

  const { data: cryptoHoldings = [] } = useQuery({
    queryKey: ['all-crypto-holdings'],
    queryFn: () => base44.entities.CryptoHolding.list('-created_date'),
    enabled: isAdmin,
  });

  const { data: creditCards = [] } = useQuery({
    queryKey: ['all-credit-cards'],
    queryFn: () => base44.entities.CreditCard.list('-created_date'),
    enabled: isAdmin,
  });

  const { data: loanApplications = [] } = useQuery({
    queryKey: ['all-loan-applications'],
    queryFn: () => base44.entities.LoanApplication.list('-created_date'),
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

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-purple-900 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Data Management</h1>
                <p className="text-slate-600 dark:text-purple-200">View and manage system data</p>
              </div>
            </div>
            <Link to={createPageUrl("AdminDashboard")}>
              <Button variant="outline" className="dark:bg-purple-800/30 dark:text-purple-200 dark:border-purple-600 dark:hover:bg-purple-700/50">
                Back to Admin
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-200 dark:bg-purple-800/30">
            <TabsTrigger value="accounts" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:text-white">
              Accounts ({accounts.length})
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:text-white">
              Transactions ({transactions.length})
            </TabsTrigger>
            <TabsTrigger value="crypto" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:text-white">
              Crypto ({cryptoHoldings.length})
            </TabsTrigger>
            <TabsTrigger value="cards" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:text-white">
              Cards ({creditCards.length})
            </TabsTrigger>
            <TabsTrigger value="loans" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:text-white">
              Loans ({loanApplications.length})
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:text-white"
              onClick={() => window.location.href = createPageUrl("PaymentManagement")}
            >
              Payments →
            </TabsTrigger>
          </TabsList>

          {/* Bank Accounts */}
          <TabsContent value="accounts">
            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-purple-200">
                  <Building2 className="w-5 h-5" />
                  Bank Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {accounts.length === 0 ? (
                  <p className="text-center py-8 text-slate-500 dark:text-purple-300">No accounts found</p>
                ) : (
                  <div className="space-y-3">
                    {accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-purple-800/30 rounded-lg border border-slate-200 dark:border-purple-700"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-slate-900 dark:text-white">{account.account_name}</p>
                            <Badge variant="outline" className="capitalize dark:bg-purple-800/50 dark:text-purple-200 dark:border-purple-600">
                              {account.account_type}
                            </Badge>
                            <Badge variant="outline" className="capitalize dark:bg-purple-800/50 dark:text-purple-200 dark:border-purple-600">
                              {account.account_owner_type || 'personal'}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-600 dark:text-purple-200">
                            <span>{account.account_number}</span>
                            <span className="mx-2">•</span>
                            <span>{account.currency}</span>
                            <span className="mx-2">•</span>
                            <span>Created by: {account.created_by}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-purple-300">
                            {format(new Date(account.created_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions">
            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-purple-200">
                  <FileText className="w-5 h-5" />
                  All Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center py-8 text-slate-500 dark:text-purple-300">No transactions found</p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-purple-800/30 rounded-lg border border-slate-200 dark:border-purple-700"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-slate-900 dark:text-white capitalize">
                              {transaction.transaction_type.replace(/_/g, ' ')}
                            </p>
                            <Badge variant="outline" className={
                              transaction.status === 'completed' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700' :
                              transaction.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700' :
                              'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700'
                            }>
                              {transaction.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-600 dark:text-purple-200">
                            {transaction.description || transaction.recipient || 'No description'}
                            <span className="mx-2">•</span>
                            <span>By: {transaction.created_by}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-purple-300 mt-1">
                            {format(new Date(transaction.created_date), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            transaction.transaction_type === 'deposit' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.transaction_type === 'deposit' ? '+' : '-'}
                            ${transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-purple-300">
                            {transaction.currency}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crypto Holdings */}
          <TabsContent value="crypto">
            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-purple-200">
                  <TrendingUp className="w-5 h-5" />
                  Crypto Holdings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cryptoHoldings.length === 0 ? (
                  <p className="text-center py-8 text-slate-500 dark:text-purple-300">No crypto holdings found</p>
                ) : (
                  <div className="space-y-3">
                    {cryptoHoldings.map((holding) => (
                      <div
                        key={holding.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-purple-800/30 rounded-lg border border-slate-200 dark:border-purple-700"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-white">{holding.cryptocurrency}</p>
                          <div className="text-sm text-slate-600 dark:text-purple-200">
                            <span>Amount: {holding.amount.toFixed(8)}</span>
                            <span className="mx-2">•</span>
                            <span>Owner: {holding.created_by}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-purple-300 mt-1">
                            {format(new Date(holding.created_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900 dark:text-white">
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
          </TabsContent>

          {/* Credit Cards */}
          <TabsContent value="cards">
            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-purple-200">
                  <CreditCard className="w-5 h-5" />
                  Credit Cards
                </CardTitle>
              </CardHeader>
              <CardContent>
                {creditCards.length === 0 ? (
                  <p className="text-center py-8 text-slate-500 dark:text-purple-300">No credit cards found</p>
                ) : (
                  <div className="space-y-3">
                    {creditCards.map((card) => (
                      <div
                        key={card.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-purple-800/30 rounded-lg border border-slate-200 dark:border-purple-700"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-slate-900 dark:text-white">{card.card_name}</p>
                            <Badge variant="outline" className="capitalize dark:bg-purple-800/50 dark:text-purple-200 dark:border-purple-600">
                              {card.card_type}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-600 dark:text-purple-200">
                            <span>•••• {card.card_number.slice(-4)}</span>
                            <span className="mx-2">•</span>
                            <span>{card.currency}</span>
                            <span className="mx-2">•</span>
                            <span>Owner: {card.created_by}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600 dark:text-purple-200">
                            Limit: ${card.credit_limit.toLocaleString()}
                          </p>
                          <p className="text-lg font-bold text-slate-900 dark:text-white">
                            Available: ${card.available_credit.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loan Applications */}
          <TabsContent value="loans">
            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-purple-200">
                  <DollarSign className="w-5 h-5" />
                  Loan Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loanApplications.length === 0 ? (
                  <p className="text-center py-8 text-slate-500 dark:text-purple-300">No loan applications found</p>
                ) : (
                  <div className="space-y-3">
                    {loanApplications.map((loan) => (
                      <div
                        key={loan.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-purple-800/30 rounded-lg border border-slate-200 dark:border-purple-700"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-slate-900 dark:text-white capitalize">
                              {loan.loan_type.replace(/_/g, ' ')}
                            </p>
                            <Badge variant="outline" className={
                              loan.status === 'approved' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700' :
                              loan.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700' :
                              loan.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700' :
                              'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                            }>
                              {loan.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-600 dark:text-purple-200">
                            {loan.purpose || 'No purpose specified'}
                            <span className="mx-2">•</span>
                            <span>By: {loan.created_by}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-purple-300 mt-1">
                            {format(new Date(loan.application_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900 dark:text-white">
                            ${loan.requested_amount ? parseFloat(loan.requested_amount).toLocaleString() : 'N/A'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-purple-300">Requested</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
