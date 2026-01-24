export interface RemoteProducerData extends Record<string, unknown> {
  enabled?: boolean;
  display?: boolean;
}

export interface RemoteProducer {
  peerId: string;
  streamId: string;
  producerId: string;
  kind: "audio" | "video";
  appData: RemoteProducerData;
}

export interface RemotePeer {
  name: string;
  email: string;
  peerId: string;
  userId: string;
  presenting: boolean;
  image?: string | null;
  role: "host" | "participant";
}
