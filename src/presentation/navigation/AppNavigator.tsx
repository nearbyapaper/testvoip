import React from 'react';
import HomeScreen from '../screen/Home';
import LoginScreen from '../screen/Login';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';

const Stack = createNativeStackNavigator();
// Debugging: Log the components to ensure they are imported correctly
console.log('Rendering AppNavigator');
console.log('LoginScreen:', LoginScreen);
console.log('HomeScreen:', HomeScreen);
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
