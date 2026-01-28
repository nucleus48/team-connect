import { UserSession } from "@thallesp/nestjs-better-auth";

interface RoomParticipant {
  id: string;
  roomId: string;
  userId: string;
  role: "host" | "participant";
}

declare module "socket.io" {
  interface Socket {
    roomId: string;
    participant: RoomParticipant;
    session?: UserSession | null;
    user?: UserSession["user"] | null;
  }
}
