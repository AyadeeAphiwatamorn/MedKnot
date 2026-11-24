import type { Metadata } from "next";
import { RegistrationProvider } from "@/components/registration/RegistrationContext";

export const metadata: Metadata = {
  title: "Register Your Hospital — MedKnot Connected Care",
  description:
    "Join the MedKnot AI Smart Healthcare Triage & Care Management Platform. Institutional registration for hospitals and clinical facilities.",
};

export default function RegisterHospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RegistrationProvider>{children}</RegistrationProvider>;
}
