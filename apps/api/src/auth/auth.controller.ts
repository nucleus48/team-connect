import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Req,
  UseInterceptors,
} from "@nestjs/common";
import { Request } from "express";
import { LogInDto, SignUpDto } from "./auth.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  handleSignup(@Body() body: SignUpDto) {
    return this.authService.signup(body);
  }

  @Post("login")
  handleLogin(@Body() body: LogInDto) {
    return this.authService.login(body);
  }

  @Post("refresh")
  handleTokenRefresh(@Req() req: Request) {
    const [type, token] = req.headers.authorization?.split(" ") ?? [];

    if (type === "Bearer" && typeof token === "string") {
      return this.authService.refreshToken(token);
    }

    throw new BadRequestException("Missing refresh token");
  }
}
