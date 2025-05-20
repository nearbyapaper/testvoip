import {useEffect, useState} from 'react';
import {
  PermissionsAndroid,
  Platform,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {mediaDevices, RTCView, MediaStream} from 'react-native-webrtc';

const Camera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const initStream = async () => {
      try {
        if (Platform.OS === 'android') {
          await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);
        }

        const mediaStream = await mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setStream(mediaStream);
      } catch (error) {
        console.error('Error accessing media devices.', error);
      }
    };

    initStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track: {stop: () => any}) => track.stop());
      }
    };
  }, []);

  const handleTakePhoto = () => {
    console.log('Take photo button pressed');
  };

  return (
    <View style={styles.container}>
      {stream && (
        <>
          <RTCView
            streamURL={stream.toURL()}
            style={styles.container}
            objectFit="cover"
          />

          {/* ปุ่มถ่ายรูป */}
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleTakePhoto}>
            <View style={styles.innerButton} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  innerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#999',
  },
});

export default Camera;
