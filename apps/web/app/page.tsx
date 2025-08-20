import MainHeader from "@/components/main-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CreateRoomButton from "@/features/media/components/ui/create-room-btn";
import { KeyboardIcon } from "lucide-react";

export default function Home() {
  return (
    <>
      <MainHeader />
      <div className="flex h-full items-center justify-center p-4">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold">Connect Your Team Instantly</h1>
          <p className="text-muted-foreground">
            TeamConnect lets you create private video rooms in seconds. No
            downloads, no hassle, just share the code and start talking.
          </p>
          <div className="flex flex-wrap gap-4">
            <CreateRoomButton />
            <div className="flex items-center gap-2">
              <KeyboardIcon className="mt-0.5 -mr-11 h-5 w-9 shrink-0" />
              <Input className="h-10 pl-9" placeholder="Enter a code or link" />
              <Button variant={"ghost"} size={"lg"}>
                Join
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
