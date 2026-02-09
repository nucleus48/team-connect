import { NestFactory } from "@nestjs/core";
import dotenv from "dotenv";
import { AppModule } from "./app.module";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.development.local" });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.setGlobalPrefix("api");
  await app.listen(process.env.PORT ?? 3030);
}
void bootstrap();
