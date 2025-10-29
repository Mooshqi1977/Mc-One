
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Building2, CreditCard, Globe, ArrowLeftRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "HKD", "NZD",
  "SEK", "KRW", "SGD", "NOK", "MXN", "INR", "RUB", "ZAR", "TRY", "BRL",
  "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AWG", "AZN",
  "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BSD", "BTN", "BWP", "BYN", "BZD",
  "CDF", "CLP", "COP", "CRC", "CUP", "CVE", "CZK",
  "DJF", "DKK", "DOP", "DZD",
  "EGP", "ERN", "ETB",
  "FJD", "FKP",
  "GEL", "GGP", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD",
  "HNL", "HRK", "HTG", "HUF",
  "IDR", "ILS", "IMP", "IQD", "IRR", "ISK",
  "JEP", "JMD", "JOD",
  "KES", "KGS", "KHR", "KMF", "KPW", "KWD", "KYD", "KZT",
  "LAK", "LBP", "LKR", "LRD", "LSL", "LYD",
  "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MYR", "MZN",
  "NAD", "NGN", "NIO", "NPR",
  "OMR",
  "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG",
  "QAR",
  "RON", "RSD", "RWF",
  "SAR", "SBD", "SCR", "SDG", "SHP", "SLE", "SLL", "SOS", "SPL", "SRD", "STN", "SYP", "SZL",
  "THB", "TJS", "TMT", "TND", "TOP", "TTD", "TVD", "TWD", "TZS",
  "UAH", "UGX", "UYU", "UZS",
  "VES", "VND", "VUV",
  "WST",
  "XAF", "XCD", "XDR", "XOF", "XPF",
  "YER",
  "ZMW", "ZWL"
];

export default function Accounts() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountForm, setAccountForm] = useState({
    account_name: "",
    account_number: "",
    account_type: "checking",
    account_owner_type: "personal",
    balance: 0,
    currency: "AUD",
    bsb: "",
    swift_bic: ""
  });
  const [transferForm, setTransferForm] = useState({
    from_account_id: "",
    to_account_id: "",
    amount: "",
    description: ""
  });

  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.BankAccount.list('-created_date'),
  });

  const createAccountMutation = useMutation({
    mutationFn: (data) => base44.entities.BankAccount.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setShowCreateDialog(false);
      setEditingAccount(null);
      resetForm();
      toast.success('Account created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create account');
    }
  });

  const updateAccountMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BankAccount.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setShowCreateDialog(false);
      setEditingAccount(null);
      resetForm();
      toast.success('Account updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update account');
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (id) => base44.entities.BankAccount.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Account deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete account');
    }
  });

  const transferMutation = useMutation({
    mutationFn: async (data) => {
      const fromAccount = accounts.find(a => a.id === data.from_account_id);
      const toAccount = accounts.find(a => a.id === data.to_account_id);
      const amount = parseFloat(data.amount);

      if (fromAccount.balance < amount) {
        throw new Error("Insufficient balance in source account");
      }

      // Update source account
      const newFromBalance = fromAccount.balance - amount;
      await base44.entities.BankAccount.update(fromAccount.id, {
        balance: newFromBalance
      });

      // Update destination account
      const newToBalance = toAccount.balance + amount;
      await base44.entities.BankAccount.update(toAccount.id, {
        balance: newToBalance
      });

      // Create transaction record for withdrawal from source
      await base44.entities.Transaction.create({
        transaction_type: "transfer",
        amount: amount,
        account_id: fromAccount.id,
        description: data.description || `Transfer to ${toAccount.account_name}`,
        recipient: toAccount.account_name,
        recipient_account_number: toAccount.account_number,
        recipient_bsb: toAccount.bsb,
        recipient_swift_bic: toAccount.swift_bic,
        status: "completed",
        balance_after: newFromBalance,
        currency: fromAccount.currency
      });

      // Create transaction record for deposit to destination
      await base44.entities.Transaction.create({
        transaction_type: "deposit",
        amount: amount,
        account_id: toAccount.id,
        description: data.description || `Transfer from ${fromAccount.account_name}`,
        recipient: fromAccount.account_name,
        status: "completed",
        balance_after: newToBalance,
        currency: toAccount.currency
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowTransferDialog(false);
      setTransferForm({
        from_account_id: "",
        to_account_id: "",
        amount: "",
        description: ""
      });
      toast.success('Transfer completed successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Transfer failed');
    }
  });

  const resetForm = () => {
    setAccountForm({
      account_name: "",
      account_number: "",
      account_type: "checking",
      account_owner_type: "personal",
      balance: 0,
      currency: "AUD",
      bsb: "",
      swift_bic: ""
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAccount) {
      updateAccountMutation.mutate({ id: editingAccount.id, data: accountForm });
    } else {
      createAccountMutation.mutate(accountForm);
    }
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (transferForm.from_account_id === transferForm.to_account_id) {
      toast.error('Cannot transfer to the same account');
      return;
    }
    transferMutation.mutate(transferForm);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setAccountForm({
      account_name: account.account_name,
      account_number: account.account_number,
      account_type: account.account_type,
      account_owner_type: account.account_owner_type || "personal", // Add this line
      balance: account.balance,
      currency: account.currency,
      bsb: account.bsb || "",
      swift_bic: account.swift_bic || ""
    });
    setShowCreateDialog(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this account?')) {
      deleteAccountMutation.mutate(id);
    }
  };

  // Helper to format an account number as a credit card number, or generate a dummy one for display
  const formatCreditCardDisplay = (accountNumber) => {
    const cleaned = (accountNumber || '').replace(/\D/g, '');
    if (cleaned.length === 16 && cleaned.startsWith('4')) {
      return cleaned.match(/.{1,4}/g).join(' ');
    } else if (cleaned.length > 0) {
      // If there's an account number but it's not a standard 16-digit card,
      // just display it formatted as is.
      return cleaned.match(/.{1,4}/g).join(' ');
    }
    // If no number, generate a dummy one for display (starting with 4 as requested)
    let dummyNum = '4';
    for (let i = 0; i < 15; i++) {
      dummyNum += Math.floor(Math.random() * 10);
    }
    return dummyNum.match(/.{1,4}/g).join(' ');
  };

  const accountTypeColors = {
    checking: "bg-blue-100 text-blue-800 border-blue-300",
    savings: "bg-green-100 text-green-800 border-green-300",
    investment: "bg-slate-100 text-slate-800 border-slate-300" 
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bank Accounts</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">Manage your bank accounts and details</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowTransferDialog(true)}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/30"
              disabled={accounts.length < 2}
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Transfer Between Accounts
            </Button>
            <Button 
              onClick={() => {
                resetForm();
                setEditingAccount(null);
                setShowCreateDialog(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </div>
        </div>

        {/* Transfer Between Accounts Section */}
        {accounts.length >= 2 && (
          <Card className="mb-8 border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ArrowLeftRight className="w-5 h-5" />
                Quick Transfer Between Your Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransferSubmit} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="from_account" className="text-white">From Account</Label>
                    <Select
                      value={transferForm.from_account_id}
                      onValueChange={(value) => setTransferForm({...transferForm, from_account_id: value})}
                      required
                    >
                      <SelectTrigger id="from_account" className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600 hover:text-purple-300">
                        <SelectValue placeholder="Select source account" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {accounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id} disabled={acc.id === transferForm.to_account_id} className="text-white hover:bg-slate-600 hover:text-purple-300 focus:bg-slate-600 focus:text-purple-300">
                            {acc.account_name} (${acc.balance.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="to_account" className="text-white">To Account</Label>
                    <Select
                      value={transferForm.to_account_id}
                      onValueChange={(value) => setTransferForm({...transferForm, to_account_id: value})}
                      required
                    >
                      <SelectTrigger id="to_account" className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600 hover:text-purple-300">
                        <SelectValue placeholder="Select destination account" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {accounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id} disabled={acc.id === transferForm.from_account_id} className="text-white hover:bg-slate-600 hover:text-purple-300 focus:bg-slate-600 focus:text-purple-300">
                            {acc.account_name} (${acc.balance.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="transfer_amount" className="text-white">Amount</Label>
                    <Input
                      id="transfer_amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                      required
                      className="bg-slate-700 text-white border-slate-600 placeholder:text-slate-400 hover:bg-slate-600 focus:bg-slate-700 hover:text-purple-300"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="transfer_description" className="text-white">Description (Optional)</Label>
                  <Input
                    id="transfer_description"
                    placeholder="e.g., Monthly savings transfer"
                    value={transferForm.description}
                    onChange={(e) => setTransferForm({...transferForm, description: e.target.value})}
                    className="bg-slate-700 text-white border-slate-600 placeholder:text-slate-400 hover:bg-slate-600 focus:bg-slate-700 hover:text-purple-300"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={transferMutation.isPending || !transferForm.from_account_id || !transferForm.to_account_id || !transferForm.amount}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {transferMutation.isPending ? 'Processing Transfer...' : 'Transfer Now'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{accounts.length}</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {['checking', 'savings', 'investment'].map(type => {
                  const count = accounts.filter(a => a.account_type === type).length;
                  return count > 0 && (
                    <Badge key={type} variant="outline" className={accountTypeColors[type]}>
                      {count} {type === 'investment' ? 'credit card' : type}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accounts List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-300">Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No accounts yet</h3>
              <p className="text-slate-600 dark:text-slate-300 text-center mb-6">
                Create your first bank account to start managing your finances
              </p>
              <Button 
                onClick={() => {
                  resetForm();
                  setEditingAccount(null);
                  setShowCreateDialog(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {accounts.map((account) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-slate-800">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {account.account_type === 'investment' ? (
                              <CreditCard className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                            ) : (
                              <Building2 className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                            )}
                            <CardTitle className="text-lg dark:text-white">{account.account_name}</CardTitle>
                          </div>
                          <Badge variant="outline" className={`${accountTypeColors[account.account_type]} border`}>
                            {account.account_type === 'investment' ? 'Credit Card' : account.account_type}
                          </Badge>
                          {account.account_owner_type && (
                            <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">
                              {account.account_owner_type === 'personal' ? 'Personal' : 'Business'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(account)}
                            className="h-8 w-8 dark:hover:bg-slate-700"
                          >
                            <Edit2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(account.id)}
                            className="h-8 w-8 dark:hover:bg-slate-700"
                          >
                            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                          ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{account.currency}</p>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-sm">
                          <CreditCard className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {account.account_type === 'investment' ? 'Card Number:' : 'Account Number:'}
                          </span>
                          <span className="font-mono text-slate-900 dark:text-white">
                            {account.account_type === 'investment' 
                              ? formatCreditCardDisplay(account.account_number) 
                              : account.account_number}
                          </span>
                        </div>

                        {account.account_type !== 'investment' && account.bsb && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <span className="text-slate-600 dark:text-slate-400">BSB:</span>
                            <span className="font-mono text-slate-900 dark:text-white">{account.bsb}</span>
                          </div>
                        )}

                        {account.account_type !== 'investment' && account.swift_bic && (
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <span className="text-slate-600 dark:text-slate-400">SWIFT/BIC:</span>
                            <span className="font-mono text-slate-900 dark:text-white">{account.swift_bic}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px] dark:bg-slate-800 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">
                {editingAccount ? 'Edit Account' : 'Create New Account'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="account_name" className="dark:text-white">Account Name *</Label>
                  <Input
                    id="account_name"
                    value={accountForm.account_name}
                    onChange={(e) => setAccountForm({...accountForm, account_name: e.target.value})}
                    placeholder="e.g., Main Checking"
                    required
                    className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                </div>

                <div>
                  <Label htmlFor="account_number" className="dark:text-white">Account Number *</Label>
                  <Input
                    id="account_number"
                    value={accountForm.account_number}
                    onChange={(e) => setAccountForm({...accountForm, account_number: e.target.value})}
                    placeholder="e.g., ACC-001-2024 or 4XXX XXXX XXXX XXXX"
                    required
                    className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                </div>

                <div>
                  <Label htmlFor="account_type" className="dark:text-white">Account Type *</Label>
                  <Select
                    value={accountForm.account_type}
                    onValueChange={(value) => setAccountForm({...accountForm, account_type: value})}
                  >
                    <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                      <SelectItem value="checking" className="dark:text-white dark:hover:bg-slate-700">Checking</SelectItem>
                      <SelectItem value="savings" className="dark:text-white dark:hover:bg-slate-700">Savings</SelectItem>
                      <SelectItem value="investment" className="dark:text-white dark:hover:bg-slate-700">Investment (Credit Card)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="account_owner_type" className="dark:text-white">Owner Type *</Label>
                  <Select
                    value={accountForm.account_owner_type}
                    onValueChange={(value) => setAccountForm({...accountForm, account_owner_type: value})}
                  >
                    <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                      <SelectItem value="personal" className="dark:text-white dark:hover:bg-slate-700">Personal</SelectItem>
                      <SelectItem value="business" className="dark:text-white dark:hover:bg-slate-700">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency" className="dark:text-white">Currency *</Label>
                  <Select
                    value={accountForm.currency}
                    onValueChange={(value) => setAccountForm({...accountForm, currency: value})}
                  >
                    <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                      {CURRENCIES.map(curr => (
                        <SelectItem key={curr} value={curr} className="dark:text-white dark:hover:bg-slate-700">{curr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="balance" className="dark:text-white">Initial Balance</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={accountForm.balance}
                    onChange={(e) => setAccountForm({...accountForm, balance: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                </div>

                <div>
                  <Label htmlFor="bsb" className="dark:text-white">BSB Code (Optional)</Label>
                  <Input
                    id="bsb"
                    value={accountForm.bsb}
                    onChange={(e) => setAccountForm({...accountForm, bsb: e.target.value})}
                    placeholder="e.g., 123-456"
                    className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="swift_bic" className="dark:text-white">SWIFT/BIC Code (Optional)</Label>
                  <Input
                    id="swift_bic"
                    value={accountForm.swift_bic}
                    onChange={(e) => setAccountForm({...accountForm, swift_bic: e.target.value})}
                    placeholder="e.g., ABCDUS33XXX"
                    className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingAccount(null);
                    resetForm();
                  }}
                  className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAccountMutation.isPending || updateAccountMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {(createAccountMutation.isPending || updateAccountMutation.isPending) 
                    ? 'Saving...' 
                    : editingAccount ? 'Update Account' : 'Create Account'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
