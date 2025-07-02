import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {hash} from "bcrypt";
import { UsersService } from "src/users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(email: string, password: string) {
    const passwordHash = await hash(password, 10);
    const user = await this.usersService.createUser(email, passwordHash);
    const accessToken = await this.jwtService.signAsync({
      sub: user.uid,
      email: user.email,
    });

    return { accessToken };
  }
}
