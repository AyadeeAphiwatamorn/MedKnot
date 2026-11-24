import type { Metadata } from 'next';
import AuthLayout from '@/components/auth/AuthLayout';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password — MedKnot Hospital Portal',
  description:
    'Create a new password to regain access to your MedKnot Hospital Portal professional workspace.',
};

/**
 * Reset Password page — /reset-password
 *
 * Implements the Create New Password screen according to the Stitch design specifications.
 * Uses the green variant with the soft glowing background.
 */
export default function ResetPasswordPage() {
  return (
    <AuthLayout
      variant="green"
      headline="Secure your account."
      subCopy="Create a new password to regain access to your professional healthcare workspace."
      footerTagline="Secure access for authorized healthcare professionals."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
