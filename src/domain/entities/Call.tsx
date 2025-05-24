export type CallStatus =
  | 'Idle'
  | 'Connecting'
  | 'Connected'
  | 'Failed'
  | 'Disconnected';

export interface VoIPCall {
  id: string;
  status: CallStatus;
  isMuted: boolean;
}
