'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiService } from '@/services/api.service';
import { useAuth } from '@/providers/auth-provider';
import { Award, Users, FileText, TrendingUp, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function InstitutionDashboard() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const certificationsData = await apiService.getCertifications();
        setCertifications(certificationsData);
      } catch (error) {
        console.error('Error fetching institution data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const mockCertifications = [
    { 
      id: '1', 
      title: 'Advanced JavaScript Developer', 
      recipient: 'John Doe', 
      recipientEmail: 'john@example.com',
      issueDate: '2025-01-15', 
      status: 'issued',
      score: 92
    },
    { 
      id: '2', 
      title: 'React Specialist', 
      recipient: 'Jane Smith', 
      recipientEmail: 'jane@example.com',
      issueDate: '2025-01-14', 
      status: 'pending',
      score: 88
    },
    { 
      id: '3', 
      title: 'Full Stack Developer', 
      recipient: 'Mike Johnson', 
      recipientEmail: 'mike@example.com',
      issueDate: '2025-01-10', 
      status: 'issued',
      score: 95
    },
  ];

  const handleIssueCertification = async (certificationData: any) => {
    try {
      await apiService.createCertification(certificationData);
      toast({
        title: "Certification issued",
        description: "The certification has been successfully issued.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to issue certification.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Institution Dashboard</h1>
          <p className="text-gray-600 mt-2">Issue and manage certifications for your learners</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Issued Certs</p>
                  <p className="text-2xl font-bold text-blue-900">342</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-teal-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-teal-600">Recipients</p>
                  <p className="text-2xl font-bold text-teal-900">186</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-600">Pending</p>
                  <p className="text-2xl font-bold text-green-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-purple-600">This Month</p>
                  <p className="text-2xl font-bold text-purple-900">24</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certifications Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Certification Management
              </CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-teal-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Issue Certification
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Issue New Certification</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Input placeholder="Certification Title" />
                    <Input placeholder="Recipient Email" type="email" />
                    <Input placeholder="Recipient Name" />
                    <Input placeholder="Issue Date" type="date" />
                  </div>
                  <Button className="w-full">Issue Certification</Button>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certification</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCertifications.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">{cert.title}</TableCell>
                    <TableCell>{cert.recipient}</TableCell>
                    <TableCell>{cert.recipientEmail}</TableCell>
                    <TableCell>
                      <Badge variant={cert.score >= 90 ? 'default' : 'secondary'}>
                        {cert.score}%
                      </Badge>
                    </TableCell>
                    <TableCell>{cert.issueDate}</TableCell>
                    <TableCell>
                      <Badge variant={cert.status === 'issued' ? 'default' : 'secondary'}>
                        {cert.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Bulk Issue</h3>
              <p className="text-gray-600 mb-4">Issue multiple certifications at once</p>
              <Button variant="outline" className="w-full">
                Start Bulk Issue
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-teal-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Templates</h3>
              <p className="text-gray-600 mb-4">Manage certification templates</p>
              <Button variant="outline" className="w-full">
                Manage Templates
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600 mb-4">View detailed reports</p>
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}