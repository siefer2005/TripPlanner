import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useContext, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { AuthContext } from '../AuthContext';
import { API_URL } from '../constants/config';
import { RootStackParamList } from '../navigation/StackNavigator';

/* ----------------------------------
   Types
----------------------------------- */
interface BackendAuthResponse {
    token: string;
    user: {
        _id: string;
        email: string;
        name: string;
    };
}

/* ----------------------------------
   Component
----------------------------------- */
const EmailAuthScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'EmailAuth'>>();
    const { setToken } = useContext(AuthContext);

    const initialMode = route.params?.isSignUp ?? true;
    const [isSignUp, setIsSignUp] = useState<boolean>(initialMode);
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    /* ----------------------------------
       Validation
    ----------------------------------- */
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = (): boolean => {
        if (!email || !password) {
            setError('Email and password are required');
            return false;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return false;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }

        if (isSignUp) {
            if (!name) {
                setError('Name is required for sign up');
                return false;
            }

            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
        }

        return true;
    };

    /* ----------------------------------
       Handle Authentication
    ----------------------------------- */
    const handleAuth = async (): Promise<void> => {
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const endpoint = isSignUp ? '/email-signup' : '/email-login';
            const body = isSignUp
                ? { name, email, password }
                : { email, password };

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }).catch((fetchError) => {
                console.error('Fetch error:', fetchError);
                throw new Error('Cannot connect to server. Please check if the backend is running and you are on the same Wi-Fi.');
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Authentication failed');
                } catch (jsonError) {
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }
            }

            const data: BackendAuthResponse = await response.json();
            const { token } = data;

            console.log('Auth successful, saving token');
            await AsyncStorage.setItem('authToken', token);
            setToken(token);

            // Navigation will happen automatically via AuthContext
        } catch (err: unknown) {
            console.log('Auth Error:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(isSignUp ? 'Sign up failed' : 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    /* ----------------------------------
       UI
    ----------------------------------- */
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled">
                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                            <AntDesign name="left" size={24} color="#333" />
                        </Pressable>
                        <Image
                            style={styles.logo}
                            source={{ uri: 'https://wanderlog.com/assets/logoWithText.png' }}
                        />
                    </View>

                    {/* Title */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {isSignUp
                                ? 'Sign up to start planning your trips'
                                : 'Sign in to continue'}
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        {isSignUp && (
                            <View style={styles.inputContainer}>
                                <AntDesign
                                    name="user"
                                    size={20}
                                    color="#666"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                    editable={!loading}
                                />
                            </View>
                        )}

                        <View style={styles.inputContainer}>
                            <AntDesign
                                name="mail"
                                size={20}
                                color="#666"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <AntDesign
                                name="lock"
                                size={20}
                                color="#666"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                editable={!loading}
                            />
                        </View>

                        {isSignUp && (
                            <View style={styles.inputContainer}>
                                <AntDesign
                                    name="lock"
                                    size={20}
                                    color="#666"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                            </View>
                        )}

                        {/* Error Message */}
                        {error ? (
                            <View style={styles.errorContainer}>
                                <AntDesign name="exclamationcircleo" size={16} color="#ff4444" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {/* Submit Button */}
                        <Pressable
                            onPress={handleAuth}
                            disabled={loading}
                            style={[
                                styles.submitButton,
                                loading && styles.submitButtonDisabled,
                            ]}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    {isSignUp ? 'Sign Up' : 'Sign In'}
                                </Text>
                            )}
                        </Pressable>

                        {/* Toggle Sign Up/Sign In */}
                        <Pressable
                            onPress={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                                setName('');
                                setPassword('');
                                setConfirmPassword('');
                            }}
                            style={styles.toggleContainer}>
                            <Text style={styles.toggleText}>
                                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                                <Text style={styles.toggleTextBold}>
                                    {isSignUp ? 'Sign In' : 'Sign Up'}
                                </Text>
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EmailAuthScreen;

/* ----------------------------------
   Styles
----------------------------------- */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    header: {
        marginTop: 20,
        alignItems: 'center',
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: 10,
        zIndex: 10,
        padding: 8,
    },
    logo: {
        width: 240,
        height: 80,
        resizeMode: 'contain',
    },
    titleContainer: {
        marginTop: 40,
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    formContainer: {
        marginTop: 40,
        paddingHorizontal: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 16,
        backgroundColor: '#F9F9F9',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: '#333',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffe6e6',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    submitButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: '#99c9ff',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    toggleContainer: {
        marginTop: 24,
        alignItems: 'center',
    },
    toggleText: {
        fontSize: 15,
        color: '#666',
    },
    toggleTextBold: {
        color: '#007AFF',
        fontWeight: '600',
    },
});
