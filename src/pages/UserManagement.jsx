import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search,
  Mail,
  Shield,
  Calendar,
  Edit2,
  AlertCircle,
  UserPlus,
  Crown,
  User as UserIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function UserManagement() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: "user" });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
      setIsAdmin(userData?.role === 'admin');
    }).catch(() => {
      window.location.href = createPageUrl("Dashboard");
    });
  }, []);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date'),
    enabled: isAdmin,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => base44.entities.User.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      setShowEditDialog(false);
      setEditingUser(null);
      toast.success('User updated successfully');
    },
    onError: () => {
      toast.error('Failed to update user');
    }
  });

  const handleEdit = (userData) => {
    setEditingUser(userData);
    setEditForm({ role: userData.role || "user" });
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    if (editingUser) {
      updateUserMutation.mutate({
        userId: editingUser.id,
        data: editForm
      });
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

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminUsers = filteredUsers.filter(u => u.role === 'admin');
  const regularUsers = filteredUsers.filter(u => u.role !== 'admin');

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-purple-900 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
                <p className="text-slate-600 dark:text-purple-200">Manage system users and permissions</p>
              </div>
            </div>
            <Link to={createPageUrl("AdminDashboard")}>
              <Button variant="outline" className="dark:bg-purple-800/30 dark:text-purple-200 dark:border-purple-600 dark:hover:bg-purple-700/50">
                Back to Admin
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-purple-200 mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{users.length}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-purple-200 mb-1">Administrators</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{adminUsers.length}</p>
                  </div>
                  <Crown className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-purple-700 bg-white dark:bg-purple-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-purple-200 mb-1">Regular Users</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{regularUsers.length}</p>
                  </div>
                  <UserIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 dark:bg-purple-900/30 dark:text-white dark:border-purple-600"
            />
          </div>
        </div>

        {/* Users List */}
        <Card className="border-slate-200 dark:border-purple-700 shadow-md bg-white dark:bg-purple-900/30">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-purple-200">All Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-500 dark:text-purple-300">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-purple-600 mb-4" />
                <p className="text-slate-500 dark:text-purple-300">No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((userData) => (
                  <div
                    key={userData.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-purple-800/30 rounded-lg border border-slate-200 dark:border-purple-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {userData.full_name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {userData.full_name || 'Unnamed User'}
                          </p>
                          {userData.role === 'admin' && (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700">
                              <Crown className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-purple-200">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {userData.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Joined {format(new Date(userData.created_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(userData)}
                      className="dark:bg-purple-800/30 dark:text-purple-200 dark:border-purple-600 dark:hover:bg-purple-700/50"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Role
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px] dark:bg-slate-800 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Edit User Role</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {editingUser.full_name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{editingUser.full_name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{editingUser.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="role" className="dark:text-white">User Role</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                  >
                    <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                      <SelectItem value="user" className="dark:text-white dark:hover:bg-slate-700">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4" />
                          Regular User
                        </div>
                      </SelectItem>
                      <SelectItem value="admin" className="dark:text-white dark:hover:bg-slate-700">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4" />
                          Administrator
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Administrators have full access to all system features and user management.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={updateUserMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateUserMutation.isPending ? 'Updating...' : 'Update Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}