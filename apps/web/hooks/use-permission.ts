import { useEffect, useState } from "react";
import { toast } from "sonner";

const permissionToast: Record<
  "camera" | "microphone",
  Record<"title" | "description", string>
> = {
  camera: {
    title: "Camera Permission",
    description: "Please grant camera permission.",
  },
  microphone: {
    title: "Audio Permission",
    description: "Please grant audio permission.",
  },
};

export function usePermission(name: "camera" | "microphone") {
  const [permission, setPermission] = useState<
    PermissionState | "undetermined"
  >("undetermined");

  const requestPermission = () => {
    if (permission === "granted" || permission === "denied") return;

    toast(permissionToast[name].title, {
      description: permissionToast[name].description,
      duration: 10000,
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast.dismiss(name);
        },
      },
      action: {
        label: "Grant",
        onClick: () => {
          toast.promise(
            navigator.mediaDevices.getUserMedia({
              video: name === "camera",
              audio: name === "microphone",
            }),
            {
              id: name,
              loading: "Requesting permission...",
              success: (stream) => {
                setPermission("granted");

                stream.getTracks().forEach((track) => {
                  track.stop();
                });

                return "Permission granted.";
              },
              error: () => {
                setPermission("denied");
                return "Permission denied.";
              },
            },
          );
        },
      },
    });
  };

  useEffect(() => {
    const controller = new AbortController();

    void navigator.permissions
      .query({ name })
      .then((p) => {
        if (controller.signal.aborted) return;
        setPermission(p.state);

        p.addEventListener(
          "change",
          () => {
            setPermission(p.state);
          },
          { signal: controller.signal },
        );
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setPermission("undetermined");
      });

    return () => {
      controller.abort();
    };
  }, [name]);

  return {
    state: permission,
    requestPermission,
  };
}
