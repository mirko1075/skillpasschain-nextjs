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
import { Users, Building2, Award, BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Institution {
  id: string;
  name: string;
  email: string;
  address: string;
  createdAt: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  levels: number;
  isActive: boolean;
  documentUrl?: string;
  createdAt: string;
}

export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInstitutions: 0,
    totalAssessments: 0,
    totalCertifications: 0,
    totalTopics: 0
  });
  const [loading, setLoading] = useState(true);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateInstitutionOpen, setIsCreateInstitutionOpen] = useState(false);
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
  const [isEditTopicOpen, setIsEditTopicOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [newInstitution, setNewInstitution] = useState({
    name: '',
    email: '',
    address: ''
  });
  const [newTopic, setNewTopic] = useState({
    name: '',
    description: '',
    levels: 1,
    isActive: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, institutionsData, assessmentsData, certificationsData, topicsData] = await Promise.all([
          apiService.getUsers(),
          apiService.getInstitutions(),
          apiService.getAssessments(),
          apiService.getCertifications(),
          apiService.getTopics()
        ]);
        setUsers(usersData);
        setInstitutions(institutionsData);
        setTopics(topicsData);
        setStats({
          totalUsers: usersData.length,
          totalInstitutions: institutionsData.length,
          totalAssessments: assessmentsData.length,
          totalCertifications: certificationsData.length,
          totalTopics: topicsData.length
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast({
          title: "Error",
          description: "Failed to load admin dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      await apiService.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
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

  const handleCreateUser = async () => {
    try {
      let createdUser;
      if (newUser.role === 'admin') {
        createdUser = await apiService.createAdminUser(newUser);
      } else {
        createdUser = await apiService.createUser(newUser);
      }
      setUsers([...users, createdUser]);
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'user'
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

  const handleCreateInstitution = async () => {
    try {
      const createdInstitution = await apiService.createInstitution(newInstitution);
      setInstitutions([...institutions, createdInstitution]);
      setStats(prev => ({ ...prev, totalInstitutions: prev.totalInstitutions + 1 }));
      setNewInstitution({
        name: '',
        email: '',
        address: ''
      });
      setIsCreateInstitutionOpen(false);
      toast({
        title: "Institution created",
        description: "The institution has been successfully created.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create institution.",
        variant: "destructive",
      });
    }
  };

  const handleCreateTopic = async () => {
    try {
      const createdTopic = await apiService.createTopic(newTopic);
      
      // Upload document if selected
      if (selectedFile) {
        await apiService.uploadTopicDocument(createdTopic.id, selectedFile);
      }
      
      setTopics([...topics, createdTopic]);
      setStats(prev => ({ ...prev, totalTopics: prev.totalTopics + 1 }));
      setNewTopic({
        name: '',
        description: '',
        levels: 1,
        isActive: true
      });
      setSelectedFile(null);
      setIsCreateTopicOpen(false);
      toast({
        title: "Topic created",
        description: "The topic has been successfully created.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create topic.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTopic = async () => {
    if (!editingTopic) return;
    
    try {
      const updatedTopic = await apiService.updateTopic(editingTopic.id, editingTopic);
      
      // Upload document if selected
      if (selectedFile) {
        await apiService.uploadTopicDocument(editingTopic.id, selectedFile);
      }
      
      setTopics(topics.map(topic => 
        topic.id === editingTopic.id ? updatedTopic : topic
      ));
      setEditingTopic(null);
      setSelectedFile(null);
      setIsEditTopicOpen(false);
      toast({
        title: "Topic updated",
        description: "The topic has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update topic.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      await apiService.deleteTopic(topicId);
      setTopics(topics.filter(topic => topic.id !== topicId));
      setStats(prev => ({ ...prev, totalTopics: prev.totalTopics - 1 }));
      toast({
        title: "Topic deleted",
        description: "The topic has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete topic.",
        variant: "destructive",
      });
    }
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setIsEditTopicOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.oasis.opendocument.text'
      ];
      
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a TXT, PDF, DOC, DOCX, or ODT file.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users, institutions, and platform settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-teal-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-teal-600">Institutions</p>
                  <p className="text-2xl font-bold text-teal-900">{stats.totalInstitutions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-600">Assessments</p>
                  <p className="text-2xl font-bold text-green-900">{stats.totalAssessments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-purple-600">Certifications</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.totalCertifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-orange-600">Topics</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.totalTopics}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Users Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Management
                </CardTitle>
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
                            <SelectItem value="user">User/Student</SelectItem>
                            <SelectItem value="institution">Institution</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
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
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
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
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteUser(user.id)}
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

          {/* Institutions Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Institution Management
                </CardTitle>
                <Dialog open={isCreateInstitutionOpen} onOpenChange={setIsCreateInstitutionOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-teal-600 to-blue-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Institution
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Institution</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="institutionName">Institution Name</Label>
                        <Input 
                          id="institutionName"
                          placeholder="Institution Name" 
                          value={newInstitution.name}
                          onChange={(e) => setNewInstitution(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="institutionEmail">Contact Email</Label>
                        <Input 
                          id="institutionEmail"
                          placeholder="Contact Email" 
                          type="email" 
                          value={newInstitution.email}
                          onChange={(e) => setNewInstitution(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="institutionAddress">Address</Label>
                        <Input 
                          id="institutionAddress"
                          placeholder="Address" 
                          value={newInstitution.address}
                          onChange={(e) => setNewInstitution(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleCreateInstitution}
                      disabled={!newInstitution.name || !newInstitution.email || !newInstitution.address}
                    >
                      Create Institution
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {institutions.map((institution) => (
                    <TableRow key={institution.id}>
                      <TableCell className="font-medium">{institution.name}</TableCell>
                      <TableCell>{institution.email}</TableCell>
                      <TableCell>{institution.address}</TableCell>
                      <TableCell>{institution.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
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

          {/* Topics Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Topic Management
                </CardTitle>
                <Dialog open={isCreateTopicOpen} onOpenChange={setIsCreateTopicOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-orange-600 to-red-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Topic
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Topic</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="topicName">Topic Name</Label>
                        <Input 
                          id="topicName"
                          placeholder="Topic Name" 
                          value={newTopic.name}
                          onChange={(e) => setNewTopic(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="topicDescription">Description</Label>
                        <Textarea 
                          id="topicDescription"
                          placeholder="Topic Description" 
                          value={newTopic.description}
                          onChange={(e) => setNewTopic(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="topicLevels">Number of Levels</Label>
                        <Input 
                          id="topicLevels"
                          type="number"
                          min="1"
                          max="10"
                          value={newTopic.levels}
                          onChange={(e) => setNewTopic(prev => ({ ...prev, levels: parseInt(e.target.value) || 1 }))}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="topicActive"
                          checked={newTopic.isActive}
                          onCheckedChange={(checked) => setNewTopic(prev => ({ ...prev, isActive: checked }))}
                        />
                        <Label htmlFor="topicActive">Active</Label>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="topicDocument">Document (Optional)</Label>
                        <Input 
                          id="topicDocument"
                          type="file"
                          accept=".txt,.pdf,.doc,.docx,.odt"
                          onChange={handleFileChange}
                        />
                        <p className="text-xs text-gray-500">
                          Supported formats: TXT, PDF, DOC, DOCX, ODT
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleCreateTopic}
                      disabled={!newTopic.name || !newTopic.description}
                    >
                      Create Topic
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Levels</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topics.map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell className="font-medium">{topic.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{topic.description}</TableCell>
                      <TableCell>{topic.levels}</TableCell>
                      <TableCell>
                        <Badge variant={topic.isActive ? 'default' : 'secondary'}>
                          {topic.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {topic.documentUrl ? (
                          <Button variant="outline" size="sm" asChild>
                            <a href={topic.documentUrl} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </TableCell>
                      <TableCell>{topic.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditTopic(topic)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteTopic(topic.id)}
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
        </div>

        {/* Edit Topic Dialog */}
        <Dialog open={isEditTopicOpen} onOpenChange={setIsEditTopicOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Topic</DialogTitle>
            </DialogHeader>
            {editingTopic && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="editTopicName">Topic Name</Label>
                  <Input 
                    id="editTopicName"
                    placeholder="Topic Name" 
                    value={editingTopic.name}
                    onChange={(e) => setEditingTopic(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editTopicDescription">Description</Label>
                  <Textarea 
                    id="editTopicDescription"
                    placeholder="Topic Description" 
                    value={editingTopic.description}
                    onChange={(e) => setEditingTopic(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editTopicLevels">Number of Levels</Label>
                  <Input 
                    id="editTopicLevels"
                    type="number"
                    min="1"
                    max="10"
                    value={editingTopic.levels}
                    onChange={(e) => setEditingTopic(prev => prev ? { ...prev, levels: parseInt(e.target.value) || 1 } : null)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editTopicActive"
                    checked={editingTopic.isActive}
                    onCheckedChange={(checked) => setEditingTopic(prev => prev ? { ...prev, isActive: checked } : null)}
                  />
                  <Label htmlFor="editTopicActive">Active</Label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editTopicDocument">Update Document (Optional)</Label>
                  <Input 
                    id="editTopicDocument"
                    type="file"
                    accept=".txt,.pdf,.doc,.docx,.odt"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-gray-500">
                    Supported formats: TXT, PDF, DOC, DOCX, ODT
                  </p>
                </div>
              </div>
            )}
            <Button 
              className="w-full" 
              onClick={handleUpdateTopic}
              disabled={!editingTopic?.name || !editingTopic?.description}
            >
              Update Topic
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}