
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Shield, Calendar, Building2, Phone, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    prefix: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    next_of_kin_name: "",
    next_of_kin_relationship: "",
    next_of_kin_phone: "",
    account_holder_type: "personal",
    business_name: "",
    business_registration: ""
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({
        prefix: userData.prefix || "Mr",
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        phone_number: userData.phone_number || "",
        address_line_1: userData.address_line_1 || "",
        address_line_2: userData.address_line_2 || "",
        city: userData.city || "",
        state: userData.state || "",
        postal_code: userData.postal_code || "",
        country: userData.country || "",
        next_of_kin_name: userData.next_of_kin_name || "",
        next_of_kin_relationship: userData.next_of_kin_relationship || "Spouse",
        next_of_kin_phone: userData.next_of_kin_phone || "",
        account_holder_type: userData.account_holder_type || "personal",
        business_name: userData.business_name || "",
        business_registration: userData.business_registration || ""
      });
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleSave = async () => {
    try {
      const full_name_parts = [formData.prefix, formData.first_name, formData.last_name].filter(Boolean);
      const full_name = full_name_parts.length > 0 ? full_name_parts.join(' ') : '';
      await base44.auth.updateMe({ ...formData, full_name });
      await loadUser();
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12 text-slate-900 dark:text-white">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Profile</h1>
          <p className="text-slate-600 dark:text-slate-300">Manage your personal information</p>
        </div>

        <div className="space-y-6">
          {/* Profile Header Card */}
          <Card className="border-slate-200 dark:border-purple-700 shadow-lg overflow-hidden bg-white dark:bg-gradient-to-br dark:from-purple-900 dark:to-blue-900">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600" />
            <CardContent className="relative pt-0 pb-8">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-purple-800 shadow-xl">
                  <span className="text-white font-bold text-4xl">
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.full_name || 'User'}</h2>
                  <p className="text-slate-600 dark:text-slate-300">{user.email}</p>
                  <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700">
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 capitalize dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700">
                      <Building2 className="w-3 h-3 mr-1" />
                      {formData.account_holder_type} Account
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">
                      <Calendar className="w-3 h-3 mr-1" />
                      Joined {format(new Date(user.created_date), 'MMM yyyy')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Card */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="dark:text-white">Personal Information</span>
              </CardTitle>
              {!editMode && (
                <Button onClick={() => setEditMode(true)} variant="outline" className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600">
                  Edit Profile
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editMode ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="prefix" className="dark:text-white">Title</Label>
                      <Select value={formData.prefix} onValueChange={(value) => setFormData({ ...formData, prefix: value })}>
                        <SelectTrigger id="prefix" className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600">
                          <SelectValue placeholder="Title" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-700">
                          <SelectItem value="Mr">Mr</SelectItem>
                          <SelectItem value="Mrs">Mrs</SelectItem>
                          <SelectItem value="Ms">Ms</SelectItem>
                          <SelectItem value="Miss">Miss</SelectItem>
                          <SelectItem value="Dr">Dr</SelectItem>
                          <SelectItem value="Prof">Prof</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="first_name" className="dark:text-white">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="Your first name"
                        className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <Label htmlFor="last_name" className="dark:text-white">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Your last name"
                        className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone_number" className="dark:text-white">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      placeholder="+61 4XX XXX XXX"
                      className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                    />
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <Label className="text-base font-semibold mb-3 block dark:text-white">Address</Label>
                    <div className="space-y-4">
                      <Input
                        id="address_line_1"
                        value={formData.address_line_1}
                        onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                        placeholder="Street Address Line 1"
                        className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                      />
                      <Input
                        id="address_line_2"
                        value={formData.address_line_2}
                        onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                        placeholder="Street Address Line 2 (optional)"
                        className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                      />
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="City"
                          className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                        />
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="State/Province"
                          className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          id="postal_code"
                          value={formData.postal_code}
                          onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                          placeholder="Postal Code"
                          className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                        />
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          placeholder="Country"
                          className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <Label className="text-base font-semibold mb-3 block dark:text-white">Next of Kin</Label>
                    <div className="space-y-4">
                      <Input
                        id="next_of_kin_name"
                        value={formData.next_of_kin_name}
                        onChange={(e) => setFormData({ ...formData, next_of_kin_name: e.target.value })}
                        placeholder="Full Name"
                        className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                      />
                      <div className="grid md:grid-cols-2 gap-4">
                        <Select 
                          value={formData.next_of_kin_relationship} 
                          onValueChange={(value) => setFormData({ ...formData, next_of_kin_relationship: value })}
                        >
                          <SelectTrigger id="next_of_kin_relationship" className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600">
                            <SelectValue placeholder="Relationship" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-700">
                            <SelectItem value="Spouse">Spouse</SelectItem>
                            <SelectItem value="Parent">Parent</SelectItem>
                            <SelectItem value="Child">Child</SelectItem>
                            <SelectItem value="Sibling">Sibling</SelectItem>
                            <SelectItem value="Friend">Friend</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          id="next_of_kin_phone"
                          value={formData.next_of_kin_phone}
                          onChange={(e) => setFormData({ ...formData, next_of_kin_phone: e.target.value })}
                          placeholder="Phone Number"
                          className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {formData.account_holder_type === "business" && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <Label className="text-base font-semibold mb-3 block dark:text-white">Business Information</Label>
                      <div className="space-y-4">
                        <Input
                          id="business_name"
                          value={formData.business_name}
                          onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                          placeholder="Business Name"
                          className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                        />
                        <Input
                          id="business_registration"
                          value={formData.business_registration}
                          onChange={(e) => setFormData({ ...formData, business_registration: e.target.value })}
                          placeholder="Business Registration Number"
                          className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 dark:text-white">
                      Save Changes
                    </Button>
                    <Button 
                      onClick={() => {
                        setEditMode(false);
                        loadUser(); // Re-load user data to reset formData to current values
                      }} 
                      variant="outline"
                      className="flex-1 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 dark:text-slate-300">Full Name</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {[formData.prefix, formData.first_name, formData.last_name].filter(Boolean).join(' ') || 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 dark:text-slate-300">Email Address</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{user.email}</p>
                    </div>
                  </div>

                  {formData.phone_number && (
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 dark:text-slate-300">Phone Number</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{formData.phone_number}</p>
                      </div>
                    </div>
                  )}

                  {(formData.address_line_1 || formData.city || formData.country) && (
                    <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 dark:text-slate-300">Address</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {formData.address_line_1}
                          {formData.address_line_2 && <>, {formData.address_line_2}</>}
                        </p>
                        {(formData.city || formData.state || formData.postal_code) && (
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {[formData.city, formData.state, formData.postal_code].filter(Boolean).join(', ')}
                          </p>
                        )}
                        {formData.country && <p className="text-sm text-slate-600 dark:text-slate-300">{formData.country}</p>}
                      </div>
                    </div>
                  )}

                  {formData.next_of_kin_name && (
                    <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 dark:text-slate-300">Next of Kin</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{formData.next_of_kin_name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {formData.next_of_kin_relationship}{formData.next_of_kin_phone && ` • ${formData.next_of_kin_phone}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {formData.account_holder_type === "business" && (formData.business_name || formData.business_registration) && (
                    <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 dark:text-slate-300">Business</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{formData.business_name || 'Not set'}</p>
                        {formData.business_registration && <p className="text-sm text-slate-600 dark:text-slate-300">Reg: {formData.business_registration}</p>}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 dark:text-slate-300">Account Role</p>
                      <p className="font-semibold text-slate-900 dark:text-white capitalize">{user.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 dark:text-slate-300">Member Since</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {format(new Date(user.created_date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
