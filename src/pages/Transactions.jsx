
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownLeft, Repeat, Plus, Search, Filter, Building2, Globe } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function Transactions() {
  const [activeTab, setActiveTab] = useState("all");
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionForm, setTransactionForm] = useState({
    transaction_type: "deposit",
    amount: "",
    account_id: "",
    description: "",
    recipient: "",
    recipient_account_number: "",
    recipient_bsb: "",
    recipient_swift_bic: ""
  });

  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date'),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.BankAccount.list(),
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data) => {
      const account = accounts.find(a => a.id === data.account_id);
      let newBalance = account.balance;
      
      if (data.transaction_type === 'deposit') {
        newBalance += parseFloat(data.amount);
      } else {
        newBalance -= parseFloat(data.amount);
      }

      await base44.entities.Transaction.create({
        ...data,
        amount: parseFloat(data.amount),
        status: "completed",
        balance_after: newBalance,
        currency: account.currency
      });

      await base44.entities.BankAccount.update(account.id, {
        balance: newBalance
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setShowNewTransaction(false);
      setTransactionForm({
        transaction_type: "deposit",
        amount: "",
        account_id: "",
        description: "",
        recipient: "",
        recipient_account_number: "",
        recipient_bsb: "",
        recipient_swift_bic: ""
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createTransactionMutation.mutate(transactionForm);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesTab = activeTab === "all" || t.transaction_type === activeTab;
    const matchesSearch = t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.recipient?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case 'withdrawal': return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case 'transfer': return <Repeat className="w-5 h-5 text-blue-500" />;
      default: return <ArrowUpRight className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transactions</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">Manage your financial activities</p>
          </div>
          <Button 
            onClick={() => setShowNewTransaction(!showNewTransaction)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Transaction
          </Button>
        </div>

        <AnimatePresence>
          {showNewTransaction && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="mb-8 border-blue-200 dark:border-blue-800 shadow-lg bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">New Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-900 dark:text-white">Transaction Type</Label>
                        <Select
                          value={transactionForm.transaction_type}
                          onValueChange={(value) => setTransactionForm({...transactionForm, transaction_type: value})}
                        >
                          <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-700">
                            <SelectItem value="deposit">Deposit</SelectItem>
                            <SelectItem value="withdrawal">Withdrawal</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-slate-900 dark:text-white">Account</Label>
                        <Select
                          value={transactionForm.account_id}
                          onValueChange={(value) => setTransactionForm({...transactionForm, account_id: value})}
                        >
                          <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-700">
                            {accounts.map(acc => (
                              <SelectItem key={acc.id} value={acc.id}>
                                {acc.account_name} (${acc.balance.toFixed(2)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-slate-900 dark:text-white">Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={transactionForm.amount}
                          onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                          required
                          className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-900 dark:text-white">Recipient (optional)</Label>
                        <Input
                          placeholder="Recipient name"
                          value={transactionForm.recipient}
                          onChange={(e) => setTransactionForm({...transactionForm, recipient: e.target.value})}
                          className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="md:col-span-2">
                        <Label className="text-slate-700 dark:text-white font-semibold">Banking Details (Optional)</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">Add recipient or sender banking information</p>
                      </div>
                      <div>
                        <Label className="text-slate-900 dark:text-white">Account Number</Label>
                        <Input
                          placeholder="Account number"
                          value={transactionForm.recipient_account_number}
                          onChange={(e) => setTransactionForm({...transactionForm, recipient_account_number: e.target.value})}
                          className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-900 dark:text-white">BSB Code</Label>
                        <Input
                          placeholder="123-456"
                          value={transactionForm.recipient_bsb}
                          onChange={(e) => setTransactionForm({...transactionForm, recipient_bsb: e.target.value})}
                          className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-slate-900 dark:text-white">SWIFT/BIC Code</Label>
                        <Input
                          placeholder="ABCDAU2SXXX"
                          value={transactionForm.recipient_swift_bic}
                          onChange={(e) => setTransactionForm({...transactionForm, recipient_swift_bic: e.target.value})}
                          className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-900 dark:text-white">Description</Label>
                      <Input
                        placeholder="Transaction description"
                        value={transactionForm.description}
                        onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                        className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setShowNewTransaction(false)} className="dark:text-white dark:hover:bg-slate-700 dark:border-slate-600">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createTransactionMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {createTransactionMutation.isPending ? 'Processing...' : 'Create Transaction'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="dark:bg-slate-700">
                  <TabsTrigger value="all" className="dark:text-white dark:data-[state=active]:bg-slate-600">All</TabsTrigger>
                  <TabsTrigger value="deposit" className="dark:text-white dark:data-[state=active]:bg-slate-600">Deposits</TabsTrigger>
                  <TabsTrigger value="withdrawal" className="dark:text-white dark:data-[state=active]:bg-slate-600">Withdrawals</TabsTrigger>
                  <TabsTrigger value="transfer" className="dark:text-white dark:data-[state=active]:bg-slate-600">Transfers</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-10 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-300">Loading...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-300">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => {
                  const account = accounts.find(a => a.id === transaction.account_id);
                  return (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-100 dark:border-slate-600"
                    >
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                        {getTransactionIcon(transaction.transaction_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white capitalize">
                          {transaction.transaction_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {transaction.description || transaction.recipient || 'No description'}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">
                          {account?.account_name} • {format(new Date(transaction.created_date), 'MMM d, yyyy h:mm a')}
                        </p>
                        
                        {/* Banking Details */}
                        {(transaction.recipient_account_number || transaction.recipient_bsb || transaction.recipient_swift_bic) && (
                          <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-xs space-y-1">
                            {transaction.recipient && (
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <span className="font-medium">To:</span>
                                <span>{transaction.recipient}</span>
                              </div>
                            )}
                            {transaction.recipient_account_number && (
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <Building2 className="w-3 h-3" />
                                <span>Account: {transaction.recipient_account_number}</span>
                              </div>
                            )}
                            {transaction.recipient_bsb && (
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <Building2 className="w-3 h-3" />
                                <span>BSB: {transaction.recipient_bsb}</span>
                              </div>
                            )}
                            {transaction.recipient_swift_bic && (
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <Globe className="w-3 h-3" />
                                <span>SWIFT/BIC: {transaction.recipient_swift_bic}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-lg font-bold ${
                          transaction.transaction_type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.transaction_type === 'deposit' ? '+' : '-'}
                          ${transaction.amount.toFixed(2)}
                        </p>
                        <Badge variant="outline" className={
                          transaction.status === 'completed' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700' :
                          transaction.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700' :
                          'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700'
                        }>
                          {transaction.status}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
