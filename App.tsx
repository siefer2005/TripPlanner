import React from 'react';
import { ModalPortal } from 'react-native-modals';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { AuthProvider } from './AuthContext';
import StackNavigator from './navigation/StackNavigator';

if (!BackHandler.removeEventListener) {
  const originalAdd = BackHandler.addEventListener;
  const subMap = new Map();
  BackHandler.addEventListener = (eventName: any, handler: any) => {
    const sub = originalAdd(eventName, handler);
    if (handler) subMap.set(handler, sub);
    return sub;
  };
  BackHandler.removeEventListener = (eventName: any, handler: any) => {
    const sub = subMap.get(handler);
    if (sub) {
      sub.remove();
      subMap.delete(handler);
    }
  };
}

// Ensure AntDesign font is loaded to avoid missing glyph warnings
AntDesign.loadFont();

const App: React.FC = () => {
  return (
    <AuthProvider>
      <StackNavigator />
      <ModalPortal />
    </AuthProvider>
  );
};

export default App;
