import {MediaStream} from 'react-native-webrtc';

export interface MediaDeviceRepository {
  requestPermissions(): Promise<boolean>;
  getLocalStream(audioOnly: boolean): Promise<MediaStream | null>;
  toggleMute(stream: MediaStream | null, mute: boolean): boolean; // Returns new mute state
  setSpeakerphoneOn(enabled: boolean): void;
  startInCallManager(media: 'audio' | 'video'): void;
  stopInCallManager(): void;
}
