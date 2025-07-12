import { UsersService } from "@/users/users.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokensEntity } from "@repo/shared-types";
import { compare, hash } from "bcrypt";
import { LogInDto, SignUpDto } from "./auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async generateTokens(id: number, email: string) {
    const access_token = await this.jwtService.signAsync({
      email,
      sub: id,
      role: "user",
    });

    return new TokensEntity({ access_token });
  }

  async signup(data: SignUpDto) {
    const passwordHash = await hash(data.password, 10);
    const user = await this.usersService.createUser(data.email, passwordHash);
    return this.generateTokens(user.id, user.email);
  }

  async login(data: LogInDto) {
    const user = await this.usersService.getUserByEmail(data.email);
    const isMatch = await compare(data.password, user?.password || "");

    if (!user || !isMatch) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.generateTokens(user.id, user.email);
  }
}
