import { AuthPage as Auth } from "@/components/auth-page";
import { Suspense } from "react";

export default function AuthPage() {
  return (
    <Suspense>
      <Auth />
    </Suspense>
  );
}
