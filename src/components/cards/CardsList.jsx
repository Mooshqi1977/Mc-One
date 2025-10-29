import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";
import VirtualCard from './VirtualCard';

export default function CardsList({ accounts, onCreateCard }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Virtual Cards</h2>
          <p className="text-slate-600 mt-1">Manage your digital payment cards</p>
        </div>
        <Button onClick={onCreateCard} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Request Card
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 text-center">
              No accounts found. Create a bank account to get a virtual card.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {accounts.map((account) => (
            <Card key={account.id} className="border-slate-200 shadow-md overflow-visible">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{account.account_name}</span>
                  <span className="text-sm font-normal text-slate-500">
                    ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VirtualCard account={account} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}