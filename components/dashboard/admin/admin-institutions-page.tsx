'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { institutionService } from '@/services/institution.service';
import { Building2, Plus, Edit, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { Institution } from '@/models/institution.model';

export function AdminInstitutionsPage() {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateInstitutionOpen, setIsCreateInstitutionOpen] = useState(false);
  const [isEditInstitutionOpen, setIsEditInstitutionOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [newInstitution, setNewInstitution] = useState({
    name: '',
    email: '',
    address: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const institutionsData = await institutionService.getInstitutions();
        setInstitutions(institutionsData);
        setFilteredInstitutions(institutionsData);
      } catch (error) {
        console.error('Error fetching institutions:', error);
        toast({
          title: "Error",
          description: "Failed to load institutions.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, [toast]);

  // Filter institutions based on search term
  useEffect(() => {
    let filtered = institutions;

    if (searchTerm) {
      filtered = filtered.filter(institution => 
        institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institution.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (institution.address && institution.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredInstitutions(filtered);
  }, [institutions, searchTerm]);

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

  const handleCreateInstitution = async () => {
    try {
      const institutionData = {
        ...newInstitution,
        createdBy: user?._id
      };
      const createdInstitution = await apiService.createInstitution(institutionData);
      const createdInstitution = await institutionService.createInstitution(institutionData);
      setInstitutions([...institutions, createdInstitution]);
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

  const handleEditInstitution = (institution: Institution) => {
    setEditingInstitution({ ...institution });
    setIsEditInstitutionOpen(true);
  };

  const handleUpdateInstitution = async () => {
    if (!editingInstitution) return;
    
    try {
      const updateData = {
        name: editingInstitution.name,
        email: editingInstitution.email,
        address: editingInstitution.address,
        updatedBy: user?._id
      };
      
      const updatedInstitution = await institutionService.updateInstitution(editingInstitution._id, updateData);
      setInstitutions(institutions.map(institution => 
        institution._id === editingInstitution._id ? updatedInstitution : institution
      ));
      setEditingInstitution(null);
      setIsEditInstitutionOpen(false);
      toast({
        title: "Institution updated",
        description: "The institution has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update institution.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInstitution = async (institutionId: string) => {
    if (!confirm('Are you sure you want to delete this institution?')) return;
    
    try {
      await institutionService.deleteInstitution(institutionId);
      setInstitutions(institutions.filter(institution => institution._id !== institutionId));
      toast({
        title: "Institution deleted",
        description: "The institution has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete institution.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Institution Management</h1>
            <p className="text-gray-600 mt-2">Manage educational institutions and certification providers</p>
          </div>
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

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search institutions by name, email, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Institutions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Institutions ({filteredInstitutions.length})
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
                    <TableHead>Address</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstitutions.map((institution) => (
                    <TableRow key={institution._id}>
                      <TableCell className="font-medium">{institution.name}</TableCell>
                      <TableCell>{institution.email}</TableCell>
                      <TableCell>{institution.address}</TableCell>
                      <TableCell>
                        {formatDate(institution.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditInstitution(institution)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteInstitution(institution._id)}
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

        {/* Edit Institution Dialog */}
        <Dialog open={isEditInstitutionOpen} onOpenChange={setIsEditInstitutionOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Institution</DialogTitle>
            </DialogHeader>
            {editingInstitution && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="editInstitutionName">Institution Name</Label>
                  <Input 
                    id="editInstitutionName"
                    placeholder="Institution Name" 
                    value={editingInstitution.name}
                    onChange={(e) => setEditingInstitution(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editInstitutionEmail">Contact Email</Label>
                  <Input 
                    id="editInstitutionEmail"
                    placeholder="Contact Email" 
                    type="email" 
                    value={editingInstitution.email}
                    onChange={(e) => setEditingInstitution(prev => prev ? { ...prev, email: e.target.value } : null)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editInstitutionAddress">Address</Label>
                  <Input 
                    id="editInstitutionAddress"
                    placeholder="Address" 
                    value={editingInstitution.address || ''}
                    onChange={(e) => setEditingInstitution(prev => prev ? { ...prev, address: e.target.value } : null)}
                  />
                </div>
              </div>
            )}
            <div className="flex space-x-2">
              <Button 
                className="flex-1" 
                onClick={handleUpdateInstitution}
                disabled={!editingInstitution?.name || !editingInstitution?.email}
              >
                Update Institution
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setEditingInstitution(null);
                  setIsEditInstitutionOpen(false);
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