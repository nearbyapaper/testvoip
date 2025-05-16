import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  NativeModules,
  TextInput,
} from 'react-native';

const HomeScreen = () => {
  const {VoipModule} = NativeModules;

  const [tel, setTel] = React.useState<string>('');
  const [isCalling, setIsCalling] = React.useState<boolean>(false);
  return (
    <View style={styles.container}>
      <Text style={styles.textWhite}>Home Screen</Text>
      <Button
        title="Test Voip Native Module"
        onPress={() => {
          VoipModule.createVoipEvent('John', '0987654321');
        }}
      />
      <TextInput
        placeholder="Enter your name"
        onChangeText={(text: React.SetStateAction<string>) => {
          setTel(text);
        }}
        style={styles.textInput}
      />

      <Button
        title="Call"
        onPress={() => {
          VoipModule.callVoip(tel);
          setIsCalling(true);
        }}
        disabled={tel.length === 0}
        color="blue"
      />
      <Button
        title="End Call"
        onPress={() => {
          VoipModule.endCall();
          setIsCalling(false);
          setTel('');
        }}
        color="red"
        disabled={!isCalling}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWhite: {color: 'white'},
  textInput: {
    borderWidth: 1,
    borderColor: 'black',
    width: 200,
    marginTop: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default HomeScreen;
