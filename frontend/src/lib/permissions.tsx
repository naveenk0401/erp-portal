'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

interface PermissionsContextType {
  permissions: Set<string>;
  isLoading: boolean;
  refreshPermissions: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = async () => {
    const token = getAccessToken();
    if (!token) {
      setPermissions(new Set());
      setIsLoading(false);
      return;
    }

    try {
      // Ensure the URL matches the backend mounting point
      const response = await api.get('auth/permissions');
      setPermissions(new Set(response.data));
    } catch (error: any) {
      console.error('Failed to fetch permissions', error);
      setPermissions(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const hasPermission = (permission: string) => {
    return permissions.has(permission);
  };

  return (
    <PermissionsContext.Provider 
      value={{ 
        permissions, 
        isLoading, 
        refreshPermissions: fetchPermissions,
        hasPermission 
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

export function useCheckPermission(permission: string) {
  const { hasPermission, isLoading } = usePermissions();
  if (isLoading) return false;
  return hasPermission(permission);
}

export function useCheckPermissions(permissions: string[], mode: 'AND' | 'OR' = 'AND') {
  const { hasPermission, isLoading } = usePermissions();
  if (isLoading) return false;
  
  if (mode === 'AND') {
    return permissions.every(p => hasPermission(p));
  }
  return permissions.some(p => hasPermission(p));
}

export function Can({ I, children, fallback = null }: { I: string; children: ReactNode; fallback?: ReactNode }) {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) return null;
  
  if (hasPermission(I)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
