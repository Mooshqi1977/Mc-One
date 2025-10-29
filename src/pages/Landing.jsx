import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  ArrowRight, 
  Wallet, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  CreditCard,
  Smartphone,
  Lock,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Landing() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthenticated);
  }, []);

  const features = [
    {
      icon: Wallet,
      title: "Multi-Currency Accounts",
      description: "Manage accounts in 170+ currencies with real-time conversion",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: CreditCard,
      title: "Virtual & Credit Cards",
      description: "Instant virtual cards and premium credit cards with rewards",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Crypto Trading",
      description: "Trade Bitcoin, Ethereum and other cryptocurrencies seamlessly",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your data is encrypted and protected with enterprise security",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Smartphone,
      title: "Apple & Google Pay",
      description: "Add cards to your digital wallet for contactless payments",
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      icon: Globe,
      title: "International Transfers",
      description: "Send money globally with SWIFT/BIC and BSB support",
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  const stats = [
    { value: "170+", label: "Currencies Supported" },
    { value: "24/7", label: "Customer Support" },
    { value: "99.9%", label: "Uptime" },
    { value: "10k+", label: "Active Users" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">MC-One</h1>
                <p className="text-xs text-slate-500">Banking & Crypto</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link to={createPageUrl("Dashboard")}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => base44.auth.redirectToLogin()}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => base44.auth.redirectToLogin()}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Modern Banking Reimagined
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Your Money,
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Simplified</span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Experience next-generation banking with multi-currency accounts, instant virtual cards, 
                and seamless crypto trading—all in one powerful platform.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                {!isAuthenticated ? (
                  <Button 
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
                    onClick={() => base44.auth.redirectToLogin()}
                  >
                    Open Free Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Link to={createPageUrl("Dashboard")}>
                    <Button 
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                )}
                
                <Button 
                  size="lg"
                  variant="outline"
                  className="text-lg px-8"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Hero Image/Cards Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                {/* Virtual Card Preview */}
                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="text-white">
                    <div className="flex justify-between items-start mb-12">
                      <div>
                        <p className="text-white/80 text-sm mb-2">Virtual Card</p>
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <Smartphone className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full" />
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full -ml-4" />
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <p className="text-white/70 text-xs mb-2">Card Number</p>
                      <p className="text-2xl font-mono tracking-wider">•••• •••• •••• 4242</p>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-white/70 text-xs mb-1">Cardholder</p>
                        <p className="text-base font-medium">JOHN DOE</p>
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <p className="text-white/70 text-xs mb-1">Expires</p>
                          <p className="text-sm font-mono">12/25</p>
                        </div>
                        <div>
                          <p className="text-white/70 text-xs mb-1">CVV</p>
                          <p className="text-sm font-mono">•••</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Stats Cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-8 -right-8 bg-white rounded-2xl p-4 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Crypto Value</p>
                      <p className="text-lg font-bold text-slate-900">$24,580</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-8 -left-8 bg-white rounded-2xl p-4 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Balance</p>
                      <p className="text-lg font-bold text-slate-900">$48,250</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Background Gradient Blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Everything You Need
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Powerful features designed to give you complete control over your finances
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}
              >
                <Card className="border-slate-200 hover:shadow-xl transition-all duration-300 h-full group">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl" />
            
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Your Security is Our Priority
                </h2>
                <p className="text-xl text-slate-300 mb-8">
                  Bank-level encryption, multi-factor authentication, and 24/7 fraud monitoring 
                  keep your money and data safe.
                </p>
                <div className="flex flex-wrap justify-center gap-8 text-white/80">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span>256-bit Encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    <span>2FA Protected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Real-time Monitoring</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Join thousands of users who trust MC-One for their banking needs
            </p>
            {!isAuthenticated ? (
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-lg px-12"
                onClick={() => base44.auth.redirectToLogin()}
              >
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Link to={createPageUrl("Dashboard")}>
                <Button 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-12"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">MC-One</h3>
                <p className="text-sm text-slate-400">Banking & Crypto Platform</p>
              </div>
            </div>
            
            <div className="text-sm text-slate-400">
              © 2024 MC-One. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}