
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Building2, CreditCard, Globe, Users } from "lucide-react";
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
  "SEK", "KRW", "SGD", "NOK", "MXN", "INR", "RUB", "ZAR", "TRY", "BRL"
];

export default function AccountsKids() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountForm, setAccountForm] = useState({
    account_name: "",
    account_number: "",
    account_type: "savings",
    account_owner_type: "kids",
    balance: 0,
    currency: "AUD",
    bsb: "",
    swift_bic: ""
  });

  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts-kids'],
    queryFn: async () => {
      const allAccounts = await base44.entities.BankAccount.list('-created_date');
      return allAccounts.filter(acc => acc.account_owner_type === 'kids');
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: (data) => base44.entities.BankAccount.create({ ...data, account_owner_type: 'kids' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-kids'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setShowCreateDialog(false);
      setEditingAccount(null);
      resetForm();
      toast.success('Kids account created successfully');
    },
    onError: () => {
      toast.error('Failed to create account');
    }
  });

  const updateAccountMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BankAccount.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-kids'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setShowCreateDialog(false);
      setEditingAccount(null);
      resetForm();
      toast.success('Account updated successfully');
    },
    onError: () => {
      toast.error('Failed to update account');
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (id) => base44.entities.BankAccount.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-kids'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Account deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete account');
    }
  });

  const resetForm = () => {
    setAccountForm({
      account_name: "",
      account_number: "",
      account_type: "savings",
      account_owner_type: "kids",
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

  const handleEdit = (account) => {
    setEditingAccount(account);
    setAccountForm({
      account_name: account.account_name,
      account_number: account.account_number,
      account_type: account.account_type,
      account_owner_type: "kids",
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

  const accountTypeColors = {
    checking: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
    savings: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
    investment: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700"
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Users className="w-8 h-8" />
              Kids Accounts
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">Manage your children's bank accounts</p>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setEditingAccount(null);
              setShowCreateDialog(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Kids Account
          </Button>
        </div>

        {/* Summary Card */}
        <Card className="mb-8 border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Kids Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{accounts.length} kids account{accounts.length !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>

        {/* Accounts List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-300">Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No kids accounts yet</h3>
              <p className="text-slate-600 dark:text-slate-300 text-center mb-6">
                Create your first kids bank account to start teaching financial responsibility
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
                Create Your First Kids Account
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
                            <Building2 className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                            <CardTitle className="text-lg dark:text-white">{account.account_name}</CardTitle>
                          </div>
                          <Badge variant="outline" className={`${accountTypeColors[account.account_type]} border`}>
                            {account.account_type}
                          </Badge>
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
                          <span className="text-slate-600 dark:text-slate-400">Account Number:</span>
                          <span className="font-mono text-slate-900 dark:text-white">{account.account_number}</span>
                        </div>

                        {account.bsb && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <span className="text-slate-600 dark:text-slate-400">BSB:</span>
                            <span className="font-mono text-slate-900 dark:text-white">{account.bsb}</span>
                          </div>
                        )}

                        {account.swift_bic && (
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
          <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 dark:bg-slate-800 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-purple-900 dark:text-white">
                {editingAccount ? 'Edit Kids Account' : 'Create New Kids Account'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="account_name" className="text-purple-900 dark:text-white">Account Name *</Label>
                  <Input
                    id="account_name"
                    value={accountForm.account_name}
                    onChange={(e) => setAccountForm({...accountForm, account_name: e.target.value})}
                    placeholder="e.g., Emma's Savings"
                    required
                    className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                </div>

                <div>
                  <Label htmlFor="account_number" className="text-purple-900 dark:text-white">Account Number *</Label>
                  <Input
                    id="account_number"
                    value={accountForm.account_number}
                    onChange={(e) => setAccountForm({...accountForm, account_number: e.target.value})}
                    placeholder="e.g., KID-001-2024"
                    required
                    className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                </div>

                <div>
                  <Label htmlFor="account_type" className="text-purple-900 dark:text-white">Account Type *</Label>
                  <Select
                    value={accountForm.account_type}
                    onValueChange={(value) => setAccountForm({...accountForm, account_type: value})}
                  >
                    <SelectTrigger className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-50 border-purple-200 dark:bg-slate-800 dark:border-slate-700">
                      <SelectItem value="savings" className="text-purple-900 focus:bg-purple-100 dark:text-white dark:hover:bg-slate-700">Savings</SelectItem>
                      <SelectItem value="checking" className="text-purple-900 focus:bg-purple-100 dark:text-white dark:hover:bg-slate-700">Checking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency" className="text-purple-900 dark:text-white">Currency *</Label>
                  <Select
                    value={accountForm.currency}
                    onValueChange={(value) => setAccountForm({...accountForm, currency: value})}
                  >
                    <SelectTrigger className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-50 border-purple-200 dark:bg-slate-800 dark:border-slate-700">
                      {CURRENCIES.map(curr => (
                        <SelectItem key={curr} value={curr} className="text-purple-900 focus:bg-purple-100 dark:text-white dark:hover:bg-slate-700">{curr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="balance" className="text-purple-900 dark:text-white">Initial Balance</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={accountForm.balance}
                    onChange={(e) => setAccountForm({...accountForm, balance: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                </div>

                <div>
                  <Label htmlFor="bsb" className="text-purple-900 dark:text-white">BSB Code (Optional)</Label>
                  <Input
                    id="bsb"
                    value={accountForm.bsb}
                    onChange={(e) => setAccountForm({...accountForm, bsb: e.target.value})}
                    placeholder="e.g., 123-456"
                    className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="swift_bic" className="text-purple-900 dark:text-white">SWIFT/BIC Code (Optional)</Label>
                  <Input
                    id="swift_bic"
                    value={accountForm.swift_bic}
                    onChange={(e) => setAccountForm({...accountForm, swift_bic: e.target.value})}
                    placeholder="e.g., ABCDUS33XXX"
                    className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
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
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAccountMutation.isPending || updateAccountMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
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
