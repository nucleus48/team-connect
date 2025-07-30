import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermission } from "@/hooks/use-permission";
import { useMediaDevices } from "../../hooks/use-media-devices";
import { useUserMedia } from "../../providers/user-media-provider";

export default function SelectVideoDevice(
  props: React.ComponentProps<typeof SelectTrigger>,
) {
  const { setVideoDeviceGroupId, videoTrack, isVideoEnabled } = useUserMedia();
  const cameraPermission = usePermission("camera");
  const { videoDevices } = useMediaDevices();

  return (
    <Select
      disabled={cameraPermission !== "granted" || !isVideoEnabled}
      value={isVideoEnabled ? (videoTrack?.getSettings().groupId ?? "") : ""}
      onValueChange={setVideoDeviceGroupId}
    >
      <SelectTrigger {...props}>
        <SelectValue placeholder={"Video disabled"} />
      </SelectTrigger>
      <SelectContent>
        {videoDevices.map((device) => (
          <SelectItem key={device.groupId} value={device.groupId}>
            {device.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
