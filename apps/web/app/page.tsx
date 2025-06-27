import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyboardIcon, VideoIcon } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-wrap p-4">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Connect Your Team Instantly</h1>
        <p className="text-muted-foreground">
          TeamConnect lets you create private video rooms in seconds. No
          downloads, no hassle, just share the code and start talking.
        </p>
        <form className="flex flex-wrap gap-4">
          <Button autoFocus size={"lg"}>
            <VideoIcon className="size-5" />
            <span>New room</span>
          </Button>
          <div className="flex items-center gap-2">
            <KeyboardIcon className="mt-0.5 -mr-11 h-5 w-9 shrink-0" />
            <Input className="h-10 pl-9" placeholder="Enter a code or link" />
            <Button variant={"ghost"} size={"lg"}>
              Join
            </Button>
          </div>
        </form>
      </section>
      <div></div>
    </main>
  );
}
