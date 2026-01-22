import { Injectable, OnModuleInit } from "@nestjs/common";
import * as mediasoup from "mediasoup";
import os from "os";
import { config } from "../config/mediasoup.config";

@Injectable()
export class RouterWorker implements OnModuleInit {
  private nextWorkerIndex = 0;
  private workers: mediasoup.types.Worker[] = [];

  async onModuleInit() {
    const cpus = os.cpus().length;

    for (let i = 0; i < cpus; i++) {
      const worker = await mediasoup.createWorker({
        logLevel: config.worker.logLevel,
        logTags: config.worker.logTags,
      });

      this.workers.push(worker);
    }
  }

  get worker() {
    const worker = this.workers[this.nextWorkerIndex++];

    if (!worker) {
      throw new Error("Worker not found");
    }

    if (this.nextWorkerIndex >= this.workers.length) {
      this.nextWorkerIndex = 0;
    }

    return worker;
  }
}
