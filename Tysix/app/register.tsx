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
                    <Text style={styles.pageTitle}>REJESTRACJA NOWEGO GRACZA</Text>
                </View>

                <View style={styles.formContainer}>

                    <Text style={styles.label}>NICK (NAZWA WYŚWIETLANA):</Text>
                    <TextInput
                        style={styles.input}
                        value={nick}
                        onChangeText={setNick}
                        placeholder="np. TysixMaster"
                        placeholderTextColor="#557c6f"
                    />

                    <Text style={styles.label}>LOGIN (UNIKALNY IDENTYFIKATOR):</Text>
                    <TextInput
                        style={styles.input}
                        value={login}
                        onChangeText={setLogin}
                        placeholder="np. tysix023"
                        placeholderTextColor="#557c6f"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>ADRES EMAIL:</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="np. tysix023@gmail.com"
                        placeholderTextColor="#557c6f"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
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
                            <ActivityIndicator size="large" color="#c5a059" style={{ marginBottom: 20 }} />
                        ) : (
                            <Pressable style={styles.primaryButton} onPress={handleRegister}>
                                <Text style={styles.primaryButtonText}>ZAREJESTRUJ SIĘ</Text>
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
        backgroundColor: '#102a22',
    },
    scrollContent: {
        alignItems: 'center',
        paddingTop: 30,
        paddingBottom: 40,
        width: '100%'
    },
    titleContainer: {
        backgroundColor: '#16352b',
        paddingVertical: 12,
        paddingHorizontal: 40,
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
        marginBottom: 20,
        fontSize: 15,
        borderWidth: 1,
        borderColor: 'rgba(197, 160, 89, 0.2)',
        fontWeight: '500'
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 15,
        width: '100%'
    },
    primaryButton: {
        backgroundColor: '#f4ebd0',
        paddingVertical: 15,
        width: '100%',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
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
    backLink: {
        padding: 10,
    },
    backLinkText: {
        color: '#c5a059',
        fontSize: 13,
        textDecorationLine: 'underline',
        fontWeight: '500',
        letterSpacing: 0.5
    }
});