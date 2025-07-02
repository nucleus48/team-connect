import { Body, Controller, Post } from "@nestjs/common";
import { LogInDto, SignUpDto } from "./auth.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  signup(@Body() body: SignUpDto) {
    return this.authService.signup(body);
  }

  @Post("login")
  login(@Body() body: LogInDto) {
    return this.authService.login(body);
  }
}
