import { Controller, Post } from "@nestjs/common";
import { MediaService } from "./media.service";

@Controller("media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post("create")
  createRouter() {
    return this.mediaService.createRouter(crypto.randomUUID());
  }
}
