/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import LoginScreen from './src/presentation/screen/Login';
import {StyleSheet, Text, View} from 'react-native';
import AppNavigator from './src/presentation/navigation/AppNavigator';
import Home from './src/presentation/screen/Home';

function App(): React.JSX.Element {
  return (
    <View style={styles.flexArea}>
      <Home />
    </View>
    // <AppNavigator />
  );
}

const styles = StyleSheet.create({
  flexArea: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default App;
