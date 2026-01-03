import { RouteProp, useRoute } from '@react-navigation/native';

import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { BottomModal, ModalContent, SlideAnimation } from 'react-native-modals';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';



interface RouteParams {
  name: string;
  itinerary: ItineraryDay[];
  onGoBack?: () => void;
}

interface ItineraryDay {
  date: string;
  activities: any[];
}

interface Photo {
  photo_reference: string;
}

interface PlaceDetails {
  opening_hours?: {
    weekday_text: string[];
  };
  formatted_phone_number?: string;
  website?: string;
  reviews?: any[];
  photos?: Photo[];
}

interface Slot {
  id: string;
  type: string;
  name: string;
  times: string[];
}

interface PhotoGalleryProps {
  photos: Photo[];
  apiKey: string;
}


const DefineActivity: React.FC = () => {
  const route = useRoute<RouteProp<{ Define: RouteParams }, 'Define'>>();

  const [slot, setSlot] = useState<string>('Morning');
  const [option, setOption] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [openingHours, setOpeningHours] = useState<string[]>([]);
  const [name, setName] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [number, setNumber] = useState<string>('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const [input, setInput] = useState<string>('');
  const inputRef = useRef<TextInput>(null);


  useEffect(() => {
    inputRef.current?.focus();
  }, []);


  const fetchPlaceDetails = async (placeId: string): Promise<void> => {
    const API_KEY = 'AIzaSyAaJ7VzIGk_y8dvrx2b4yya119jQVZJnNs';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data: any = await response.json();
      const details: PlaceDetails = data.result;

      setOpeningHours(details.opening_hours?.weekday_text || []);
      setNumber(details.formatted_phone_number || '');
      setWebsite(details.website || '');
      setReviews(details.reviews || []);
      setPhotos(details.photos || []);
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  const firstDayTime =
    openingHours.length > 0 ? openingHours[0].split(': ')[1] : 'N/A';


  const formatDate = (date: string): string =>
    moment(date).format('D MMMM');

  const getDayName = (date: string): string =>
    moment(date).format('dddd');


  const slots: Slot[] = [
    {
      id: '0',
      type: 'Morning',
      name: 'sun',
      times: ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'],
    },
    {
      id: '1',
      type: 'Afternoon',
      name: 'sunrise',
      times: ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
    },
    {
      id: '2',
      type: 'Night',
      name: 'moon',
      times: ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'],
    },
  ];


  const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, apiKey }) => (
    <ScrollView
      contentContainerStyle={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        gap: 10,
      }}>
      {photos.map((photo, index) => {
        const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`;

        return (
          <View key={index} style={{ width: '45%' }}>
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: '100%',
                height: 120,
                borderRadius: 10,
              }}
            />
          </View>
        );
      })}
    </ScrollView>
  );



  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <ScrollView>
          <Text style={{ textAlign: 'center', padding: 10 }}>
            {route.params?.name}
          </Text>

          <View style={{ padding: 10, flexDirection: 'row', gap: 10 }}>
            <AntDesign name="search" size={23} color="pink" />

            <View style={{ flex: 1 }}>
              <TextInput
                editable={false}
                ref={inputRef}
                value={input}
                onChangeText={setInput}
                placeholder={`Search by ${route.params?.name}`}
                placeholderTextColor="gray"
              />

              <GooglePlacesAutocomplete
                placeholder="Search"
                fetchDetails
                onPress={(data, details) => {
                  setName(data.description);
                  if (details?.place_id) {
                    fetchPlaceDetails(details.place_id);
                  }
                }}
                query={{
                  key: 'AIzaSyAaJ7VzIGk_y8dvrx2b4yya119jQVZJnNs',
                  language: 'en',
                }}
              />
            </View>
          </View>

          {name && (
            <View style={{ padding: 12, flexDirection: 'row', gap: 10 }}>
              <Text style={{ fontWeight: '600' }}>{name}</Text>
              <Pressable onPress={() => setModalVisible(true)}>
                <Text>Add</Text>
              </Pressable>
            </View>
          )}

          {openingHours.length > 0 && (
            <Text style={{ marginLeft: 12 }}>
              Open {firstDayTime}
            </Text>
          )}

          {number && <Text style={{ marginLeft: 12 }}>{number}</Text>}
          {website && <Text style={{ marginLeft: 12 }}>{website}</Text>}

          {photos.length > 0 && (
            <PhotoGallery
              photos={photos}
              apiKey="AIzaSyAaJ7VzIGk_y8dvrx2b4yya119jQVZJnNs"
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Bottom Modal */}
      <BottomModal
        visible={modalVisible}
        onTouchOutside={() => setModalVisible(false)}
        modalAnimation={new SlideAnimation({ slideFrom: 'bottom' })}>
        <ModalContent style={{ height: 700 }}>
          {route.params?.itinerary?.map((item, index) => (
            <View key={index} style={{ padding: 10 }}>
              <Text>
                {getDayName(item.date)}, {formatDate(item.date)}
              </Text>

              {option === getDayName(item.date) &&
                slots.map((s) => (
                  <Pressable key={s.id} onPress={() => setSlot(s.type)}>
                    <Feather
                      name={s.name}
                      size={23}
                      color={slot === s.type ? 'orange' : 'gray'}
                    />
                  </Pressable>
                ))}
            </View>
          ))}
        </ModalContent>
      </BottomModal>
    </>
  );
};

export default DefineActivity;

const styles = StyleSheet.create({});
