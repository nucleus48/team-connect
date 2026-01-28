interface RoomData {
  roomId: string;
  participantId: string;
}

export async function createRoom() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? ""}/api/room/create`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (res.ok) {
    const data = (await res.json()) as RoomData;
    return data;
  }

  throw new Error("Failed to create room");
}
