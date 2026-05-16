import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

export default function HistoryScreen() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: cloudGames, error } = await supabase
                    .from('games')
                    .select(`
                        id,
                        created_at,
                        game_scores (
                            player_name,
                            score,
                            is_winner
                        )
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (cloudGames && cloudGames.length > 0) {
                    const formattedCloudHistory = cloudGames.map((game: any) => ({
                        id: game.id,
                        date: new Date(game.created_at).toLocaleDateString('pl-PL') + ' ' + new Date(game.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
                        players: game.game_scores.map((score: any) => ({
                            name: score.player_name,
                            score: score.score,
                            isWinner: score.is_winner
                        }))
                    }));

                    setHistory(formattedCloudHistory);
                    setLoading(false);
                    return;
                }
            }

            const localData = await AsyncStorage.getItem('games_history');
            if (localData) {
                setHistory(JSON.parse(localData));
            }

        } catch (e) {
            console.error("Błąd wczytywania historii z chmury lub telefonu:", e);
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = async () => {
        await AsyncStorage.removeItem('games_history');
        setHistory([]);
    };

    return (
        <View style={styles.container}>
            <Header />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.titleContainer}>
                    <Text style={styles.pageTitle}>HISTORIA ROZGRYWEK</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#c5a059" style={{ marginTop: 50 }} />
                ) : history.length === 0 ? (
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
                                        <Text style={[styles.playerName, p.isWinner && styles.winnerName]}>
                                            {p.name.toUpperCase()} {p.isWinner && '👑'}
                                        </Text>
                                        <Text style={[styles.playerScore, p.isWinner && styles.winnerScore]}>
                                            {p.score}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))
                )}

                {history.length > 0 && (
                    <Pressable style={styles.clearButton} onPress={clearHistory}>
                        <Text style={styles.clearButtonText}>WYCZYŚĆ LOKALNĄ HISTORIĘ</Text>
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
    container: {
        flex: 1,
        backgroundColor: '#102a22'
    },
    scrollContent: {
        paddingBottom: 40,
        alignItems: 'center',
        width: '100%'
    },
    titleContainer: {
        backgroundColor: '#16352b',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 20,
        marginVertical: 20,
        borderWidth: 1,
        borderColor: '#c5a059'
    },
    pageTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f4ebd0',
        letterSpacing: 1
    },
    noHistory: {
        color: '#c5a059',
        marginTop: 50,
        fontSize: 15,
        textAlign: 'center',
        paddingHorizontal: 20,
        opacity: 0.7
    },
    gameCard: {
        backgroundColor: '#0d221b',
        width: '90%',
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(197, 160, 89, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 4
    },
    cardHeader: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(197, 160, 89, 0.2)',
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: '#16352b'
    },
    cardHeaderText: {
        fontWeight: 'bold',
        fontSize: 11,
        color: '#c5a059',
        letterSpacing: 1
    },
    cardBody: {
        padding: 16
    },
    playerResult: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(197, 160, 89, 0.1)',
        paddingBottom: 6,
        alignItems: 'center'
    },
    playerName: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#f4ebd0',
        letterSpacing: 0.5
    },
    winnerName: {
        color: '#c5a059',
    },
    playerScore: {
        color: '#f4ebd0',
        fontWeight: 'bold',
        fontSize: 16,
        opacity: 0.85
    },
    winnerScore: {
        color: '#c5a059',
        fontSize: 18,
        opacity: 1
    },
    clearButton: {
        marginTop: 20,
        backgroundColor: 'rgba(255, 77, 77, 0.06)',
        padding: 15,
        borderRadius: 25,
        width: '80%',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#ff4d4d'
    },
    clearButtonText: {
        color: '#ff4d4d',
        fontWeight: 'bold',
        fontSize: 13,
        letterSpacing: 1
    },
    backButton: {
        marginTop: 25,
        padding: 10
    },
    backButtonText: {
        color: '#c5a059',
        fontSize: 15,
        textDecorationLine: 'underline'
    }
});