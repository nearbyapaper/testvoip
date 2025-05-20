import React, {useEffect, useRef, useState} from 'react';
import {Button, PermissionsAndroid, StyleSheet, Text, View} from 'react-native';
import {io} from 'socket.io-client';
import {
  mediaDevices,
  MediaStream,
  MediaStreamTrack,
  RTCPeerConnection,
} from 'react-native-webrtc';
import {RTCSessionDescriptionInit} from 'react-native-webrtc/lib/typescript/RTCSessionDescription';
import RTCIceCandidateInit from 'react-native-webrtc/lib/typescript/RTCIceCandidate';

// const SIGNALING_SERVER_URL = 'ws://<YOUR_COMPUTER_LOCAL_IP>:3002'; // Replace with your actual URL
const SIGNALING_SERVER_URL = 'ws://192.168.0.136:3002'; // Replace with your actual URL

const ROOM_ID = 'voip-room';

const config = {
  iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
};

const TestVoip = () => {
  const socket = useRef<any>();
  const peerConnection = useRef<RTCPeerConnection>();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    requestPermissions();
    initSocket();
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
          audio: true,
          video: false,
        });
        setLocalStream(lStream);
      } else {
        console.log('Permissions denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const createPeerConnection = async () => {
    peerConnection.current = new RTCPeerConnection(config);

    const newRemoteStream = new MediaStream();
    setRemoteStream(newRemoteStream);

    peerConnection.current.ontrack = event => {
      event.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
        newRemoteStream.addTrack(track);
      });
    };

    peerConnection.current.onicecandidate = event => {
      if (event.candidate) {
        socket.current.emit('ice-candidate', {
          room: ROOM_ID,
          candidate: event.candidate,
        });
      }
    };
  };

  const initSocket = () => {
    socket.current = io(SIGNALING_SERVER_URL);
    socket.current.emit('join', ROOM_ID);

    socket.current.on('joined', async (_userId: string) => {
      await createPeerConnection();
      if (localStream) {
        localStream
          .getTracks()
          .forEach(track =>
            peerConnection.current?.addTrack(track, localStream),
          );
      }

      const offer = await peerConnection.current?.createOffer();
      if (offer) {
        await peerConnection.current?.setLocalDescription(offer);
        socket.current.emit('offer', {room: ROOM_ID, sdp: offer});
      }
    });

    // เพิ่ม listener offer → สร้าง answer และส่งกลับ
    socket.current.on(
      'offer',
      async (_data: {sdp: RTCSessionDescriptionInit}) => {
        console.log('📨 Received offer');
        await createPeerConnection();

        if (localStream) {
          localStream.getTracks().forEach(track => {
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
      async (_data: {sdp: RTCSessionDescriptionInit}) => {
        console.log('📨 Received answer');
        await peerConnection.current?.setRemoteDescription(_data.sdp);
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
  };

  return (
    <View style={styles.container}>
      <Text>Test Voip</Text>
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
