import { NestFactory } from "@nestjs/core";
import { AuthService } from "@thallesp/nestjs-better-auth";
import { toNodeHandler } from "better-auth/node";
import express from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const expressApp = app.getHttpAdapter().getInstance() as express.Express;
  const authService = app.get<AuthService>(AuthService);

  app.enableCors({
    origin: authService.instance.options.trustedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  });

  expressApp.all(
    "/api/auth/*path",
    toNodeHandler(authService.instance.handler),
  );

  expressApp.use(express.json());
  app.setGlobalPrefix("api");

  await app.listen(process.env.PORT ?? 3030);
}
void bootstrap();
