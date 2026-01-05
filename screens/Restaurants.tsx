import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Linking,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../navigation/StackNavigator';

type RestaurantsRouteProp = RouteProp<RootStackParamList, 'Restaurants'>;

interface Restaurant {
    place_id: string;
    name: string;
    rating: number;
    user_ratings_total: number;
    price_level?: number;
    photos?: { photo_reference: string }[];
    formatted_address: string;
    opening_hours?: { open_now: boolean };
}

const API_KEY = 'AIzaSyAaJ7VzIGk_y8dvrx2b4yya119jQVZJnNs';

const RestaurantsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<RestaurantsRouteProp>();
    const { location } = route.params || { location: 'India' }; // Fallback

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRestaurants();
    }, [location]);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            // Search for restaurants in the location sorted by rating (implicitly by query logic or post-sort)
            // Note: Text Search output is usually sorted by prominence/relevance. We can sort client side by rating.
            const query = `top rated restaurants in ${location}`;
            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.results) {
                // Sort by rating descending
                const sortedDetails = data.results.sort((a: Restaurant, b: Restaurant) => (b.rating || 0) - (a.rating || 0));
                setRestaurants(sortedDetails);
            }
        } catch (error) {
            console.error("Error fetching restaurants:", error);
        } finally {
            setLoading(false);
        }
    };

    const getPhotoUrl = (photoReference?: string) => {
        if (!photoReference) return null;
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${API_KEY}`;
    };

    const renderPriceLevel = (level?: number) => {
        if (level === undefined) return 'Price not available';
        return '💵'.repeat(level) || '💵';
    };

    const openInMaps = (placeName: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName + ' ' + location)}`;
        Linking.openURL(url);
    };

    const renderItem = ({ item }: { item: Restaurant }) => {
        const imageUrl = item.photos && item.photos.length > 0 ? getPhotoUrl(item.photos[0].photo_reference) : null;

        return (
            <Pressable onPress={() => openInMaps(item.name)} style={styles.card}>
                <View style={styles.imageContainer}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={[styles.image, styles.placeholderImage]}>
                            <Ionicons name="restaurant" size={40} color="#ccc" />
                        </View>
                    )}
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={14} color="#fff" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                        <Text style={styles.ratingCount}>({item.user_ratings_total})</Text>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>

                    <View style={styles.row}>
                        <MaterialCommunityIcons name="currency-usd" size={16} color="#666" />
                        <Text style={styles.detailsText}>{renderPriceLevel(item.price_level)}</Text>
                    </View>

                    <View style={styles.row}>
                        <Ionicons name="location-sharp" size={16} color="#666" />
                        <Text style={styles.addressText} numberOfLines={2}>{item.formatted_address}</Text>
                    </View>

                    {item.opening_hours && (
                        <View style={styles.row}>
                            <Text style={[styles.statusText, { color: item.opening_hours.open_now ? 'green' : 'red' }]}>
                                {item.opening_hours.open_now ? 'Open Now' : 'Closed'}
                            </Text>
                        </View>
                    )}
                </View>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </Pressable>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    Restaurants in {location}
                </Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Finding best places to eat...</Text>
                </View>
            ) : (
                <FlatList
                    data={restaurants}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.place_id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.centerEmpty}>
                            <Text style={{ fontSize: 16, color: 'gray' }}>No restaurants found.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default RestaurantsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        marginTop: 10, 
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        marginTop: 10,   
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    imageContainer: {
        height: 180,
        backgroundColor: '#f0f0f0',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratingBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 4,
        fontSize: 14,
    },
    ratingCount: {
        color: '#ddd',
        fontSize: 12,
        marginLeft: 2,
    },
    infoContainer: {
        padding: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailsText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
        flex: 1,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerEmpty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    }
});
