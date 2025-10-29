
import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CreditCard as CreditCardIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";

import VirtualCard from "../components/cards/VirtualCard";
import CreditCardComponent from "../components/cards/CreditCardComponent";

const CURRENCIES = [
  "AUD", "USD", "EUR", "GBP", "JPY", "CAD", "CHF", "CNY", "HKD", "NZD",
  "SEK", "KRW", "SGD", "NOK", "MXN", "INR"
];

export default function Cards() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creditCardForm, setCreditCardForm] = useState({
    card_name: "",
    card_number: "",
    credit_limit: "",
    currency: "AUD",
    interest_rate: "",
    card_type: "standard",
    expiry_date: "12/28",
    cvv: ""
  });

  const virtualCardsScrollRef = useRef(null);
  const creditCardsScrollRef = useRef(null);

  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.BankAccount.list(),
  });

  const { data: creditCards = [], isLoading: creditCardsLoading } = useQuery({
    queryKey: ['credit-cards'],
    queryFn: () => base44.entities.CreditCard.list('-created_date'),
  });

  const createCreditCardMutation = useMutation({
    mutationFn: (data) => {
      const creditLimit = parseFloat(data.credit_limit);
      
      // Generate unique random card number starting with 4
      let cardNumber = data.card_number;
      if (!cardNumber || cardNumber.length === 0) {
        const timestamp = Date.now();
        const random = Math.random();
        cardNumber = '4';
        for (let i = 0; i < 15; i++) {
          cardNumber += Math.floor(((timestamp + random * 1000 + i * 7919) * 9973 + 49297 * (i + 1)) % 10);
        }
      }
      
      // Generate unique random CVV
      let cvv = data.cvv;
      if (!cvv || cvv.length === 0) {
        const timestamp = Date.now();
        cvv = (100 + Math.floor((timestamp + Math.random() * 10000) % 900)).toString();
      }
      
      return base44.entities.CreditCard.create({
        ...data,
        card_number: cardNumber,
        cvv: cvv,
        expiry_date: data.expiry_date || "12/28",
        credit_limit: creditLimit,
        current_balance: 0,
        available_credit: creditLimit,
        interest_rate: parseFloat(data.interest_rate) || 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
      setShowCreateDialog(false);
      resetForm();
      toast.success('Credit card created successfully');
    },
    onError: () => {
      toast.error('Failed to create credit card');
    }
  });

  const resetForm = () => {
    setCreditCardForm({
      card_name: "",
      card_number: "",
      credit_limit: "",
      currency: "AUD",
      interest_rate: "",
      card_type: "standard",
      expiry_date: "12/28",
      cvv: ""
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createCreditCardMutation.mutate(creditCardForm);
  };

  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 400; // Adjust scroll amount as needed
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const isLoading = accountsLoading || creditCardsLoading;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cards</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1">Manage your virtual, debit and credit cards</p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Credit Card
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-8 md:grid-cols-2">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </div>
        ) : (
          <Tabs defaultValue="virtual" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-200 dark:bg-slate-800">
              <TabsTrigger 
                value="virtual" 
                className="text-slate-700 data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:text-white dark:data-[state=active]:bg-slate-700"
              >
                Virtual, Debit & Credit Cards
              </TabsTrigger>
              <TabsTrigger 
                value="credit" 
                className="text-slate-700 data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:text-white dark:data-[state=active]:bg-slate-700"
              >
                Additional Credit Cards ({creditCards.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="virtual" className="space-y-6">
              {accounts.length === 0 ? (
                <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                      <CreditCardIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-center">
                      No accounts found. Create a bank account to get cards.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="relative group">
                  {accounts.length > 2 && ( 
                    <>
                      <Button
                        onClick={() => scrollCarousel(virtualCardsScrollRef, 'left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-900 dark:text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full w-10 h-10 p-0"
                        size="icon"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </Button>
                      <Button
                        onClick={() => scrollCarousel(virtualCardsScrollRef, 'right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-900 dark:text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full w-10 h-10 p-0"
                        size="icon"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    </>
                  )}
                  
                  <div 
                    ref={virtualCardsScrollRef}
                    className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-4"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {accounts.map((account) => (
                      <motion.div
                        key={account.id}
                        className="flex-shrink-0 w-[calc(40%-1rem)] md:w-[calc(40%-1rem)] snap-center"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="border-slate-200 dark:border-slate-700 shadow-md overflow-visible bg-white dark:bg-slate-800 h-full">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center justify-between dark:text-white">
                              <span>{account.account_name}</span>
                              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                                ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <VirtualCard account={account} />
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="credit" className="space-y-6">
              {creditCards.length === 0 ? (
                <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                      <CreditCardIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-center mb-4">
                      No additional credit cards yet. Create your first credit card.
                    </p>
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Credit Card
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="relative group">
                  {creditCards.length > 2 && ( 
                    <>
                      <Button
                        onClick={() => scrollCarousel(creditCardsScrollRef, 'left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-900 dark:text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full w-10 h-10 p-0"
                        size="icon"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </Button>
                      <Button
                        onClick={() => scrollCarousel(creditCardsScrollRef, 'right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-900 dark:text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full w-10 h-10 p-0"
                        size="icon"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    </>
                  )}
                  
                  <div 
                    ref={creditCardsScrollRef}
                    className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-4"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {creditCards.map((card) => (
                      <motion.div
                        key={card.id}
                        className="flex-shrink-0 w-[calc(40%-1rem)] md:w-[calc(40%-1rem)] snap-center"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="border-slate-200 dark:border-slate-700 shadow-md overflow-visible bg-white dark:bg-slate-800 h-full">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center justify-between dark:text-white">
                              <span>{card.card_name}</span>
                              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 capitalize">
                                {card.card_type}
                              </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <CreditCardComponent card={card} />
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Create Credit Card Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 dark:bg-slate-800 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-purple-900 dark:text-white">Create New Credit Card</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="card_name" className="text-purple-900 dark:text-white">Card Name *</Label>
                <Input
                  id="card_name"
                  value={creditCardForm.card_name}
                  onChange={(e) => setCreditCardForm({...creditCardForm, card_name: e.target.value})}
                  placeholder="e.g., Platinum Rewards Card"
                  required
                  className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
              </div>

              <div>
                <Label htmlFor="card_number" className="text-purple-900 dark:text-white">Card Number (Optional - Auto-generated)</Label>
                <Input
                  id="card_number"
                  value={creditCardForm.card_number}
                  onChange={(e) => setCreditCardForm({...creditCardForm, card_number: e.target.value.replace(/\s/g, '')})}
                  placeholder="Leave empty to auto-generate (4xxx xxxx xxxx xxxx)"
                  maxLength="16"
                  className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
                <p className="text-xs text-purple-700 dark:text-slate-400 mt-1">Leave blank to generate a random card number starting with 4</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="credit_limit" className="text-purple-900 dark:text-white">Credit Limit *</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    step="100"
                    value={creditCardForm.credit_limit}
                    onChange={(e) => setCreditCardForm({...creditCardForm, credit_limit: e.target.value})}
                    placeholder="10000"
                    required
                    className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                </div>

                <div>
                  <Label htmlFor="card_type" className="text-purple-900 dark:text-white">Card Type *</Label>
                  <Select
                    value={creditCardForm.card_type}
                    onValueChange={(value) => setCreditCardForm({...creditCardForm, card_type: value})}
                  >
                    <SelectTrigger className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-50 border-purple-200 dark:bg-slate-800 dark:border-slate-700">
                      <SelectItem value="standard" className="text-purple-900 focus:bg-purple-100 dark:text-white dark:hover:bg-slate-700">Standard</SelectItem>
                      <SelectItem value="gold" className="text-purple-900 focus:bg-purple-100 dark:text-white dark:hover:bg-slate-700">Gold</SelectItem>
                      <SelectItem value="platinum" className="text-purple-900 focus:bg-purple-100 dark:text-white dark:hover:bg-slate-700">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency" className="text-purple-900 dark:text-white">Currency *</Label>
                  <Select
                    value={creditCardForm.currency}
                    onValueChange={(value) => setCreditCardForm({...creditCardForm, currency: value})}
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
                  <Label htmlFor="interest_rate" className="text-purple-900 dark:text-white">Interest Rate (%) *</Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    step="0.01"
                    value={creditCardForm.interest_rate}
                    onChange={(e) => setCreditCardForm({...creditCardForm, interest_rate: e.target.value})}
                    placeholder="19.99"
                    required
                    className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry_date" className="text-purple-900 dark:text-white">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    value={creditCardForm.expiry_date}
                    onChange={(e) => setCreditCardForm({...creditCardForm, expiry_date: e.target.value})}
                    placeholder="12/28"
                    className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                </div>

                <div>
                  <Label htmlFor="cvv" className="text-purple-900 dark:text-white">CVV (Optional - Auto-generated)</Label>
                  <Input
                    id="cvv"
                    value={creditCardForm.cvv}
                    onChange={(e) => setCreditCardForm({...creditCardForm, cvv: e.target.value})}
                    placeholder="Leave empty to auto-generate"
                    maxLength="3"
                    className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                  <p className="text-xs text-purple-700 dark:text-slate-400 mt-1">Leave blank to generate random CVV</p>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateDialog(false);
                    resetForm();
                  }}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCreditCardMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {createCreditCardMutation.isPending ? 'Creating...' : 'Create Card'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
}
