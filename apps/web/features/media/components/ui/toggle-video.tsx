import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/use-permission";
import { cn } from "@/lib/utils";
import { VideoIcon, VideoOffIcon } from "lucide-react";
import { useUserMedia } from "../../providers/user-media-provider";

export default function ToggleVideo({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const cameraPermission = usePermission("camera");
  const { isVideoEnabled, setVideoEnabled, enableVideoPermission } =
    useUserMedia();

  return (
    <Button
      size="icon"
      variant={"secondary"}
      className={cn("rounded-full", className)}
      onClick={
        cameraPermission !== "granted"
          ? enableVideoPermission
          : () => setVideoEnabled((p) => !p)
      }
      {...props}
    >
      {isVideoEnabled && cameraPermission === "granted" ? (
        <VideoIcon />
      ) : (
        <VideoOffIcon />
      )}
    </Button>
  );
}
