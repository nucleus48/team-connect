import { Logo } from "@/components/logo";
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
          <Logo className="text-foreground h-6 w-auto" />
          <span className="text-foreground hidden text-xl font-medium sm:block">
            Team Connect
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Add more header items if needed like settings or profile */}
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

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center overflow-hidden p-6 md:p-12">
        <div className="grid w-full max-w-7xl grid-cols-1 items-center gap-12 md:grid-cols-2">
          {/* Left Column: Text & Actions */}
          <div className="mx-auto flex max-w-xl flex-col gap-8 text-center md:mx-0 md:text-left">
            <div className="space-y-4">
              <h1 className="text-foreground text-4xl leading-[1.1] font-normal tracking-tight md:text-5xl lg:text-6xl">
                Video calls and meetings for everyone
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed md:text-xl">
                Connect, collaborate, and celebrate from anywhere with Team
                Connect.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row md:justify-start">
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
                <a href="#" className="hover:text-primary underline">
                  Learn more
                </a>{" "}
                about Team Connect
              </p>
            </div>
          </div>

          {/* Right Column: Hero ImageCarousel */}
          <div className="relative flex items-center justify-center">
            {/* Using a placeholder or the uploaded image idea. 
                 Since I can't easily access the uploaded image by URL cleanly without more hacks, 
                 I'll create a nice visual placeholder using CSS/SVG or just a div for now 
                 that represents the 'connect' aspect. */}
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-50 to-indigo-50 opacity-60 blur-3xl dark:from-slate-900 dark:to-zinc-900"></div>
              {/*  A carousel-like graphic representation */}
              <div className="bg-card border-border relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border p-4 shadow-2xl">
                <div className="grid h-3/4 w-3/4 grid-cols-2 gap-4 opacity-80">
                  <div className="bg-muted animate-pulse rounded-lg delay-75"></div>
                  <div className="bg-muted animate-pulse rounded-lg delay-100"></div>
                  <div className="bg-muted animate-pulse rounded-lg delay-150"></div>
                  <div className="bg-muted animate-pulse rounded-lg delay-200"></div>
                </div>

                {/* Central Icon/Logo overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-background border-border rounded-full border p-6 shadow-xl">
                    <Logo className="text-primary h-12 w-12" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
