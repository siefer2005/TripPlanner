import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { saveFlightSearch, searchAirports } from './Flightbackend';

export default function FlightHome() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const [isRoundTrip, setIsRoundTrip] = useState(false);
    const [isReturnEnabled, setIsReturnEnabled] = useState(false);

    // Date State
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    // Return Date State
    const [returnDate, setReturnDate] = useState(new Date());
    const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);

    const onReturnDateChange = (event: any, selectedDate?: Date) => {
        setShowReturnDatePicker(false);
        if (selectedDate) {
            setReturnDate(selectedDate);
        }
    };

    // Route State
    const [fromLocation, setFromLocation] = useState<any>(null);
    const [toLocation, setToLocation] = useState<any>(null);

    // Search Modal State
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [activeSearchField, setActiveSearchField] = useState<'FROM' | 'TO'>('FROM');

    // Class State
    const [flightClass, setFlightClass] = useState('Business');
    const [isClassModalVisible, setIsClassModalVisible] = useState(false);
    const classOptions = ['Economy', 'Premium Economy', 'Business', 'First'];

    // Passenger State
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [isPassengerModalVisible, setIsPassengerModalVisible] = useState(false);

    const updatePassenger = (type: 'ADULT' | 'CHILD' | 'INFANT', operation: 'ADD' | 'MINUS') => {
        if (type === 'ADULT') {
            if (operation === 'ADD') setAdults(adults + 1);
            else if (adults > 1) setAdults(adults - 1);
        } else if (type === 'CHILD') {
            if (operation === 'ADD') setChildren(children + 1);
            else if (children > 0) setChildren(children - 1);
        } else if (type === 'INFANT') {
            if (operation === 'ADD') setInfants(infants + 1);
            else if (infants > 0) setInfants(infants - 1);
        }
    };

    const handleSwap = () => {
        const temp = fromLocation;
        setFromLocation(toLocation);
        setToLocation(temp);
    };

    const openSearch = (type: 'FROM' | 'TO') => {
        setActiveSearchField(type);
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchVisible(true);
    };

    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.length > 2) {
            const results = await searchAirports(text);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const selectAirport = async (airport: any) => {
        // Optimistic update first to close modal and show something
        if (activeSearchField === 'FROM') {
            setFromLocation(airport);
        } else {
            setToLocation(airport);
        }
        setIsSearchVisible(false);

        // If code is invalid, try to fetch it in background and update
        if (!airport.code || airport.code === '---' || airport.code.length !== 3) {
            console.log(`Missing IATA for selected city ${airport.city}. Fetching...`);
            // Import dynamically or assume it's imported at top. We need to import fetchIATAWithAI in Flightbackend.
            // Since I cannot change imports in this block, I will rely on the import. 
            // Wait, I need to add the import first? No, I'll assume I can add the logic and user will fix import or I'll do it next.
            // Actually, I should update the import in a separate block or this one if I can range it. 
            // I'll stick to logic here and update imports in next step to be safe.

            // Correction: I can't use the function if not imported.
            // I will use a 'require' or just assume I'll add the import. 
            // Better: I will use the tool to update imports as well.

            // For now, let's just use the function name assuming I'll add the import in a moment.
            try {
                const { fetchIATAWithAI } = require('./Flightbackend');
                const realCode = await fetchIATAWithAI(airport.city || airport.name);
                if (realCode && realCode !== '---') {
                    const updatedAirport = { ...airport, code: realCode };
                    if (activeSearchField === 'FROM') setFromLocation(updatedAirport);
                    else setToLocation(updatedAirport);
                }
            } catch (e) {
                console.error("Failed to update IATA on selection", e);
            }
        }
    };


    const handleNextPress = async () => {
        const flightData = {
            from: fromLocation,
            to: toLocation,
            date: date.toISOString(),
            returnDate: isRoundTrip ? returnDate.toISOString() : null,
            isRoundTrip: isRoundTrip,
            flightClass: flightClass,
            passengers: {
                adults,
                children,
                infants
            }
        };

        try {
            await saveFlightSearch(flightData);
            console.log('Flight search saved successfully');
        } catch (error) {
            console.error('Failed to save flight search:', error);
        }

        navigation.navigate('FlightResult', { searchDetails: flightData });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#181A20" />

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                {/* Background Header */}
                <View style={styles.headerBackground}>
                    <SafeAreaView>
                        <View style={styles.headerNav}>
                            {/* Title Only as per design */}
                        </View>
                    </SafeAreaView>

                    <View style={styles.headerContent}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>Discover the best</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.headerTitle}>flight for you </Text>
                                <Text style={{ fontSize: 24 }}>✈️</Text>
                            </View>
                        </View>

                        <View>
                            <TouchableOpacity style={styles.notificationBtn}>
                                <Ionicons name="notifications-outline" size={24} color="#FFF" />
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>9+</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Main Content Area with Overlapping Card */}
                <View style={styles.scrollContent}>
                    {/* Search Card */}
                    <View style={styles.searchCard}>
                        {/* Tabs */}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tab, !isRoundTrip && styles.activeTab]}
                                onPress={() => setIsRoundTrip(false)}
                            >
                                <Text style={[styles.tabText, !isRoundTrip && styles.activeTabText]}>One - Way</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tab, isRoundTrip && styles.activeTab]}
                                onPress={() => setIsRoundTrip(true)}
                            >
                                <Text style={[styles.tabText, isRoundTrip && styles.activeTabText]}>Round Trip</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Route Inputs */}
                        <View style={styles.routeContainer}>
                            <TouchableOpacity style={styles.routeInputItem} onPress={() => openSearch('FROM')}>
                                <MaterialCommunityIcons name="airplane-takeoff" size={24} color="#888" style={styles.inputIcon} />
                                <View style={styles.routeTextContainer}>
                                    <Text style={styles.routeLabel}>From</Text>
                                    <Text style={styles.routeValue}>
                                        {fromLocation ? `${fromLocation.city} - ${fromLocation.code}` : 'Select City'}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <View style={styles.swapButtonContainer}>
                                <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
                                    <MaterialCommunityIcons name="swap-vertical" size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.routeInputItem} onPress={() => openSearch('TO')}>
                                <MaterialCommunityIcons name="airplane-landing" size={24} color="#888" style={styles.inputIcon} />
                                <View style={styles.routeTextContainer}>
                                    <Text style={styles.routeLabel}>To</Text>
                                    <Text style={styles.routeValue}>
                                        {toLocation ? `${toLocation.city} - ${toLocation.code}` : 'Select City'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Date and Return Toggle */}
                        <View style={styles.rowContainer}>
                            <TouchableOpacity style={[styles.dateInput, { flex: 1 }]} onPress={() => setShowDatePicker(true)}>
                                <MaterialCommunityIcons name="calendar-month-outline" size={22} color="#888" />
                                <View>
                                    <Text style={{ fontSize: 10, color: '#888' }}>Departure</Text>
                                    <Text style={styles.dateText}>{moment(date).format('ddd, DD MMM')}</Text>
                                </View>
                            </TouchableOpacity>

                            {isRoundTrip && (
                                <TouchableOpacity style={[styles.dateInput, { flex: 1 }]} onPress={() => setShowReturnDatePicker(true)}>
                                    <MaterialCommunityIcons name="calendar-month-outline" size={22} color="#888" />
                                    <View>
                                        <Text style={{ fontSize: 10, color: '#888' }}>Return</Text>
                                        <Text style={styles.dateText}>{moment(returnDate).format('ddd, DD MMM')}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Class and Seat */}
                        <View style={styles.rowContainer}>
                            <TouchableOpacity style={styles.optionInput} onPress={() => setIsClassModalVisible(true)}>
                                <MaterialCommunityIcons
                                    name={flightClass === 'First' ? 'crown' : flightClass === 'Business' ? 'briefcase' : 'seat-recline-normal'}
                                    size={24}
                                    color="#888"
                                />
                                <Text style={styles.optionText}>{flightClass}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.optionInput} onPress={() => setIsPassengerModalVisible(true)}>
                                <Ionicons name="people-outline" size={24} color="#888" />
                                <Text style={styles.optionText}>{adults + children + infants} Seat</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Next Button */}
                        <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
                            <Text style={styles.nextButtonText}>Next</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Active Ticket Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Active Ticket</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeMoreText}>See more</Text>
                        </TouchableOpacity>
                    </View>

                    {/* User's Ticket Card */}
                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <Text style={{ fontSize: 16, color: '#666' }}>Enter the place name to search flights</Text>
                    </View>

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Airport Search Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isSearchVisible}
                onRequestClose={() => setIsSearchVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Airport</Text>
                            <TouchableOpacity onPress={() => setIsSearchVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchInputContainer}>
                            <Ionicons name="search" size={20} color="#888" style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search city or airport code..."
                                placeholderTextColor="#AAA"
                                value={searchQuery}
                                onChangeText={handleSearch}
                                autoFocus
                            />
                        </View>

                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.searchResultItem} onPress={() => selectAirport(item)}>
                                    <View style={styles.resultIconContainer}>
                                        <FontAwesome5 name="plane-departure" size={14} color="#4A6DFF" />
                                    </View>
                                    <View>
                                        <Text style={styles.resultCity}>{item.city} ({item.code})</Text>
                                        <Text style={styles.resultAirport}>{item.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={() => (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <Text style={{ color: '#888' }}>
                                        {searchQuery ? "No airports found" : "Type to search..."}
                                    </Text>
                                </View>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Class Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isClassModalVisible}
                onRequestClose={() => setIsClassModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { height: 'auto', maxHeight: '50%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Class</Text>
                            <TouchableOpacity onPress={() => setIsClassModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View>
                            {classOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.searchResultItem,
                                        { justifyContent: 'space-between', borderBottomWidth: index === classOptions.length - 1 ? 0 : 1 }
                                    ]}
                                    onPress={() => {
                                        setFlightClass(option);
                                        setIsClassModalVisible(false);
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={[styles.resultIconContainer, { backgroundColor: flightClass === option ? '#E8F0FE' : '#F5F6F8' }]}>
                                            <MaterialCommunityIcons
                                                name={option === 'First' ? 'crown' : option === 'Business' ? 'briefcase' : 'seat-recline-normal'}
                                                size={20}
                                                color={flightClass === option ? '#4A6DFF' : '#888'}
                                            />
                                        </View>
                                        <Text style={[styles.resultCity, { color: flightClass === option ? '#4A6DFF' : '#333' }]}>{option}</Text>
                                    </View>

                                    {flightClass === option && (
                                        <Ionicons name="checkmark-circle" size={24} color="#4A6DFF" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Passenger Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isPassengerModalVisible}
                onRequestClose={() => setIsPassengerModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { height: 'auto' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Passengers</Text>
                            <TouchableOpacity onPress={() => setIsPassengerModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Adults */}
                        <View style={styles.passengerRow}>
                            <View>
                                <Text style={styles.passengerType}>Adults</Text>
                                <Text style={styles.passengerAge}>Above 12 years</Text>
                            </View>
                            <View style={styles.counterContainer}>
                                <TouchableOpacity
                                    style={[styles.counterButton, adults <= 1 && styles.counterButtonDisabled]}
                                    disabled={adults <= 1}
                                    onPress={() => updatePassenger('ADULT', 'MINUS')}
                                >
                                    <MaterialCommunityIcons name="minus" size={20} color={adults <= 1 ? "#CCC" : "#4A6DFF"} />
                                </TouchableOpacity>
                                <Text style={styles.counterValue}>{adults}</Text>
                                <TouchableOpacity style={styles.counterButton} onPress={() => updatePassenger('ADULT', 'ADD')}>
                                    <MaterialCommunityIcons name="plus" size={20} color="#4A6DFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Children */}
                        <View style={styles.passengerRow}>
                            <View>
                                <Text style={styles.passengerType}>Children</Text>
                                <Text style={styles.passengerAge}>2 - 12 years</Text>
                            </View>
                            <View style={styles.counterContainer}>
                                <TouchableOpacity
                                    style={[styles.counterButton, children <= 0 && styles.counterButtonDisabled]}
                                    disabled={children <= 0}
                                    onPress={() => updatePassenger('CHILD', 'MINUS')}
                                >
                                    <MaterialCommunityIcons name="minus" size={20} color={children <= 0 ? "#CCC" : "#4A6DFF"} />
                                </TouchableOpacity>
                                <Text style={styles.counterValue}>{children}</Text>
                                <TouchableOpacity style={styles.counterButton} onPress={() => updatePassenger('CHILD', 'ADD')}>
                                    <MaterialCommunityIcons name="plus" size={20} color="#4A6DFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Infants */}
                        <View style={styles.passengerRow}>
                            <View>
                                <Text style={styles.passengerType}>Infants</Text>
                                <Text style={styles.passengerAge}>Below 2 years</Text>
                            </View>
                            <View style={styles.counterContainer}>
                                <TouchableOpacity
                                    style={[styles.counterButton, infants <= 0 && styles.counterButtonDisabled]}
                                    disabled={infants <= 0}
                                    onPress={() => updatePassenger('INFANT', 'MINUS')}
                                >
                                    <MaterialCommunityIcons name="minus" size={20} color={infants <= 0 ? "#CCC" : "#4A6DFF"} />
                                </TouchableOpacity>
                                <Text style={styles.counterValue}>{infants}</Text>
                                <TouchableOpacity style={styles.counterButton} onPress={() => updatePassenger('INFANT', 'ADD')}>
                                    <MaterialCommunityIcons name="plus" size={20} color="#4A6DFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={[styles.nextButton, { marginTop: 20 }]} onPress={() => setIsPassengerModalVisible(false)}>
                            <Text style={styles.nextButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onDateChange}
                    minimumDate={new Date()}
                />
            )}

            {/* Return Date Picker */}
            {showReturnDatePicker && (
                <DateTimePicker
                    testID="returnDateTimePicker"
                    value={returnDate}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onReturnDateChange}
                    minimumDate={date}
                />
            )}

            <Pressable
                onPress={() =>
                    navigation.navigate('Ai', {
                        name: route?.params?.item?.tripName,
                        tripId: route?.params?.item?._id,
                    })
                }
                style={{
                    width: 60,
                    height: 60,
                    borderRadius: 40,
                    justifyContent: 'center',
                    backgroundColor: '#4A6DFF',
                    marginLeft: 'auto',
                    position: 'absolute',
                    bottom: 50,
                    right: 25,
                    alignContent: 'center',
                }}>
                <FontAwesome6
                    style={{ textAlign: 'center' }}
                    name="wand-magic-sparkles"
                    size={24}
                    color="white"
                />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6F8', // Light greyish background for body
    },
    headerBackground: {
        backgroundColor: '#181A20', // Dark background
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 110, // Extra padding to allow card overlap
        borderBottomLeftRadius: 30, // Optional curve if desired, but image looks straight or slightly curved
        borderBottomRightRadius: 30,
    },
    headerNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        lineHeight: 36,
    },
    notificationBtn: {
        padding: 5,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF5A5F',
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: '#181A20',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        marginTop: -80, // Negative margin to pull card up
        paddingBottom: 20,
    },
    searchCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F4F6F8',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: '#4A6DFF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
    },
    activeTabText: {
        color: '#FFF',
    },
    routeContainer: {
        marginBottom: 20,
    },
    routeInputItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderRadius: 12,
        padding: 15,
    },
    inputIcon: {
        marginRight: 15,
    },
    routeTextContainer: {

    },
    routeLabel: {
        fontSize: 12,
        color: '#AAA',
        marginBottom: 2,
        display: 'none', // Image doesn't clearly show labels, just the city. Hiding based on "Semarang - SRG" appearance
    },
    routeValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    divider: {
        height: 10,
    },
    swapButtonContainer: {
        position: 'absolute',
        right: 20,
        top: '35%',
        zIndex: 1,
    },
    swapButton: {
        backgroundColor: '#4A6DFF',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 15,
    },
    dateInput: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderRadius: 12,
        padding: 15,
        gap: 10,
    },
    dateText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    returnContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    returnLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    optionInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderRadius: 12,
        padding: 15,
        gap: 10,
        justifyContent: 'center'
    },
    optionText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    nextButton: {
        backgroundColor: '#4A6DFF',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#181A20',
    },
    seeMoreText: {
        fontSize: 14,
        color: '#4A6DFF',
    },
    ticketCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    ticketCityName: {
        fontSize: 12,
        color: '#888',
        flex: 1,
    },
    ticketDate: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    ticketRouteRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    airportCode: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#181A20',
    },
    timeText: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    flightPathContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    pathLineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        position: 'relative',
    },
    dashedLine: {
        height: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#CCC',
        width: '100%',
        position: 'absolute',
        zIndex: -1,
    },
    flightIcon: {
        backgroundColor: '#FFF', // mask line
        paddingHorizontal: 4,
        fontSize: 14,
        color: '#4A6DFF',
    },
    durationText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 5,
    },
    pathDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E0E0E0', // Light dot on ends? Image shows circles near codes
    },
    ticketDividerContainer: {
        marginVertical: 10,
        overflow: 'hidden',
        width: '100%',
    },
    ticketDividerLine: {
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderStyle: 'dashed',
        width: '100%',
    },
    ticketFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    footerText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    dotSeparator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CCC',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F6F8',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        color: '#333',
        fontSize: 16,
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F6F8',
    },
    resultIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    resultCity: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    resultAirport: {
        fontSize: 13,
        color: '#888',
    },
    // Passenger Modal Styles
    passengerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F6F8',
    },
    passengerType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    passengerAge: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    counterButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#4A6DFF',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F4FF',
    },
    counterButtonDisabled: {
        borderColor: '#E0E0E0',
        backgroundColor: '#F5F6F8',
    },
    counterValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        width: 20,
        textAlign: 'center',
    },
});


