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
                    <Text style={styles.pageTitle}>KONTO</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>EMAIL:</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="tysix023@gmail.com"
                        placeholderTextColor="#888"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>HASŁO:</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="******************"
                        placeholderTextColor="#888"
                        secureTextEntry
                    />

                    <View style={styles.buttonContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#4da6ff" style={{ marginBottom: 15 }} />
                        ) : (
                            <Pressable style={styles.actionButton} onPress={handleLogin}>
                                <Text style={styles.buttonText}>ZALOGUJ SIĘ</Text>
                            </Pressable>
                        )}

                        <Pressable style={styles.actionButton} onPress={handleRegister}>
                            <Text style={styles.buttonText}>ZAREJESTRUJ SIĘ</Text>
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
        backgroundColor: '#1e1e1e',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
    },
    titleContainer: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 5,
        marginBottom: 40,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'normal',
        color: '#000',
    },
    formContainer: {
        width: '85%',
    },
    label: {
        color: '#e0e0e0',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 5,
        marginLeft: 5,
    },
    input: {
        backgroundColor: '#e0e0e0',
        color: '#000',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginBottom: 20,
        fontSize: 14,
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    actionButton: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 15,
    },
    buttonText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'normal',
    }
});