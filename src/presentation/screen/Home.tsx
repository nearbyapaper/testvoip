import React, {useEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  NativeModules,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

const {width, height} = Dimensions.get('window');
const buttonSize = Math.min(width, height) / 4; // Adjust button size based on screen dimensions
const textSize = buttonSize * 0.5; // Adjust text size based on button size
const HomeScreen = () => {
  const {VoipModule} = NativeModules;

  const [tel, setTel] = React.useState<string>('');
  const [formatTel, setFormatTel] = React.useState<string>('');
  // const [isCalling, setIsCalling] = React.useState<boolean>(false);

  const keyPads: {key: string; value: string}[][] = [
    [
      {key: '1', value: '1'},
      {key: '2', value: '2'},
      {key: '3', value: '3'},
    ],
    [
      {key: '4', value: '4'},
      {key: '5', value: '5'},
      {key: '6', value: '6'},
    ],
    [
      {key: '7', value: '7'},
      {key: '8', value: '8'},
      {key: '9', value: '9'},
    ],
    [
      {key: '*', value: '*'},
      {key: 'call', value: 'call'},
      {key: '#', value: '#'},
    ],
  ];

  // useEffect(() => {
  //   VoipModule.createLocalMediaStream();
  // }, []);

  useEffect(() => {
    if (tel.length <= 3) {
      setFormatTel(tel);
    } else {
      const preTel = tel.slice(0, 3);
      const postTel = tel.slice(3);
      const merheTel = preTel + '-' + postTel;
      setFormatTel(merheTel);
    }
  }, [tel]);

  return (
    <View style={styles.container}>
      <View style={styles.rowContent}>
        {tel.length > 0 && (
          <View style={styles.alignStart}>
            <TouchableOpacity
              onPress={() => {
                setTel('');
              }}>
              <Icon name="backspace" size={32} color="green" />/
            </TouchableOpacity>
          </View>
        )}
        <View style={[styles.flexArea, styles.alignCenter]}>
          <Text style={styles.fontTel}>{formatTel}</Text>
        </View>
        {tel.length > 0 && (
          <View style={styles.alignEnd}>
            <TouchableOpacity
              onPress={() => {
                if (tel.length === 0) {
                  return;
                }
                setTel(tel.slice(0, -1));
              }}>
              <Icon name="backspace" size={32} color="green" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View>
        {keyPads.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.rowContent}>
            {row.map(keyPad => (
              <KeypadButton
                key={keyPad.key}
                keyPad={keyPad}
                onPress={() => {
                  if (tel.length === 10) return;
                  if (keyPad.key === 'call') {
                    // setIsCalling(true);
                    VoipModule.startCall(tel);
                    VoipModule.callWithNumber(tel);
                  } else {
                    setTel(prevTel => prevTel + keyPad.value);
                  }
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const KeypadButton = ({
  keyPad,
  onPress,
}: {
  keyPad: {key: string; value: string};
  onPress: () => void;
}) => {
  const isCall = keyPad.key === 'call';

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      {isCall ? (
        <Icon name="backspace" size={32} color="green" />
      ) : (
        <Text style={styles.buttonText}>{keyPad.value}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  textWhite: {color: 'white'},
  textInput: {
    borderWidth: 1,
    borderColor: 'black',
    width: 200,
    marginTop: 20,
  },
  button: {
    padding: 20,
    margin: 5,
    backgroundColor: '#ddd',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    width: buttonSize,
  },
  buttonText: {
    fontSize: textSize,
    color: '#000',
  },
  rowContent: {
    flexDirection: 'row',
  },
  fontTel: {
    fontSize: textSize,
    color: '#000',
  },
  flexArea: {
    flex: 1,
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
});

export default HomeScreen;
