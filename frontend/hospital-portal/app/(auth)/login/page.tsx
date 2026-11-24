import type { Metadata } from 'next';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: "Sign In — MedKnot Hospital Portal",
  description:
    "Sign in to access your MedKnot Hospital Portal professional workspace. Authorized healthcare staff only.",
};

/**
 * Login page — /login
 *
 * Route entry point. Authenticated users are redirected to /dashboard via middleware.
 */
export default function LoginPage() {
  return (
    <AuthLayout
      variant="blue"
      headline="Care teams, connected."
      subCopy="One secure workspace for doctors and hospital teams to coordinate appointments, review patient records, and optimize live clinic queues."
      footerTagline="One platform. Connected healthcare."
    >
      <LoginForm />
    </AuthLayout>
  );
}
