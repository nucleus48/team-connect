"use client";

import { Button } from "@/components/ui/button";
import { Home01Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";

export default function LeftState() {
  const router = useRouter();

  const handleRejoin = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="animate-in fade-in slide-in-from-bottom-4 flex max-w-md flex-col items-center space-y-8 text-center duration-700">
        <div className="space-y-3">
          <h1 className="text-4xl font-normal tracking-tight sm:text-5xl">
            You&apos;ve left the meeting
          </h1>
          <p className="text-muted-foreground text-lg">
            Thanks for using Team Connect. You can rejoin the meeting or return
            to the home screen.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            variant="outline"
            className="h-12 flex-1 rounded-full px-8 text-sm transition-all"
            onClick={handleGoHome}
          >
            <HugeiconsIcon icon={Home01Icon} className="mr-2 size-4" />
            Go to Home
          </Button>
          <Button
            size="lg"
            className="h-12 flex-1 rounded-full px-8 text-sm"
            onClick={handleRejoin}
          >
            <HugeiconsIcon icon={RefreshIcon} className="mr-2 size-4" />
            Rejoin
          </Button>
        </div>
      </div>
    </div>
  );
}
