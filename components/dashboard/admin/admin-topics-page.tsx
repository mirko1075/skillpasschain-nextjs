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
import { topicService } from '@/services/topic.service';
import { BookOpen, Plus, Edit, Trash2, Search, Filter, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { Topic } from '@/models/topic.model';

export function AdminTopicsPage() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
  const [isEditTopicOpen, setIsEditTopicOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [newTopic, setNewTopic] = useState({
    name: '',
    description: '',
    levels: 1,
    isActive: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topicsData = await topicService.getTopics();
        setTopics(topicsData);
        setFilteredTopics(topicsData);
      } catch (error) {
        console.error('Error fetching topics:', error);
        toast({
          title: "Error",
          description: "Failed to load topics.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [toast]);

  // Filter topics based on search term and status
  useEffect(() => {
    let filtered = topics;

    if (searchTerm) {
      filtered = filtered.filter(topic => 
        topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(topic => topic.isActive === isActive);
    }

    setFilteredTopics(filtered);
  }, [topics, searchTerm, statusFilter]);

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

  const handleCreateTopic = async () => {
    try {
      const topicData = {
        ...newTopic,
        createdBy: user?._id
      };
      const createdTopic = await apiService.createTopic(topicData);
      const createdTopic = await topicService.createTopic(topicData);
      
      // Upload document if selected
      if (selectedFile) {
        await topicService.uploadTopicDocument(createdTopic.id, selectedFile);
      }
      
      setTopics([...topics, createdTopic]);
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

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic({ ...topic });
    setIsEditTopicOpen(true);
  };

  const handleUpdateTopic = async () => {
    if (!editingTopic) return;
    
    try {
      const updateData = {
        ...editingTopic,
        updatedBy: user?._id
      };
      const updatedTopic = await apiService.updateTopic(editingTopic._id, updateData);
      const updatedTopic = await topicService.updateTopic(editingTopic._id, updateData);
      
      // Upload document if selected
      if (selectedFile) {
        await topicService.uploadTopicDocument(editingTopic._id, selectedFile);
      }
      
      setTopics(topics.map(topic => 
        topic._id === editingTopic._id ? updatedTopic : topic
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
    if (!confirm('Are you sure you want to delete this topic?')) return;
    
    try {
      await topicService.deleteTopic(topicId);
      setTopics(topics.filter(topic => topic._id !== topicId));
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

  const handleToggleStatus = async (topicId: string, isActive: boolean) => {
    try {
      await topicService.updateTopicStatus(topicId, isActive);
      setTopics(topics.map(topic => 
        topic._id === topicId ? { ...topic, isActive } : topic
      ));
      toast({
        title: "Topic updated",
        description: `Topic has been ${isActive ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update topic status.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Topic Management</h1>
            <p className="text-gray-600 mt-2">Manage assessment topics and their configurations</p>
          </div>
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

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search topics by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topics Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Topics ({filteredTopics.length})
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
                    <TableHead>Description</TableHead>
                    <TableHead>Levels</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTopics.map((topic) => (
                    <TableRow key={topic._id}>
                      <TableCell className="font-medium">{topic.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{topic.description}</TableCell>
                      <TableCell>{topic.levels}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant={topic.isActive ? 'default' : 'secondary'}>
                            {topic.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Switch
                            checked={topic.isActive}
                            onCheckedChange={(checked) => handleToggleStatus(topic._id, checked)}
                            size="sm"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {topic.referenceDocumentUrl ? (
                          <Button variant="outline" size="sm" asChild>
                            <a href={topic.referenceDocumentUrl} target="_blank" rel="noopener noreferrer">
                              <Upload className="w-3 h-3 mr-1" />
                              View
                            </a>
                          </Button>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(topic.createdAt)}
                      </TableCell>
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
                            onClick={() => handleDeleteTopic(topic._id)}
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
            <div className="flex space-x-2">
              <Button 
                className="flex-1" 
                onClick={handleUpdateTopic}
                disabled={!editingTopic?.name || !editingTopic?.description}
              >
                Update Topic
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setEditingTopic(null);
                  setSelectedFile(null);
                  setIsEditTopicOpen(false);
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