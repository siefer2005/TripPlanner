import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {
  useCallback,
  useEffect,
  useState
} from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

import axios from 'axios';
import moment from 'moment';

import Place from '../components/Place';

/* ------------------------------------
   Navigation Types
------------------------------------ */
type RootStackParamList = {
  TripPlan: {
    item: any;
    user: any;
  };
  Ai: { name: string };
  Map: { places: any[] };
};

type TripPlanRouteProp = RouteProp<RootStackParamList, 'TripPlan'>;

const TripPlanScreen: React.FC = () => {
  const route = useRoute<TripPlanRouteProp>();
  const navigation = useNavigation<any>();

  /* ------------------------------------
     State
  ------------------------------------ */
  const [option, setOption] = useState<'Overview' | 'Itinerary' | 'Explore' | '$'>('Overview');

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [openShareModal, setOpenShareModal] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);

  const [places, setPlaces] = useState<any[]>([]);
  const [placeDetails, setPlaceDetails] = useState<any[]>([]);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  const [price, setPrice] = useState<number>(0);
  const [budget, setBudget] = useState<string>('');
  const [category, setCategory] = useState<string>('');

  const [paidBy, setPaidBy] = useState<string>('');
  const [splitBy, setSplitBy] = useState<string>('');

  const [email, setEmail] = useState<string>('');
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);

  const [selectedDate, setSelectedDate] = useState<string>('');

  /* ------------------------------------
     Helpers
  ------------------------------------ */
  const formatDate = (date: string): string =>
    moment(date).format('D MMMM');

  const getDayName = (date: string): string =>
    moment(date).format('dddd');

  /* ------------------------------------
     Fetch Places
  ------------------------------------ */
  const tripId = route.params.item?._id;

  const fetchPlacesToVisit = async (): Promise<void> => {
    try {
      const res = await axios.get(
        `http://10.0.2.2:8000/trip/${tripId}/placesToVisit`,
      );
      setPlaces(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPlacesToVisit();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPlacesToVisit();
    }, []),
  );

  /* ------------------------------------
     Expenses
  ------------------------------------ */
  const fetchExpenses = async (): Promise<void> => {
    try {
      const res = await axios.get(
        `http://10.0.2.2:8000/getExpenses/${tripId}`,
      );
      setExpenses(res.data.expenses);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [modal]);

  /* ------------------------------------
     Email Validation
  ------------------------------------ */
  const validateEmail = (value: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleEmailChange = (value: string): void => {
    setEmail(value);
    setIsValidEmail(validateEmail(value));
  };

  /* ------------------------------------
     Render
  ------------------------------------ */
  return (
    <>
      <SafeAreaView>
        <ScrollView>
          {/* HEADER IMAGE */}
          <Image
            style={{ width: '100%', height: 200 }}
            source={{
              uri: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
            }}
          />

          {/* TABS */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 12 }}>
            {['Overview', 'Itinerary', 'Explore', '$'].map(tab => (
              <Pressable key={tab} onPress={() => setOption(tab as any)}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: option === tab ? '#ed6509' : 'gray',
                  }}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* OVERVIEW */}
          {option === 'Overview' && (
            <View style={{ padding: 12 }}>
              {places.map((item, index) => (
                <Place
                  key={index}
                  index={index}
                  item={item}
                  items={[]}
                  setItems={() => { }}
                />
              ))}
            </View>
          )}

          {/* ITINERARY */}
          {option === 'Itinerary' && (
            <View style={{ padding: 12 }}>
              {itinerary.map((item, index) => (
                <Text key={index}>{formatDate(item.date)}</Text>
              ))}
            </View>
          )}

          {/* EXPENSES */}
          {option === '$' && (
            <View style={{ padding: 12 }}>
              {expenses.length === 0 ? (
                <Text>No expenses yet</Text>
              ) : (
                expenses.map((exp, index) => (
                  <Text key={index}>
                    ₹{exp.price} - {exp.category}
                  </Text>
                ))
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* FLOATING AI BUTTON */}
      <Pressable
        onPress={() =>
          navigation.navigate('Ai', {
            name: route.params.item.tripName,
          })
        }
        style={{
          position: 'absolute',
          bottom: 110,
          right: 25,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#662d91',
          justifyContent: 'center',
        }}>
        <FontAwesome6
          name="wand-magic-sparkles"
          size={24}
          color="white"
          style={{ textAlign: 'center' }}
        />
      </Pressable>

      {/* MAP BUTTON */}
      <Pressable
        onPress={() =>
          navigation.navigate('Map', { places })
        }
        style={{
          position: 'absolute',
          bottom: 35,
          right: 25,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: 'black',
          justifyContent: 'center',
        }}>
        <Feather
          name="map"
          size={24}
          color="white"
          style={{ textAlign: 'center' }}
        />
      </Pressable>
    </>
  );
};

export default TripPlanScreen;

const styles = StyleSheet.create({});
