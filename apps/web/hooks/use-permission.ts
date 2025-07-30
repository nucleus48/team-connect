import { useEffect, useState } from "react";

export const usePermission = (name: PermissionDescriptor["name"]) => {
  const [permissionState, setPermissionState] = useState<PermissionState>();

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      const permissionStatus = await navigator.permissions.query({ name });

      setPermissionState(permissionStatus.state);

      const handleChange = () => {
        setPermissionState(permissionStatus.state);
      };

      permissionStatus.addEventListener("change", handleChange, {
        signal: controller.signal,
      });
    })();

    return () => {
      controller.abort();
    };
  }, [name]);

  return permissionState;
};
