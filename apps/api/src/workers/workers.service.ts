import { Injectable } from "@nestjs/common";
import { createWorker, types } from "mediasoup";
import { cpus } from "os";

@Injectable()
export class WorkersService {
  private nextWorkerIdx = 0;
  private workers: types.Worker[] = [];

  constructor() {
    this.createWorkers();
  }

  private createWorkers() {
    const numWorkers = Object.keys(cpus()).length;

    for (let i = 0; i < numWorkers; i++) {
      createWorker()
        .then((worker) => {
          worker.on("died", () => {
            console.error(
              "mediasoup worker died, exiting in 2 seconds... [pid:%d]",
              worker.pid,
            );
            setTimeout(() => process.exit(1), 2000);
          });

          this.workers.push(worker);
        })
        .catch((error) => {
          throw error;
        });
    }
  }

  getWorker() {
    const worker = this.workers[this.nextWorkerIdx++];

    if (this.nextWorkerIdx >= this.workers.length) {
      this.nextWorkerIdx = 0;
    }

    return worker;
  }
}
