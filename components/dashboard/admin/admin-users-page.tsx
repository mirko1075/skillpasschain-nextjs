'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiService } from '@/services/api.service';
import { Users, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { User } from '@/models/user.model';

export function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student'
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await apiService.getUsers();
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  // Filter users based on search term and role
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const formatDate = (date: Date) => {
    if (!(date instanceof Date)) date = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const handleCreateUser = async () => {
    try {
      const userData = {
        ...newUser,
        createdBy: user?._id
      };
      let createdUser;
      if (newUser.role === 'admin') {
        createdUser = await apiService.createAdminUser(userData);
      } else {
        createdUser = await apiService.createUser(userData);
      }
      setUsers([...users, createdUser]);
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'student'
      });
      setIsCreateUserOpen(false);
      toast({
        title: newUser.role === 'admin' ? "Admin created" : "User created",
        description: "The user has been successfully created.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user, password: '' }); // Clear password for security
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      const updateData = {
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        email: editingUser.email,
        role: editingUser.role,
        updatedBy: user?._id,
        ...(editingUser.password && { password: editingUser.password })
      };
      
      const updatedUser = await apiService.updateUser(editingUser._id, updateData);
      setUsers(users.map(user => 
        user._id === editingUser._id ? updatedUser : user
      ));
      setEditingUser(null);
      setIsEditUserOpen(false);
      toast({
        title: "User updated",
        description: "The user has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await apiService.deleteUser(userId);
      setUsers(users.filter(user => user._id !== userId));
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-600 mt-2">Manage all platform users and their permissions</p>
          </div>
          <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-teal-600">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName"
                    placeholder="First Name" 
                    value={newUser.firstName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName"
                    placeholder="Last Name" 
                    value={newUser.lastName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    placeholder="Email" 
                    type="email" 
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    placeholder="Password" 
                    type="password" 
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">User/Student</SelectItem>
                      <SelectItem value="institution">Institution</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="institution_admin">Institution Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={handleCreateUser}
                disabled={!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password}
              >
                Create User
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="institution">Institutions</SelectItem>
                    <SelectItem value="admin">Administrators</SelectItem>
                    <SelectItem value="institution_admin">Institution Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input 
                    id="editFirstName"
                    placeholder="First Name" 
                    value={editingUser.firstName}
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input 
                    id="editLastName"
                    placeholder="Last Name" 
                    value={editingUser.lastName}
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editEmail">Email</Label>
                  <Input 
                    id="editEmail"
                    placeholder="Email" 
                    type="email" 
                    value={editingUser.email}
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editPassword">New Password (leave blank to keep current)</Label>
                  <Input 
                    id="editPassword"
                    placeholder="New Password" 
                    type="password" 
                    value={editingUser.password}
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, password: e.target.value } : null)}
                  />
                  <p className="text-xs text-gray-500">
                    Leave empty to keep the current password unchanged
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editRole">Role</Label>
                  <Select 
                    value={editingUser.role}
                    onValueChange={(value) => setEditingUser(prev => prev ? { ...prev, role: value as User['role'] } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">User/Student</SelectItem>
                      <SelectItem value="institution">Institution</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="institution_admin">Institution Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="flex space-x-2">
              <Button 
                className="flex-1" 
                onClick={handleUpdateUser}
                disabled={!editingUser?.firstName || !editingUser?.lastName || !editingUser?.email}
              >
                Update User
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setEditingUser(null);
                  setIsEditUserOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}