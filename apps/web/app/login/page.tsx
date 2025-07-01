import LogInForm from "@/features/auth/components/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
};

export default function LogInPage() {
  return (
    <main className="flex h-screen min-h-max shrink-0 items-center py-16">
      <div className="mx-auto w-full max-w-sm">
        <LogInForm />
      </div>
    </main>
  );
}
