import SignUpForm from "@/features/auth/components/signup-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return (
    <main className="flex h-screen min-h-max shrink-0 items-center py-16">
      <div className="mx-auto w-full max-w-sm">
        <SignUpForm />
      </div>
    </main>
  );
}
