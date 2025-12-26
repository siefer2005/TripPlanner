import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import 'core-js/stable/atob';
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AuthContext } from '../AuthContext';
import { RootStackParamList } from '../navigation/StackNavigator';

/* ----------------------------------
   Types & Interfaces
----------------------------------- */

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface DecodedToken {
  userId: string;
}

interface Trip {
  _id: string;
  tripName: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  background: string;
}

interface User {
  _id: string;
  name?: string;
  email?: string;
}

/* ----------------------------------
   Component
----------------------------------- */

const HomeScreen: React.FC = () => {
  const currentYear: number = moment().year();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const isFocused = useIsFocused();

  const { userId, setUserId, setToken } = useContext(AuthContext);

  /* ----------------------------------
     Decode JWT & Get UserId
  ----------------------------------- */
  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const decoded = jwtDecode<DecodedToken>(token);
        setUserId(decoded.userId);
      }
    };
    fetchUser();
  }, []);

  /* ----------------------------------
     Fetch User Data
  ----------------------------------- */
  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchTrips();
    }
  }, [userId]);

  useEffect(() => {
    const checkLastCreated = async (): Promise<void> => {
      try {
        const raw = await AsyncStorage.getItem('lastCreatedTrip');
        if (raw) {
          const newTrip: Trip = JSON.parse(raw);
          setTrips((prev) => [newTrip, ...prev]);
          await AsyncStorage.removeItem('lastCreatedTrip');
        }
      } catch (err) {
        console.warn('Error reading lastCreatedTrip', err);
      }
    };

    if (isFocused) checkLastCreated();
  }, [isFocused]);

  const fetchUserData = async (): Promise<void> => {
    const response = await axios.get<User>(
      `http://10.0.2.2:8000/user/${userId}`
    );
    setUser(response.data);
  };

  const fetchTrips = async (): Promise<void> => {
    try {
      const response = await axios.get<Trip[]>(
        `http://10.0.2.2:8000/trips/${userId}`
      );
      setTrips(response.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
     Logout
  ----------------------------------- */
  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('authToken');
      setToken('');
    } catch (error) {
      console.log('Error', error);
    }
  };

  /* ----------------------------------
     UI
  ----------------------------------- */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons onPress={logout} name="person" size={30} color="orange" />
          <View style={styles.headerIcons}>
            <AntDesign name="search1" size={30} color="orange" />
            <AntDesign name="plus" size={30} color="orange" />
          </View>
        </View>

        {/* Title */}
        <View style={{ padding: 10 }}>
          <Text style={styles.title}>My Trips</Text>
          <Text style={styles.year}>{currentYear}</Text>
        </View>

        {/* Trips */}
        <View style={{ padding: 15 }}>
          {trips.map((item) => (
            <Pressable
              key={item._id}
              style={{ marginTop: 15 }}
              onPress={() =>
                navigation.navigate('Plan', { item, user })
              }>
              <ImageBackground
                imageStyle={{ borderRadius: 10 }}
                style={{ width: '100%', height: 220 }}
                source={{ uri: item.background }}>
                <View style={styles.tripHeader}>
                  <Text style={styles.tripText}>
                    {item.startDate} - {item.endDate}
                  </Text>
                  <Text style={styles.tripText}>
                    {moment(item.createdAt).format('MMMM Do')}
                  </Text>
                </View>
                <Text style={styles.tripName}>{item.tripName}</Text>
              </ImageBackground>
            </Pressable>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Organize your next trip</Text>
          <Text style={styles.ctaDesc}>
            Create your next trip and plan the activities of your itinerary
          </Text>

          <Pressable
            onPress={() => navigation.navigate('Create')}
            style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Create a Trip</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

/* ----------------------------------
   Styles
----------------------------------- */

const styles = StyleSheet.create({
  header: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  year: {
    marginTop: 6,
    fontSize: 19,
    color: 'orange',
    fontWeight: '600',
  },
  tripHeader: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripText: {
    fontSize: 17,
    color: 'white',
    fontWeight: 'bold',
  },
  tripName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 15,
  },
  cta: {
    marginTop: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  ctaDesc: {
    marginTop: 15,
    color: 'gray',
    width: 250,
    textAlign: 'center',
    fontSize: 16,
  },
  ctaButton: {
    marginTop: 25,
    backgroundColor: '#383838',
    padding: 14,
    width: 200,
    borderRadius: 25,
  },
  ctaButtonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
