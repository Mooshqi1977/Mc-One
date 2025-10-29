import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, TrendingUp, DollarSign, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function Loans() {
  const [overdraftForm, setOverdraftForm] = useState({
    requested_amount: "",
    purpose: "",
    employment_status: "full-time",
    annual_income: "",
    existing_debt: ""
  });

  const [locForm, setLocForm] = useState({
    requested_amount: "",
    purpose: "",
    business_name: "",
    business_type: "",
    annual_revenue: "",
    years_in_business: ""
  });

  const [creditCardForm, setCreditCardForm] = useState({
    requested_limit: "",
    card_type: "standard",
    employment_status: "full-time",
    annual_income: "",
    existing_cards: ""
  });

  const queryClient = useQueryClient();

  const applyOverdraftMutation = useMutation({
    mutationFn: (data) => base44.entities.LoanApplication.create({
      ...data,
      loan_type: "overdraft",
      status: "pending",
      application_date: new Date().toISOString()
    }),
    onSuccess: () => {
      toast.success('Overdraft application submitted successfully');
      setOverdraftForm({
        requested_amount: "",
        purpose: "",
        employment_status: "full-time",
        annual_income: "",
        existing_debt: ""
      });
    },
    onError: () => {
      toast.error('Failed to submit overdraft application');
    }
  });

  const applyLOCMutation = useMutation({
    mutationFn: (data) => base44.entities.LoanApplication.create({
      ...data,
      loan_type: "line_of_credit",
      status: "pending",
      application_date: new Date().toISOString()
    }),
    onSuccess: () => {
      toast.success('Line of Credit application submitted successfully');
      setLocForm({
        requested_amount: "",
        purpose: "",
        business_name: "",
        business_type: "",
        annual_revenue: "",
        years_in_business: ""
      });
    },
    onError: () => {
      toast.error('Failed to submit Line of Credit application');
    }
  });

  const applyCreditCardMutation = useMutation({
    mutationFn: (data) => base44.entities.LoanApplication.create({
      ...data,
      loan_type: "credit_card",
      status: "pending",
      application_date: new Date().toISOString()
    }),
    onSuccess: () => {
      toast.success('Credit Card application submitted successfully');
      setCreditCardForm({
        requested_limit: "",
        card_type: "standard",
        employment_status: "full-time",
        annual_income: "",
        existing_cards: ""
      });
    },
    onError: () => {
      toast.error('Failed to submit Credit Card application');
    }
  });

  const handleOverdraftSubmit = (e) => {
    e.preventDefault();
    applyOverdraftMutation.mutate(overdraftForm);
  };

  const handleLOCSubmit = (e) => {
    e.preventDefault();
    applyLOCMutation.mutate(locForm);
  };

  const handleCreditCardSubmit = (e) => {
    e.preventDefault();
    applyCreditCardMutation.mutate(creditCardForm);
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Loan Applications</h1>
          <p className="text-slate-600 dark:text-slate-300">Apply for overdrafts, lines of credit, or credit cards</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-1">
          {/* Overdraft Application */}
          <Card className="border-slate-200 dark:border-purple-700 shadow-lg bg-white dark:bg-gradient-to-br dark:from-purple-900 dark:to-blue-900">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-slate-900 dark:text-white">Apply for Overdraft</CardTitle>
                  <CardDescription className="dark:text-slate-300">Get overdraft protection for your account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOverdraftSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="overdraft_amount" className="dark:text-white">Requested Amount *</Label>
                    <Input
                      id="overdraft_amount"
                      type="number"
                      step="100"
                      placeholder="5000"
                      value={overdraftForm.requested_amount}
                      onChange={(e) => setOverdraftForm({...overdraftForm, requested_amount: e.target.value})}
                      required
                      className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="overdraft_employment" className="dark:text-white">Employment Status *</Label>
                    <Select
                      value={overdraftForm.employment_status}
                      onValueChange={(value) => setOverdraftForm({...overdraftForm, employment_status: value})}
                    >
                      <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="full-time" className="dark:text-white">Full-Time</SelectItem>
                        <SelectItem value="part-time" className="dark:text-white">Part-Time</SelectItem>
                        <SelectItem value="self-employed" className="dark:text-white">Self-Employed</SelectItem>
                        <SelectItem value="unemployed" className="dark:text-white">Unemployed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="overdraft_income" className="dark:text-white">Annual Income *</Label>
                    <Input
                      id="overdraft_income"
                      type="number"
                      step="1000"
                      placeholder="50000"
                      value={overdraftForm.annual_income}
                      onChange={(e) => setOverdraftForm({...overdraftForm, annual_income: e.target.value})}
                      required
                      className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="overdraft_debt" className="dark:text-white">Existing Debt</Label>
                    <Input
                      id="overdraft_debt"
                      type="number"
                      step="100"
                      placeholder="0"
                      value={overdraftForm.existing_debt}
                      onChange={(e) => setOverdraftForm({...overdraftForm, existing_debt: e.target.value})}
                      className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="overdraft_purpose" className="dark:text-white">Purpose *</Label>
                  <Textarea
                    id="overdraft_purpose"
                    placeholder="Explain why you need an overdraft..."
                    value={overdraftForm.purpose}
                    onChange={(e) => setOverdraftForm({...overdraftForm, purpose: e.target.value})}
                    required
                    className="dark:bg-slate-700 dark:text-white dark:border-slate-600 min-h-[100px]"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={applyOverdraftMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  {applyOverdraftMutation.isPending ? 'Submitting...' : 'Submit Overdraft Application'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Line of Credit Application */}
          <Card className="border-slate-200 dark:border-purple-700 shadow-lg bg-white dark:bg-gradient-to-br dark:from-purple-900 dark:to-blue-900">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-slate-900 dark:text-white">Apply for Line of Credit</CardTitle>
                  <CardDescription className="dark:text-slate-300">Flexible business financing solution</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLOCSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="loc_amount" className="dark:text-white">Requested Amount *</Label>
                    <Input
                      id="loc_amount"
                      type="number"
                      step="1000"
                      placeholder="50000"
                      value={locForm.requested_amount}
                      onChange={(e) => setLocForm({...locForm, requested_amount: e.target.value})}
                      required
                      className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loc_business_name" className="dark:text-white">Business Name *</Label>
                    <Input
                      id="loc_business_name"
                      placeholder="Your Business Pty Ltd"
                      value={locForm.business_name}
                      onChange={(e) => setLocForm({...locForm, business_name: e.target.value})}
                      required
                      className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loc_business_type" className="dark:text-white">Business Type *</Label>
                    <Input
                      id="loc_business_type"
                      placeholder="e.g., Retail, Manufacturing"
                      value={locForm.business_type}
                      onChange={(e) => setLocForm({...locForm, business_type: e.target.value})}
                      required
                      className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loc_revenue" className="dark:text-white">Annual Revenue *</Label>
                    <Input
                      id="loc_revenue"
                      type="number"
                      step="10000"
                      placeholder="500000"
                      value={locForm.annual_revenue}
                      onChange={(e) => setLocForm({...locForm, annual_revenue: e.target.value})}
                      required
                      className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loc_years" className="dark:text-white">Years in Business *</Label>
                    <Input
                      id="loc_years"
                      type="number"
                      placeholder="5"
                      value={locForm.years_in_business}
                      onChange={(e) => setLocForm({...locForm, years_in_business: e.target.value})}
                      required
                      className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="loc_purpose" className="dark:text-white">Purpose *</Label>
                  <Textarea
                    id="loc_purpose"
                    placeholder="Explain how you'll use the line of credit..."
                    value={locForm.purpose}
                    onChange={(e) => setLocForm({...locForm, purpose: e.target.value})}
                    required
                    className="dark:bg-slate-700 dark:text-white dark:border-slate-600 min-h-[100px]"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={applyLOCMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                >
                  {applyLOCMutation.isPending ? 'Submitting...' : 'Submit Line of Credit Application'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Credit Card Application */}
          <Card className="border-slate-200 dark:border-purple-700 shadow-lg bg-white dark:bg-gradient-to-br dark:from-purple-900 dark:to-blue-900">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-slate-900 dark:text-white">Apply for Credit Card</CardTitle>
                  <CardDescription className="dark:text-slate-300">Get a new credit card with rewards</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreditCardSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cc_limit" className="dark:text-white">Requested Credit Limit *</Label>
                    <Input
                      id="cc_limit"
                      type="number"
                      step="1000"
                      placeholder="10000"
                      value={creditCardForm.requested_limit}
                      onChange={(e) => setCreditCardForm({...creditCardForm, requested_limit: e.target.value})}
                      required
                      className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cc_type" className="dark:text-white">Card Type *</Label>
                    <Select
                      value={creditCardForm.card_type}
                      onValueChange={(value) => setCreditCardForm({...creditCardForm, card_type: value})}
                    >
                      <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="standard" className="dark:text-white">Standard</SelectItem>
                        <SelectItem value="gold" className="dark:text-white">Gold</SelectItem>
                        <SelectItem value="platinum" className="dark:text-white">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cc_employment" className="dark:text-white">Employment Status *</Label>
                    <Select
                      value={creditCardForm.employment_status}
                      onValueChange={(value) => setCreditCardForm({...creditCardForm, employment_status: value})}
                    >
                      <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="full-time" className="dark:text-white">Full-Time</SelectItem>
                        <SelectItem value="part-time" className="dark:text-white">Part-Time</SelectItem>
                        <SelectItem value="self-employed" className="dark:text-white">Self-Employed</SelectItem>
                        <SelectItem value="unemployed" className="dark:text-white">Unemployed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cc_income" className="dark:text-white">Annual Income *</Label>
                    <Input
                      id="cc_income"
                      type="number"
                      step="1000"
                      placeholder="60000"
                      value={creditCardForm.annual_income}
                      onChange={(e) => setCreditCardForm({...creditCardForm, annual_income: e.target.value})}
                      required
                      className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="cc_existing" className="dark:text-white">Number of Existing Credit Cards</Label>
                    <Input
                      id="cc_existing"
                      type="number"
                      placeholder="0"
                      value={creditCardForm.existing_cards}
                      onChange={(e) => setCreditCardForm({...creditCardForm, existing_cards: e.target.value})}
                      className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={applyCreditCardMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                >
                  {applyCreditCardMutation.isPending ? 'Submitting...' : 'Submit Credit Card Application'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}