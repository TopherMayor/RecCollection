import { ModeHandler } from "../lib/modes";
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { Server, ServerCredentials } from '@grpc/grpc-js';
import { ProtoGrpcType } from './protocol';
import { validate } from 'class-validator';
import { AgentCommunicationHandlers } from './protocol/mcp/servers/AgentCommunication';
import { ClientMessage, ServerMessage } from './protocol/mcp/servers';

const PROTO_PATH = './protocol.proto';

// Configure proto loader
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const proto = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;

export class CoreModeServer {
  private modeHandler = new ModeHandler({
    allowedTransitions: [
      { from: "architect", to: ["code", "test"] },
      { from: "code", to: ["architect", "test", "debug", "ask"] },
      { from: "test", to: ["code", "debug"] },
      { from: "debug", to: ["code", "test"] },
      { from: "ask", to: ["code", "architect"] },
    ],
  });

  private grpcServer: Server;
  private grpcPort: number;

  constructor(grpcPort: number = 50051) {
    this.grpcPort = grpcPort;
    this.grpcServer = new grpc.Server();
    this.configureGRPCServices();
  }

  handleModeSwitch(currentMode: string, targetMode: string) {
    if (this.modeHandler.validateTransition(currentMode, targetMode)) {
      return { success: true, newMode: targetMode };
    }
    return { success: false, error: "Invalid mode transition" };
  }

  private configureGRPCServices(): void {
    const agentCommunication: AgentCommunicationHandlers = {
      BidirectionalStream: (call) => {
        call.on('data', async (clientMessage: ClientMessage) => {
          try {
            const validationErrors = await validate(clientMessage);
            if (validationErrors.length > 0) {
              const errorMessage = validationErrors
                .map(err => `${err.property}: ${Object.values(err.constraints || {})`)
                .join(', ');
              call.write({
                status: 1,
                message: `Validation failed: ${errorMessage}`,
                timestamp: Date.now()
              });
              return;
            }

            call.write({
              status: 0,
              message: 'Received valid message',
              response_data: clientMessage.payload,
              timestamp: Date.now()
            });
          } catch (error) {
            console.error('Processing error:', error);
            call.write({
              status: 1,
              message: 'Internal server error',
              timestamp: Date.now()
            });
          }
        });

        call.on('end', () => call.end());
      }
    };

    this.grpcServer.addService(proto.mcp.servers.AgentCommunication.service, agentCommunication);
  }

  startGRPCServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.grpcServer.bindAsync(
        `0.0.0.0:${this.grpcPort}`,
        ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) return reject(err);
          console.log(`gRPC server running on port ${port}`);
          resolve();
        }
      );
    });
  }

  stopGRPCServer(): Promise<void> {
    return new Promise((resolve) => {
      this.grpcServer.tryShutdown(() => resolve());
    });
  }
}

export const registerGRPCGateway = (restApp: Express) => {
  restApp.post('/v1/agent/stream', (req, res) => {
    res.status(501).json({ error: 'Gateway implementation pending' });
  });
};
