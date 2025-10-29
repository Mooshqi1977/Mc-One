
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Eye, EyeOff, Copy, Apple, Smartphone, RotateCw, Lock, Unlock, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

// Generate unique random card number starting with 4
const generateCardNumber = (accountId, accountNumber) => {
  const combined = (accountId + accountNumber).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const seed = Math.abs(combined);
  
  let cardNumber = '4';
  for (let i = 0; i < 15; i++) {
    const digit = Math.floor(((seed + i * 7919) * 9973 + 49297 * (i + 1)) % 233280 / 233280 * 10);
    cardNumber += digit;
  }
  
  return cardNumber;
};

// Generate unique random CVV
const generateCVV = (accountId, accountNumber) => {
  const combined = (accountId + accountNumber + 'cvv').split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const cvv = Math.abs(combined) % 900 + 100;
  return cvv.toString();
};

export default function VirtualCard({ account }) {
  const [showDetails, setShowDetails] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [user, setUser] = useState(null);
  const [cardSettings, setCardSettings] = useState({
    isActivated: false,
    activationDigits: '',
    pin: '',
    newPin: '',
    confirmPin: '',
    dailyWithdrawLimit: 500,
    gamblingLimit: 100,
    isLocked: false,
    contactlessEnabled: true,
    internationalEnabled: true,
    onlineEnabled: true
  });
  
  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);
  
  const cardNumber = generateCardNumber(account.id, account.account_number);
  const maskedCardNumber = showDetails 
    ? cardNumber.match(/.{1,4}/g)?.join(' ') || '•••• •••• •••• ••••'
    : '•••• •••• •••• ' + cardNumber.slice(-4);
  
  const cvv = showDetails ? generateCVV(account.id, account.account_number) : '•••';
  const expiryDate = '12/28';
  const lastFourDigits = cardNumber.slice(-4);
  
  const cardGradients = {
    checking: 'from-blue-500 via-blue-600 to-indigo-600',
    savings: 'from-green-500 via-emerald-600 to-teal-600',
    investment: 'from-slate-700 via-slate-800 to-slate-900'
  };

  const cardTypes = {
    checking: 'Virtual Card',
    savings: 'Debit Card',
    investment: 'Credit Card'
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleActivateCard = () => {
    if (cardSettings.activationDigits === lastFourDigits) {
      setCardSettings({ ...cardSettings, isActivated: true, activationDigits: '' });
      toast.success('Card activated successfully!');
    } else {
      toast.error('Incorrect digits. Please enter the last 4 digits from the back of the card.');
    }
  };

  const handleChangePin = () => {
    if (cardSettings.newPin.length < 4 || cardSettings.newPin.length > 6) {
      toast.error('PIN must be between 4 and 6 digits');
      return;
    }
    if (cardSettings.newPin !== cardSettings.confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    setCardSettings({ ...cardSettings, pin: cardSettings.newPin, newPin: '', confirmPin: '' });
    toast.success('PIN changed successfully!');
  };

  const handleReportCard = (type) => {
    toast.success(`${type} card reported. A new card will be ordered and shipped to you.`, {
      action: {
        label: 'Track Order',
        onClick: () => toast.info('Order tracking coming soon')
      }
    });
  };

  return (
    <div className="space-y-4">
      <motion.div
        className="relative cursor-pointer"
        style={{ perspective: 1000 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Card Front */}
          <div 
            className={`${isFlipped ? 'hidden' : 'block'}`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className={`bg-gradient-to-br ${cardGradients[account.account_type]} rounded-2xl p-6 md:p-8 shadow-2xl aspect-[1.586/1] w-full max-w-[400px] text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 text-xs mb-1">{cardTypes[account.account_type]}</p>
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                      {account.account_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Smartphone className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-white/70 text-xs mb-2">Card Number</p>
                    <p className="text-2xl md:text-3xl font-mono tracking-wider">{maskedCardNumber}</p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-white/70 text-xs mb-1">Cardholder</p>
                      <p className="text-sm md:text-base font-medium">
                        {user?.full_name?.toUpperCase() || 'CARDHOLDER NAME'}
                      </p>
                    </div>

                    <div className="flex gap-6">
                      <div>
                        <p className="text-white/70 text-xs mb-1">Expires</p>
                        <p className="text-sm md:text-base font-mono">{expiryDate}</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-xs mb-1">CVV</p>
                        <p className="text-sm md:text-base font-mono">{cvv}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="text-xs text-white/60">
                    {account.swift_bic && <p>SWIFT: {account.swift_bic}</p>}
                    {account.bsb && <p>BSB: {account.bsb}</p>}
                  </div>
                  <div className="flex gap-1">
                    <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-full" />
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full -ml-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Back - Management Options */}
          <div 
            className={`${!isFlipped ? 'hidden' : 'block'}`}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-6 shadow-2xl w-full max-w-[400px] border-2 border-blue-300 dark:border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-lg">Card Management</h3>
                  <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                    Last 4: {lastFourDigits}
                  </Badge>
                </div>

                {/* Card Activation */}
                {!cardSettings.isActivated && (
                  <div className="p-3 bg-yellow-100/90 dark:bg-yellow-900/40 rounded-lg border border-yellow-300 dark:border-yellow-700">
                    <Label className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2 block">Activate Card</Label>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-2">Enter the last 4 digits from the back of your card</p>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        maxLength="4"
                        placeholder="Last 4 digits"
                        value={cardSettings.activationDigits}
                        onChange={(e) => setCardSettings({...cardSettings, activationDigits: e.target.value.replace(/\D/g, '')})}
                        className="text-sm h-9 bg-white/90 dark:bg-slate-700 dark:text-white"
                      />
                      <Button size="sm" onClick={handleActivateCard} className="h-9 px-4">
                        Activate
                      </Button>
                    </div>
                  </div>
                )}

                {/* Change PIN */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-white">Change PIN</Label>
                  <Input
                    type="password"
                    maxLength="6"
                    placeholder="New PIN (4-6 digits)"
                    value={cardSettings.newPin}
                    onChange={(e) => setCardSettings({...cardSettings, newPin: e.target.value.replace(/\D/g, '')})}
                    className="h-10 bg-white/90 dark:bg-slate-700 dark:text-white placeholder:text-slate-500"
                  />
                  <Input
                    type="password"
                    maxLength="6"
                    placeholder="Confirm PIN"
                    value={cardSettings.confirmPin}
                    onChange={(e) => setCardSettings({...cardSettings, confirmPin: e.target.value.replace(/\D/g, '')})}
                    className="h-10 bg-white/90 dark:bg-slate-700 dark:text-white placeholder:text-slate-500"
                  />
                  <Button size="sm" onClick={handleChangePin} className="w-full h-10 bg-white/90 hover:bg-white text-purple-700 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">
                    Update PIN
                  </Button>
                </div>

                {/* Daily Withdraw Limit */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm font-semibold text-white">Daily Withdraw Limit</Label>
                    <span className="text-sm font-bold text-white">${cardSettings.dailyWithdrawLimit}</span>
                  </div>
                  <Slider
                    value={[cardSettings.dailyWithdrawLimit]}
                    onValueChange={(value) => setCardSettings({...cardSettings, dailyWithdrawLimit: value[0]})}
                    min={100}
                    max={2000}
                    step={50}
                    className="w-full [&>span:first-child]:h-2 [&>span:first-child]:bg-white/30 [&>span:first-child>span]:bg-white [&>span:first-child>span]:ring-white"
                  />
                </div>

                {/* Gambling Limit */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm font-semibold text-white">Gambling Payments Limit</Label>
                    <span className="text-sm font-bold text-white">${cardSettings.gamblingLimit}</span>
                  </div>
                  <Slider
                    value={[cardSettings.gamblingLimit]}
                    onValueChange={(value) => setCardSettings({...cardSettings, gamblingLimit: value[0]})}
                    min={100}
                    max={2000}
                    step={50}
                    className="w-full [&>span:first-child]:h-2 [&>span:first-child]:bg-white/30 [&>span:first-child>span]:bg-white [&>span:first-child>span]:ring-white"
                  />
                </div>

                {/* Toggle Options */}
                <div className="space-y-3 pt-2 border-t-2 border-white/30">
                  <Label className="text-sm font-semibold text-white block">Card Controls</Label>
                  
                  <div className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      {cardSettings.isLocked ? <Lock className="w-4 h-4 text-white" /> : <Unlock className="w-4 h-4 text-white" />}
                      <Label className="text-sm text-white font-medium">Lock Card Temporarily</Label>
                    </div>
                    <Switch
                      checked={cardSettings.isLocked}
                      onCheckedChange={(checked) => {
                        setCardSettings({...cardSettings, isLocked: checked});
                        toast.success(checked ? 'Card locked' : 'Card unlocked');
                      }}
                      className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
                    <Label className="text-sm text-white font-medium">Contactless Card Payment</Label>
                    <Switch
                      checked={cardSettings.contactlessEnabled}
                      onCheckedChange={(checked) => setCardSettings({...cardSettings, contactlessEnabled: checked})}
                      className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
                    <Label className="text-sm text-white font-medium">In-Store International Payments</Label>
                    <Switch
                      checked={cardSettings.internationalEnabled}
                      onCheckedChange={(checked) => setCardSettings({...cardSettings, internationalEnabled: checked})}
                      className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
                    <Label className="text-sm text-white font-medium">Online Payments</Label>
                    <Switch
                      checked={cardSettings.onlineEnabled}
                      onCheckedChange={(checked) => setCardSettings({...cardSettings, onlineEnabled: checked})}
                      className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                    />
                  </div>
                </div>

                {/* Report Card */}
                <div className="pt-2 border-t-2 border-white/30">
                  <Label className="text-sm font-semibold text-white mb-2 block">Report Card Issue</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="h-10 text-sm bg-red-500 hover:bg-red-600"
                      onClick={() => handleReportCard('Lost')}
                    >
                      Lost
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="h-10 text-sm bg-red-500 hover:bg-red-600"
                      onClick={() => handleReportCard('Stolen')}
                    >
                      Stolen
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-10 text-sm bg-white/90 hover:bg-white text-purple-700 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                      onClick={() => handleReportCard('Damaged')}
                    >
                      Damaged
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Card Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-2"
        >
          <RotateCw className="w-4 h-4" />
          {isFlipped ? 'Show Card' : 'Manage Card'}
        </Button>

        {!isFlipped && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2"
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
            
            {showDetails && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(cardNumber, 'Card number')}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Number
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateCVV(account.id, account.account_number), 'CVV')}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy CVV
                </Button>
              </>
            )}
          </>
        )}
      </div>

      {/* Wallet Integration */}
      {!isFlipped && (
        <div className="border-t border-slate-200 pt-4">
          <p className="text-sm font-medium text-slate-700 mb-3">Add to Wallet</p>
          <div className="flex gap-3">
            <Button
              onClick={() => toast.info('Apple Wallet integration coming soon')}
              className="flex-1 bg-black hover:bg-gray-900 text-white"
            >
              <Apple className="w-5 h-5 mr-2" />
              Apple Wallet
            </Button>
            <Button
              onClick={() => toast.info('Google Pay integration coming soon')}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/>
                <path d="M12 2v10l7.07-7.07C17.09 3.27 14.68 2 12 2z" fill="#34A853"/>
                <path d="M12 12l7.07 7.07C20.73 17.09 22 14.68 22 12H12z" fill="#FBBC04"/>
                <path d="M12 12v10c2.68 0 5.09-1.27 7.07-3.27L12 12z" fill="#EA4335"/>
              </svg>
              Google Pay
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
