import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import moment, { Moment } from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ImageBackground,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import DateRangePicker from 'react-native-daterange-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { AuthContext } from '../AuthContext';
import { RootStackParamList } from '../navigation/StackNavigator';

/* ----------------------------------
   Types
----------------------------------- */

type CreateTripNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Create'
>;

type CreateTripRouteProp = RouteProp<
    RootStackParamList,
    'Create'
>;

interface ImageItem {
    id: string;
    image: string;
}

interface DateRange {
    startDate?: Date | Moment | null;
    endDate?: Date | Moment | null;
    displayedDate?: Moment | null;
}

/* ----------------------------------
   Component
----------------------------------- */

const CreateTrip: React.FC = () => {
    const images: ImageItem[] = [
        { id: '0', image: 'https://images.unsplash.com/photo-1464852045489-bccb7d17fe39?w=800' },
        { id: '1', image: 'https://images.unsplash.com/photo-1716417511759-dd9c0f353ef9?w=800' },
        { id: '2', image: 'https://images.unsplash.com/photo-1536928994169-e339332d0b4e?w=800' },
        { id: '3', image: 'https://images.unsplash.com/photo-1689753363735-1f7427933d0d?w=800' },
        { id: '4', image: 'https://images.unsplash.com/photo-1577172249844-716749254893?w=800' },
        { id: '5', image: 'https://images.unsplash.com/photo-1503756234508-e32369269deb?w=800' },
        { id: '6', image: 'https://images.unsplash.com/photo-1715940404541-8de003993435?w=800' },
        { id: '7', image: 'https://images.unsplash.com/photo-1489945796694-07eba0228bc7?w=800' },
        { id: '8', image: 'https://images.unsplash.com/photo-1715144536829-50ee7e56596d?w=800' },
    ];

    const navigation = useNavigation<CreateTripNavigationProp>();
    const route = useRoute<CreateTripRouteProp>();

    const { userId } = useContext(AuthContext);

    const [tripName, setTripName] = useState<string>('');
    const [image] = useState<string>(images[0].image);
    const [background, setBackground] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [displayedDate, setDisplayedDate] = useState<Moment>(moment());
    const [displayedStart, setDisplayedStart] = useState<Moment>(moment());
    const [displayedEnd, setDisplayedEnd] = useState<Moment>(moment());
    const [showStartPicker, setShowStartPicker] = useState<boolean>(false);
    const [showEndPicker, setShowEndPicker] = useState<boolean>(false);
    const [showTimezoneModal, setShowTimezoneModal] = useState<boolean>(false);
    const [timezone, setTimezone] = useState<string>('Asia/Kolkata');
    const [timezoneLabel, setTimezoneLabel] = useState<string>('Bengaluru, India');

    const [startDay, setStartDay] = useState<string>('');
    const [endDay, setEndDay] = useState<string>('');

    /* ----------------------------------
       Handle Selected Image
    ----------------------------------- */
    useEffect(() => {
        if (route.params?.image) {
            setBackground(route.params.image);
        }
    }, [route.params]);

    /* ----------------------------------
       Create Trip
    ----------------------------------- */
    const handleCreateTrip = async (): Promise<void> => {
        if (!tripName) {
            Alert.alert('Missing Requirement', 'Please enter a trip name');
            return;
        }
        if (!startDate || !endDate) {
            Alert.alert('Missing Requirement', 'Please select start and end dates');
            return;
        }

        setIsLoading(true);

        const tripData = {
            tripName,
            startDate: startDate ? moment(startDate).toISOString() : null,
            endDate: endDate ? moment(endDate).toISOString() : null,
            startDay,
            endDay,
            timezone,
            background: background || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop',
            host: userId || '664585c5c93f0b22f0852778', // fallback for testing
        };

        try {
            // Create trip locally 
            const newTrip = {
                ...tripData,
                _id: Date.now().toString(), // Helper to generate unique ID
                createdAt: new Date().toISOString(),
            };

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            console.log('Trip created locally:', newTrip);

            try {
                await AsyncStorage.setItem('lastCreatedTrip', JSON.stringify(newTrip));
            } catch (storageError) {
                console.warn('Failed to persist trip locally:', storageError);
            }

            // Navigate to the Trip screen with the created data
            navigation.navigate('Trip', { item: newTrip });

        } catch (error) {
            console.error('Error creating trip:', error);
            Alert.alert('Error', 'Failed to create trip. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };


    const setDates = (dates: DateRange): void => {
        const toDate = (d?: Date | Moment | null): Date | null =>
            d ? moment(d).toDate() : null;

        if (dates.startDate) {
            setStartDate(toDate(dates.startDate));
            setStartDay(moment(dates.startDate).format('dddd'));
        }
        if (dates.endDate) {
            setEndDate(toDate(dates.endDate));
            setEndDay(moment(dates.endDate).format('dddd'));
        }
        if (dates.displayedDate) {
            setDisplayedDate(dates.displayedDate || moment());
        }
    };

    const setStart = (dates: DateRange): void => {
        const toDate = (d?: Date | Moment | null): Date | null =>
            d ? moment(d).toDate() : null;

        if (dates.startDate) {
            setStartDate(toDate(dates.startDate));
            setStartDay(moment(dates.startDate).format('dddd'));
        }
        if (dates.displayedDate) {
            setDisplayedStart(dates.displayedDate || moment());
        }
    };

    const setEnd = (dates: DateRange): void => {
        const toDate = (d?: Date | Moment | null): Date | null =>
            d ? moment(d).toDate() : null;

        if (dates.startDate) {
            // the picker returns the chosen date in `startDate` when using single-date mode
            setEndDate(toDate(dates.startDate));
            setEndDay(moment(dates.startDate).format('dddd'));
        }
        if (dates.displayedDate) {
            setDisplayedEnd(dates.displayedDate || moment());
        }
    };

    const handleConfirmStart = (date: Date): void => {
        setStartDate(date);
        setStartDay(moment(date).format('dddd'));
        setDisplayedStart(moment(date));
        setShowStartPicker(false);
    };

    const handleConfirmEnd = (date: Date): void => {
        setEndDate(date);
        setEndDay(moment(date).format('dddd'));
        setDisplayedEnd(moment(date));
        setShowEndPicker(false);
    };

    const formatDate = (date: Date | null): string =>
        date ? moment(date).format('DD MMMM YYYY') : '';

    const TIMEZONES: { zone: string; label: string }[] = [
        { zone: 'UTC', label: 'UTC' },
        { zone: 'Europe/London', label: 'London, UK' },
        { zone: 'Europe/Paris', label: 'Paris, France' },
        { zone: 'Europe/Berlin', label: 'Berlin, Germany' },
        { zone: 'America/New_York', label: 'New York, USA' },
        { zone: 'America/Chicago', label: 'Chicago, USA' },
        { zone: 'America/Los_Angeles', label: 'Los Angeles, USA' },
        { zone: 'Asia/Kolkata', label: 'Bengaluru, India' },
        { zone: 'Asia/Tokyo', label: 'Tokyo, Japan' },
        { zone: 'Asia/Shanghai', label: 'Shanghai, China' },
        { zone: 'Australia/Sydney', label: 'Sydney, Australia' },
        { zone: 'Africa/Johannesburg', label: 'Johannesburg, South Africa' },
    ];

    const selectTimezone = (zone: string, label: string): void => {
        setTimezone(zone);
        setTimezoneLabel(label);
        setShowTimezoneModal(false);
    };

    /* ----------------------------------
       UI
    ----------------------------------- */

    return (
        <SafeAreaView>
            <ImageBackground
                style={{ width: '100%', height: '100%' }}
                source={{ uri: background || image }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <Text style={styles.cancel}>Cancel</Text>
                    </Pressable>

                    <Pressable
                        onPress={handleCreateTrip}
                        style={[styles.createBtn, isLoading && { opacity: 0.7 }]}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="orange" />
                        ) : (
                            <Text style={styles.createText}>Create</Text>
                        )}
                    </Pressable>
                </View>

                {/* Body */}
                <View style={{ padding: 15 }}>
                    <DateRangePicker
                        onChange={setDates}
                        startDate={startDate}
                        endDate={endDate}
                        displayedDate={displayedDate}
                        range
                    >
                        <AntDesign name="calendar" size={25} color="white" />
                    </DateRangePicker>

                    <TextInput
                        value={tripName}
                        onChangeText={setTripName}
                        placeholder="Trip name"
                        placeholderTextColor="#c1c9d6"
                        style={styles.tripInput}
                    />

                    {/* Itinerary */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <AntDesign name="calendar" size={25} color="black" />
                            <Text style={styles.cardTitle}>Itinerary</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={{ padding: 15 }}>
                            <View style={styles.dateRow}>
                                <Pressable
                                    style={styles.dateButton}
                                    onPress={() => setShowStartPicker(true)}
                                >
                                    <Text style={styles.grayText}>{startDay || 'Starts'}</Text>
                                    <Text>{formatDate(startDate)}</Text>
                                </Pressable>



                                <Pressable
                                    style={styles.dateButton}
                                    onPress={() => setShowEndPicker(true)}
                                >
                                    <Text style={styles.grayText}>{endDay || 'Ends'}</Text>
                                    <Text>{formatDate(endDate)}</Text>
                                </Pressable>

                                <DateTimePickerModal
                                    isVisible={showStartPicker}
                                    mode="date"
                                    onConfirm={handleConfirmStart}
                                    onCancel={() => setShowStartPicker(false)}
                                />

                                <DateTimePickerModal
                                    isVisible={showEndPicker}
                                    mode="date"
                                    onConfirm={handleConfirmEnd}
                                    onCancel={() => setShowEndPicker(false)}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Footer Cards */}
                    <View style={styles.footerRow}>
                        <Pressable
                            style={styles.footerCard}
                            onPress={() => setShowTimezoneModal(true)}
                        >
                            {/* <AntDesign name="earth" size={16} color="#505050" style={styles.footerIcon} /> */}
                            <Text style={styles.footerTitle}>TimeZone</Text>
                            <Text style={styles.footerDesc}>{timezoneLabel}</Text>
                        </Pressable>

                        <Modal
                            visible={showTimezoneModal}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setShowTimezoneModal(false)}
                        >
                            <Pressable
                                style={styles.modalOverlay}
                                onPress={() => setShowTimezoneModal(false)}
                            >
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Select Timezone</Text>
                                    <FlatList<{ zone: string; label: string }>
                                        data={TIMEZONES}
                                        keyExtractor={(item) => item.zone}
                                        renderItem={({ item }: { item: { zone: string; label: string } }) => (
                                            <Pressable
                                                style={styles.timezoneItem}
                                                onPress={() => selectTimezone(item.zone, item.label)}
                                            >
                                                <Text style={styles.timezoneText}>{item.label}</Text>
                                                <Text style={styles.timezoneSub}>{item.zone}</Text>
                                            </Pressable>
                                        )}
                                    />
                                </View>
                            </Pressable>
                        </Modal>

                        <Pressable
                            onPress={() => navigation.navigate('Choose')}
                            style={styles.footerCard}
                        >
                            <FontAwesome name="photo" size={25} color="black" />
                            <Text style={styles.footerDesc}>Choose Image</Text>
                        </Pressable>
                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default CreateTrip;

/* ----------------------------------
   Styles
----------------------------------- */

const styles = StyleSheet.create({
    header: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancel: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    createBtn: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 25,
    },
    createText: {
        color: 'orange',
        fontSize: 15,
        fontWeight: '500',
    },
    tripInput: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#c1c9d6',
    },
    card: {
        backgroundColor: '#c1c9d6',
        marginVertical: 15,
        borderRadius: 20,
    },
    cardHeader: {
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    cardTitle: {
        fontSize: 16,
        color: '#505050',
    },
    divider: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    grayText: {
        color: '#505050',
    },
    dateButton: {
        padding: 6,
        alignItems: 'flex-start',
        minWidth: 120,
    },
    footerIcon: {
        marginBottom: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '70%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    timezoneItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    timezoneText: {
        fontSize: 14,
        fontWeight: '500',
    },
    timezoneSub: {
        fontSize: 12,
        color: '#777',
    },
    footerRow: {
        flexDirection: 'row',
        gap: 20,
    },
    footerCard: {
        flex: 1,
        backgroundColor: '#c1c9d6',
        borderRadius: 20,
        padding: 15,
    },
    footerTitle: {
        marginTop: 10,
        fontSize: 15,
        fontWeight: '600',
    },
    footerDesc: {
        marginTop: 10,
        fontSize: 15,
        fontWeight: '600',
        color: '#505050',
    },
});
