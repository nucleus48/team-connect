import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "src/users/users.module";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

const DynamicJwtModule = JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    secret: configService.getOrThrow<string>("JWT_ACCESS_TOKEN_SECRET"),
    signOptions: { algorithm: "HS256" },
  }),
});

@Module({
  imports: [UsersModule, DynamicJwtModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthGuard, DynamicJwtModule],
})
export class AuthModule {}
