"use client";

import { Button } from "@/components/ui/button";
import { VideoIcon } from "lucide-react";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { createRoom } from "../../lib/actions";

export default function CreateRoomButton(
  props: React.ComponentProps<"button">,
) {
  const [isLoading, startTransition] = useTransition();

  const handleCreateRoom = useCallback(async () => {
    const error = await createRoom();
    toast.error(error);
  }, []);

  return (
    <Button
      autoFocus
      size={"lg"}
      onClick={() => startTransition(handleCreateRoom)}
      {...props}
    >
      <VideoIcon className="size-5" />
      <span>{isLoading ? "Creating room..." : "New room"}</span>
    </Button>
  );
}
