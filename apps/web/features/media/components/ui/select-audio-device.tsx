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

export default function SelectAudioDevice(
  props: React.ComponentProps<typeof SelectTrigger>,
) {
  const { setAudioDeviceGroupId, audioTrack, isAudioEnabled } = useUserMedia();
  const microphonePermission = usePermission("microphone");
  const { audioDevices } = useMediaDevices();

  return (
    <Select
      disabled={microphonePermission !== "granted" || !isAudioEnabled}
      value={isAudioEnabled ? (audioTrack?.getSettings().groupId ?? "") : ""}
      onValueChange={setAudioDeviceGroupId}
    >
      <SelectTrigger {...props}>
        <SelectValue placeholder={"Audio disabled"} />
      </SelectTrigger>
      <SelectContent>
        {audioDevices.map((device) => (
          <SelectItem key={device.groupId} value={device.groupId}>
            {device.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
