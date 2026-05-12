import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';

export default function HistoryScreen() {
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await AsyncStorage.getItem('games_history');
                if (data) {
                    setHistory(JSON.parse(data));
                }
            } catch (e) {
                console.error("Błąd wczytywania historii", e);
            }
        };
        loadHistory();
    }, []);

    const clearHistory = async () => {
        await AsyncStorage.removeItem('games_history');
        setHistory([]);
    };

    return (
        <View style={styles.container}>
            <Header />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.titleContainer}>
                    <Text style={styles.pageTitle}>HISTORIA GIER</Text>
                </View>

                {history.length === 0 ? (
                    <Text style={styles.noHistory}>Brak zapisanych gier. Zagraj, aby zobaczyć tu wyniki!</Text>
                ) : (
                    history.map((game) => (
                        <View key={game.id} style={styles.gameCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardHeaderText}>SESJA: {game.date}</Text>
                            </View>

                            <View style={styles.cardBody}>
                                {game.players.map((p: any, index: number) => (
                                    <View key={index} style={styles.playerResult}>
                                        <Text style={styles.playerName}>{p.name}:</Text>
                                        <Text style={styles.playerScore}>{p.score}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))
                )}

                {history.length > 0 && (
                    <Pressable style={styles.clearButton} onPress={clearHistory}>
                        <Text style={styles.clearButtonText}>Wyczyść całą historię</Text>
                    </Pressable>
                )}

                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Wstecz do menu</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1e1e1e' },
    scrollContent: { paddingBottom: 40, alignItems: 'center' },
    titleContainer: { backgroundColor: '#e0e0e0', paddingVertical: 10, paddingHorizontal: 40, borderRadius: 5, marginVertical: 20 },
    pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    noHistory: { color: '#888', marginTop: 50, fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },

    gameCard: { backgroundColor: '#e0e0e0', width: '90%', borderRadius: 8, marginBottom: 20, overflow: 'hidden' },
    cardHeader: { borderBottomWidth: 1, borderBottomColor: '#ccc', paddingVertical: 8, alignItems: 'center', backgroundColor: '#d0d0d0' },
    cardHeaderText: { fontWeight: 'bold', fontSize: 12, color: '#000' },
    cardBody: { padding: 15 },
    playerResult: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 3 },
    playerName: { fontWeight: 'bold', fontSize: 14, color: '#333' },
    playerScore: { color: '#4da6ff', fontWeight: 'bold', fontSize: 16 },

    clearButton: { marginTop: 20, backgroundColor: '#ff4d4d', padding: 15, borderRadius: 8, width: '80%', alignItems: 'center' },
    clearButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    backButton: { marginTop: 20, padding: 10 },
    backButtonText: { color: '#e0e0e0', fontSize: 16, textDecorationLine: 'underline' }
});