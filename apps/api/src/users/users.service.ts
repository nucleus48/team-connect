import { Database, DATABASE } from "@/db/db.module";
import { usersTable } from "@/db/entities/users";
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

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
      where: (users, { eq }) => eq(users.email, email),
    });

    return user;
  }

  async getUserByEmailOrThrow(email: string) {
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async getUserById(id: number) {
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });

    return user;
  }

  async getUserByIdOrThrow(id: number) {
    const user = await this.getUserById(id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }
}
