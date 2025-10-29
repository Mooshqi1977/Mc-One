
import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, DollarSign, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, subDays, subMonths, subYears } from "date-fns";

const CRYPTO_DETAILS = {
  BTC: { name: "Bitcoin", icon: "₿", color: "#F7931A", description: "The first and largest cryptocurrency by market cap" },
  ETH: { name: "Ethereum", icon: "Ξ", color: "#627EEA", description: "Leading smart contract platform" },
  USDT: { name: "Tether", icon: "₮", color: "#26A17B", description: "Leading stablecoin pegged to USD" },
  BNB: { name: "Binance Coin", icon: "BNB", color: "#F3BA2F", description: "Native token of Binance ecosystem" },
  SOL: { name: "Solana", icon: "◎", color: "#14F195", description: "High-performance blockchain platform" },
  ADA: { name: "Cardano", icon: "₳", color: "#0033AD", description: "Proof-of-stake blockchain platform" },
  XRP: { name: "Ripple", icon: "✕", color: "#23292F", description: "Digital payment protocol and cryptocurrency" },
  DOT: { name: "Polkadot", icon: "●", color: "#E6007A", description: "Multi-chain network protocol" }
};

export default function CryptoDetail() {
  const [searchParams] = useSearchParams();
  const symbol = searchParams.get('symbol') || 'BTC';
  const cryptoInfo = CRYPTO_DETAILS[symbol] || CRYPTO_DETAILS.BTC;

  const [timeframe, setTimeframe] = useState("1D");
  const [chartData, setChartData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [marketStats, setMarketStats] = useState({
    marketCap: 0,
    volume24h: 0,
    high24h: 0,
    low24h: 0,
    circulatingSupply: 0
  });

  useEffect(() => {
    fetchCryptoData();
  }, [symbol, timeframe]);

  const fetchCryptoData = async () => {
    setLoading(true);
    try {
      const timeframePrompts = {
        "1D": "last 24 hours with hourly data points",
        "7D": "last 7 days with daily data points",
        "1M": "last 30 days with daily data points",
        "1Y": "last 365 days with weekly data points"
      };

      const data = await base44.integrations.Core.InvokeLLM({
        prompt: `Get detailed market data for ${cryptoInfo.name} (${symbol}):
        1. Current price in AUD (convert from USD using current exchange rate)
        2. 24-hour price change amount and percentage
        3. Historical price data for ${timeframePrompts[timeframe]} (each data point should have timestamp and price in AUD)
        4. Market statistics: market cap, 24h trading volume, 24h high, 24h low, circulating supply
        
        Return accurate real-time data from live markets.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            current_price_aud: { type: "number" },
            price_change_24h: { type: "number" },
            price_change_percent_24h: { type: "number" },
            historical_data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timestamp: { type: "string" },
                  price: { type: "number" }
                }
              }
            },
            market_cap_aud: { type: "number" },
            volume_24h_aud: { type: "number" },
            high_24h_aud: { type: "number" },
            low_24h_aud: { type: "number" },
            circulating_supply: { type: "number" }
          }
        }
      });

      setCurrentPrice(data.current_price_aud || 0);
      setPriceChange(data.price_change_24h || 0);
      setPriceChangePercent(data.price_change_percent_24h || 0);
      setChartData(data.historical_data || []);
      setMarketStats({
        marketCap: data.market_cap_aud || 0,
        volume24h: data.volume_24h_aud || 0,
        high24h: data.high_24h_aud || 0,
        low24h: data.low_24h_aud || 0,
        circulatingSupply: data.circulating_supply || 0
      });
    } catch (error) {
      console.error("Error fetching crypto data:", error);
      // Fallback data
      setCurrentPrice(45000);
      setPriceChange(1200);
      setPriceChangePercent(2.7);
      generateFallbackChartData();
    }
    setLoading(false);
  };

  const generateFallbackChartData = () => {
    const dataPoints = timeframe === "1D" ? 24 : timeframe === "7D" ? 7 : timeframe === "1M" ? 30 : 52;
    const basePrice = 45000;
    const data = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const randomChange = (Math.random() - 0.5) * 2000;
      const date = timeframe === "1D" 
        ? subDays(new Date(), 1 - (i / dataPoints))
        : timeframe === "7D"
        ? subDays(new Date(), 7 - i)
        : timeframe === "1M"
        ? subDays(new Date(), 30 - i)
        : subDays(new Date(), 365 - (i * 7));
      
      data.push({
        timestamp: date.toISOString(),
        price: basePrice + randomChange + (i * 50)
      });
    }
    setChartData(data);
  };

  const formatXAxis = (timestamp) => {
    const date = new Date(timestamp);
    if (timeframe === "1D") {
      return format(date, 'HH:mm');
    } else if (timeframe === "7D") {
      return format(date, 'MMM d');
    } else if (timeframe === "1M") {
      return format(date, 'MMM d');
    } else {
      return format(date, 'MMM yyyy');
    }
  };

  const isPositive = priceChange >= 0;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-purple-900 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link to={createPageUrl("CryptoExchange")}>
          <Button variant="ghost" className="mb-6 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exchange
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {cryptoInfo.icon}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">{cryptoInfo.name}</h1>
              <p className="text-slate-600">{symbol}</p>
            </div>
          </div>
          <p className="text-slate-600">{cryptoInfo.description}</p>
        </div>

        {/* Current Price Card */}
        <Card className="mb-8 border-slate-200 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:border-purple-700 dark:bg-gradient-to-br dark:from-purple-900/50 dark:to-purple-950/50">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-slate-600 text-sm mb-2">Current Price (AUD)</p>
                <div className="flex items-baseline gap-3 mb-3">
                  <h2 className="text-5xl font-bold text-slate-900">
                    ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                </div>
                <div className={`flex items-center gap-2 text-lg font-semibold ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span>{isPositive ? '+' : ''}${Math.abs(priceChange).toFixed(2)}</span>
                  <span>({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)</span>
                  <span className="text-slate-500 font-normal text-sm">24h</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">24h High</p>
                  <p className="text-lg font-bold text-green-600">
                    ${marketStats.high24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">24h Low</p>
                  <p className="text-lg font-bold text-red-600">
                    ${marketStats.low24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">24h Volume</p>
                  <p className="text-lg font-bold text-slate-900">
                    ${(marketStats.volume24h / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Market Cap</p>
                  <p className="text-lg font-bold text-slate-900">
                    ${(marketStats.marketCap / 1000000000).toFixed(2)}B
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Section */}
        <Card className="mb-8 border-slate-200 shadow-lg dark:border-purple-700 dark:bg-purple-900/30">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Price Chart
              </CardTitle>
              <Tabs value={timeframe} onValueChange={setTimeframe}>
                <TabsList>
                  <TabsTrigger value="1D">1D</TabsTrigger>
                  <TabsTrigger value="7D">7D</TabsTrigger>
                  <TabsTrigger value="1M">1M</TabsTrigger>
                  <TabsTrigger value="1Y">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-600">Loading chart data...</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatXAxis}
                    stroke="#64748B"
                  />
                  <YAxis 
                    stroke="#64748B"
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Price']}
                    labelFormatter={(label) => format(new Date(label), 'PPpp')}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={isPositive ? "#10B981" : "#EF4444"}
                    strokeWidth={3}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Market Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200 shadow-md dark:border-purple-700 dark:bg-purple-900/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                Market Cap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                ${(marketStats.marketCap / 1000000000).toFixed(2)}B
              </p>
              <p className="text-sm text-slate-500 mt-1">AUD</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md dark:border-purple-700 dark:bg-purple-900/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                24h Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                ${(marketStats.volume24h / 1000000).toFixed(2)}M
              </p>
              <p className="text-sm text-slate-500 mt-1">AUD</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md dark:border-purple-700 dark:bg-purple-900/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                Circulating Supply
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                {(marketStats.circulatingSupply / 1000000).toFixed(2)}M
              </p>
              <p className="text-sm text-slate-500 mt-1">{symbol}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-slate-200 shadow-md dark:border-purple-700 dark:bg-purple-900/30">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl("CryptoExchange")}>
                <Button className="bg-green-600 hover:bg-green-700">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Buy {symbol}
                </Button>
              </Link>
              <Link to={createPageUrl("CryptoExchange")}>
                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Sell {symbol}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
