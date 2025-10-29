
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  TrendingUp, 
  Wallet,
  CreditCard,
  Building2,
  Settings,
  LogOut,
  Search,
  Moon,
  Sun,
  Menu,
  DollarSign,
  ChevronDown,
  User,
  Briefcase,
  Users
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, Settings as SettingsIcon, LogOut as LogOutIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Accounts",
    icon: Building2,
    children: [
      {
        title: "Personal",
        url: createPageUrl("AccountsPersonal"),
        icon: User,
      },
      {
        title: "Business",
        url: createPageUrl("AccountsBusiness"),
        icon: Briefcase,
      },
      {
        title: "Kids",
        url: createPageUrl("AccountsKids"),
        icon: Users,
      }
    ]
  },
  {
    title: "Cards",
    url: createPageUrl("Cards"),
    icon: CreditCard,
  },
  {
    title: "Transactions",
    url: createPageUrl("Transactions"),
    icon: ArrowLeftRight,
  },
  {
    title: "Loans",
    url: createPageUrl("Loans"),
    icon: DollarSign,
  },
  {
    title: "Crypto Exchange",
    url: createPageUrl("CryptoExchange"),
    icon: TrendingUp,
  },
  {
    title: "Portfolio",
    url: createPageUrl("Portfolio"),
    icon: Wallet,
  },
  {
    title: "Admin",
    icon: Settings,
    adminOnly: true,
    children: [
      {
        title: "Dashboard",
        url: createPageUrl("AdminDashboard"),
        icon: LayoutDashboard,
      },
      {
        title: "Users",
        url: createPageUrl("UserManagement"),
        icon: Users,
      },
      {
        title: "Data",
        url: createPageUrl("DataManagement"),
        icon: Building2,
      },
      {
        title: "Payments",
        url: createPageUrl("PaymentManagement"),
        icon: CreditCard,
      }
    ]
  },
];

function SidebarContent_({ location, user }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [expandedMenus, setExpandedMenus] = useState(() => {
    const initialExpanded = {};
    navigationItems.forEach(item => {
      if (item.children) {
        initialExpanded[item.title] = item.children.some(child => location.pathname === child.url);
      }
    });
    return initialExpanded;
  });

  const toggleMenu = (title) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const visibleNavItems = navigationItems.filter(item => {
    if (item.adminOnly) {
      return user?.role === 'admin';
    }
    return true;
  });

  return (
    <>
      <SidebarHeader className="border-b border-slate-800 p-6">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-white text-lg">MC-One</h2>
              <p className="text-xs text-slate-400">Banking & Crypto</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-3">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => {
                if (item.children) {
                  const isExpanded = expandedMenus[item.title];
                  const hasActiveChild = item.children.some(child => location.pathname === child.url);
                  
                  return (
                    <div key={item.title}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => !isCollapsed && toggleMenu(item.title)}
                          tooltip={isCollapsed ? item.title : undefined}
                          className={`transition-all duration-200 rounded-lg mb-1 ${
                            hasActiveChild
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'text-slate-300 hover:bg-purple-600/20 hover:text-purple-300'
                          } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                          <div className={`flex items-center gap-3 px-3 py-2.5 w-full ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                            <div className="flex items-center gap-3">
                              <item.icon className="w-5 h-5" />
                              {!isCollapsed && <span className="font-medium">{item.title}</span>}
                            </div>
                            {!isCollapsed && (
                              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      
                      {!isCollapsed && isExpanded && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.children.map((child) => {
                            const isActive = location.pathname === child.url;
                            return (
                              <SidebarMenuItem key={child.title}>
                                <SidebarMenuButton
                                  asChild
                                  className={`transition-all duration-200 rounded-lg ${
                                    isActive
                                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                                      : 'text-slate-300 hover:bg-purple-600/20 hover:text-purple-300'
                                  }`}
                                >
                                  <Link to={child.url} className="flex items-center gap-3 px-3 py-2">
                                    <child.icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{child.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      tooltip={isCollapsed ? item.title : undefined}
                      className={`transition-all duration-200 rounded-lg mb-1 ${
                        isActive 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'text-slate-300 hover:bg-purple-600/20 hover:text-purple-300'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                      <Link to={item.url} className={`flex items-center gap-3 px-3 py-2.5 ${isCollapsed ? 'justify-center' : ''}`}>
                        <item.icon className="w-5 h-5" />
                        {!isCollapsed && <span className="font-medium">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-800 p-4">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => base44.auth.logout(createPageUrl("Landing"))}
              className="p-2 hover:bg-purple-600/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 text-slate-400 hover:text-purple-300" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <button
              onClick={() => base44.auth.logout(createPageUrl("Landing"))}
              className="p-2 hover:bg-purple-600/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 text-slate-400 hover:text-purple-300" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </>
  );
}

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [footerExpanded, setFooterExpanded] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      setUser(null); 
    });
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --sidebar-background: #0A1628;
          --sidebar-foreground: #E2E8F0;
          --sidebar-primary: #3B82F6;
          --sidebar-primary-foreground: #FFFFFF;
          --sidebar-accent: #1E293B;
          --sidebar-accent-foreground: #F1F5F9;
          --sidebar-border: #1E3A5F;
        }

        .dark {
          --background: #0f172a;
          --foreground: #e2e8f0;
        }

        .dark main {
          background: linear-gradient(to bottom right, #0f172a, #1e293b);
        }

        .dark .card-dark {
          background: #1e293b;
          border-color: #334155;
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <Sidebar className="border-r border-slate-800 bg-slate-900" collapsible="icon">
          <SidebarContent_ 
            location={location} 
            user={user}
          />
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-purple-900/30 p-2 rounded-lg transition-colors duration-200 dark:text-purple-400">
                  <Menu className="w-5 h-5" />
                </SidebarTrigger>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white hidden md:block">MC-One</h1>
              </div>

              <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search transactions, accounts, crypto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </form>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => {
                    const searchInput = prompt("Search for:");
                    if (searchInput) setSearchQuery(searchInput);
                  }}
                >
                  <Search className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-600" />
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.full_name || 'User'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-700">
                        <span className="text-white font-semibold text-sm">
                          {user?.full_name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 dark:bg-slate-800 dark:border-slate-700">
                    <DropdownMenuLabel className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user?.full_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{user?.full_name || 'User'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">{user?.email}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="dark:bg-slate-700" />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("Profile")} className="flex items-center gap-3 cursor-pointer dark:hover:bg-slate-700">
                        <UserIcon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("Settings")} className="flex items-center gap-3 cursor-pointer dark:hover:bg-slate-700">
                        <SettingsIcon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="dark:bg-slate-700" />
                    <DropdownMenuItem
                      onClick={() => base44.auth.logout(createPageUrl("Landing"))}
                      className="flex items-center gap-3 cursor-pointer text-red-600 focus:text-red-600 dark:text-red-500 dark:hover:bg-slate-700 dark:focus:bg-slate-700"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>

          <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6">
              <div className="py-4">
                <button
                  onClick={() => setFooterExpanded(!footerExpanded)}
                  className="flex items-center justify-between w-full text-left hover:opacity-70 transition-opacity group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className={`h-0.5 w-4 bg-slate-600 dark:bg-slate-400 transition-all ${footerExpanded ? 'rotate-45 translate-y-1' : ''}`}></span>
                      <span className={`h-0.5 w-4 bg-slate-600 dark:bg-slate-400 transition-all ${footerExpanded ? 'opacity-0' : ''}`}></span>
                      <span className={`h-0.5 w-4 bg-slate-600 dark:bg-slate-400 transition-all ${footerExpanded ? '-rotate-45 -translate-y-1' : ''}`}></span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      © MC-One 2025
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform ${
                      footerExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {footerExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <p>
                      MC-One (ABN 27560018632) is a company registered in Australia and is authorised by the Australian Securities & Investments Commission (AFSL & Australian Credit Licence number 517679).
                    </p>
                    <p>
                      Please make sure to read the Financial Services Guide, Target Market Determination and Product Disclosure Statement prior to deciding whether our products and services are appropriate for you.
                    </p>
                    <p>
                      The MC-One Cryptocurrency and Commodities products are unregulated products in Australia and are not provided to you under our AFSL.
                    </p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      Any advice given does not take into account your objectives, financial circumstances or needs and you should consider if it is appropriate for you.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
}
