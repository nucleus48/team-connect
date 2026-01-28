import * as mediasoup from "mediasoup";

export const config = {
  // mediasoup Worker settings
  worker: {
    logLevel: "warn" as mediasoup.types.WorkerLogLevel,
    logTags: [
      "info",
      "ice",
      "dtls",
      "rtp",
      "srtp",
      "rtcp",
      "rtx",
      "bwe",
      "score",
      "simulcast",
      "svc",
    ] as mediasoup.types.WorkerLogTag[],
  },
  // mediasoup Router settings
  router: {
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
          "x-google-start-bitrate": 1000,
        },
      },
      {
        kind: "video",
        mimeType: "video/VP9",
        clockRate: 90000,
        parameters: {
          "profile-id": 2,
          "x-google-start-bitrate": 1000,
        },
      },
      {
        kind: "video",
        mimeType: "video/H264",
        clockRate: 90000,
        parameters: {
          "packetization-mode": 1,
          "profile-level-id": "42e01f",
          "level-asymmetry-allowed": 1,
          "x-google-start-bitrate": 1000,
        },
      },
      {
        kind: "video",
        mimeType: "video/H264",
        clockRate: 90000,
        parameters: {
          "packetization-mode": 1,
          "profile-level-id": "42e01f",
          "level-asymmetry-allowed": 1,
          "x-google-start-bitrate": 1000,
        },
      },
    ] as mediasoup.types.RtpCodecCapability[],
  },
  // mediasoup WebRtcTransport settings
  webRtcTransport: {
    listenIps: [
      {
        ip: "0.0.0.0", // TODO: Replace with actual public IP
        announcedIp: process.env.ANNOUNCED_IP ?? "127.0.0.1",
      },
    ],
    initialAvailableOutgoingBitrate: 1000000,
    minimumAvailableOutgoingBitrate: 600000,
    maxSctpMessageSize: 262144,
    // Additional options for WebRtcTransport that are not part of the mediasoup type definition
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
  },
  // mediasoup PlainTransport settings
  plainTransport: {
    listenIp: {
      ip: "0.0.0.0", // TODO: Replace with actual public IP
      announcedIp: process.env.ANNOUNCED_IP ?? "127.0.0.1",
    },
    rtcpMux: true,
    comedia: false,
  },
};
