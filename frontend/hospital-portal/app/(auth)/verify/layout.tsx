import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Account — MedKnot Hospital Portal',
  description:
    'Verify your contact information to access your MedKnot Hospital Portal professional workspace.',
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
