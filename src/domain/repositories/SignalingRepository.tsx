export interface SignalingRepository {
  connect: (userId: string) => void;
  disconnect: () => void;
  sendOffer(roomId: string, offer: RTCSessionDescriptionInit): void;
  sendAnswer(roomId: string, answer: RTCSessionDescriptionInit): void;
  sendIceCandidate(roomId: string, candidate: RTCIceCandidateInit): void;
  onReady: (callback: () => void) => void;
  onOffer(callback: (offer: RTCSessionDescriptionInit) => void): void;
  onAnswer(callback: (answer: RTCSessionDescriptionInit) => void): void;
  onIceCandidate(callback: (candidate: RTCIceCandidateInit) => void): void;
  onDisconnected(callback: () => void): void;
}
