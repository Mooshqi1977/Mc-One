import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Transactions from "./Transactions";

import CryptoExchange from "./CryptoExchange";

import Portfolio from "./Portfolio";

import Cards from "./Cards";

import Accounts from "./Accounts";

import Landing from "./Landing";

import CryptoDetail from "./CryptoDetail";

import Profile from "./Profile";

import Settings from "./Settings";

import Loans from "./Loans";

import AccountsPersonal from "./AccountsPersonal";

import AccountsBusiness from "./AccountsBusiness";

import AccountsKids from "./AccountsKids";

import AdminDashboard from "./AdminDashboard";

import UserManagement from "./UserManagement";

import DataManagement from "./DataManagement";

import PaymentManagement from "./PaymentManagement";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Transactions: Transactions,
    
    CryptoExchange: CryptoExchange,
    
    Portfolio: Portfolio,
    
    Cards: Cards,
    
    Accounts: Accounts,
    
    Landing: Landing,
    
    CryptoDetail: CryptoDetail,
    
    Profile: Profile,
    
    Settings: Settings,
    
    Loans: Loans,
    
    AccountsPersonal: AccountsPersonal,
    
    AccountsBusiness: AccountsBusiness,
    
    AccountsKids: AccountsKids,
    
    AdminDashboard: AdminDashboard,
    
    UserManagement: UserManagement,
    
    DataManagement: DataManagement,
    
    PaymentManagement: PaymentManagement,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Transactions" element={<Transactions />} />
                
                <Route path="/CryptoExchange" element={<CryptoExchange />} />
                
                <Route path="/Portfolio" element={<Portfolio />} />
                
                <Route path="/Cards" element={<Cards />} />
                
                <Route path="/Accounts" element={<Accounts />} />
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/CryptoDetail" element={<CryptoDetail />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Loans" element={<Loans />} />
                
                <Route path="/AccountsPersonal" element={<AccountsPersonal />} />
                
                <Route path="/AccountsBusiness" element={<AccountsBusiness />} />
                
                <Route path="/AccountsKids" element={<AccountsKids />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/UserManagement" element={<UserManagement />} />
                
                <Route path="/DataManagement" element={<DataManagement />} />
                
                <Route path="/PaymentManagement" element={<PaymentManagement />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}