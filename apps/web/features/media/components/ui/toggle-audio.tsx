import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/use-permission";
import { cn } from "@/lib/utils";
import { MicIcon, MicOffIcon } from "lucide-react";
import { useUserMedia } from "../../providers/user-media-provider";

export default function ToggleAudio({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { isAudioEnabled, setAudioEnabled, enableAudioPermission } =
    useUserMedia();
  const microphonePermission = usePermission("microphone");

  return (
    <Button
      size="icon"
      variant={"secondary"}
      className={cn("rounded-full", className)}
      onClick={
        microphonePermission !== "granted"
          ? enableAudioPermission
          : () => setAudioEnabled((p) => !p)
      }
      {...props}
    >
      {isAudioEnabled && microphonePermission === "granted" ? (
        <MicIcon />
      ) : (
        <MicOffIcon />
      )}
    </Button>
  );
}
