import { useEffect, useRef, useState } from "react";
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

  const promiseRef = useRef<Promise<unknown>>(null);

  const requestPermission = () => {
    if (permission === "granted" || permission === "denied")
      return Promise.resolve();

    if (promiseRef.current) return promiseRef.current;

    const { promise, resolve, reject } = Promise.withResolvers();
    promiseRef.current = promise;

    toast(permissionToast[name].title, {
      description: permissionToast[name].description,
      duration: 10000,
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast.dismiss(name);
          reject(new Error("Permission denied"));
          promiseRef.current = null;
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
                resolve("Permission granted");
                promiseRef.current = null;
                return "Permission granted.";
              },
              error: () => {
                setPermission("denied");
                reject(new Error("Permission denied"));
                promiseRef.current = null;
                return "Permission denied.";
              },
            },
          );
        },
      },
    });

    return promise;
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
