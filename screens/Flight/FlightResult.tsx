import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { generateFlights } from './Flightbackend';

const { width } = Dimensions.get('window');

const FlightResult = ({ navigation, route }: any) => {
    const { searchDetails } = route.params || {};

    const formattedDate = searchDetails?.date
        ? new Date(searchDetails.date).toDateString()
        : 'Fri Jan 27th';

    const [flights, setFlights] = useState<any[]>([]);
    const [allFlights, setAllFlights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter Modal State
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [priceMin, setPriceMin] = useState('500');
    const [priceMax, setPriceMax] = useState('10000'); // Default fallback
    const [dynamicMax, setDynamicMax] = useState(10000);
    const [selectedFilters, setSelectedFilters] = useState<string[]>(['Recommended', 'Best Seller']);
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>(['Free Protection', 'Food']);


    useEffect(() => {
        const fetchFlights = async () => {
            setLoading(true);
            try {
                const results = await generateFlights(
                    searchDetails?.from || { code: 'SRG', city: 'Semarang', id: '' },
                    searchDetails?.to || { code: 'TYO', city: 'Tokyo', id: '' },
                    searchDetails?.date || new Date().toISOString(),
                    searchDetails?.flightClass || 'Economy',
                    searchDetails?.returnDate
                );

                console.log(`FlightResult: Generated flights for Class: ${searchDetails?.flightClass}, Count: ${results.length}`);
                if (results.length > 0) {
                    console.log(`First Flight Price: ${results[0].price}, Class: ${results[0].class}`);
                }
                setFlights(results);
                setAllFlights(results);

                // Calculate Max Price from results
                if (results.length > 0) {
                    const maxPrice = Math.max(...results.map((f: any) => f.price));
                    setDynamicMax(maxPrice);
                    setPriceMax(maxPrice.toString());
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFlights();
    }, [searchDetails]);

    const filters = ['₹5,000 - ₹20,000', 'Recommended', 'Best Seller', 'Free Reschedule'];


    const toggleFilter = (filter: string) => {
        if (selectedFilters.includes(filter)) {
            setSelectedFilters(selectedFilters.filter(f => f !== filter));
        } else {
            setSelectedFilters([...selectedFilters, filter]);
        }
    };

    const toggleFacility = (facility: string) => {
        if (selectedFacilities.includes(facility)) {
            setSelectedFacilities(selectedFacilities.filter(f => f !== facility));
        } else {
            setSelectedFacilities([...selectedFacilities, facility]);
        }
    };

    const applyFilter = () => {
        const limit = Number(priceMax);
        const filtered = allFlights.filter(item => item.price <= limit);
        setFlights(filtered);
        setIsFilterVisible(false);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#192038" />

            <ScrollView
                stickyHeaderIndices={[1]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {/* Scrollable Header Section (Index 0) - Nav & BG */}
                <View style={{ marginBottom: -115 }}>
                    <View style={styles.headerBackground}>
                        <Image
                            source={{ uri: 'https://i.ibb.co/6yV6z5d/world-map-dots.png' }}
                            style={styles.headerImage}
                            resizeMode="cover"
                        />
                        <SafeAreaView>
                            <View style={styles.headerNav}>
                                <TouchableOpacity style={styles.navButton} onPress={() => navigation?.goBack()}>
                                    <Ionicons name="chevron-back" size={24} color="#FFF" />
                                </TouchableOpacity>
                                <Text style={styles.headerTitle}>Search Result</Text>
                                <TouchableOpacity style={styles.navButton}>
                                    <Ionicons name="ellipsis-horizontal" size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>
                    </View>
                </View>

                {/* Sticky Header Section (Index 1) - Card */}
                <View style={{ zIndex: 100 }}>
                    {/* Search Info Card - Floating */}
                    <View style={[styles.searchInfoCard, { marginTop: 30, marginBottom: 10 }]}>
                        <View style={styles.searchInfoContent}>
                            <View>
                                <View style={styles.routeRow}>
                                    <Text style={styles.cityText}>{searchDetails?.from?.city || 'Semarang'}</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginHorizontal: 10 }} />
                                    <Text style={styles.cityText}>{searchDetails?.to?.city || 'Tokyo'}</Text>
                                </View>
                                <Text style={styles.subInfoText}>
                                    {formattedDate}  •  {((searchDetails?.passengers?.adults || 1) + (searchDetails?.passengers?.children || 0) + (searchDetails?.passengers?.infants || 0))} Seat  •  {searchDetails?.flightClass || 'Business'}
                                </Text>
                            </View>
                            <TouchableOpacity>
                                <MaterialCommunityIcons name="pencil-outline" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Scrollable Body */}
                <View style={styles.bodyContainer}>
                    {/* Result Count Heading */}
                    <View style={styles.resultHeader}>
                        <Text style={styles.resultTitle}>Search Result</Text>
                        <Text style={styles.resultCount}>"{flights.length} Result"</Text>
                    </View>

                    {loading ? (
                        <View style={{ padding: 50, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#4A6DFF" />
                            <Text style={{ marginTop: 10, color: '#888' }}>Finding best flights...</Text>
                        </View>
                    ) : (
                        <>
                            {/* Horizontal Filters */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
                                {filters.map((filter, index) => (
                                    <TouchableOpacity key={index} style={styles.filterChip}>
                                        <Text style={styles.filterText}>{filter}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Flight List Items */}
                            {flights.length === 0 ? (
                                <View style={{ alignItems: 'center', marginTop: 50, paddingBottom: 100 }}>
                                    <MaterialCommunityIcons name="airplane-off" size={64} color="#DDD" />
                                    <Text style={{ marginTop: 10, fontSize: 16, color: '#888', fontWeight: 'bold' }}>No Flight Found</Text>
                                    <Text style={{ fontSize: 14, color: '#AAA' }}>Try adjusting your filters</Text>
                                </View>
                            ) : (
                                <View style={styles.listContent}>
                                    {flights.map((item) => (
                                        <View key={item.id} style={styles.flightCard}>
                                            {/* Card Header for Tag */}
                                            <View style={styles.cardHeader}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    {item.airlineLogo ? (
                                                        <Image
                                                            source={{ uri: item.airlineLogo }}
                                                            style={{ width: 30, height: 30, marginRight: 10, borderRadius: 15 }}
                                                            resizeMode="contain"
                                                        />
                                                    ) : <View style={styles.airlineLogoPlaceholder} />}
                                                    <View>
                                                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.airline}</Text>
                                                        <Text style={{ fontSize: 12, color: '#888' }}>{item.flightName}</Text>
                                                    </View>
                                                </View>
                                                {item.tag ? (
                                                    <View style={[styles.tagContainer, { backgroundColor: item.tagColor }]}>
                                                        <Text style={[styles.tagText, { color: item.tagTextColor }]}>{item.tag}</Text>
                                                    </View>
                                                ) : null}
                                            </View>

                                            {/* Flight Route Info */}
                                            <View style={styles.flightInfoRow}>
                                                {/* Departure */}
                                                <View>
                                                    <Text style={styles.smallLabel}>{item.departure.city}</Text>
                                                    <Text style={styles.codeText}>{item.departure.code}</Text>
                                                    <Text style={styles.timeText}>{item.departure.time}</Text>
                                                </View>

                                                {/* Duration Graphic */}
                                                <View style={styles.durationContainer}>
                                                    <Text style={styles.dateLabel}>{item.date}</Text>
                                                    <View style={styles.pathContainer}>
                                                        <View style={styles.dot} />
                                                        <View style={styles.line}>
                                                            <Ionicons name="airplane" size={14} color="#4A6DFF" style={styles.planeIcon} />
                                                        </View>
                                                        <View style={styles.dot} />
                                                    </View>
                                                    <Text style={styles.durationText}>{item.duration}</Text>
                                                </View>

                                                {/* Arrival */}
                                                <View style={{ alignItems: 'flex-end' }}>
                                                    <Text style={styles.smallLabel}>{item.arrival.city}</Text>
                                                    <Text style={styles.codeText}>{item.arrival.code}</Text>
                                                    <Text style={styles.timeText}>{item.arrival.time}</Text>
                                                </View>

                                                {/* Price */}
                                                <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
                                                    <Text style={styles.priceText}>₹{item.price.toLocaleString('en-IN')}</Text>
                                                    <Text style={styles.originalPriceText}>₹{item.originalPrice.toLocaleString('en-IN')}</Text>
                                                    <Text style={styles.paxText}>({item.class})</Text>
                                                </View>
                                            </View>

                                            {/* Return Flight Info (if Round Trip) */}
                                            {item.returnFlight && (
                                                <View style={{ marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F0F0F0' }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#4A6DFF', backgroundColor: '#E8F0FE', padding: 4, borderRadius: 4 }}>RETURN</Text>
                                                        <Text style={{ marginLeft: 10, fontSize: 13, color: '#333', fontWeight: '600' }}>{item.returnFlight.airline} {item.returnFlight.flightNumber}</Text>
                                                    </View>
                                                    <View style={styles.flightInfoRow}>
                                                        <View>
                                                            <Text style={styles.smallLabel}>Departure</Text>
                                                            <Text style={styles.codeText}>{item.returnFlight.departure.code}</Text>
                                                            <Text style={styles.timeText}>{item.returnFlight.departure.time}</Text>
                                                        </View>
                                                        <View style={{ flex: 1, alignItems: 'center' }}>
                                                            <Ionicons name="airplane" size={16} color="#ccc" style={{ transform: [{ rotate: '180deg' }] }} />
                                                        </View>
                                                        <View style={{ alignItems: 'flex-end' }}>
                                                            <Text style={styles.smallLabel}>Arrival</Text>
                                                            <Text style={styles.codeText}>{item.returnFlight.arrival.code}</Text>
                                                            <Text style={styles.timeText}>{item.returnFlight.arrival.time}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            )}

                                            <View style={styles.dashedDivider} />

                                            {/* Footer */}
                                            <View style={styles.cardFooter}>
                                                <View style={styles.footerLeft}>
                                                    <Ionicons name="person" size={14} color="#4A6DFF" />
                                                    <Text style={styles.footerText}>{item.class}</Text>
                                                    <View style={styles.dotSeparator} />
                                                    <Text style={styles.footerText}>{item.seats} Seat</Text>
                                                    {item.stopCount > 0 && (
                                                        <>
                                                            <View style={styles.dotSeparator} />
                                                            <Text style={[styles.footerText, { color: '#E53935' }]}>{item.stopCount} Stop {item.stopCity ? `via ${item.stopCity}` : ''}</Text>
                                                        </>
                                                    )}
                                                </View>
                                                <View style={styles.footerRight}>
                                                    {item.amenities.includes('meal') && <MaterialCommunityIcons name="food-fork-drink" size={16} color="#888" style={styles.amenityIcon} />}
                                                    {item.amenities.includes('luggage') && <MaterialCommunityIcons name="bag-suitcase" size={16} color="#888" style={styles.amenityIcon} />}
                                                    {item.amenities.includes('entertainment') && <MaterialCommunityIcons name="movie" size={16} color="#888" style={styles.amenityIcon} />}
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Floating Sort/Filter */}
            <View style={styles.bottomFloatingContainer}>
                <View style={styles.floatingButton}>
                    <TouchableOpacity style={styles.floatBtnItem}>
                        <MaterialCommunityIcons name="sort-variant" size={20} color="#333" />
                        <Text style={styles.floatBtnText}>Sort</Text>
                    </TouchableOpacity>
                    <View style={styles.verticalDivider} />
                    <TouchableOpacity style={styles.floatBtnItem} onPress={() => setIsFilterVisible(true)}>
                        <MaterialCommunityIcons name="filter-outline" size={20} color="#333" />
                        <Text style={styles.floatBtnText}>Filter</Text>
                    </TouchableOpacity>
                    {/* Filter Modal */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isFilterVisible}
                        onRequestClose={() => setIsFilterVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                {/* Drag Handle */}
                                <View style={styles.dragHandle} />

                                {/* Header */}
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Filter</Text>
                                    <TouchableOpacity onPress={() => {
                                        setPriceMin('500');
                                        setPriceMax(dynamicMax.toString());
                                        setSelectedFilters([]);
                                        setSelectedFacilities([]);
                                        setFlights(allFlights);
                                    }}>
                                        <Text style={styles.resetText}>Reset</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Price Range - Fixed at top for better slider UX */}
                                <View style={styles.sectionContainer}>
                                    <View style={styles.sectionHeaderRow}>
                                        <Text style={styles.sectionTitle}>Price Range</Text>
                                        <Ionicons name="chevron-up" size={20} color="#333" />
                                    </View>
                                    <View style={styles.priceInputsRow}>
                                        <View style={styles.priceInputContainer}>
                                            <Text style={styles.currencySymbol}>₹</Text>
                                            <TextInput
                                                style={styles.priceInput}
                                                value={priceMin}
                                                onChangeText={setPriceMin}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <Text style={{ color: '#DDD', marginHorizontal: 10 }}>—</Text>
                                        <View style={styles.priceInputContainer}>
                                            <Text style={styles.currencySymbol}>₹</Text>
                                            <TextInput
                                                style={styles.priceInput}
                                                value={priceMax}
                                                onChangeText={setPriceMax}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>

                                    {/* Visual Slider */}
                                    <View style={styles.sliderContainer}>
                                        <Slider
                                            key={dynamicMax}
                                            style={{ width: '100%', height: 40 }}
                                            minimumValue={0}
                                            maximumValue={dynamicMax > 0 ? dynamicMax : 10000}
                                            step={100}
                                            minimumTrackTintColor="#4A6DFF"
                                            maximumTrackTintColor="#F0F0F0"
                                            thumbTintColor="#4A6DFF"
                                            value={Math.min(Math.max(Number(priceMax) || 0, 0), dynamicMax > 0 ? dynamicMax : 10000)}
                                            onValueChange={(val) => setPriceMax(Math.floor(val).toString())}
                                        />
                                    </View>
                                    <View style={styles.sliderLabels}>
                                        <Text style={styles.sliderLabelText}>₹ 500</Text>
                                        <Text style={styles.sliderLabelText}>₹ {priceMax}</Text>
                                    </View>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false}>

                                    {/* Filter Type */}
                                    <View style={styles.sectionContainer}>
                                        <View style={styles.sectionHeaderRow}>
                                            <Text style={styles.sectionTitle}>Filter type</Text>
                                            <Ionicons name="chevron-up" size={20} color="#333" />
                                        </View>
                                        <View style={styles.optionsGrid}>
                                            {['Recommended', 'Fastest', 'Best Seller'].map((option, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={styles.optionRow}
                                                    onPress={() => toggleFilter(option)}
                                                >
                                                    <Ionicons
                                                        name={selectedFilters.includes(option) ? "checkmark-circle" : "ellipse-outline"}
                                                        size={24}
                                                        color={selectedFilters.includes(option) ? "#4A6DFF" : "#DDD"}
                                                    />
                                                    <Text style={styles.optionText}>{option}</Text>
                                                </TouchableOpacity>
                                            ))}
                                            {/* Dummy duplication for layout matching image which has two columns effectively? No, looks like grid */}
                                            <TouchableOpacity style={styles.optionRow} onPress={() => { }}>
                                                <Ionicons name="ellipse-outline" size={24} color="#DDD" />
                                                <Text style={styles.optionText}>Best Seller</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Facilities */}
                                    <View style={styles.sectionContainer}>
                                        <View style={styles.sectionHeaderRow}>
                                            <Text style={styles.sectionTitle}>Facilities</Text>
                                            <Ionicons name="chevron-up" size={20} color="#333" />
                                        </View>
                                        <View style={styles.optionsGrid}>
                                            {['Free Protection', 'Luggage', 'Food', 'Entertainment'].map((option, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={styles.optionRow}
                                                    onPress={() => toggleFacility(option)}
                                                >
                                                    <Ionicons
                                                        name={selectedFacilities.includes(option) ? "checkmark-circle" : "ellipse-outline"}
                                                        size={24}
                                                        color={selectedFacilities.includes(option) ? "#4A6DFF" : "#DDD"}
                                                    />
                                                    <Text style={styles.optionText}>{option}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                    <View style={{ height: 20 }} />
                                </ScrollView>

                                {/* Footer Buttons */}
                                <View style={styles.modalFooter}>
                                    <TouchableOpacity style={styles.cancelButton} onPress={() => setIsFilterVisible(false)}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.applyButton} onPress={applyFilter}>
                                        <Text style={styles.applyButtonText}>Apply</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6F8',
    },
    headerBackground: {
        backgroundColor: '#24315bff', // Deep Blue
        paddingBottom: 90,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
    },
    headerImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
    },
    headerNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 25,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    searchInfoCard: {
        marginHorizontal: 20,
        backgroundColor: '#24315bff', // Lighter blue for card
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    searchInfoContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    cityText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    subInfoText: {
        fontSize: 12,
        color: '#AAB4CF',
    },
    bodyContainer: {
        // Space handled by sticky header margins
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#24315bff',
    },
    resultCount: {
        fontSize: 14,
        color: '#888',
    },
    filterScroll: {
        maxHeight: 50,
        marginBottom: 10,
    },
    filterContent: {
        paddingHorizontal: 20,
    },
    filterChip: {
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    filterText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 100, // Space for floating button
    },
    flightCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    airlineLogoPlaceholder: {
        width: 100,
        height: 30,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
    },
    tagContainer: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    flightInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    codeText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#181A20',
    },
    smallLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    timeText: {
        fontSize: 13,
        color: '#333',
        marginTop: 4,
    },
    durationContainer: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 10,
    },
    dateLabel: {
        fontSize: 11,
        color: '#333',
        fontWeight: '600',
        marginBottom: 5,
    },
    pathContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#DDD',
        backgroundColor: '#FFF',
    },
    line: {
        height: 1,
        backgroundColor: '#DDD',
        flex: 1,
        borderStyle: 'dashed',
        borderWidth: 0.5,
        borderColor: '#DDD',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center'
    },
    planeIcon: {
        position: 'absolute',
        top: -7,
        backgroundColor: '#FFF',
        paddingHorizontal: 2,
    },
    durationText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 5,
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00C9A7', // Teal/Green
    },
    originalPriceText: {
        fontSize: 12,
        color: '#CCC',
        textDecorationLine: 'line-through',
    },
    paxText: {
        fontSize: 12,
        color: '#888',
    },
    dashedDivider: {
        height: 1,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderStyle: 'dashed',
        marginVertical: 15,
        borderRadius: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    footerText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555',
    },
    dotSeparator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CCC',
    },
    footerRight: {
        flexDirection: 'row',
        gap: 8,
    },
    amenityIcon: {
        opacity: 0.6,
    },
    bottomFloatingContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    floatingButton: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
        alignItems: 'center',
    },
    floatBtnItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    floatBtnText: {
        marginLeft: 8,
        fontWeight: 'bold',
        color: '#333',
    },
    verticalDivider: {
        width: 1,
        height: 20,
        backgroundColor: '#E0E0E0',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        height: '80%', // Bottom sheet height
    },
    dragHandle: {
        width: 50,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#181A20',
    },
    resetText: {
        fontSize: 14,
        color: '#4A6DFF',
        fontWeight: 'bold',
    },
    sectionContainer: {
        marginBottom: 25,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#181A20',
    },
    priceInputsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    priceInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
    },
    currencySymbol: {
        fontSize: 16,
        color: '#333',
        marginRight: 10,
    },
    priceInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    sliderContainer: {
        height: 50,
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 10,
    },
    sliderTrack: {
        height: 4,
        backgroundColor: '#F0F0F0',
        borderRadius: 2,
        width: '100%',
        position: 'absolute',
    },
    sliderActiveTrack: {
        height: 4,
        backgroundColor: '#4A6DFF',
        borderRadius: 2,
        width: '80%',
        left: '10%',
        position: 'absolute',
    },
    sliderThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFF',
        borderWidth: 3,
        borderColor: '#4A6DFF',
        position: 'absolute',
        top: 5, // Center vertically roughly
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sliderLabelText: {
        color: '#4A6DFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%', // 2 columns
        marginBottom: 20,
        paddingRight: 10,
    },
    optionText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        marginLeft: 10,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#181A20',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    applyButton: {
        flex: 1,
        backgroundColor: '#4A6DFF',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FlightResult;
