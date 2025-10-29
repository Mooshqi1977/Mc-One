
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  CreditCard,
  Calendar,
  Key,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Shield,
  Zap,
  Plus,
  Plug,
  Network,
  Globe,
  Activity,
  Edit,
  Trash2,
  TestTube
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { toast } from "sonner";

export default function PaymentManagement() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("cards");
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [editingApi, setEditingApi] = useState(null);
  const [apiForm, setApiForm] = useState({
    connection_name: "",
    service_type: "REST",
    service_provider: "",
    api_endpoint: "",
    api_key: "",
    api_secret: "",
    authentication_type: "api_key",
    environment: "development",
    rate_limit: "",
    webhook_url: "",
    webhook_secret: "",
    notes: ""
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
      setIsAdmin(userData?.role === 'admin');
    }).catch(() => {
      window.location.href = createPageUrl("Dashboard");
    });
  }, []);

  const { data: paymentCards = [] } = useQuery({
    queryKey: ['all-payment-cards'],
    queryFn: () => base44.entities.PaymentCard.list('-created_date'),
    enabled: isAdmin,
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['all-subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date'),
    enabled: isAdmin,
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['all-tokens'],
    queryFn: () => base44.entities.Token.list('-created_date'),
    enabled: isAdmin,
  });

  const { data: apiConnections = [] } = useQuery({
    queryKey: ['all-api-connections'],
    queryFn: () => base44.entities.APIConnection.list('-created_date'),
    enabled: isAdmin,
  });

  const createApiMutation = useMutation({
    mutationFn: (data) => base44.entities.APIConnection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-api-connections'] });
      setShowApiDialog(false);
      resetApiForm();
      toast.success('API connection created successfully');
    },
    onError: (error) => {
      console.error("Failed to create API connection:", error);
      toast.error(`Failed to create API connection: ${error.message || 'Unknown error'}`);
    }
  });

  const updateApiMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.APIConnection.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-api-connections'] });
      setShowApiDialog(false);
      setEditingApi(null);
      resetApiForm();
      toast.success('API connection updated successfully');
    },
    onError: (error) => {
      console.error("Failed to update API connection:", error);
      toast.error(`Failed to update API connection: ${error.message || 'Unknown error'}`);
    }
  });

  const deleteApiMutation = useMutation({
    mutationFn: (id) => base44.entities.APIConnection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-api-connections'] });
      toast.success('API connection deleted successfully');
    },
    onError: (error) => {
      console.error("Failed to delete API connection:", error);
      toast.error(`Failed to delete API connection: ${error.message || 'Unknown error'}`);
    }
  });

  const resetApiForm = () => {
    setApiForm({
      connection_name: "",
      service_type: "REST",
      service_provider: "",
      api_endpoint: "",
      api_key: "",
      api_secret: "",
      authentication_type: "api_key",
      environment: "development",
      rate_limit: "",
      webhook_url: "",
      webhook_secret: "",
      notes: ""
    });
    setEditingApi(null);
  };

  const handleEditApi = (api) => {
    setEditingApi(api);
    setApiForm({
      connection_name: api.connection_name || "",
      service_type: api.service_type || "REST",
      service_provider: api.service_provider || "",
      api_endpoint: api.api_endpoint || "",
      api_key: api.api_key || "",
      api_secret: api.api_secret || "",
      authentication_type: api.authentication_type || "api_key",
      environment: api.environment || "development",
      rate_limit: api.rate_limit ? String(api.rate_limit) : "",
      webhook_url: api.webhook_url || "",
      webhook_secret: api.webhook_secret || "",
      notes: api.notes || ""
    });
    setShowApiDialog(true);
  };

  const handleSubmitApi = (e) => {
    e.preventDefault();
    const data = {
      ...apiForm,
      rate_limit: apiForm.rate_limit ? parseFloat(apiForm.rate_limit) : undefined,
      status: "pending"
    };

    if (editingApi) {
      updateApiMutation.mutate({ id: editingApi.id, data });
    } else {
      createApiMutation.mutate(data);
    }
  };

  const handleDeleteApi = (id) => {
    if (window.confirm('Are you sure you want to delete this API connection?')) {
      deleteApiMutation.mutate(id);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 dark:border-red-800 bg-white dark:bg-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
              <p className="text-slate-600 dark:text-slate-300 text-center mb-6">
                You need administrator privileges to access this page.
              </p>
              <Link to={createPageUrl("Dashboard")}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const activeTokens = tokens.filter(t => t.status === 'active').length;
  const expiredTokens = tokens.filter(t => {
    if (!t.expires_at) return false;
    return isPast(new Date(t.expires_at));
  }).length;
  const activeApis = apiConnections.filter(a => a.status === 'active').length;

  const getCardBrandColor = (brand) => {
    const colors = {
      'Visa': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Mastercard': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'Amex': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Discover': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'UnionPay': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'JCB': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
    };
    return colors[brand] || 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
  };

  const getServiceTypeColor = (type) => {
    const colors = {
      'REST': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'GraphQL': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      'SOAP': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'WebSocket': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'MCP': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'gRPC': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'Custom': 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
    };
    return colors[type] || 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
  };

  const getStatusBadge = (status) => {
    const variants = {
      'active': { className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700', icon: CheckCircle },
      'expired': { className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700', icon: XCircle },
      'paused': { className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700', icon: Clock },
      'cancelled': { className: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border-slate-300 dark:border-slate-700', icon: XCircle },
      'blocked': { className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700', icon: XCircle },
      'trial': { className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700', icon: Zap },
      'revoked': { className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700', icon: XCircle },
      'pending': { className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700', icon: Clock },
      'pending_verification': { className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700', icon: Clock },
      'inactive': { className: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border-slate-300 dark:border-slate-700', icon: XCircle },
      'error': { className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700', icon: AlertCircle },
      'testing': { className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700', icon: TestTube },
    };
    const config = variants[status] || variants['active'];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-purple-900 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Payment Management</h1>
                <p className="text-slate-600 dark:text-purple-200">Manage payment cards, subscriptions, tokens, and API connections</p>
              </div>
            </div>
            <Link to={createPageUrl("DataManagement")}>
              <Button variant="outline" className="dark:bg-purple-800/30 dark:text-purple-200 dark:border-purple-600 dark:hover:bg-purple-700/50">
                Back to Data
              </Button>
            </Link>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-purple-200 mb-1">Payment Cards</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{paymentCards.length}</p>
                  </div>
                  <CreditCard className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-purple-200 mb-1">Active Subscriptions</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{activeSubscriptions}</p>
                  </div>
                  <RefreshCw className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-purple-200 mb-1">Active Tokens</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{activeTokens}</p>
                  </div>
                  <Key className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-purple-200 mb-1">Expired Tokens</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{expiredTokens}</p>
                  </div>
                  <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-purple-200 mb-1">API Connections</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{apiConnections.length}</p>
                  </div>
                  <Plug className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-200 dark:bg-purple-800/30">
            <TabsTrigger value="cards" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:text-white">
              Payment Cards ({paymentCards.length})
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:text-white">
              Subscriptions ({subscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="tokens" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:text-white">
              Tokens ({tokens.length})
            </TabsTrigger>
            <TabsTrigger value="apis" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:text-white">
              API Connections ({apiConnections.length})
            </TabsTrigger>
          </TabsList>

          {/* Payment Cards */}
          <TabsContent value="cards">
            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-purple-200">
                  <CreditCard className="w-5 h-5" />
                  Payment Cards
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentCards.length === 0 ? (
                  <p className="text-center py-8 text-slate-500 dark:text-purple-300">No payment cards found</p>
                ) : (
                  <div className="space-y-3">
                    {paymentCards.map((card) => (
                      <div
                        key={card.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-purple-800/30 rounded-lg border border-slate-200 dark:border-purple-700"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-slate-900 dark:text-white">{card.card_holder_name}</p>
                            <Badge className={getCardBrandColor(card.card_brand)}>
                              {card.card_brand}
                            </Badge>
                            <Badge variant="outline" className="capitalize dark:bg-purple-800/50 dark:text-purple-200 dark:border-purple-600">
                              {card.card_type}
                            </Badge>
                            {card.is_default && (
                              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Default
                              </Badge>
                            )}
                            {getStatusBadge(card.status)}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-purple-200 space-y-1">
                            <p>
                              <span className="font-mono">•••• •••• •••• {card.card_number.slice(-4)}</span>
                              <span className="mx-2">•</span>
                              <span>Expires: {card.expiry_month}/{card.expiry_year}</span>
                            </p>
                            {card.billing_city && card.billing_country && (
                              <p className="text-xs">
                                {card.billing_address && `${card.billing_address}, `}
                                {card.billing_city}, {card.billing_state && `${card.billing_state}, `}
                                {card.billing_country} {card.billing_postal_code}
                              </p>
                            )}
                            <p className="text-xs">Owner: {card.created_by}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 dark:text-purple-300">
                            Added {format(new Date(card.created_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions */}
          <TabsContent value="subscriptions">
            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-purple-200">
                  <RefreshCw className="w-5 h-5" />
                  Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <p className="text-center py-8 text-slate-500 dark:text-purple-300">No subscriptions found</p>
                ) : (
                  <div className="space-y-3">
                    {subscriptions.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-purple-800/30 rounded-lg border border-slate-200 dark:border-purple-700"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-slate-900 dark:text-white">{sub.subscription_name}</p>
                            {sub.service_provider && (
                              <Badge variant="outline" className="dark:bg-purple-800/50 dark:text-purple-200 dark:border-purple-600">
                                {sub.service_provider}
                              </Badge>
                            )}
                            <Badge variant="outline" className="capitalize dark:bg-purple-800/50 dark:text-purple-200 dark:border-purple-600">
                              {sub.subscription_type}
                            </Badge>
                            {getStatusBadge(sub.status)}
                            {sub.auto_renew && (
                              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Auto-renew
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-purple-200 space-y-1">
                            {sub.service_description && (
                              <p>{sub.service_description}</p>
                            )}
                            <p className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Started: {format(new Date(sub.start_date), 'MMM d, yyyy')}</span>
                              {sub.next_billing_date && (
                                <>
                                  <span>•</span>
                                  <span>Next billing: {format(new Date(sub.next_billing_date), 'MMM d, yyyy')}</span>
                                </>
                              )}
                            </p>
                            {sub.trial_end_date && (
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                Trial ends: {format(new Date(sub.trial_end_date), 'MMM d, yyyy')}
                              </p>
                            )}
                            <p className="text-xs">Owner: {sub.created_by}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            ${sub.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-purple-300 capitalize">
                            per {sub.subscription_type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tokens */}
          <TabsContent value="tokens">
            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-purple-200">
                  <Key className="w-5 h-5" />
                  API Tokens & Keys
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tokens.length === 0 ? (
                  <p className="text-center py-8 text-slate-500 dark:text-purple-300">No tokens found</p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {tokens.map((token) => {
                      const isExpired = token.expires_at && isPast(new Date(token.expires_at));
                      return (
                        <div
                          key={token.id}
                          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-purple-800/30 rounded-lg border border-slate-200 dark:border-purple-700"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              <p className="font-semibold text-slate-900 dark:text-white">{token.token_name}</p>
                              <Badge variant="outline" className="capitalize dark:bg-purple-800/50 dark:text-purple-200 dark:border-purple-600">
                                {token.token_type.replace(/_/g, ' ')}
                              </Badge>
                              {getStatusBadge(isExpired ? 'expired' : token.status)}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-purple-200 space-y-1">
                              {token.associated_service && (
                                <p>Service: {token.associated_service}</p>
                              )}
                              {token.scope && (
                                <p className="text-xs">Scope: {token.scope}</p>
                              )}
                              <p className="text-xs">
                                Created: {format(new Date(token.issued_at || token.created_date), 'MMM d, yyyy h:mm a')}
                                {token.expires_at && (
                                  <>
                                    <span className="mx-2">•</span>
                                    {isExpired ? (
                                      <span className="text-red-600 dark:text-red-400">
                                        Expired {formatDistanceToNow(new Date(token.expires_at), { addSuffix: true })}
                                      </span>
                                    ) : (
                                      <span>
                                        Expires {formatDistanceToNow(new Date(token.expires_at), { addSuffix: true })}
                                      </span>
                                    )}
                                  </>
                                )}
                              </p>
                              {token.last_used_at && (
                                <p className="text-xs">
                                  Last used: {formatDistanceToNow(new Date(token.last_used_at), { addSuffix: true })}
                                  <span className="mx-2">•</span>
                                  Used {token.usage_count} {token.usage_count === 1 ? 'time' : 'times'}
                                </p>
                              )}
                              <p className="text-xs">Owner: {token.created_by}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500 dark:text-purple-300 font-mono">
                              {token.token_value.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Connections */}
          <TabsContent value="apis">
            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-purple-200">
                    <Plug className="w-5 h-5" />
                    API Connections
                  </CardTitle>
                  <Button
                    onClick={() => {
                      resetApiForm();
                      setShowApiDialog(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Connection
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {apiConnections.length === 0 ? (
                  <div className="text-center py-12">
                    <Network className="w-16 h-16 mx-auto text-slate-300 dark:text-purple-600 mb-4" />
                    <p className="text-slate-500 dark:text-purple-300 mb-4">No API connections yet</p>
                    <Button
                      onClick={() => {
                        resetApiForm();
                        setShowApiDialog(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Connection
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {apiConnections.map((api) => (
                      <div
                        key={api.id}
                        className="flex items-start justify-between p-4 bg-slate-50 dark:bg-purple-800/30 rounded-lg border border-slate-200 dark:border-purple-700"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <p className="font-semibold text-slate-900 dark:text-white">{api.connection_name}</p>
                            <Badge className={getServiceTypeColor(api.service_type)}>
                              {api.service_type}
                            </Badge>
                            {getStatusBadge(api.status)}
                            <Badge variant="outline" className="capitalize dark:bg-purple-800/50 dark:text-purple-200 dark:border-purple-600">
                              {api.environment}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-600 dark:text-purple-200 space-y-1">
                            <p className="font-medium">{api.service_provider}</p>
                            {api.api_endpoint && (
                              <p className="text-xs font-mono bg-slate-100 dark:bg-purple-900/50 px-2 py-1 rounded">
                                {api.api_endpoint}
                              </p>
                            )}
                            {api.authentication_type && (
                              <p className="text-xs">
                                Auth: <span className="capitalize">{api.authentication_type.replace(/_/g, ' ')}</span>
                              </p>
                            )}
                            {api.rate_limit && (
                              <p className="text-xs flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                Rate limit: {api.rate_limit}/min
                              </p>
                            )}
                            {api.total_requests > 0 && (
                              <div className="flex items-center gap-4 text-xs pt-2">
                                <span className="text-green-600 dark:text-green-400">
                                  ✓ {api.total_requests - (api.failed_requests || 0)} successful
                                </span>
                                {api.failed_requests > 0 && (
                                  <span className="text-red-600 dark:text-red-400">
                                    ✗ {api.failed_requests} failed
                                  </span>
                                )}
                                {api.average_response_time && (
                                  <span className="text-blue-600 dark:text-blue-400">
                                    ⚡ {api.average_response_time}ms avg
                                  </span>
                                )}
                              </div>
                            )}
                            {api.last_used_at && (
                              <p className="text-xs text-slate-400 dark:text-purple-400">
                                Last used: {formatDistanceToNow(new Date(api.last_used_at), { addSuffix: true })}
                              </p>
                            )}
                            <p className="text-xs">Owner: {api.created_by}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditApi(api)}
                            className="dark:bg-purple-800/30 dark:text-purple-200 dark:border-purple-600 dark:hover:bg-purple-700/50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteApi(api.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* API Connection Dialog */}
      <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white dark:bg-purple-900/50 border-slate-200 dark:border-purple-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              {editingApi ? 'Edit API Connection' : 'Create API Connection'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitApi} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="connection_name" className="text-slate-900 dark:text-white">Connection Name *</Label>
                <Input
                  id="connection_name"
                  value={apiForm.connection_name}
                  onChange={(e) => setApiForm({...apiForm, connection_name: e.target.value})}
                  placeholder="My API Connection"
                  required
                  className="dark:bg-purple-800/30 dark:text-white dark:border-purple-600"
                />
              </div>

              <div>
                <Label htmlFor="service_provider" className="text-slate-900 dark:text-white">Service Provider *</Label>
                <Input
                  id="service_provider"
                  value={apiForm.service_provider}
                  onChange={(e) => setApiForm({...apiForm, service_provider: e.target.value})}
                  placeholder="Stripe, OpenAI, AWS..."
                  required
                  className="dark:bg-purple-800/30 dark:text-white dark:border-purple-600"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service_type" className="text-slate-900 dark:text-white">Service Type *</Label>
                <Select
                  value={apiForm.service_type}
                  onValueChange={(value) => setApiForm({...apiForm, service_type: value})}
                >
                  <SelectTrigger className="dark:bg-purple-800/30 dark:text-white dark:border-purple-600">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-purple-900 dark:border-purple-700">
                    <SelectItem value="REST" className="dark:text-white dark:hover:bg-purple-800">REST API</SelectItem>
                    <SelectItem value="GraphQL" className="dark:text-white dark:hover:bg-purple-800">GraphQL</SelectItem>
                    <SelectItem value="SOAP" className="dark:text-white dark:hover:bg-purple-800">SOAP</SelectItem>
                    <SelectItem value="WebSocket" className="dark:text-white dark:hover:bg-purple-800">WebSocket</SelectItem>
                    <SelectItem value="MCP" className="dark:text-white dark:hover:bg-purple-800">MCP (Model Context Protocol)</SelectItem>
                    <SelectItem value="gRPC" className="dark:text-white dark:hover:bg-purple-800">gRPC</SelectItem>
                    <SelectItem value="Custom" className="dark:text-white dark:hover:bg-purple-800">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="authentication_type" className="text-slate-900 dark:text-white">Authentication Type *</Label>
                <Select
                  value={apiForm.authentication_type}
                  onValueChange={(value) => setApiForm({...apiForm, authentication_type: value})}
                >
                  <SelectTrigger className="dark:bg-purple-800/30 dark:text-white dark:border-purple-600">
                    <SelectValue placeholder="Select auth type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-purple-900 dark:border-purple-700">
                    <SelectItem value="api_key" className="dark:text-white dark:hover:bg-purple-800">API Key</SelectItem>
                    <SelectItem value="bearer_token" className="dark:text-white dark:hover:bg-purple-800">Bearer Token</SelectItem>
                    <SelectItem value="oauth2" className="dark:text-white dark:hover:bg-purple-800">OAuth 2.0</SelectItem>
                    <SelectItem value="basic_auth" className="dark:text-white dark:hover:bg-purple-800">Basic Auth</SelectItem>
                    <SelectItem value="custom" className="dark:text-white dark:hover:bg-purple-800">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="api_endpoint" className="text-slate-900 dark:text-white">API Endpoint</Label>
              <Input
                id="api_endpoint"
                value={apiForm.api_endpoint}
                onChange={(e) => setApiForm({...apiForm, api_endpoint: e.target.value})}
                placeholder="https://api.example.com/v1"
                className="dark:bg-purple-800/30 dark:text-white dark:border-purple-600"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="api_key" className="text-slate-900 dark:text-white">API Key</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={apiForm.api_key}
                  onChange={(e) => setApiForm({...apiForm, api_key: e.target.value})}
                  placeholder="Your API key"
                  className="dark:bg-purple-800/30 dark:text-white dark:border-purple-600"
                />
              </div>

              <div>
                <Label htmlFor="api_secret" className="text-slate-900 dark:text-white">API Secret</Label>
                <Input
                  id="api_secret"
                  type="password"
                  value={apiForm.api_secret}
                  onChange={(e) => setApiForm({...apiForm, api_secret: e.target.value})}
                  placeholder="Your API secret"
                  className="dark:bg-purple-800/30 dark:text-white dark:border-purple-600"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="environment" className="text-slate-900 dark:text-white">Environment *</Label>
                <Select
                  value={apiForm.environment}
                  onValueChange={(value) => setApiForm({...apiForm, environment: value})}
                >
                  <SelectTrigger className="dark:bg-purple-800/30 dark:text-white dark:border-purple-600">
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-purple-900 dark:border-purple-700">
                    <SelectItem value="development" className="dark:text-white dark:hover:bg-purple-800">Development</SelectItem>
                    <SelectItem value="staging" className="dark:text-white dark:hover:bg-purple-800">Staging</SelectItem>
                    <SelectItem value="test" className="dark:text-white dark:hover:bg-purple-800">Test</SelectItem>
                    <SelectItem value="production" className="dark:text-white dark:hover:bg-purple-800">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rate_limit" className="text-slate-900 dark:text-white">Rate Limit (per minute)</Label>
                <Input
                  id="rate_limit"
                  type="number"
                  value={apiForm.rate_limit}
                  onChange={(e) => setApiForm({...apiForm, rate_limit: e.target.value})}
                  placeholder="60"
                  className="dark:bg-purple-800/30 dark:text-white dark:border-purple-600"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="webhook_url" className="text-slate-900 dark:text-white">Webhook URL (Optional)</Label>
              <Input
                id="webhook_url"
                value={apiForm.webhook_url}
                onChange={(e) => setApiForm({...apiForm, webhook_url: e.target.value})}
                placeholder="https://your-app.com/webhooks/callback"
                className="dark:bg-purple-800/30 dark:text-white dark:border-purple-600"
              />
            </div>

            <div>
              <Label htmlFor="webhook_secret" className="text-slate-900 dark:text-white">Webhook Secret (Optional)</Label>
              <Input
                id="webhook_secret"
                type="password"
                value={apiForm.webhook_secret}
                onChange={(e) => setApiForm({...apiForm, webhook_secret: e.target.value})}
                placeholder="Webhook signing secret"
                className="dark:bg-purple-800/30 dark:text-white dark:border-purple-600"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-slate-900 dark:text-white">Notes</Label>
              <Textarea
                id="notes"
                value={apiForm.notes}
                onChange={(e) => setApiForm({...apiForm, notes: e.target.value})}
                placeholder="Additional notes or documentation..."
                rows={3}
                className="dark:bg-purple-800/30 dark:text-white dark:border-purple-600"
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowApiDialog(false);
                  resetApiForm();
                }}
                className="dark:text-white dark:border-purple-600 dark:hover:bg-purple-800/30"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createApiMutation.isPending || updateApiMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {createApiMutation.isPending || updateApiMutation.isPending 
                  ? 'Saving...' 
                  : editingApi ? 'Update Connection' : 'Create Connection'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
