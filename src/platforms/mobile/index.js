// Mobile Platform Entry Point (React Native/Expo)
// This file will be used when creating the mobile app

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// Core functionality (reusable)
export * from '../../core';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>CRM Mobile App - Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Mobile-specific components will be added here
// export * from './components';
// export * from './screens';
// export * from './navigation';