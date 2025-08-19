'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiService } from '@/services/api.service';
import { Users, Building2, Award, BookOpen, ArrowRight, TrendingUp, Calendar, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Institution } from '@/models/institution.model';
import { Topic } from '@/models/topic.model';
import { User } from '@/models/user.model';

export function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInstitutions: 0,
    totalAssessments: 0,
    totalCertifications: 0,
    totalTopics: 0,
    activeTopics: 0,
    thisMonthUsers: 0,
    thisMonthAssessments: 0
  });
  const [loading, setLoading] = useState(true);
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
        
        // Calculate additional stats
        const activeTopics = topicsData.filter((topic: Topic) => topic.isActive).length;
        const thisMonth = new Date();
        const thisMonthUsers = usersData.filter((user: User) => {
          const userDate = new Date(user.createdAt);
          return userDate.getMonth() === thisMonth.getMonth() && 
                 userDate.getFullYear() === thisMonth.getFullYear();
        }).length;
        
        setStats({
          totalUsers: usersData.length,
          totalInstitutions: institutionsData.length,
          totalAssessments: assessmentsData.length,
          totalCertifications: certificationsData.length,
          totalTopics: topicsData.length,
          activeTopics,
          thisMonthUsers,
          thisMonthAssessments: Math.floor(Math.random() * 50) // Mock data
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
  }, [toast]);

  const formatDate = (date: Date) => {
    if (!(date instanceof Date)) date = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const recentUsers = users.slice(0, 5);
  const recentTopics = topics.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Platform overview and quick access to management tools</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-600">This month</p>
                  <p className="text-sm font-bold text-blue-800">+{stats.thisMonthUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="w-8 h-8 text-teal-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-teal-600">Institutions</p>
                    <p className="text-2xl font-bold text-teal-900">{stats.totalInstitutions}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-600">Topics</p>
                    <p className="text-2xl font-bold text-green-900">{stats.totalTopics}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-600">Active</p>
                  <p className="text-sm font-bold text-green-800">{stats.activeTopics}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-purple-600">Certifications</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.totalCertifications}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50"
                onClick={() => router.push('/dashboard/admin/users')}
              >
                <Users className="w-6 h-6 text-blue-600" />
                <span>Manage Users</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-teal-50"
                onClick={() => router.push('/dashboard/admin/institutions')}
              >
                <Building2 className="w-6 h-6 text-teal-600" />
                <span>Manage Institutions</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50"
                onClick={() => router.push('/dashboard/admin/topics')}
              >
                <BookOpen className="w-6 h-6 text-green-600" />
                <span>Manage Topics</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Recent Users
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/dashboard/admin/users')}
                >
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Topics */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Recent Topics
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/dashboard/admin/topics')}
                >
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {recentTopics.map((topic) => (
                    <div key={topic._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{topic.name}</p>
                        <p className="text-sm text-gray-600 truncate max-w-xs">{topic.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={topic.isActive ? 'default' : 'secondary'}>
                          {topic.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {topic.levels} levels
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.totalAssessments}</p>
                <p className="text-sm text-gray-600">Total Assessments</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.thisMonthAssessments}</p>
                <p className="text-sm text-gray-600">This Month</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.totalCertifications}</p>
                <p className="text-sm text-gray-600">Certifications Issued</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{Math.round((stats.activeTopics / stats.totalTopics) * 100) || 0}%</p>
                <p className="text-sm text-gray-600">Topics Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}