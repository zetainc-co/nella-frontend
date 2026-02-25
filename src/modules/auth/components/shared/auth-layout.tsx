import { AuthBackground } from "./auth-background";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * AuthLayout — centra el contenido auth dentro de AuthBackground.
 * Usar este componente en páginas de login y registro.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthBackground>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="w-full max-w-[480px]"
          style={{ animation: "fadeIn 0.35s ease-out" }}
        >
          {children}
        </div>
      </div>
    </AuthBackground>
  );
}
