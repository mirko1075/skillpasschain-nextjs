'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Loader2 } from 'lucide-react';

export function DashboardRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        // Redirect based on user role
        switch (user.role) {
          case 'admin':
            router.push('/dashboard/admin');
            break;
          case 'institution':
            router.push('/dashboard/institution');
            break;
          default:
            router.push('/dashboard/user');
            break;
        }
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}