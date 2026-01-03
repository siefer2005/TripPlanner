import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { API_URL } from '../constants/config';

type RootStackParamList = {
  Activity: {
    name: string;
    tripId: string;
  };
};

type ActivityRouteProp = RouteProp<RootStackParamList, 'Activity'>;

interface PlaceDetails {
  opening_hours?: {
    weekday_text: string[];
  };
  formatted_phone_number?: string;
  website?: string;
  reviews?: any[];
  photos?: any[];
  name?: string;
}

const NewActivity: React.FC = () => {
  const route = useRoute<ActivityRouteProp>();
  const navigation = useNavigation<any>();
  const [input, setInput] = useState<string>('');
  const inputRef = useRef<TextInput>(null);
  const [placeId, setPlaceId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [details, setDetails] = useState<PlaceDetails | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fetchPlaceDetails = async (placeId: string): Promise<void> => {
    const API_KEY = 'AIzaSyAaJ7VzIGk_y8dvrx2b4yya119jQVZJnNs'; // Ideally move to config or env
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data: any = await response.json();
      setDetails(data.result);
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  const handleSave = async () => {
    if (!placeId || !route.params?.tripId) return;

    try {
      const response = await fetch(`${API_URL}/trip/${route.params.tripId}/addPlace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeId: placeId,
        }),
      });

      if (response.ok) {
        navigation.goBack();
      } else {
        console.error('Failed to add place');
        // Optionally show an alert
      }
    } catch (error) {
      console.error('Error adding place:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ padding: 10, flexDirection: 'row', gap: 10 }}>
        <AntDesign name="search" size={23} color="pink" />
        <View style={{ flex: 1 }}>
          <TextInput
            editable={false}
            ref={inputRef}
            value={input}
            onChangeText={setInput}
            placeholder={`Search ${route.params?.name}`}
            placeholderTextColor="gray"
            style={{ marginBottom: 10 }}
          />

          <GooglePlacesAutocomplete
            placeholder="Search"
            fetchDetails
            onPress={(data, details) => {
              setName(data.description); // or data.structured_formatting.main_text
              setPlaceId(details?.place_id || '');
              if (details?.place_id) {
                fetchPlaceDetails(details.place_id);
              }
            }}
            query={{
              key: 'AIzaSyAaJ7VzIGk_y8dvrx2b4yya119jQVZJnNs',
              language: 'en',
            }}
            styles={{
              textInput: {
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 5,
              }
            }}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 10 }}>
        {details && (
          <>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{details.name}</Text>
            {details.formatted_phone_number && <Text>{details.formatted_phone_number}</Text>}
            {details.website && <Text>{details.website}</Text>}

            {/* Simple Photo Display if available */}
            {details.photos && details.photos.length > 0 && (
              <ScrollView horizontal style={{ marginTop: 10 }}>
                {details.photos.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=AIzaSyAaJ7VzIGk_y8dvrx2b4yya119jQVZJnNs` }}
                    style={{ width: 200, height: 150, borderRadius: 10, marginRight: 10 }}
                  />
                ))}
              </ScrollView>
            )}

            <Pressable onPress={handleSave} style={{
              marginTop: 20,
              backgroundColor: '#007AFF',
              padding: 15,
              borderRadius: 10,
              alignItems: 'center'
            }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Save to Trip</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NewActivity;

const styles = StyleSheet.create({});
