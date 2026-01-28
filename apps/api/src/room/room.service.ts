import { DB_INSTANCE } from "@/db/db";
import { roomParticipantTable, roomTable } from "@/db/schema";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { v7 as uuid } from "uuid";

@Injectable()
export class RoomService {
  constructor(@Inject(DB_INSTANCE) private dbService: DB_INSTANCE) {}

  async create(userId: string) {
    const roomId = uuid();
    const participantId = uuid();

    await this.dbService.transaction(async (tx) => {
      await tx.insert(roomTable).values({ id: roomId });
      await tx.insert(roomParticipantTable).values({
        id: participantId,
        role: "host",
        userId,
        roomId,
      });
    });

    return { roomId, participantId };
  }

  async join(roomId: string, userId: string) {
    const roomExist = await this.getRoomById(roomId);

    if (!roomExist) {
      throw new BadRequestException("Room not found");
    }

    const participantId = uuid();

    await this.dbService.insert(roomParticipantTable).values({
      id: participantId,
      role: "participant",
      userId,
      roomId,
    });

    return { roomId, participantId };
  }

  async getRoomById(id: string) {
    const room = await this.dbService.query.roomTable.findFirst({
      where: () => eq(roomTable.id, id),
    });

    return room;
  }

  async getRoomParticipant(roomId: string, userId: string) {
    const participant =
      await this.dbService.query.roomParticipantTable.findFirst({
        where: () =>
          and(
            eq(roomParticipantTable.roomId, roomId),
            eq(roomParticipantTable.userId, userId),
          ),
      });

    return participant;
  }
}
