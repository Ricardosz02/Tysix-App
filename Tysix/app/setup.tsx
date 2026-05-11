import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function SetupScreen() {
    // Przechowujemy imiona w stanie aplikacji (domyślnie Gracz 1, 2, 3)
    const [player1, setPlayer1] = useState('Gracz 1');
    const [player2, setPlayer2] = useState('Gracz 2');
    const [player3, setPlayer3] = useState('Gracz 3');

    // Funkcja uruchamiana po kliknięciu przycisku
    const handleStartGame = () => {
        // Przechodzimy do dashboardu i wysyłamy imiona jako parametry URL
        router.push({
            pathname: "/dashboard",
            params: { p1: player1, p2: player2, p3: player3 }
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Konfiguracja Gry</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Imię Gracza 1:</Text>
                <TextInput
                    style={styles.input}
                    value={player1}
                    onChangeText={setPlayer1}
                    placeholder="Wpisz imię..."
                />

                <Text style={styles.label}>Imię Gracza 2:</Text>
                <TextInput
                    style={styles.input}
                    value={player2}
                    onChangeText={setPlayer2}
                    placeholder="Wpisz imię..."
                />

                <Text style={styles.label}>Imię Gracza 3:</Text>
                <TextInput
                    style={styles.input}
                    value={player3}
                    onChangeText={setPlayer3}
                    placeholder="Wpisz imię..."
                />
            </View>

            <Pressable onPress={handleStartGame} style={styles.button}>
                <Text style={styles.buttonText}>Zatwierdź i rozpocznij</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: 'black', marginBottom: 30 },
    inputContainer: { width: '100%', marginBottom: 30 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
    button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});