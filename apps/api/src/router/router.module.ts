import { Module } from "@nestjs/common";
import { RouterService } from "./router.service";
import { RouterWorker } from "./router.worker";

@Module({
  providers: [RouterService, RouterWorker],
  exports: [RouterService],
})
export class RouterModule {}
