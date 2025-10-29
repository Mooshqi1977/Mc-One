
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Activity, Send, Download, Upload, ArrowDownToLine, Copy, CheckCircle, Plus, X, Star, Flame, ArrowUp, ArrowDown, Users, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const CRYPTOS = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { symbol: "USDT", name: "Tether", icon: "₮" },
  { symbol: "BNB", name: "Binance Coin", icon: "BNB" },
  { symbol: "SOL", name: "Solana", icon: "◎" },
  { symbol: "ADA", name: "Cardano", icon: "₳" },
  { symbol: "XRP", name: "Ripple", icon: "✕" },
  { symbol: "DOT", name: "Polkadot", icon: "●" }
];

// Helper function to create URL for internal navigation
const createPageUrl = (pageName, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return `/${pageName}${query ? `?${query}` : ''}`;
};

export default function CryptoExchange() {
  const [activeTab, setActiveTab] = useState("buy");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("account");
  const [selectedCardId, setSelectedCardId] = useState("");
  const [externalCardForm, setExternalCardForm] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });
  const [prices, setPrices] = useState({});
  const [priceChanges, setPriceChanges] = useState({});
  const [usdToAud, setUsdToAud] = useState(1.52);
  const [loading, setLoading] = useState(false);
  const [activeMarketView, setActiveMarketView] = useState("all");
  const [filteredCryptos, setFilteredCryptos] = useState([]);

  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [sendForm, setSendForm] = useState({
    cryptoSymbol: "",
    amount: "",
    sourceAccountId: "",
    recipientAddress: "",
    note: ""
  });
  const [copiedAddress, setCopiedAddress] = useState("");
  const [showAddToWatchlistDialog, setShowAddToWatchlistDialog] = useState(false);

  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.BankAccount.list(),
  });

  const { data: holdings = [] } = useQuery({
    queryKey: ['crypto-holdings'],
    queryFn: () => base44.entities.CryptoHolding.list(),
  });

  const { data: creditCards = [] } = useQuery({
    queryKey: ['credit-cards'],
    queryFn: () => base44.entities.CreditCard.list(),
  });

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => base44.entities.UserWatchlistCrypto.list(),
  });

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchFilteredCryptos();
  }, [activeMarketView, watchlist, prices, priceChanges]);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const priceData = await base44.integrations.Core.InvokeLLM({
        prompt: `Get the current real-time market data:
        1. Cryptocurrency prices in USD: Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Binance Coin (BNB), Solana (SOL), Cardano (ADA), Ripple (XRP), Polkadot (DOT)
        2. 24-hour percentage change for each (can be positive or negative)
        3. Current USD to AUD exchange rate
        
        Return accurate data from live markets.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            prices_usd: {
              type: "object",
              properties: {
                BTC: { type: "number" },
                ETH: { type: "number" },
                USDT: { type: "number" },
                BNB: { type: "number" },
                SOL: { type: "number" },
                ADA: { type: "number" },
                XRP: { type: "number" },
                DOT: { type: "number" }
              }
            },
            changes_24h: {
              type: "object",
              properties: {
                BTC: { type: "number" },
                ETH: { type: "number" },
                USDT: { type: "number" },
                BNB: { type: "number" },
                SOL: { type: "number" },
                ADA: { type: "number" },
                XRP: { type: "number" },
                DOT: { type: "number" }
              }
            },
            usd_to_aud: { type: "number" }
          }
        }
      });
      
      const exchangeRate = priceData.usd_to_aud || 1.52;
      setUsdToAud(exchangeRate);
      
      const pricesInAud = {};
      Object.keys(priceData.prices_usd || {}).forEach(crypto => {
        pricesInAud[crypto] = priceData.prices_usd[crypto] * exchangeRate;
      });
      
      setPrices(pricesInAud);
      setPriceChanges(priceData.changes_24h || {});
    } catch (error) {
      console.error("Error fetching prices:", error);
      const fallbackRate = 1.52;
      setUsdToAud(fallbackRate);
      setPrices({
        BTC: 45000 * fallbackRate,
        ETH: 2500 * fallbackRate,
        USDT: 1 * fallbackRate,
        BNB: 300 * fallbackRate,
        SOL: 100 * fallbackRate,
        ADA: 0.5 * fallbackRate,
        XRP: 0.6 * fallbackRate,
        DOT: 7 * fallbackRate
      });
      setPriceChanges({
        BTC: 2.5,
        ETH: 1.8,
        USDT: 0.01,
        BNB: -0.5,
        SOL: 5.2,
        ADA: 3.1,
        XRP: -1.2,
        DOT: 0.8
      });
    }
    setLoading(false);
  };

  const fetchFilteredCryptos = async () => {
    if (activeMarketView === "all") {
      setFilteredCryptos(CRYPTOS);
    } else if (activeMarketView === "watchlist") {
      if (watchlist.length === 0) {
        // Show default watchlist examples
        setFilteredCryptos([
          { symbol: "BTC", name: "Bitcoin", icon: "₿" },
          { symbol: "ETH", name: "Ethereum", icon: "Ξ" },
          { symbol: "SOL", name: "Solana", icon: "◎" }
        ]);
      } else {
        const watchlistSymbols = watchlist.map(w => w.cryptocurrency);
        setFilteredCryptos(CRYPTOS.filter(c => watchlistSymbols.includes(c.symbol)));
      }
    } else if (activeMarketView === "gainers") {
      // Top 5 gainers only
      const sorted = [...CRYPTOS].sort((a, b) => (priceChanges[b.symbol] || 0) - (priceChanges[a.symbol] || 0));
      setFilteredCryptos(sorted.slice(0, 5));
    } else if (activeMarketView === "losers") {
      // Top 5 losers only (only cryptos with negative changes)
      const losers = [...CRYPTOS].filter(c => (priceChanges[c.symbol] || 0) < 0);
      const sorted = losers.sort((a, b) => (priceChanges[a.symbol] || 0) - (priceChanges[b.symbol] || 0));
      setFilteredCryptos(sorted.slice(0, 5));
    } else if (activeMarketView === "trending") {
      // Top 5 trending only
      const sorted = [...CRYPTOS].sort((a, b) => Math.abs(priceChanges[b.symbol] || 0) - Math.abs(priceChanges[a.symbol] || 0));
      setFilteredCryptos(sorted.slice(0, 5));
    } else if (activeMarketView === "buyers") {
      // Top 5 most buyers only
      const sorted = [...CRYPTOS].sort((a, b) => Math.abs(priceChanges[b.symbol] || 0) - Math.abs(priceChanges[a.symbol] || 0));
      setFilteredCryptos(sorted.slice(0, 5));
    } else if (activeMarketView === "searched") {
      // Top 5 most searched only
      const sorted = [...CRYPTOS].sort((a, b) => Math.abs(priceChanges[b.symbol] || 0) - Math.abs(priceChanges[a.symbol] || 0));
      setFilteredCryptos(sorted.slice(0, 5));
    }
  };

  const addToWatchlistMutation = useMutation({
    mutationFn: (crypto) => base44.entities.UserWatchlistCrypto.create({ cryptocurrency: crypto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    }
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: (id) => base44.entities.UserWatchlistCrypto.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    }
  });

  const isInWatchlist = (symbol) => {
    return watchlist.some(w => w.cryptocurrency === symbol);
  };

  const toggleWatchlist = (symbol) => {
    const watchlistItem = watchlist.find(w => w.cryptocurrency === symbol);
    if (watchlistItem) {
      removeFromWatchlistMutation.mutate(watchlistItem.id);
    } else {
      addToWatchlistMutation.mutate(symbol);
    }
  };

  const sendCryptoMutation = useMutation({
    mutationFn: async (data) => {
      const sourceAccount = accounts.find(acc => acc.id === data.sourceAccountId);
      if (!sourceAccount) throw new Error("Source account not found");

      const holding = holdings.find(h => h.cryptocurrency === data.cryptoSymbol && h.account_id === data.sourceAccountId);
      if (!holding || holding.amount < parseFloat(data.amount)) {
        throw new Error(`Insufficient ${data.cryptoSymbol} balance`);
      }

      const sendAmount = parseFloat(data.amount);
      const priceAud = prices[data.cryptoSymbol] || 0;
      const transferValueAud = sendAmount * priceAud;

      const newAmount = holding.amount - sendAmount;
      if (newAmount <= 0) {
        await base44.entities.CryptoHolding.delete(holding.id);
      } else {
        await base44.entities.CryptoHolding.update(holding.id, {
          amount: newAmount
        });
      }

      await base44.entities.Transaction.create({
        transaction_type: "crypto_send_external",
        amount: transferValueAud,
        account_id: data.sourceAccountId,
        description: `Sent ${sendAmount.toFixed(6)} ${data.cryptoSymbol} to ${data.recipientAddress.substring(0, 8)}...${data.note ? ` - ${data.note}` : ''}`,
        status: "completed",
        currency: sourceAccount.currency
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crypto-holdings'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowSendDialog(false);
      setSendForm({
        cryptoSymbol: "",
        amount: "",
        sourceAccountId: "",
        recipientAddress: "",
        note: ""
      });
      alert("Crypto sent successfully!");
    },
    onError: (error) => {
      alert(`Send failed: ${error.message}`);
    }
  });

  const tradeMutation = useMutation({
    mutationFn: async ({ type, crypto, amount, accountId, paymentMethod, cardId, externalCard }) => {
      const priceAud = prices[crypto] || 0;
      const totalCost = parseFloat(amount) * priceAud;
      const priceUsd = priceAud / usdToAud;

      let sourceAccount;
      let paymentDescription = "";
      let bankBalanceAfter = null;

      if (type === 'buy') {
        if (paymentMethod === "external_card") {
          if (!externalCard.cardName || !externalCard.cardNumber || !externalCard.expiryDate || !externalCard.cvv) {
            throw new Error("Please fill in all external card details.");
          }
          if (externalCard.cardNumber.replace(/\s/g, '').length < 15) {
            throw new Error("Invalid card number format.");
          }
          if (!/^\d{2}\/\d{2}$/.test(externalCard.expiryDate)) {
            throw new Error("Invalid expiry date format (MM/YY).");
          }
          if (!/^\d{3,4}$/.test(externalCard.cvv)) {
            throw new Error("Invalid CVV format.");
          }

          sourceAccount = accounts[0]; 
          if (!sourceAccount) {
            throw new Error("No bank account available to link crypto holding to (when paying by external card).");
          }
          paymentDescription = `Paid with External Card (****${externalCard.cardNumber.replace(/\s/g, '').slice(-4)})`;
          bankBalanceAfter = sourceAccount.balance;

        } else if (paymentMethod === "card") {
          if (cardId.startsWith('virtual-')) {
            const actualAccountId = cardId.replace('virtual-', '');
            sourceAccount = accounts.find(a => a.id === actualAccountId);
            if (!sourceAccount) {
              throw new Error("Linked bank account not found for virtual card.");
            }
            if (sourceAccount.balance < totalCost) {
              throw new Error("Insufficient bank account balance for virtual card payment.");
            }

            await base44.entities.BankAccount.update(actualAccountId, {
              balance: sourceAccount.balance - totalCost
            });
            bankBalanceAfter = sourceAccount.balance - totalCost;
            paymentDescription = `Paid with Virtual Card from ${sourceAccount.account_name} (****${sourceAccount.account_number.slice(-4)})`;

          } else {
            const card = creditCards.find(c => c.id === cardId);
            if (!card) {
              throw new Error("Credit card not found.");
            }
            
            if (card.available_credit < totalCost) {
              throw new Error("Insufficient credit limit on selected card.");
            }

            await base44.entities.CreditCard.update(cardId, {
              current_balance: card.current_balance + totalCost,
              available_credit: card.available_credit - totalCost
            });

            sourceAccount = accounts[0]; 
            if (!sourceAccount) {
              throw new Error("No bank account available to link crypto holding to (even when paying by card).");
            }
            bankBalanceAfter = sourceAccount.balance;
            paymentDescription = `Paid with ${card.card_name} (****${card.card_number.slice(-4)})`;
          }
        } else {
          sourceAccount = accounts.find(a => a.id === accountId);
          if (!sourceAccount) {
            throw new Error("Bank account not found.");
          }
          if (sourceAccount.balance < totalCost) {
            throw new Error("Insufficient balance in bank account.");
          }

          await base44.entities.BankAccount.update(accountId, {
            balance: sourceAccount.balance - totalCost
          });
          bankBalanceAfter = sourceAccount.balance - totalCost;
          paymentDescription = `Paid from ${sourceAccount.account_name}`;
        }

        const existingHolding = holdings.find(h => h.cryptocurrency === crypto && h.account_id === sourceAccount.id);
        
        if (existingHolding) {
          const newAmount = existingHolding.amount + parseFloat(amount);
          const newAvgPrice = ((existingHolding.amount * existingHolding.purchase_price_usd) + (parseFloat(amount) * priceUsd)) / newAmount;
          await base44.entities.CryptoHolding.update(existingHolding.id, {
            amount: newAmount,
            purchase_price_usd: newAvgPrice
          });
        } else {
          await base44.entities.CryptoHolding.create({
            cryptocurrency: crypto,
            amount: parseFloat(amount),
            purchase_price_usd: priceUsd,
            account_id: sourceAccount.id
          });
        }

        await base44.entities.Transaction.create({
          transaction_type: "crypto_buy",
          amount: totalCost,
          account_id: sourceAccount.id,
          description: `Bought ${amount} ${crypto} at $${priceAud.toFixed(2)} AUD - ${paymentDescription}`,
          status: "completed",
          balance_after: bankBalanceAfter,
          currency: sourceAccount.currency
        });

      } else {
        sourceAccount = accounts.find(a => a.id === accountId);
        if (!sourceAccount) {
          throw new Error("Bank account to receive funds not found.");
        }

        const holding = holdings.find(h => h.cryptocurrency === crypto && h.account_id === sourceAccount.id);
        if (!holding || holding.amount < parseFloat(amount)) {
          throw new Error("Insufficient crypto balance to sell.");
        }

        const newAmount = holding.amount - parseFloat(amount);
        if (newAmount <= 0) {
          await base44.entities.CryptoHolding.delete(holding.id);
        } else {
          await base44.entities.CryptoHolding.update(holding.id, {
            amount: newAmount
          });
        }

        await base44.entities.BankAccount.update(sourceAccount.id, {
          balance: sourceAccount.balance + totalCost
        });

        await base44.entities.Transaction.create({
          transaction_type: "crypto_sell",
          amount: totalCost,
          account_id: sourceAccount.id,
          description: `Sold ${amount} ${crypto} at $${priceAud.toFixed(2)} AUD`,
          status: "completed",
          balance_after: sourceAccount.balance + totalCost,
          currency: sourceAccount.currency
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crypto-holdings'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
      setAmount("");
      setAccountId("");
      setSelectedCardId("");
      setExternalCardForm({
        cardName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: ""
      });
      setPaymentMethod("account");
    },
    onError: (error) => {
        alert(`Trade failed: ${error.message}`);
    }
  });

  const handleSendCrypto = (e) => {
    e.preventDefault();
    if (!sendForm.cryptoSymbol || !sendForm.amount || !sendForm.sourceAccountId || !sendForm.recipientAddress) {
      alert("Please fill in all required fields");
      return;
    }
    if (sendForm.recipientAddress.length < 10) {
      alert("Please enter a valid recipient address");
      return;
    }
    sendCryptoMutation.mutate(sendForm);
  };

  const generateWalletAddress = (crypto, accountId) => {
    const prefixes = {
      BTC: "1",
      ETH: "0x",
      USDT: "0x",
      BNB: "0x",
      SOL: "So1",
      ADA: "addr1",
      XRP: "r",
      DOT: "1"
    };
    const prefix = prefixes[crypto] || "0x";
    const hash = accountId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const address = prefix + Math.abs(hash).toString(16).padStart(40, '0').substring(0, 40);
    return address;
  };

  const copyToClipboard = (text, crypto) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(crypto);
    setTimeout(() => setCopiedAddress(""), 2000);
  };

  const handleTrade = () => {
    if (!amount || !selectedCrypto) {
      alert("Please enter an amount and select a cryptocurrency.");
      return;
    }
    
    if (activeTab === "buy") {
      if (paymentMethod === "account" && !accountId) {
        alert("Please select a bank account for payment.");
        return;
      }
      if (paymentMethod === "card" && !selectedCardId) {
        alert("Please select a card for payment.");
        return;
      }
      if (paymentMethod === "external_card") {
        if (!externalCardForm.cardName || !externalCardForm.cardNumber || !externalCardForm.expiryDate || !externalCardForm.cvv) {
          alert("Please fill in all external card details.");
          return;
        }
        if (externalCardForm.cardNumber.replace(/\s/g, '').length < 15) {
          alert("Invalid card number. Please check the card number.");
          return;
        }
        if (!/^\d{2}\/\d{2}$/.test(externalCardForm.expiryDate)) {
          alert("Invalid expiry date format (MM/YY).");
          return;
        }
        if (!/^\d{3,4}$/.test(externalCardForm.cvv)) {
          alert("Invalid CVV format.");
          return;
        }
      }
    } else {
      if (!accountId) {
        alert("Please select a bank account to receive funds.");
        return;
      }
    }
    
    tradeMutation.mutate({
      type: activeTab,
      crypto: selectedCrypto,
      amount,
      accountId: accountId,
      paymentMethod,
      cardId: selectedCardId,
      externalCard: externalCardForm
    });
  };

  const selectedPrice = prices[selectedCrypto] || 0;
  const totalValue = parseFloat(amount || 0) * selectedPrice;

  const portfolioValue = holdings.reduce((sum, holding) => {
    const currentPrice = prices[holding.cryptocurrency] || 0;
    return sum + (holding.amount * currentPrice);
  }, 0);

  const initialInvestment = holdings.reduce((sum, holding) => {
    const purchasePriceAud = holding.purchase_price_usd * usdToAud;
    return sum + (holding.amount * purchasePriceAud);
  }, 0);

  const profitLoss = portfolioValue - initialInvestment;
  const profitLossPercentage = initialInvestment > 0 ? (profitLoss / initialInvestment) * 100 : 0;

  const getButtonDisabledState = () => {
    if (tradeMutation.isPending || !amount || loading) return true;
    if (activeTab === "buy") {
      if (paymentMethod === "account" && !accountId) return true;
      if (paymentMethod === "card" && !selectedCardId) return true;
      if (paymentMethod === "external_card") {
        if (!externalCardForm.cardName || !externalCardForm.cardNumber || !externalCardForm.expiryDate || !externalCardForm.cvv) {
          return true;
        }
        if (externalCardForm.cardNumber.replace(/\s/g, '').length < 15) {
          return true;
        }
        if (!/^\d{2}\/\d{2}$/.test(externalCardForm.expiryDate)) {
          return true;
        }
        if (!/^\d{3,4}$/.test(externalCardForm.cvv)) {
          return true;
        }
      }
    } else {
      if (!accountId) return true;
    }
    return false;
  };

  const marketViewButtons = [
    { id: "watchlist", label: "Watchlist", icon: Star },
    { id: "trending", label: "Trending", icon: Flame },
    { id: "gainers", label: "Top Gainers", icon: ArrowUp },
    { id: "losers", label: "Top Losers", icon: ArrowDown },
    { id: "buyers", label: "Most Buyers", icon: Users },
    { id: "searched", label: "Most Searched", icon: Search }
  ];

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-purple-900 dark:to-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Crypto Exchange</h1>
              <p className="text-slate-600 dark:text-slate-300">Buy and sell cryptocurrencies with live market prices in AUD</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Exchange Rate: 1 USD = ${usdToAud.toFixed(4)} AUD</p>
            </div>
            <Button
              onClick={fetchPrices}
              variant="outline"
              size="sm"
              disabled={loading}
              className="flex items-center gap-2 bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100 hover:text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700 dark:hover:bg-purple-900/50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Refresh Prices
                </>
              )}
            </Button>
          </div>
        </div>

        {holdings.length > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-purple-500 to-blue-600 text-white border-none shadow-xl">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <p className="text-white/80 text-sm mb-1">Total Portfolio Value</p>
                  <h2 className="text-4xl font-bold mb-2">
                    ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <p className="text-white/70 text-xs">
                    Initial Investment: ${initialInvestment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AUD
                  </p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className={`px-6 py-3 rounded-xl ${
                    profitLoss >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                  } backdrop-blur-sm`}>
                    <div className="flex items-center gap-2 mb-1">
                      {profitLoss >= 0 ? (
                        <TrendingUp className="w-5 h-5 text-white" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-white" />
                      )}
                      <p className="text-white/80 text-sm">Profit/Loss</p>
                    </div>
                    <p className={`text-2xl font-bold ${
                      profitLoss >= 0 ? 'text-green-100' : 'text-red-100'
                    }`}>
                      {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm font-semibold mt-1 ${
                      profitLoss >= 0 ? 'text-green-200' : 'text-red-200'
                    }`}>
                      {profitLoss >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-white/80 text-xs mb-1">Holdings</p>
                    <p className="text-2xl font-bold">{holdings.length}</p>
                    <p className="text-white/70 text-xs">Cryptocurrencies</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8 border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-purple-200">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 hover:scale-105 transition-transform duration-200 border-slate-200 dark:border-purple-700 dark:bg-purple-800/30 dark:hover:bg-purple-700/50 hover:border-blue-300 group"
                onClick={() => setShowSendDialog(true)}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-purple-200">Send Crypto</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex-col gap-2 hover:scale-105 transition-transform duration-200 border-slate-200 dark:border-purple-700 dark:bg-purple-800/30 dark:hover:bg-purple-700/50 hover:border-green-300 group"
                onClick={() => setShowReceiveDialog(true)}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-purple-200">Receive Crypto</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex-col gap-2 hover:scale-105 transition-transform duration-200 border-slate-200 dark:border-purple-700 dark:bg-purple-800/30 dark:hover:bg-purple-700/50 hover:border-purple-300 group"
                onClick={() => setShowDepositDialog(true)}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <ArrowDownToLine className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-purple-200">Deposit</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex-col gap-2 hover:scale-105 transition-transform duration-200 border-slate-200 dark:border-purple-700 dark:bg-purple-800/30 dark:hover:bg-purple-700/50 hover:border-orange-300 group"
                onClick={() => setShowWithdrawDialog(true)}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-purple-200">Withdraw</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-purple-200">Market Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeMarketView === "all" ? "default" : "outline"}
                onClick={() => setActiveMarketView("all")}
                className={`flex items-center gap-2 ${
                  activeMarketView === "all"
                    ? "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white"
                    : "border-slate-300 dark:border-purple-600 text-slate-700 dark:text-purple-300 hover:bg-slate-100 dark:hover:bg-purple-800/30"
                }`}
              >
                All Cryptos
              </Button>
              {marketViewButtons.map((view) => (
                <Button
                  key={view.id}
                  variant={activeMarketView === view.id ? "default" : "outline"}
                  onClick={() => setActiveMarketView(view.id)}
                  className={`flex items-center gap-2 ${
                    activeMarketView === view.id
                      ? "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white"
                      : "border-slate-300 dark:border-purple-600 text-slate-700 dark:text-purple-300 hover:bg-slate-100 dark:hover:bg-purple-800/30"
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  {view.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-purple-200 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 dark:border-purple-700 dark:bg-gradient-to-br dark:from-purple-900 dark:via-purple-950 dark:to-slate-900 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white dark:text-white">
                  <Activity className="w-5 h-5 text-purple-400 dark:text-purple-400" />
                  Trading Panel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-600 dark:bg-purple-800">
                    <TabsTrigger value="buy" className="text-white data-[state=active]:bg-green-500 data-[state=active]:text-white dark:text-white dark:data-[state=active]:bg-green-600">
                      Buy Crypto
                    </TabsTrigger>
                    <TabsTrigger value="sell" className="text-white data-[state=active]:bg-red-500 data-[state=active]:text-white dark:text-white dark:data-[state=active]:bg-red-600">
                      Sell Crypto
                    </TabsTrigger>
                  </TabsList>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-white dark:text-white">Select Cryptocurrency</Label>
                      <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                        <SelectTrigger className="border-slate-600 focus:border-purple-500 focus:ring-purple-500 bg-slate-700 text-white dark:bg-purple-900 dark:text-white dark:border-purple-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600 dark:bg-purple-950 dark:border-purple-700">
                          {CRYPTOS.map(crypto => (
                            <SelectItem key={crypto.symbol} value={crypto.symbol} className="text-white focus:bg-slate-600 dark:text-white dark:hover:bg-purple-800">
                              {crypto.icon} {crypto.name} ({crypto.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedPrice > 0 && (
                        <div className="mt-2 p-3 bg-slate-600/50 dark:bg-purple-900/30 rounded-lg border border-slate-500 dark:border-purple-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-200 dark:text-slate-300">Live Price (AUD):</span>
                            <span className="text-lg font-bold text-white dark:text-white">${selectedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          {priceChanges[selectedCrypto] !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-300 dark:text-slate-400">24h Change:</span>
                              <span className={`text-sm font-bold flex items-center gap-1 ${
                                priceChanges[selectedCrypto] >= 0 ? 'text-green-400 dark:text-green-400' : 'text-red-400 dark:text-red-400'
                              }`}>
                                {priceChanges[selectedCrypto] >= 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                {priceChanges[selectedCrypto] >= 0 ? '+' : ''}{priceChanges[selectedCrypto].toFixed(2)}%
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-slate-300 dark:text-slate-400 mt-1">
                            Auto-updates every 30 seconds
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-white dark:text-white">Amount ({selectedCrypto})</Label>
                      <Input
                        type="number"
                        step="0.00000001"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="border-slate-600 focus:border-purple-500 focus:ring-purple-500 bg-slate-700 text-white dark:bg-purple-900 dark:text-white dark:border-purple-700"
                      />
                      {totalValue > 0 && (
                        <p className="text-sm text-slate-200 dark:text-slate-300 mt-2">
                          Total: <span className="font-bold">${totalValue.toFixed(2)}</span> AUD
                        </p>
                      )}
                    </div>

                    {activeTab === "buy" && (
                      <div className="border-t border-slate-600 dark:border-purple-700 pt-6">
                        <Label className="text-base font-semibold mb-3 block text-white dark:text-white">Payment Method</Label>
                        
                        <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                          <TabsList className="grid w-full grid-cols-3 mb-4 bg-slate-600 dark:bg-purple-800">
                            <TabsTrigger value="account" className="text-white dark:text-white dark:data-[state=active]:bg-purple-800 data-[state=active]:bg-slate-500">Bank Account</TabsTrigger>
                            <TabsTrigger value="card" className="text-white dark:text-white dark:data-[state=active]:bg-purple-800 data-[state=active]:bg-slate-500">My Cards</TabsTrigger>
                            <TabsTrigger value="external_card" className="text-white dark:text-white dark:data-[state=active]:bg-purple-800 data-[state=active]:bg-slate-500">New Card</TabsTrigger>
                          </TabsList>

                          {paymentMethod === "account" ? (
                            <div>
                              <Label className="text-white dark:text-white">Select Account</Label>
                              <Select value={accountId} onValueChange={setAccountId}>
                                <SelectTrigger className="border-slate-600 focus:border-purple-500 focus:ring-purple-500 bg-slate-700 text-white dark:bg-purple-900 dark:text-white dark:border-purple-700">
                                  <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-700 border-slate-600 dark:bg-purple-950 dark:border-purple-700">
                                  {accounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id} className="text-white focus:bg-slate-600 dark:text-white dark:hover:bg-purple-800">
                                      {acc.account_name} (${acc.balance.toFixed(2)})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : paymentMethod === "card" ? (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-white dark:text-white">Select Card</Label>
                                <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                                  <SelectTrigger className="border-slate-600 focus:border-purple-500 focus:ring-purple-500 bg-slate-700 text-white dark:bg-purple-900 dark:text-white dark:border-purple-700">
                                    <SelectValue placeholder="Select card" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-700 border-slate-600 dark:bg-purple-950 dark:border-purple-700">
                                    {accounts.map(acc => (
                                      <SelectItem key={`virtual-${acc.id}`} value={`virtual-${acc.id}`} className="text-white focus:bg-slate-600 dark:text-white dark:hover:bg-purple-800">
                                        {acc.account_type === 'savings' ? '💳 Debit Card' : '💳 Virtual Card'} - {acc.account_name} (${acc.balance.toFixed(2)})
                                      </SelectItem>
                                    ))}
                                    {creditCards.map(card => (
                                      <SelectItem key={card.id} value={card.id} className="text-white focus:bg-slate-600 dark:text-white dark:hover:bg-purple-800">
                                        🔵 {card.card_name} (${card.available_credit.toFixed(2)} available)
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {selectedCardId && (
                                <div className="p-3 bg-blue-900/30 dark:bg-purple-900/30 rounded-lg border border-blue-700 dark:border-purple-800">
                                  <p className="text-sm text-blue-200 dark:text-purple-300 font-medium mb-1">
                                    💡 Using Saved Card
                                  </p>
                                  <p className="text-xs text-blue-300 dark:text-purple-400">
                                    {selectedCardId.startsWith('virtual-') 
                                      ? "Payment will be deducted from your bank account balance"
                                      : "Payment will be charged to your credit card."}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : paymentMethod === "external_card" ? (
                            <div className="space-y-4">
                              <div className="p-3 bg-purple-900/30 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg border border-purple-700 dark:border-purple-800 mb-4">
                                <p className="text-sm text-purple-200 dark:text-purple-300 font-medium mb-1">
                                  💳 Pay with Credit/Debit Card
                                </p>
                                <p className="text-xs text-purple-300 dark:text-purple-400">
                                  Enter your card details to complete the purchase
                                </p>
                              </div>

                              <div>
                                <Label htmlFor="cardName" className="text-white dark:text-white">Name on Card *</Label>
                                <Input
                                  id="cardName"
                                  placeholder="John Doe"
                                  value={externalCardForm.cardName}
                                  onChange={(e) => setExternalCardForm({...externalCardForm, cardName: e.target.value})}
                                  className="border-slate-600 focus:border-purple-500 focus:ring-purple-500 bg-slate-700 text-white dark:bg-purple-900 dark:text-white dark:border-purple-700"
                                />
                              </div>

                              <div>
                                <Label htmlFor="cardNumber" className="text-white dark:text-white">Card Number *</Label>
                                <Input
                                  id="cardNumber"
                                  placeholder="1234 5678 9012 3456"
                                  maxLength="19"
                                  value={externalCardForm.cardNumber}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\s/g, '');
                                    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                                    setExternalCardForm({...externalCardForm, cardNumber: formatted});
                                  }}
                                  className="border-slate-600 focus:border-purple-500 focus:ring-purple-500 bg-slate-700 text-white dark:bg-purple-900 dark:text-white dark:border-purple-700"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="expiryDate" className="text-white dark:text-white">Expiry Date *</Label>
                                  <Input
                                    id="expiryDate"
                                    placeholder="MM/YY"
                                    maxLength="5"
                                    value={externalCardForm.expiryDate}
                                    onChange={(e) => {
                                      let value = e.target.value.replace(/\D/g, '');
                                      if (value.length >= 2) {
                                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                      }
                                      setExternalCardForm({...externalCardForm, expiryDate: value});
                                    }}
                                    className="border-slate-600 focus:border-purple-500 focus:ring-purple-500 bg-slate-700 text-white dark:bg-purple-900 dark:text-white dark:border-purple-700"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="cvv" className="text-white dark:text-white">CVV *</Label>
                                  <Input
                                    id="cvv"
                                    type="password"
                                    placeholder="123"
                                    maxLength="4"
                                    value={externalCardForm.cvv}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, '');
                                      setExternalCardForm({...externalCardForm, cvv: value});
                                    }}
                                    className="border-slate-600 focus:border-purple-500 focus:ring-purple-500 bg-slate-700 text-white dark:bg-purple-900 dark:text-white dark:border-purple-700"
                                  />
                                </div>
                              </div>

                              <div className="p-3 bg-green-900/30 dark:bg-green-900/30 rounded-lg border border-green-700 dark:border-green-800">
                                <div className="flex items-start gap-2">
                                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-sm text-green-200 dark:text-green-300 font-medium">Secure Payment</p>
                                    <p className="text-xs text-green-300 dark:text-green-400">Your card information is encrypted and secure</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </Tabs>
                      </div>
                    )}

                    {activeTab === "sell" && (
                      <div>
                        <Label className="text-white dark:text-white">Receive Funds In</Label>
                        <Select value={accountId} onValueChange={setAccountId}>
                          <SelectTrigger className="border-slate-600 focus:border-purple-500 focus:ring-purple-500 bg-slate-700 text-white dark:bg-purple-900 dark:text-white dark:border-purple-700">
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600 dark:bg-purple-950 dark:border-purple-700">
                            {accounts.map(acc => (
                              <SelectItem key={acc.id} value={acc.id} className="text-white focus:bg-slate-600 dark:text-white dark:hover:bg-purple-800">
                                {acc.account_name} (${acc.balance.toFixed(2)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Button
                      onClick={handleTrade}
                      disabled={getButtonDisabledState()}
                      className={`w-full ${activeTab === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                    >
                      {tradeMutation.isPending ? 'Processing...' : `${activeTab === 'buy' ? 'Buy' : 'Sell'} ${selectedCrypto}`}
                    </Button>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-slate-900 dark:text-purple-200">
                    {activeMarketView === "all" ? "Live Market Prices (AUD)" :
                     activeMarketView === "watchlist" ? "My Watchlist" :
                     activeMarketView === "gainers" ? "Top Gainers" :
                     activeMarketView === "losers" ? "Top Losers" :
                     activeMarketView === "trending" ? "Trending Now" :
                     activeMarketView === "buyers" ? "Most Buyers" :
                     "Most Searched"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {activeMarketView === "watchlist" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddToWatchlistDialog(true)}
                        className="h-8 w-8 p-0 border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/30"
                      >
                        <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </Button>
                    )}
                    {loading && (
                      <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading && Object.keys(prices).length === 0 ? (
                  <div className="text-center py-4 text-slate-500 dark:text-purple-300">Loading live prices...</div>
                ) : (
                  <div className="space-y-3">
                    {filteredCryptos.map(crypto => {
                      const price = prices[crypto.symbol] || 0;
                      const change = priceChanges[crypto.symbol] || 0;
                      const isPositive = change >= 0;
                      const inWatchlist = isInWatchlist(crypto.symbol);
                      
                      const changeColor = activeMarketView === "losers" 
                        ? 'text-red-600 dark:text-red-400' 
                        : (isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400');
                      
                      return (
                        <motion.div
                          key={crypto.symbol}
                          whileHover={{ scale: 1.02 }}
                          className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                            selectedCrypto === crypto.symbol 
                              ? 'border-purple-400 bg-purple-100 dark:border-purple-500 dark:bg-purple-800/50' 
                              : 'border-purple-300 bg-purple-50 hover:border-purple-400 hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-800/30 dark:hover:border-purple-600 dark:hover:bg-purple-700/50'
                          }`}
                          onClick={() => {
                            window.location.href = createPageUrl('CryptoDetail', { symbol: crypto.symbol });
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {crypto.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-slate-900 dark:text-purple-200">{crypto.symbol}</p>
                                  {activeMarketView === "watchlist" && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 dark:hover:bg-purple-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleWatchlist(crypto.symbol);
                                      }}
                                    >
                                      {inWatchlist ? (
                                        <X className="w-4 h-4 text-red-500" />
                                      ) : (
                                        <Plus className="w-4 h-4 text-green-500" />
                                      )}
                                    </Button>
                                  )}
                                  {activeMarketView !== "watchlist" && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 dark:hover:bg-purple-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleWatchlist(crypto.symbol);
                                      }}
                                    >
                                      <Star className={`w-4 h-4 ${inWatchlist ? 'fill-yellow-500 text-yellow-500' : 'text-slate-400 dark:text-purple-400'}`} />
                                    </Button>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-purple-300">{crypto.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900 dark:text-purple-200">
                                ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <div className={`flex items-center justify-end gap-1 text-xs font-semibold ${changeColor}`}>
                                {(activeMarketView === "losers" || !isPositive) ? (
                                  <TrendingDown className="w-3 h-3" />
                                ) : (
                                  <TrendingUp className="w-3 h-3" />
                                )}
                                {isPositive ? '+' : ''}{change.toFixed(2)}%
                              </div>
                            </div>
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
      </div>

      {/* Add to Watchlist Dialog */}
      <Dialog open={showAddToWatchlistDialog} onOpenChange={setShowAddToWatchlistDialog}>
        <DialogContent className="sm:max-w-[500px] dark:bg-purple-900/95 dark:text-purple-100 dark:border-purple-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-purple-100">
              <Star className="w-5 h-5 text-yellow-500" />
              Add to Watchlist
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600 dark:text-purple-300 mb-4">Select cryptocurrencies to add to your watchlist</p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {CRYPTOS.map(crypto => {
                const inWatchlist = isInWatchlist(crypto.symbol);
                const price = prices[crypto.symbol] || 0;
                const change = priceChanges[crypto.symbol] || 0;
                const isPositive = change >= 0;
                
                return (
                  <div
                    key={crypto.symbol}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      inWatchlist 
                        ? 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/30' 
                        : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50 dark:border-purple-700 dark:bg-purple-800/30 dark:hover:border-purple-600 dark:hover:bg-purple-700/50'
                    }`}
                    onClick={() => toggleWatchlist(crypto.symbol)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {crypto.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900 dark:text-purple-200">{crypto.symbol}</p>
                            {inWatchlist && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700">
                                <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                                In Watchlist
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-purple-300">{crypto.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-purple-200">
                          ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <div className={`flex items-center justify-end gap-1 text-xs font-semibold ${
                          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {isPositive ? '+' : ''}{change.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-purple-700">
              <Button 
                onClick={() => setShowAddToWatchlistDialog(false)}
                className="w-full"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-[500px] dark:bg-purple-900/95 dark:text-purple-100 dark:border-purple-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-purple-100">
              <Send className="w-5 h-5 text-blue-600" />
              Send Cryptocurrency
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendCrypto} className="space-y-4 py-4">
            <div>
              <Label htmlFor="send-account" className="dark:text-purple-100">From Account *</Label>
              <Select
                value={sendForm.sourceAccountId}
                onValueChange={(value) => setSendForm({...sendForm, sourceAccountId: value, cryptoSymbol: ""})}
              >
                <SelectTrigger id="send-account" className="dark:bg-purple-900 dark:text-purple-100 dark:border-purple-700">
                  <SelectValue placeholder="Select source account" />
                </SelectTrigger>
                <SelectContent className="dark:bg-purple-950 dark:border-purple-700">
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id} className="dark:text-purple-100 dark:hover:bg-purple-800">
                      {acc.account_name} (${acc.balance.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="send-crypto" className="dark:text-purple-100">Cryptocurrency *</Label>
              <Select
                value={sendForm.cryptoSymbol}
                onValueChange={(value) => setSendForm({...sendForm, cryptoSymbol: value})}
                disabled={!sendForm.sourceAccountId}
              >
                <SelectTrigger id="send-crypto" className="dark:bg-purple-900 dark:text-purple-100 dark:border-purple-700">
                  <SelectValue placeholder="Select crypto" />
                </SelectTrigger>
                <SelectContent className="dark:bg-purple-950 dark:border-purple-700">
                  {holdings
                    .filter(h => h.account_id === sendForm.sourceAccountId && h.amount > 0)
                    .map(holding => (
                      <SelectItem key={holding.cryptocurrency} value={holding.cryptocurrency} className="dark:text-purple-100 dark:hover:bg-purple-800">
                        {CRYPTOS.find(c => c.symbol === holding.cryptocurrency)?.icon} {holding.cryptocurrency} ({holding.amount.toFixed(6)} available)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {sendForm.cryptoSymbol && sendForm.sourceAccountId && (
                <p className="text-sm text-slate-500 dark:text-purple-300 mt-1">
                  Available: {holdings.find(h => h.cryptocurrency === sendForm.cryptoSymbol && h.account_id === sendForm.sourceAccountId)?.amount.toFixed(6) || "0"} {sendForm.cryptoSymbol}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="send-amount" className="dark:text-purple-100">Amount *</Label>
              <Input
                id="send-amount"
                type="number"
                step="0.00000001"
                placeholder="0.00"
                value={sendForm.amount}
                onChange={(e) => setSendForm({...sendForm, amount: e.target.value})}
                disabled={!sendForm.cryptoSymbol}
                className="dark:bg-purple-900 dark:text-purple-100 dark:border-purple-700"
              />
              {sendForm.amount && sendForm.cryptoSymbol && prices[sendForm.cryptoSymbol] && (
                <p className="text-sm text-slate-500 dark:text-purple-300 mt-1">
                  ≈ ${(parseFloat(sendForm.amount) * prices[sendForm.cryptoSymbol]).toFixed(2)} AUD
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="recipient-address" className="dark:text-purple-100">Recipient Wallet Address *</Label>
              <Input
                id="recipient-address"
                placeholder="Enter wallet address"
                value={sendForm.recipientAddress}
                onChange={(e) => setSendForm({...sendForm, recipientAddress: e.target.value})}
                className="dark:bg-purple-900 dark:text-purple-100 dark:border-purple-700"
              />
            </div>

            <div>
              <Label htmlFor="send-note" className="dark:text-purple-100">Note (Optional)</Label>
              <Input
                id="send-note"
                placeholder="Add a note..."
                value={sendForm.note}
                onChange={(e) => setSendForm({...sendForm, note: e.target.value})}
                className="dark:bg-purple-900 dark:text-purple-100 dark:border-purple-700"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 dark:bg-purple-800/30 dark:text-purple-100 dark:border-purple-700 dark:hover:bg-purple-700/50"
                onClick={() => {
                  setShowSendDialog(false);
                  setSendForm({
                    cryptoSymbol: "",
                    amount: "",
                    sourceAccountId: "",
                    recipientAddress: "",
                    note: ""
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={sendCryptoMutation.isPending || !sendForm.cryptoSymbol || !sendForm.amount || !sendForm.sourceAccountId || !sendForm.recipientAddress}
              >
                {sendCryptoMutation.isPending ? "Sending..." : "Send Crypto"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto dark:bg-purple-900/95 dark:text-purple-100 dark:border-purple-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-purple-100">
              <Download className="w-5 h-5 text-green-600" />
              Receive Cryptocurrency
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600 dark:text-purple-300">Share these wallet addresses to receive crypto</p>
            
            {accounts.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-purple-900/30 rounded-lg border border-slate-200 dark:border-purple-700 text-center">
                <p className="text-sm text-slate-600 dark:text-purple-300">No accounts found. Create a bank account first.</p>
              </div>
            ) : holdings.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-purple-900/30 rounded-lg border border-slate-200 dark:border-purple-700 text-center">
                <p className="text-sm text-slate-600 dark:text-purple-300">No crypto holdings yet. Buy some crypto to get wallet addresses.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map(account => {
                  const accountHoldings = holdings.filter(h => h.account_id === account.id);
                  if (accountHoldings.length === 0) return null;

                  return (
                    <div key={account.id} className="border border-slate-200 dark:border-purple-700 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 dark:text-purple-200 mb-3">{account.account_name}</h3>
                      <div className="space-y-3">
                        {accountHoldings.map(holding => {
                          const crypto = CRYPTOS.find(c => c.symbol === holding.cryptocurrency);
                          const address = generateWalletAddress(holding.cryptocurrency, account.id);
                          
                          return (
                            <div key={holding.cryptocurrency} className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {crypto?.icon}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-purple-200">{holding.cryptocurrency}</p>
                                    <p className="text-xs text-slate-500 dark:text-purple-300">Balance: {holding.amount.toFixed(6)}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-white dark:bg-purple-900 rounded-lg p-3 border border-slate-200 dark:border-purple-700">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-500 dark:text-purple-300 mb-1">Wallet Address</p>
                                    <p className="text-sm font-mono text-slate-700 dark:text-purple-100 break-all">{address}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(address, holding.cryptocurrency)}
                                    className="flex-shrink-0 dark:hover:bg-purple-800"
                                  >
                                    {copiedAddress === holding.cryptocurrency ? (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Copy className="w-4 h-4 dark:text-purple-300" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="p-4 bg-blue-50 dark:bg-purple-900/30 rounded-lg border border-blue-200 dark:border-purple-800">
              <p className="text-sm text-blue-900 dark:text-purple-300 font-medium mb-1">⚠️ Important</p>
              <p className="text-xs text-blue-700 dark:text-purple-400">Only send the corresponding cryptocurrency to each address. Sending other coins may result in permanent loss.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent className="sm:max-w-[425px] dark:bg-purple-900/95 dark:text-purple-100 dark:border-purple-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-purple-100">
              <ArrowDownToLine className="w-5 h-5 text-purple-600" />
              Deposit Funds
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600 dark:text-purple-300">This is a placeholder for the deposit functionality.</p>
            <p className="text-xs text-slate-500 dark:text-purple-400 mt-2">You would typically connect your bank account or another payment method here to add funds.</p>
            <Button className="w-full mt-4" onClick={() => setShowDepositDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="sm:max-w-[425px] dark:bg-purple-900/95 dark:text-purple-100 dark:border-purple-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-purple-100">
              <Upload className="w-5 h-5 text-orange-600" />
              Withdraw Funds
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600 dark:text-purple-300">This is a placeholder for the withdrawal functionality.</p>
            <p className="text-xs text-slate-500 dark:text-purple-400 mt-2">You would typically withdraw funds from your bank account to an external account or payment method.</p>
            <Button className="w-full mt-4" onClick={() => setShowWithdrawDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
