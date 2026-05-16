import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Błąd", "Wpisz email i hasło!");
            return;
        }

        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            Alert.alert("Błąd logowania", "Nieprawidłowy email lub hasło.");
            console.error(error.message);
        } else if (data.user) {
            Alert.alert("Sukces", "Zalogowano pomyślnie!");
            router.replace('/');
        }

        setLoading(false);
    };

    const handleRegister = () => {
        router.push('/register');
    };

    return (
        <View style={styles.container}>
            <Header />

            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={styles.pageTitle}>LOGOWANIE DO KONTA</Text>
                </View>

                <View style={styles.formContainer}>

                    <Text style={styles.label}>ADRES EMAIL:</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="np. gracz@tysix.pl"
                        placeholderTextColor="#557c6f"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>HASŁO:</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••••••••••"
                        placeholderTextColor="#557c6f"
                        secureTextEntry
                    />

                    <View style={styles.buttonContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#c5a059" style={{ marginBottom: 15 }} />
                        ) : (
                            <Pressable style={styles.primaryButton} onPress={handleLogin}>
                                <Text style={styles.primaryButtonText}>ZALOGUJ SIĘ</Text>
                            </Pressable>
                        )}

                        <Pressable style={styles.secondaryButton} onPress={handleRegister}>
                            <Text style={styles.secondaryButtonText}>STWÓRZ NOWE KONTO</Text>
                        </Pressable>
                    </View>

                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#102a22',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 30,
    },
    titleContainer: {
        backgroundColor: '#16352b',
        paddingVertical: 12,
        paddingHorizontal: 45,
        borderRadius: 20,
        marginBottom: 35,
        borderWidth: 1,
        borderColor: '#c5a059'
    },
    pageTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#f4ebd0',
        letterSpacing: 1.5,
    },
    formContainer: {
        backgroundColor: '#0d221b',
        width: '90%',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(197, 160, 89, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    label: {
        color: '#c5a059',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 1,
    },
    input: {
        backgroundColor: '#16352b',
        color: '#f4ebd0',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 24,
        fontSize: 15,
        borderWidth: 1,
        borderColor: 'rgba(197, 160, 89, 0.2)',
        fontWeight: '500'
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 10,
        width: '100%'
    },
    primaryButton: {
        backgroundColor: '#f4ebd0',
        paddingVertical: 15,
        width: '100%',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: '#c5a059',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#102a22',
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingVertical: 14,
        width: '100%',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#c5a059',
    },
    secondaryButtonText: {
        color: '#c5a059',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});