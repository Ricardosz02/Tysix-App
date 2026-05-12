import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Header from '../components/Header';

export default function RegisterScreen() {
    const [nick, setNick] = useState('');
    const [login, setLogin] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = () => {
        console.log('Nowy gracz:', { nick, login, email, password });
        alert('Konto utworzone! Możesz się zalogować.');
        router.back();
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
                        <Pressable style={styles.actionButton} onPress={handleRegister}>
                            <Text style={styles.buttonText}>ZAREJESTRUJ SIĘ</Text>
                        </Pressable>

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