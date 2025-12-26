import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, User } from '@react-native-google-signin/google-signin';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useContext, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

import { AuthContext } from '../AuthContext';
import { RootStackParamList } from '../navigation/StackNavigator';

/* ----------------------------------
   Google Sign-In Config
----------------------------------- */
GoogleSignin.configure({
  webClientId:
    '903206219784-bcvavuo2gorcaq7sae15127588fr9b9d.apps.googleusercontent.com',
  // iosClientId:
  //   '903206219784-jtvnboqi1us7u6v42ljtfsbjc0c72ibh.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
});

/* ----------------------------------
   Types
----------------------------------- */

type GoogleLoginResponse = User & {
  idToken: string | null;
  data?: {
    idToken?: string | null;
  };
};

interface BackendLoginResponse {
  token: string;
}

/* ----------------------------------
   Component
----------------------------------- */

const LoginScreen: React.FC = () => {
  const { token, setToken } = useContext(AuthContext);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  /* ----------------------------------
     Google Login
  ----------------------------------- */
  const GoogleLogin = async (): Promise<GoogleLoginResponse> => {
    await GoogleSignin.hasPlayServices();
    const userInfo = (await GoogleSignin.signIn()) as unknown;

    // Guard against cancelled response shape
    if ((userInfo as { type?: string })?.type === 'cancel') {
      throw new Error('Google sign-in cancelled');
    }

    const user = userInfo as User;

    return {
      ...user,
      idToken: user.idToken ?? null,
    };
  };

  const handleGoogleLogin = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await GoogleLogin();

      const extractedIdToken =
        response.idToken || response.data?.idToken;

      if (!extractedIdToken) {
        throw new Error('ID Token not found');
      }

      const apiBase =
        Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

      const backendResponse = await axios.post<BackendLoginResponse>(
        `${apiBase}/google-login`,
        { idToken: extractedIdToken }
      );

      const { token } = backendResponse.data;

      await AsyncStorage.setItem('authToken', token);
      setToken(token);
    } catch (err: unknown) {
      console.log('Login Error:', err);
      setError('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectHome = async (): Promise<void> => {
    // Persist a dummy auth token so the main stack renders
    await AsyncStorage.setItem('authToken', 'guest');
    setToken('guest');
    navigation.navigate('Home');
  };

  /* ----------------------------------
     UI
  ----------------------------------- */

  return (
    <SafeAreaView>
      <View style={{ marginTop: 30, alignItems: 'center' }}>
        <Image
          style={{ width: 240, height: 80, resizeMode: 'contain' }}
          source={{ uri: 'https://wanderlog.com/assets/logoWithText.png' }}
        />
      </View>

      <View style={{ marginTop: 70 }}>
        {/* Facebook */}
        <View style={styles.authButton}>
          <AntDesign
            style={styles.iconLeft}
            name="facebook"
            size={24}
            color="blue"
          />
          <Text style={styles.authText}>Sign Up With Facebook</Text>
        </View>

        {/* Google */}
        <Pressable onPress={handleGoogleLogin} style={styles.authButton}>
          <AntDesign
            style={styles.iconLeft}
            name="google"
            size={24}
            color="red"
          />
          <Text style={styles.authText}>Sign Up With Google</Text>
        </Pressable>

        {/* Email */}
        <View style={styles.authButton}>
          <AntDesign
            style={styles.iconLeft}
            name="mail"
            size={24}
            color="black"
          />
          <Text style={styles.authText}>Sign Up With Email</Text>
        </View>

        <Pressable style={{ marginTop: 12 }}>
          <Text style={styles.signInText}>
            Already have an account? Sign In
          </Text>
        </Pressable>
        <Pressable style={{ marginTop: 12 }} onPress={handleDirectHome}>
          <Text style={styles.signInText}>Continue to Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

/* ----------------------------------
   Styles
----------------------------------- */

const styles = StyleSheet.create({
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'center',
    borderColor: '#E0E0E0',
    margin: 12,
    borderWidth: 1,
    borderRadius: 25,
    marginTop: 20,
    position: 'relative',
  },
  iconLeft: {
    position: 'absolute',
    left: 10,
  },
  authText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
  },
  signInText: {
    textAlign: 'center',
    fontSize: 15,
    color: 'gray',
  },
});
