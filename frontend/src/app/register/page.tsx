'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { setTokens } from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', {
        email: data.email,
        password: data.password
      });
      const { access_token, refresh_token } = response.data;
      setTokens(access_token, refresh_token);
      setIsSuccess(true);
      setTimeout(() => router.push('/onboarding'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
              <UserPlus className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
            <p className="text-slate-400 mt-2">Join the enterprise ERP portal</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            {isSuccess && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-sm"
              >
                <CheckCircle2 size={18} />
                Registration successful! Redirecting...
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full bg-slate-800/50 border ${errors.email ? 'border-red-500/50' : 'border-slate-700'} rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  {...register('password')}
                  type="password"
                  className={`w-full bg-slate-800/50 border ${errors.password ? 'border-red-500/50' : 'border-slate-700'} rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-red-400 ml-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  className={`w-full bg-slate-800/50 border ${errors.confirmPassword ? 'border-red-500/50' : 'border-slate-700'} rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400 ml-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  Register
                  <UserPlus className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
