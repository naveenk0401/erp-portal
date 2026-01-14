'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAccessToken, parseJwt } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = () => {
    const token = getAccessToken();
    
    // 1. Check if authenticated
    if (!token) {
      if (pathname !== '/login' && pathname !== '/register') {
        router.push('/login');
      } else {
        setIsAuthorized(true); // Allow login/register if no token
        setIsLoading(false);
      }
      return;
    }

    const payload = parseJwt(token);
    
    // 2. Check if active company selected
    const hasActiveCompany = !!payload?.active_company_id;

    if (!hasActiveCompany && pathname !== '/onboarding') {
      router.push('/onboarding');
      return;
    }

    // 3. Prevent logged-in users from visiting login/register
    if (token && (pathname === '/login' || pathname === '/register')) {
      if (hasActiveCompany) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-emerald-500 w-12 h-12" />
        <p className="text-slate-400 font-medium animate-pulse">Securing workspace...</p>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
