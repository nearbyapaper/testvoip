export interface PeerConnectionRepository {
  createPeerConnection(config: RTCConfiguration): Promise<void>;
  closePeerConnection(): void;
  addTrack(track: MediaStreamTrack, stream: MediaStream): void;
  createOffer(): Promise<RTCSessionDescriptionInit | undefined>;
  createAnswer(): Promise<RTCSessionDescriptionInit | undefined>;
  setLocalDescription(sdp: RTCSessionDescriptionInit): Promise<void>;
  setRemoteDescription(sdp: RTCSessionDescriptionInit): Promise<void>;
  addIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;
  onTrack(callback: (stream: MediaStream) => void): void;
  onIceCandidate(callback: (candidate: RTCIceCandidateInit) => void): void;
  onIceConnectionStateChange(
    callback: (state: RTCIceConnectionState) => void,
  ): void;
  onConnectionStateChange(
    callback: (state: RTCPeerConnectionState) => void,
  ): void;
  restartIce?(): void;
  getIceConnectionState(): RTCIceConnectionState | undefined;
  getConnectionState(): RTCPeerConnectionState | undefined;
}
