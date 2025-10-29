
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Copy, Apple, CreditCard as CreditCardIcon, Lock, Unlock, AlertCircle, Wrench, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CreditCardComponent({ card }) {
  const [showDetails, setShowDetails] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [user, setUser] = useState(null);
  const [cardSettings, setCardSettings] = useState({
    isActivated: false,
    activationDigits: '',
    pin: '1234', // Placeholder, ideally fetched or set securely
    newPin: '',
    confirmPin: '',
    dailyWithdrawLimit: 500, // Example default
    gamblingLimit: 100, // Example default
    isLocked: false,
    contactlessEnabled: true,
    internationalEnabled: true,
    onlineEnabled: true
  });
  
  useEffect(() => {
    // Fetch user details when the component mounts
    base44.auth.me().then(setUser).catch(() => {
      // Optionally handle error, e.g., if user is not authenticated
      console.error("Failed to fetch user details.");
    });
    // For a real app, you would fetch actual card settings here
    // For this demo, we'll initialize with some defaults or placeholder values
    setCardSettings(prev => ({
      ...prev,
      isActivated: true, // Assume card is activated for demo purposes initially
      dailyWithdrawLimit: 500,
      gamblingLimit: 100,
      isLocked: false,
      contactlessEnabled: true,
      internationalEnabled: true,
      onlineEnabled: true
    }));
  }, []); // Empty dependency array means this runs once on mount
  
  // Use the card number stored in the database (already starts with 4 and is unique)
  const maskedCardNumber = showDetails 
    ? card.card_number.match(/.{1,4}/g)?.join(' ') || '•••• •••• •••• ••••'
    : '•••• •••• •••• ' + card.card_number.slice(-4);
  
  const cvv = showDetails ? card.cvv : '•••';
  const lastFourDigits = card.card_number.slice(-4);
  
  const cardGradients = {
    platinum: 'from-slate-700 via-slate-800 to-slate-900',
    gold: 'from-yellow-500 via-amber-600 to-yellow-700',
    standard: 'from-red-500 via-rose-600 to-pink-600'
  };

  const availableCredit = card.credit_limit - card.current_balance;
  const usagePercentage = (card.current_balance / card.credit_limit) * 100;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const addToAppleWallet = () => {
    toast.info('Apple Wallet integration coming soon');
  };

  const addToGooglePay = () => {
    toast.info('Google Pay integration coming soon');
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
          transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Card Front */}
          <div 
            className={`${isFlipped ? 'invisible' : 'visible'} absolute w-full`} // Use invisible/visible to keep it in flow for layout calc
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className={`bg-gradient-to-br ${cardGradients[card.card_type]} rounded-2xl p-6 md:p-8 shadow-2xl aspect-[1.586/1] w-full max-w-[400px] text-white relative overflow-hidden`}>
              {/* Card Design Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                {/* Card Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 text-xs mb-1">Credit Card</p>
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30 capitalize">
                      {card.card_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <CreditCardIcon className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Card Number */}
                <div className="space-y-4">
                  <div>
                    <p className="text-white/70 text-xs mb-2">Card Number</p>
                    <p className="text-2xl md:text-3xl font-mono tracking-wider">
                      {maskedCardNumber}
                    </p>
                  </div>

                  <div className="flex justify-between items-end">
                    {/* Cardholder Name */}
                    <div>
                      <p className="text-white/70 text-xs mb-1">Cardholder</p>
                      {/* Display user's full name from the fetched user data, or a placeholder */}
                      <p className="text-sm md:text-base font-medium">
                        {user?.full_name?.toUpperCase() || 'CARDHOLDER NAME'}
                      </p>
                    </div>

                    {/* Expiry & CVV */}
                    <div className="flex gap-6">
                      <div>
                        <p className="text-white/70 text-xs mb-1">Expires</p>
                        <p className="text-sm md:text-base font-mono">{card.expiry_date}</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-xs mb-1">CVV</p>
                        <p className="text-sm md:text-base font-mono">{cvv}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex justify-between items-end">
                  <div className="text-xs text-white/80">
                    <p className="font-semibold">Available Credit</p>
                    <p className="text-lg font-bold">${availableCredit.toLocaleString()}</p>
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
            className={`${!isFlipped ? 'invisible' : 'visible'} w-full`} // Use invisible/visible to keep it in flow for layout calc
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="bg-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl aspect-[1.586/1] w-full max-w-[400px] text-slate-50 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10 h-full flex flex-col space-y-4 overflow-y-auto pr-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">Card Management</h3>
                  <div className="text-sm text-slate-300">Last 4: {lastFourDigits}</div>
                </div>

                {/* Card Activation */}
                {!cardSettings.isActivated && (
                  <div className="bg-slate-800 p-3 rounded-md space-y-2">
                    <p className="text-sm font-medium text-red-400">Activate Your Card</p>
                    <Label htmlFor="activation-digits" className="sr-only">Activation Digits</Label>
                    <Input
                      id="activation-digits"
                      type="text"
                      placeholder="Enter last 4 digits on back of card"
                      value={cardSettings.activationDigits}
                      onChange={(e) => setCardSettings({ ...cardSettings, activationDigits: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      className="bg-slate-900 border-slate-600 text-white placeholder-slate-400"
                    />
                    <Button onClick={handleActivateCard} className="w-full bg-blue-600 hover:bg-blue-700">Activate Card</Button>
                  </div>
                )}

                {/* PIN Management */}
                <div className="bg-slate-800 p-3 rounded-md space-y-2">
                  <p className="text-sm font-medium">Change PIN</p>
                  <Input
                    type="password"
                    placeholder="New PIN (4-6 digits)"
                    value={cardSettings.newPin}
                    onChange={(e) => setCardSettings({ ...cardSettings, newPin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className="bg-slate-900 border-slate-600 text-white placeholder-slate-400"
                  />
                  <Input
                    type="password"
                    placeholder="Confirm New PIN"
                    value={cardSettings.confirmPin}
                    onChange={(e) => setCardSettings({ ...cardSettings, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className="bg-slate-900 border-slate-600 text-white placeholder-slate-400"
                  />
                  <Button onClick={handleChangePin} className="w-full bg-green-600 hover:bg-green-700">Update PIN</Button>
                </div>

                {/* Spending Limits */}
                <div className="bg-slate-800 p-3 rounded-md space-y-3">
                  <p className="text-sm font-medium">Spending Limits</p>
                  <div>
                    <Label className="flex justify-between items-center text-slate-300 text-xs">
                      Daily Withdraw Limit: <span className="font-semibold">${cardSettings.dailyWithdrawLimit.toLocaleString()}</span>
                    </Label>
                    <Slider
                      defaultValue={[cardSettings.dailyWithdrawLimit]}
                      max={2000}
                      step={50}
                      onValueChange={(val) => setCardSettings({ ...cardSettings, dailyWithdrawLimit: val[0] })}
                      className="[&>span:first-child]:h-2 [&>span:first-child]:bg-slate-600 [&>span:first-child>span]:bg-blue-500 [&>span:first-child>span]:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="flex justify-between items-center text-slate-300 text-xs">
                      Gambling Limit: <span className="font-semibold">${cardSettings.gamblingLimit.toLocaleString()}</span>
                    </Label>
                    <Slider
                      defaultValue={[cardSettings.gamblingLimit]}
                      max={1000}
                      step={25}
                      onValueChange={(val) => setCardSettings({ ...cardSettings, gamblingLimit: val[0] })}
                      className="[&>span:first-child]:h-2 [&>span:first-child]:bg-slate-600 [&>span:first-child>span]:bg-blue-500 [&>span:first-child>span]:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Card Controls */}
                <div className="bg-slate-800 p-3 rounded-md space-y-3">
                  <p className="text-sm font-medium">Card Controls</p>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contactless-mode" className="text-slate-300">Contactless Payments</Label>
                    <Switch
                      id="contactless-mode"
                      checked={cardSettings.contactlessEnabled}
                      onCheckedChange={(checked) => setCardSettings({ ...cardSettings, contactlessEnabled: checked })}
                      className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="international-mode" className="text-slate-300">International Usage</Label>
                    <Switch
                      id="international-mode"
                      checked={cardSettings.internationalEnabled}
                      onCheckedChange={(checked) => setCardSettings({ ...cardSettings, internationalEnabled: checked })}
                      className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="online-mode" className="text-slate-300">Online Transactions</Label>
                    <Switch
                      id="online-mode"
                      checked={cardSettings.onlineEnabled}
                      onCheckedChange={(checked) => setCardSettings({ ...cardSettings, onlineEnabled: checked })}
                      className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-600"
                    />
                  </div>
                </div>

                {/* Card Actions */}
                <div className="bg-slate-800 p-3 rounded-md space-y-2">
                  <p className="text-sm font-medium">Card Actions</p>
                  <Button
                    onClick={() => setCardSettings({ ...cardSettings, isLocked: !cardSettings.isLocked })}
                    className={`w-full ${cardSettings.isLocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {cardSettings.isLocked ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                    {cardSettings.isLocked ? 'Unlock Card' : 'Lock Card'}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full bg-orange-600 hover:bg-orange-700">
                        <AlertCircle className="w-4 h-4 mr-2" /> Report Card
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white text-gray-900">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Report Card Issue</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to report this card? Please select the issue type. A new card will be ordered.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" onClick={() => handleReportCard('Lost')}>
                          <AlertCircle className="w-4 h-4 mr-2" /> Lost
                        </Button>
                        <Button variant="outline" onClick={() => handleReportCard('Stolen')}>
                          <AlertCircle className="w-4 h-4 mr-2" /> Stolen
                        </Button>
                        <Button variant="outline" onClick={() => handleReportCard('Damaged')}>
                          <Wrench className="w-4 h-4 mr-2" /> Damaged
                        </Button>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Credit Usage */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Credit Usage</span>
          <span className="font-semibold text-slate-900">{usagePercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-xs text-slate-500">Credit Limit</p>
            <p className="font-semibold text-slate-900">${card.credit_limit.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Current Balance</p>
            <p className="font-semibold text-red-600">${card.current_balance.toLocaleString()}</p>
          </div>
        </div>
        {card.interest_rate && (
          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500">Interest Rate</p>
            <p className="font-semibold text-slate-900">{card.interest_rate}% APR</p>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }} // Prevent flipping when clicking this button
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
              onClick={(e) => { e.stopPropagation(); copyToClipboard(card.card_number, 'Card number'); }}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Number
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); copyToClipboard(card.cvv, 'CVV'); }}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy CVV
            </Button>
          </>
        )}
      </div>

      {/* Wallet Integration */}
      <div className="border-t border-slate-200 pt-4">
        <p className="text-sm font-medium text-slate-700 mb-3">Add to Wallet</p>
        <div className="flex gap-3">
          <Button
            onClick={addToAppleWallet}
            className="flex-1 bg-black hover:bg-gray-900 text-white"
          >
            <Apple className="w-5 h-5 mr-2" />
            Apple Wallet
          </Button>
          <Button
            onClick={addToGooglePay}
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
    </div>
  );
}
