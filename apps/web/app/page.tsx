import NewRoomBtn from "@/components/room/new-room-btn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyboardIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function Home() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-xl font-medium">
            Team Connect
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground mr-4 text-sm">
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            •{" "}
            {new Date().toLocaleDateString([], {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center overflow-hidden p-6 md:p-12">
        <div className="flex max-w-xl flex-col gap-8 text-center">
          <div className="space-y-4">
            <h1 className="text-foreground text-4xl leading-[1.1] font-normal tracking-tight md:text-5xl lg:text-6xl">
              Video calls and meetings for everyone
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed md:text-xl">
              Connect, collaborate, and celebrate from anywhere with Team
              Connect.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <NewRoomBtn />

            <div className="bg-background relative flex w-full max-w-xs items-center gap-2 sm:w-auto">
              <div className="relative w-full">
                <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                  <HugeiconsIcon
                    className="h-5 w-5"
                    icon={KeyboardIcon}
                    strokeWidth={2}
                  />
                </div>
                <Input
                  placeholder="Enter a code or link"
                  className="h-12 pr-16 pl-10 text-base"
                />
              </div>
              <Button
                variant="ghost"
                size="lg"
                className="text-muted-foreground hover:text-foreground absolute right-0 h-12 px-4 text-base"
                disabled
              >
                Join
              </Button>
            </div>
          </div>

          <div className="border-border mt-4 border-t pt-8">
            <p className="text-muted-foreground text-sm">
              Connect with Team Connect
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
