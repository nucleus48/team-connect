"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn, tryCatch } from "@/lib/utils";
import { createRoom } from "@/services/room";
import { Loading03Icon, Video01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export default function NewRoomBtn() {
  const router = useRouter();
  const session = useSession();
  const [isPending, startTransition] = useTransition();

  const handleCreateRoom = async () => {
    if (!session.data) {
      router.push("/auth");
      return;
    }

    const { success, error, data } = await tryCatch(createRoom());

    if (success) {
      router.push(`/room/${data.roomId}`);
    } else {
      toast.error(error.message);
    }
  };

  return (
    <Button
      size="lg"
      onClick={() => {
        startTransition(handleCreateRoom);
      }}
      disabled={isPending}
      className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 gap-2 px-6 text-base"
    >
      <HugeiconsIcon
        strokeWidth={2}
        className={cn("h-5 w-5", isPending && "animate-spin")}
        icon={isPending ? Loading03Icon : Video01Icon}
      />
      New meeting
    </Button>
  );
}
