'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiService } from '@/services/api.service';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { BookOpen, Award, TrendingUp, Calendar } from 'lucide-react';

export function UserDashboard() {
  const [assessments, setAssessments] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [stats, setStats] = useState({
    totalAssessments: 0,
    totalCertifications: 0,
    averageScore: 0,
    thisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        const [userAssessments, userCertifications] = await Promise.all([
          apiService.getUserAssessments(user.id),
          apiService.getUserCertifications(user.id)
        ]);
        setAssessments(userAssessments);
        setCertifications(userCertifications);
        
        // Calculate stats from real data
        const completedAssessments = userAssessments.filter(a => a.status === 'completed');
        const avgScore = completedAssessments.length > 0 
          ? Math.round(completedAssessments.reduce((sum, a) => sum + a.score, 0) / completedAssessments.length)
          : 0;
        
        const thisMonth = userAssessments.filter(a => {
          const assessmentDate = new Date(a.date || a.createdAt);
          const now = new Date();
          return assessmentDate.getMonth() === now.getMonth() && 
                 assessmentDate.getFullYear() === now.getFullYear();
        }).length;
        
        setStats({
          totalAssessments: userAssessments.length,
          totalCertifications: userCertifications.length,
          averageScore: avgScore,
          thisMonth
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id, toast]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-gray-600 mt-2">Continue your skill development journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Assessments</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalAssessments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-teal-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-teal-600">Certifications</p>
                  <p className="text-2xl font-bold text-teal-900">{stats.totalCertifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-600">Avg. Score</p>
                  <p className="text-2xl font-bold text-green-900">{stats.averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-purple-600">This Month</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.thisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Assessments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Recent Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
              <div className="space-y-4">
                {assessments.length > 0 ? assessments.map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{assessment.title}</h3>
                      <p className="text-sm text-gray-600">
                        {assessment.status === 'completed' ? `Completed on ${assessment.date}` : 'Not started'}
                      </p>
                      {assessment.status === 'completed' && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Score: {assessment.score}%</span>
                            <Badge variant={assessment.score >= 80 ? 'default' : 'secondary'}>
                              {assessment.score >= 80 ? 'Excellent' : 'Good'}
                            </Badge>
                          </div>
                          <Progress value={assessment.score} className="mt-1" />
                        </div>
                      )}
                    </div>
                    {assessment.status === 'pending' && (
                      <Button variant="outline" className="ml-4">
                        Start
                      </Button>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    No assessments found. Start your first assessment!
                  </div>
                )}
              </div>
              )}
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                My Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
              <div className="space-y-4">
                {certifications.length > 0 ? certifications.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{cert.title}</h3>
                      <p className="text-sm text-gray-600">Issued by {cert.institution}</p>
                      <p className="text-sm text-gray-500">Earned on {cert.issueDate || cert.date}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    No certifications yet. Complete assessments to earn certifications!
                  </div>
                )}
              </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Available Assessments */}
        <Card>
          <CardHeader>
            <CardTitle>Available Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Python Programming', level: 'Intermediate', duration: '45 min' },
                { title: 'Data Analytics', level: 'Advanced', duration: '60 min' },
                { title: 'UI/UX Design', level: 'Beginner', duration: '30 min' },
              ].map((assessment, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <h3 className="font-medium mb-2">{assessment.title}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                    <span>{assessment.level}</span>
                    <span>{assessment.duration}</span>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600"
                    onClick={() => router.push(`/assessment/${index + 1}`)}
                  >
                    Start Assessment
                  </Button>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}