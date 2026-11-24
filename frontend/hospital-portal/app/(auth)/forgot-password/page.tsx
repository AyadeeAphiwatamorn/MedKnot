import type { Metadata } from 'next';
import AuthLayout from '@/components/auth/AuthLayout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password — MedKnot Hospital Portal',
  description:
    'Reset your password securely to regain access to your MedKnot Hospital Portal professional workspace.',
};

/**
 * Forgot Password page — /forgot-password
 *
 * Implements the Account Recovery screen according to the Stitch design specifications.
 * Uses the blue variant for the brand showcase panel.
 */
export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      variant="blue"
      headline="Your care team's access, protected."
      subCopy="Reset your password securely to regain access to your professional healthcare workspace."
      footerTagline="Secure access for authorized healthcare professionals."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
