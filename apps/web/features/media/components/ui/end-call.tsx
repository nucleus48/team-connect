import { Button } from "@/components/ui/button";
import { PhoneIcon } from "lucide-react";

export default function EndCall({
  setJoined,
}: {
  setJoined: (value: boolean) => void;
}) {
  return (
    <Button
      size="icon"
      variant={"secondary"}
      className={"!w-max rounded-full bg-red-600 px-6 hover:bg-red-400"}
      onClick={() => setJoined(false)}
    >
      <PhoneIcon className="rotate-[135deg] stroke-white" />
    </Button>
  );
}
