import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

export default function RegisterScreen() {
    const [nick, setNick] = useState('');
    const [login, setLogin] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!nick || !login || !email || !password) {
            Alert.alert("Błąd", "Wypełnij wszystkie pola!");
            return;
        }

        setLoading(true);

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
        });

        if (authError) {
            Alert.alert("Błąd rejestracji", authError.message);
            setLoading(false);
            return;
        }

        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: authData.user.id,
                        username: login,
                    }
                ]);

            if (profileError) {
                console.error("Błąd zapisu profilu:", profileError);
                Alert.alert("Uwaga", "Konto zostało utworzone, ale wystąpił problem z zapisem profilu.");
            } else {
                Alert.alert('Sukces!', 'Konto utworzone pomyślnie. Możesz się zalogować.');
                router.back();
            }
        }

        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Header />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.titleContainer}>
                    <Text style={styles.pageTitle}>REJESTRACJA</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>NICK</Text>
                    <TextInput
                        style={styles.input}
                        value={nick}
                        onChangeText={setNick}
                        placeholder="TysixMaster"
                        placeholderTextColor="#888"
                    />

                    <Text style={styles.label}>LOGIN</Text>
                    <TextInput
                        style={styles.input}
                        value={login}
                        onChangeText={setLogin}
                        placeholder="tysix023"
                        placeholderTextColor="#888"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>EMAIL</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="tysix023@gmail.com"
                        placeholderTextColor="#888"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Text style={styles.label}>HASŁO</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="****************"
                        placeholderTextColor="#888"
                        secureTextEntry
                    />

                    <View style={styles.buttonContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#4da6ff" style={{ marginBottom: 20 }} />
                        ) : (
                            <Pressable style={styles.actionButton} onPress={handleRegister}>
                                <Text style={styles.buttonText}>ZAREJESTRUJ SIĘ</Text>
                            </Pressable>
                        )}

                        <Pressable onPress={() => router.back()} style={styles.backLink}>
                            <Text style={styles.backLinkText}>Masz już konto? Wróć do logowania</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e1e1e',
    },
    scrollContent: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 40,
    },
    titleContainer: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 5,
        marginBottom: 30,
    },
    pageTitle: {
        fontSize: 24,
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
        textTransform: 'uppercase',
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
        marginTop: 10,
    },
    actionButton: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 5,
        marginBottom: 20,
    },
    buttonText: {
        color: '#000',
        fontSize: 14,
    },
    backLink: {
        padding: 10,
    },
    backLinkText: {
        color: '#e0e0e0',
        fontSize: 12,
        textDecorationLine: 'underline',
    }
});