'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiService } from '@/services/api.service';
import { BookOpen, Award, TrendingUp, Calendar } from 'lucide-react';

export function UserDashboard() {
  const [assessments, setAssessments] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // In a real app, you'd get the user ID from the auth context
        const userId = 'current-user-id'; // Replace with actual user ID
        const [userAssessments, userCertifications] = await Promise.all([
          apiService.getUserAssessments(userId),
          apiService.getUserCertifications(userId)
        ]);
        setAssessments(userAssessments);
        setCertifications(userCertifications);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const mockAssessments = [
    { id: '1', title: 'JavaScript Fundamentals', score: 85, status: 'completed', date: '2025-01-15' },
    { id: '2', title: 'React Development', score: 0, status: 'pending', date: null },
    { id: '3', title: 'Node.js Backend', score: 92, status: 'completed', date: '2025-01-10' },
  ];

  const mockCertifications = [
    { id: '1', title: 'JavaScript Developer', institution: 'TechEd Institute', date: '2025-01-15' },
    { id: '2', title: 'Full Stack Developer', institution: 'CodeAcademy Pro', date: '2025-01-10' },
  ];

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
                  <p className="text-2xl font-bold text-blue-900">12</p>
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
                  <p className="text-2xl font-bold text-teal-900">5</p>
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
                  <p className="text-2xl font-bold text-green-900">89%</p>
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
                  <p className="text-2xl font-bold text-purple-900">3</p>
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
              <div className="space-y-4">
                {mockAssessments.map((assessment) => (
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
                ))}
              </div>
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
              <div className="space-y-4">
                {mockCertifications.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{cert.title}</h3>
                      <p className="text-sm text-gray-600">Issued by {cert.institution}</p>
                      <p className="text-sm text-gray-500">Earned on {cert.date}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Assessments */}
        <Card>
          <CardHeader>
            <CardTitle>Available Assessments</CardTitle>
          </CardHeader>
          <CardContent>
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
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600">
                    Start Assessment
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}