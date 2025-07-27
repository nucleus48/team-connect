import { User } from "@/db/entities/users";
import { UsersService } from "@/users/users.service";
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  ACCESS_TOKEN_DURATION,
  REFRESH_TOKEN_DURATION,
  TokenPayload,
  TokensEntity,
} from "@repo/shared-types";
import { compare, hash } from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup({ email, password }: Pick<User, "email" | "password">) {
    let user = await this.usersService.getUserByEmail({ email });

    if (user) {
      throw new ConflictException("Account already exist");
    }

    const passwordHash = await hash(password, 10);

    user = await this.usersService.createUser({
      email,
      password: passwordHash,
    });

    return this.generateTokens(user);
  }

  async login({ email, password }: Pick<User, "email" | "password">) {
    const user = await this.usersService.getUserByEmail({ email });
    const authenticated = await compare(password, user?.password || "");

    if (!user || !authenticated) {
      throw new UnauthorizedException("Invalid account credentials");
    }

    const tokens = await this.generateTokens(user);

    if (!tokens) {
      throw new InternalServerErrorException("Tokens generation failed");
    }

    return tokens;
  }

  async refreshToken(token: string) {
    const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
      secret: this.configService.getOrThrow<string>("JWT_REFRESH_TOKEN_SECRET"),
    });
    return this.generateTokens({ email: payload.email, id: payload.sub });
  }

  private async generateTokens({ email, id }: Pick<User, "id" | "email">) {
    try {
      const accessToken = await this.jwtService.signAsync(
        {
          email,
          sub: id,
        },
        { expiresIn: ACCESS_TOKEN_DURATION },
      );

      const refreshToken = await this.jwtService.signAsync(
        {
          email,
          sub: id,
        },
        {
          expiresIn: REFRESH_TOKEN_DURATION,
          secret: this.configService.getOrThrow<string>(
            "JWT_REFRESH_TOKEN_SECRET",
          ),
        },
      );

      return new TokensEntity({ accessToken, refreshToken });
    } catch {
      return null;
    }
  }
}
