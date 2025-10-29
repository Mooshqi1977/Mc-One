
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Lock, Smartphone, Mail, Shield, CreditCard, Globe, Settings, AlertCircle } from "lucide-react"; // Added Settings and AlertCircle icons
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() { // Renamed component to avoid conflict with imported 'Settings' icon
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    transactions: true,
    security: true,
    marketing: false
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    biometric: false,
    loginAlerts: true
  });

  const ToggleSwitch = ({ id, checked, onCheckedChange, label, description }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
      <div className="flex-1">
        <Label htmlFor={id} className="text-base font-semibold text-slate-900 dark:text-white cursor-pointer">
          {label}
        </Label>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="relative">
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          // The inline style for background color was causing issues with Tailwind's data-[state] classes.
          // Removed it and rely solely on Tailwind for consistency.
          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
        />
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-purple-900 dark:to-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
          <p className="text-slate-600 dark:text-purple-200">Manage your account preferences and security</p>
        </div>

        <div className="space-y-6">
          {/* Notifications Settings */}
          <Card className="border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-purple-200">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Notifications
              </CardTitle>
              <CardDescription className="dark:text-purple-300">
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleSwitch
                id="email-notif"
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                label="Email Notifications"
                description="Receive notifications via email"
              />

              <ToggleSwitch
                id="push-notif"
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                label="Push Notifications"
                description="Receive push notifications on your devices"
              />

              <ToggleSwitch
                id="sms-notif"
                checked={notifications.sms}
                onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                label="SMS Notifications"
                description="Receive notifications via SMS"
              />

              <ToggleSwitch
                id="trans-notif"
                checked={notifications.transactions}
                onCheckedChange={(checked) => setNotifications({...notifications, transactions: checked})}
                label="Transaction Alerts"
                description="Get notified of all transactions"
              />

              <ToggleSwitch
                id="sec-notif"
                checked={notifications.security}
                onCheckedChange={(checked) => setNotifications({...notifications, security: checked})}
                label="Security Alerts"
                description="Important security notifications"
              />

              <ToggleSwitch
                id="mark-notif"
                checked={notifications.marketing}
                onCheckedChange={(checked) => setNotifications({...notifications, marketing: checked})}
                label="Marketing Communications"
                description="News, updates, and promotions"
              />
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-purple-200">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                Security
              </CardTitle>
              <CardDescription className="dark:text-purple-300">
                Manage your account security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleSwitch
                id="2fa"
                checked={security.twoFactor}
                onCheckedChange={(checked) => setSecurity({...security, twoFactor: checked})}
                label="Two-Factor Authentication"
                description="Add an extra layer of security"
              />

              <ToggleSwitch
                id="biometric"
                checked={security.biometric}
                onCheckedChange={(checked) => setSecurity({...security, biometric: checked})}
                label="Biometric Login"
                description="Use fingerprint or face ID"
              />

              <ToggleSwitch
                id="login-alerts"
                checked={security.loginAlerts}
                onCheckedChange={(checked) => setSecurity({...security, loginAlerts: checked})}
                label="Login Alerts"
                description="Get notified of new device logins"
              />

              <div className="pt-4">
                <Button variant="outline" className="w-full dark:bg-purple-800/30 dark:text-purple-200 dark:border-purple-600 dark:hover:bg-purple-700/50">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-purple-200">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Privacy & Data
              </CardTitle>
              <CardDescription className="dark:text-purple-300">
                Control your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleSwitch
                id="data-sharing"
                checked={true} // As per outline
                onCheckedChange={() => {}} // As per outline
                label="Data Sharing"
                description="Share anonymized data to improve service"
              />
              <ToggleSwitch
                id="personalized-ads"
                checked={false} // As per outline
                onCheckedChange={() => {}} // As per outline
                label="Personalized Experience"
                description="Use my data to personalize my experience"
              />
              <div className="pt-4">
                <Button variant="outline" className="w-full dark:bg-purple-800/30 dark:text-purple-200 dark:border-purple-600 dark:hover:bg-purple-700/50">
                  Download My Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* App Preferences */}
          <Card className="border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-purple-200">
                <Settings className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                App Preferences
              </CardTitle>
              <CardDescription className="dark:text-purple-300">
                Customize your app experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-purple-800/30 rounded-lg">
                <div className="flex-1">
                  <Label className="text-base font-semibold text-slate-900 dark:text-white cursor-pointer">
                    Default Currency
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-purple-300">Choose your preferred currency display</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">AUD</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-purple-800/30 rounded-lg">
                <div className="flex-1">
                  <Label className="text-base font-semibold text-slate-900 dark:text-white cursor-pointer">
                    Language
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-purple-300">Select your preferred language</p>
                </div>
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">English</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-purple-800/30 rounded-lg">
                <div className="flex-1">
                  <Label className="text-base font-semibold text-slate-900 dark:text-white cursor-pointer">
                    Time Zone
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-purple-300">Your current time zone</p>
                </div>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">AEST</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
            <CardHeader>
              <CardTitle className="dark:text-purple-200">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start h-auto py-4 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900 dark:text-white">Manage Cards</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">View and control your cards</p>
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900 dark:text-white">Language & Region</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Currency and language settings</p>
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900 dark:text-white">Connected Devices</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Manage trusted devices</p>
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900 dark:text-white">Support</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Get help and contact us</p>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-800 shadow-md bg-white dark:bg-red-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="dark:text-red-300">
                Irreversible actions - proceed with caution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                Deactivate Account
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-red-400 text-red-800 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/50"
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
