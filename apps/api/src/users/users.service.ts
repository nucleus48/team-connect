import { Database, DATABASE } from "@/db/db.module";
import { usersTable } from "@/db/entities/users";
import { ConflictException, Inject, Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async createUser(email: string, password: string) {
    const result = await this.getUserByEmail(email);

    if (result) {
      throw new ConflictException("Email address already exist");
    }

    const [user] = await this.db
      .insert(usersTable)
      .values({ email, password })
      .returning();

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.db.query.users.findFirst({
      where: (usersTable, { eq }) => eq(usersTable.email, email),
    });

    return user;
  }
}
