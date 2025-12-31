import { ArgumentsHost, Catch, HttpException, Logger } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    if (exception instanceof WsException) {
      const error = exception.getError();
      const details =
        error instanceof Object
          ? { ...error, message: exception.message }
          : exception.message;
      client.emit("exception", { status: "error", message: details });
      this.logger.error(
        `WebSocket Exception: ${exception.message}`,
        exception.stack,
      );
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.getResponse();
      client.emit("exception", { status, message });
      this.logger.error(
        `HTTP Exception (converted to WS): ${exception.message}`,
        exception.stack,
      );
    } else if (exception instanceof Error) {
      client.emit("exception", { status: "error", message: exception.message });
      this.logger.error(
        `Generic Error (converted to WS): ${exception.message}`,
        exception.stack,
      );
    } else {
      super.catch(exception, host);
    }
  }
}
