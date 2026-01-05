import { StatusBar } from 'react-native';
import { ModalPortal } from 'react-native-modals';
import AntDesign from 'react-native-vector-icons/AntDesign';

import { AuthProvider } from './AuthContext';
import StackNavigator from './navigation/StackNavigator';

// Ensure AntDesign font is loaded to avoid missing glyph warnings
AntDesign.loadFont();

const App: React.FC = () => {
  return (
    <AuthProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <StackNavigator />
      <ModalPortal />
    </AuthProvider>
  );
};

export default App;
