import { Injectable, OnModuleInit } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { createWorker, types } from "mediasoup";
import { cpus } from "os";

@Injectable()
export class MediaWorkers implements OnModuleInit {
  private nextWorkerIdx = 0;
  private workers: types.Worker[] = [];

  async onModuleInit() {
    await this.createWorkers();
  }

  private async createWorkers() {
    const numWorkers = Object.keys(cpus()).length;
    const workerPromises: Promise<types.Worker>[] = [];

    for (let i = 0; i < numWorkers; i++) {
      workerPromises.push(
        createWorker().then((worker) => {
          worker.on("died", () => {
            setTimeout(() => process.exit(1), 2000);
          });
          return worker;
        }),
      );
    }

    try {
      this.workers = await Promise.all(workerPromises);
    } catch (error) {
      throw new WsException(`Failed to create mediasoup workers: ${error}`);
    }
  }

  get worker() {
    if (this.workers.length === 0) {
      throw new WsException("No mediasoup workers available");
    }

    const worker = this.workers[this.nextWorkerIdx++];

    if (this.nextWorkerIdx >= this.workers.length) {
      this.nextWorkerIdx = 0;
    }

    return worker;
  }
}
