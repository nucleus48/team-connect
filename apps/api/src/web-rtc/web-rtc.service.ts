import { Injectable } from "@nestjs/common";
import mediasoup from "mediasoup";
import os from "node:os";

@Injectable()
export class WebRtcService {
  private nextWorkerIdx = 0;
  private workers: mediasoup.types.Worker<mediasoup.types.AppData>[] = [];
  private routers: Map<
    string,
    mediasoup.types.Router<mediasoup.types.AppData>
  > = new Map();

  constructor() {
    this.createWorkers();
  }

  private async createWorkers() {
    const numWorkers = Object.keys(os.cpus()).length;

    for (let i = 0; i < numWorkers; i++) {
      const worker = await mediasoup.createWorker();

      worker.on("died", () => {
        console.error(
          "mediasoup worker died, exiting in 2 seconds... [pid:%d]",
          worker.pid,
        );
        setTimeout(() => process.exit(1), 2000);
      });

      this.workers.push(worker);
    }
  }

  private getWorker() {
    const worker = this.workers[this.nextWorkerIdx++];

    if (this.nextWorkerIdx >= this.workers.length) {
      this.nextWorkerIdx = 0;
    }

    return worker;
  }
}
