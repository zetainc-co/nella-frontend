'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/modules/auth/components/shared';
import { CreatePasswordForm } from '@/modules/auth/components/create-password-form';

function CreatePasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return (
      <div className="auth-card p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Link inválido</h2>
        <p className="text-muted-foreground">
          El link de activación es inválido o está incompleto.
        </p>
      </div>
    );
  }

  return (
    <div className="auth-card p-8">
      {/* Branding */}
      <div className="text-center space-y-1.5 mb-7">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Nella<span style={{ color: '#9EFF00' }}>Sales</span>
        </h1>
        <p className="text-sm" style={{ color: 'rgba(240,244,255,0.5)' }}>
          Crea tu contraseña
        </p>
      </div>

      <CreatePasswordForm token={token} email={email} />
    </div>
  );
}

export default function CreatePasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div>Cargando...</div>}>
        <CreatePasswordContent />
      </Suspense>
    </AuthLayout>
  );
}
