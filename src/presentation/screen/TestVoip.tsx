import React, {useEffect, useRef, useState} from 'react';
import {Button, PermissionsAndroid, StyleSheet, Text, View} from 'react-native';
import {io} from 'socket.io-client';
import {
  mediaDevices,
  MediaStream,
  RTCPeerConnection,
  RTCView,
} from 'react-native-webrtc';
import {RTCSessionDescriptionInit} from 'react-native-webrtc/lib/typescript/RTCSessionDescription';
import RTCIceCandidateInit from 'react-native-webrtc/lib/typescript/RTCIceCandidate';
import InCallManager from 'react-native-incall-manager';

// const SIGNALING_SERVER_URL = 'ws://<YOUR_COMPUTER_LOCAL_IP>:3002'; // Replace with your actual URL
const SIGNALING_SERVER_URL = 'ws://192.168.0.136:3002'; // Replace with your actual URL

const ROOM_ID = 'voip-room';

const config = {
  iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
};

const TestVoip = () => {
  const socket = useRef<any>();
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    requestPermissions();
    // initSocket();

    // requestPermissions().then(() => initSocket());

    InCallManager.start({media: 'audio'});
    InCallManager.setForceSpeakerphoneOn(false); // ลองใช้ false ถ้าเสียงหวีด
    InCallManager.setSpeakerphoneOn(false); // อาจลอง false เช่นกัน

    // Clean up function to disconnect socket and close peer connection
    return () => {
      socket.current?.disconnect();
      peerConnection.current?.close();
      peerConnection.current = null;
      setLocalStream(null);
      setRemoteStream(null);
      setStatus('Idle');
      InCallManager.stop();
    };
  }, []);

  const requestPermissions = async () => {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ];
    try {
      const granted = await PermissionsAndroid.requestMultiple(permissions);
      if (
        granted['android.permission.CAMERA'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('Permissions granted');
        // set local stream here
        const lStream = await mediaDevices.getUserMedia({
          // audio: true,
          audio: {
            echoCancellation: true, // ป้องกันเสียงสะท้อน
            noiseSuppression: true, // ลดเสียงรบกวน
            autoGainControl: true,
          },
          // audio: {
          //   echoCancellation: true,
          //   noiseSuppression: true,
          //   autoGainControl: true,
          //   channelCount: 1,
          //   sampleRate: 44100,
          // },
          video: false,
        });
        setLocalStream(lStream);

        console.log('🎙️ localStream tracks:', lStream.getAudioTracks());
        lStream.getAudioTracks().forEach(track => {
          console.log('🎙️ Track enabled:', track.enabled);
        });
      } else {
        console.log('Permissions denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const createPeerConnection = async () => {
    // ก่อนสร้าง peerConnection ใหม่ ให้เคลียร์ของเก่า
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    peerConnection.current = new RTCPeerConnection(config);

    // remoteStream ที่ใช้ใน ontrack อาจเป็น null เสมอ
    // คุณสร้าง newRemoteStream และเรียก setRemoteStream() → แต่นี่เป็น async → remoteStream ด้านล่างอาจยัง null อยู่ตอนใช้งาน
    const newRemoteStream = new MediaStream();
    // setRemoteStream(newRemoteStream);

    peerConnection.current.ontrack = event => {
      // เมื่อมีเสียง/วิดีโอเข้ามา ให้เพิ่มเข้า remote stream
      console.log('🎤 ontrack: track received', event.track.kind);
      // event.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
      //   console.log('🎙️ Adding track', track.kind);
      //   newRemoteStream.addTrack(track);
      // });

      // อย่าดึงเสียงจาก remote กลับมาซ้ำ
      // const stream = event.streams[0];
      // if (stream && remoteStream) {
      //   stream.getTracks().forEach(track => {
      //     const alreadyExists = remoteStream
      //       .getTracks()
      //       .some(t => t.id === track.id);
      //     if (!alreadyExists) {
      //       remoteStream.addTrack(track);
      //     }
      //   });
      // }

      const stream = event.streams[0];
      console.log('🎤 ontrack: stream received', stream);
      if (stream) {
        stream.getTracks().forEach(track => {
          const alreadyExists = newRemoteStream
            .getTracks()
            .some(t => t.id === track.id);
          if (!alreadyExists) {
            newRemoteStream.addTrack(track);
          }
        });

        stream.getAudioTracks().forEach(track => {
          console.log(
            '🔊 Remote audio track:',
            track.id,
            'enabled:',
            track.enabled,
            'muted:',
            track.muted,
          );
        });
        setRemoteStream(newRemoteStream); // ย้าย setRemoteStream(newRemoteStream); ไปไว้ หลัง เพิ่ม track เสร็จแล้ว:
      }
    };

    peerConnection.current.onicecandidate = event => {
      // ถ้ามี ICE candidate ใหม่ ส่งให้คู่สนทนาผ่าน signaling server
      if (event.candidate) {
        console.log('ICE CANDIDATE:', event.candidate);
        socket.current.emit('ice-candidate', {
          room: ROOM_ID,
          candidate: event.candidate,
        });
      } else {
        console.log('ICE Gathering complete');
      }
    };

    peerConnection.current.oniceconnectionstatechange = () => {
      console.log(
        '🌐 ICE connection state:',
        peerConnection.iceConnectionState,
      );

      const state = peerConnection.current?.iceConnectionState;
      console.log('ICE state:', state);
      if (state === 'failed' || state === 'disconnected') {
        // ลอง restart ICE
        console.log('⚠️ ICE failed/disconnected → Try restartIce');
        peerConnection.current?.restartIce?.();
      }
    };

    peerConnection.current.onconnectionstatechange = () => {
      console.log(
        'Peer Connection State:',
        peerConnection.current?.connectionState,
      );
    };
  };

  const initSocket = () => {
    socket.current = io(SIGNALING_SERVER_URL);
    socket.current.emit('join', ROOM_ID);

    setStatus('Connected');

    // เมื่อเข้าห้องสำเร็จ
    // ลบ socket.current.on('joined'... ที่มี createOffer() ทิ้งไป เพราะมันทำให้ทุกคนพยายามสร้าง offer ทันทีที่เข้าห้อง
    // socket.current.on('joined', async (_userId: string) => {
    //   await createPeerConnection(); // สร้าง peer connection
    //   if (localStream) {
    //     localStream
    //       .getTracks()
    //       .forEach(track =>
    //         peerConnection.current?.addTrack(track, localStream),
    //       );
    //   }
    //   const offer = await peerConnection.current?.createOffer(); // สร้าง offer
    //   if (offer) {
    //     await peerConnection.current?.setLocalDescription(offer); // ตั้ง localDescription
    //     socket.current.emit('offer', {room: ROOM_ID, sdp: offer}); // ส่ง offer ไปที่ server
    //   }
    // });

    // เปลี่ยน flow ให้รองรับเฉพาะ 1:1 call
    socket.current.on('ready', async () => {
      console.log('✅ Ready to start call');
      // create connection
      await createPeerConnection(); // สร้าง peer connection
      try {
        console.log('InCallManager:', InCallManager);

        if (InCallManager && typeof InCallManager.start === 'function') {
          InCallManager.start({media: 'audio'});
          // InCallManager.setSpeakerphoneOn(true); // ป้องกันเสียงย้อนเข้าหูฟัง} else {
          setTimeout(() => {
            InCallManager.setSpeakerphoneOn(true);
          }, 1000);
          console.warn(
            '⚠️ InCallManager not available or not initialized properly',
          );
        }
      } catch (e) {
        console.error('⚠️ InCallManager failed to start', e);
      }

      if (localStream) {
        localStream
          .getTracks()
          .forEach(track =>
            peerConnection.current?.addTrack(track, localStream),
          );
      }

      // create offer
      const offer = await peerConnection.current?.createOffer(); // สร้าง offer
      await peerConnection.current?.setLocalDescription(offer); // ตั้ง localDescription
      console.log('📨 Sent offer:', offer.sdp);
      socket.current.emit('offer', {room: ROOM_ID, sdp: offer}); // ส่ง offer ไปที่ server
    });

    // เพิ่ม listener offer → สร้าง answer และส่งกลับ
    socket.current.on(
      'offer',
      async (_data: {sdp: RTCSessionDescriptionInit}) => {
        console.log('📨 Received offer');
        await createPeerConnection();

        try {
          InCallManager.start({media: 'audio'});
          InCallManager.setSpeakerphoneOn(true); // ป้องกันเสียงย้อนเข้าหูฟัง
        } catch (e) {
          console.error('⚠️ InCallManager failed to start', e);
        }

        console.log('🔈 on offer localStream', localStream);

        if (localStream) {
          localStream.getTracks().forEach(track => {
            console.log('🔈 Adding local track', track.kind, track.enabled);
            peerConnection.current?.addTrack(track, localStream);
          });
        }

        await peerConnection.current?.setRemoteDescription(_data.sdp);
        const answer = await peerConnection.current?.createAnswer();
        await peerConnection.current?.setLocalDescription(answer);

        socket.current.emit('answer', {
          room: ROOM_ID,
          sdp: answer,
        });
      },
    );

    // เพิ่ม listener answer → ตั้ง remote description
    socket.current.on(
      'answer',
      async (data: {sdp: RTCSessionDescriptionInit}) => {
        console.log('📨 Received answer');
        await peerConnection.current?.setRemoteDescription(data.sdp);
        console.log('✅ Answer set as remote description');
      },
    );

    // เพิ่ม listener ice-candidate → addIceCandidate
    socket.current.on(
      'ice-candidate',
      async (_data: {candidate: RTCIceCandidateInit}) => {
        console.log('📨 Received ice-candidate');
        try {
          await peerConnection.current?.addIceCandidate(_data.candidate);
        } catch (e) {
          console.error('Error adding ice-candidate', e);
        }
      },
    );

    socket.current.on('disconnect', () => {
      console.warn('❌ Socket disconnected unexpectedly');
    });
  };

  return (
    <View style={styles.container}>
      <Text>Test Voip : {status}</Text>
      {/* component สำหรับเล่นเสียงฝั่งตรงข้าม (remote stream) */}
      {remoteStream && (
        <View>
          <RTCView
            streamURL={remoteStream.toURL()}
            style={{width: 0, height: 0}} // ซ่อนเพราะเป็น audio
          />
          <Text>Remote tracks: {remoteStream?.getTracks().length ?? 0}</Text>
        </View>
      )}
      {remoteStream ? (
        <Text style={{color: 'green'}}>🔊 Connected to remote audio</Text>
      ) : (
        <Text style={{color: 'gray'}}>Waiting for remote audio...</Text>
      )}
      <Button title="Call" onPress={initSocket} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TestVoip;
