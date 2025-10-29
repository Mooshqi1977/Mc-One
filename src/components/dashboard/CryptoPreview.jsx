
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const CRYPTOS = [
  { symbol: "BTC", icon: "₿", name: "Bitcoin" },
  { symbol: "ETH", icon: "Ξ", name: "Ethereum" },
  { symbol: "USDT", icon: "₮", name: "Tether" },
  { symbol: "BNB", icon: "BNB", name: "Binance Coin" },
  { symbol: "SOL", icon: "◎", name: "Solana" },
  { symbol: "ADA", icon: "₳", name: "Cardano" },
  { symbol: "XRP", icon: "✕", name: "XRP" },
  { symbol: "DOT", icon: "●", name: "Polkadot" }
];

export default function CryptoPreview({ holdings, isLoading }) {
  return (
    <Card className="border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-purple-200">
            Crypto Holdings
          </CardTitle>
          <Link to={createPageUrl("CryptoExchange")}>
            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-purple-300 dark:hover:bg-purple-800/30 dark:hover:text-purple-200">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : holdings.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 mx-auto text-slate-300 dark:text-purple-600 mb-2" />
            <p className="text-slate-500 dark:text-purple-300 mb-3">No crypto holdings yet</p>
            <Link to={createPageUrl("CryptoExchange")}>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                Buy Crypto
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {holdings.slice(0, 5).map((holding) => {
              const crypto = CRYPTOS.find(c => c.symbol === holding.cryptocurrency);
              return (
                <div
                  key={holding.id}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-purple-800/30 rounded-lg transition-colors border border-slate-100 dark:border-purple-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {crypto?.icon || holding.cryptocurrency.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-purple-200">{holding.cryptocurrency}</p>
                      <p className="text-xs text-slate-500 dark:text-purple-300">
                        {holding.amount.toFixed(6)} coins
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-purple-200">
                      ${(holding.amount * holding.purchase_price_usd).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-purple-300">
                      @${holding.purchase_price_usd.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
