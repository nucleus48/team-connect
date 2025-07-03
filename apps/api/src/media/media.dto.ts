import { types } from "mediasoup";

class TransportDto {
  routerId: string;
  transportId: string;
}

export class ConnectTransportDto extends TransportDto {
  dtlsParameters: types.DtlsParameters;
}

export class CreateProducerDto extends TransportDto {
  kind: types.MediaKind;
  rtpParameters: types.RtpParameters;
}

export class CreateConsumerDto extends TransportDto {
  producerId: string;
  rtpCapabilities: types.RtpCapabilities;
}
