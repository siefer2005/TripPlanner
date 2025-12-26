import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import React, {
    createContext,
    ReactNode,
    useEffect,
    useState,
} from 'react';

/* ----------------------------------
   Types
----------------------------------- */

interface DecodedToken {
  userId: string;
  iat?: number;
  exp?: number;
}

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  userId: string;
  setUserId: (id: string) => void;
  userInfo: any;
  setUserInfo: (info: any) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

/* ----------------------------------
   Context
----------------------------------- */

export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  userId: '',
  setUserId: () => {},
  userInfo: null,
  setUserInfo: () => {},
});

/* ----------------------------------
   Provider
----------------------------------- */

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [userInfo, setUserInfo] = useState<any>(null);

  /* ---------- Check if logged in ---------- */
  const isLoggedIn = async (): Promise<void> => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      setToken(storedToken);
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  /* ---------- Decode token ---------- */
  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      const storedToken = await AsyncStorage.getItem('authToken');

      if (!storedToken) return;

      try {
        const decoded = (jwtDecode as any)<DecodedToken>(storedToken);
        setUserId(decoded.userId);
      } catch (error) {
        console.error('Invalid token:', error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        userId,
        setUserId,
        userInfo,
        setUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
