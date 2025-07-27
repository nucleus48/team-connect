import { Database, DATABASE } from "@/db/db.module";
import { User, usersTable } from "@/db/entities/users";
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async createUser({ email, password }: Pick<User, "email" | "password">) {
    const result = await this.getUserByEmail({ email });

    if (result) {
      throw new ConflictException("Email address already exist");
    }

    const [user] = await this.db
      .insert(usersTable)
      .values({ email, password })
      .returning();

    return user;
  }

  async getUserByEmail({ email }: Pick<User, "email">) {
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    return user;
  }

  async getUserByEmailOrThrow({ email }: Pick<User, "email">) {
    const user = await this.getUserByEmail({ email });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async getUserById({ id: userId }: Pick<User, "id">) {
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });

    return user;
  }

  async getUserByIdOrThrow({ id: userId }: Pick<User, "id">) {
    const user = await this.getUserById({ id: userId });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }
}
