'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Loader2 } from 'lucide-react';

export function DashboardRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role
      const redirectPath = user.role === 'admin' 
        ? '/dashboard/admin' 
        : user.role === 'institution' 
        ? '/dashboard/institution' 
        : '/dashboard/user';
      
      window.location.href = redirectPath;
    } else if (!loading && !user) {
      window.location.href = '/login';
    }
  }, [user, loading, router]);

  if (!loading && !user) {
    return null; // Will redirect to login
  }

  if (!loading && user) {
    return null; // Will redirect to appropriate dashboard
  }
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}