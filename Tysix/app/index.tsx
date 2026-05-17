import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

export default function MainMenuScreen() {
    const [activeGames, setActiveGames] = useState<any[]>([]);
    const [hasActiveGame, setHasActiveGame] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            fetchActiveGames();
        }, [])
    );

    const fetchActiveGames = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setHasActiveGame(false);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('games')
                .select(`
                    id,
                    created_at,
                    elapsed_time,
                    player_count,
                    game_scores (player_name, score, is_winner)
                `)
                .eq('user_id', user.id)
                .eq('status', 'w_toku')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                const trulyActiveGames = data.filter((game: any) => {
                    const scores = game.game_scores || [];
                    return !scores.some((s: any) => s.score >= 1000);
                });

                if (trulyActiveGames.length > 0) {
                    setActiveGames(trulyActiveGames);
                    setHasActiveGame(true);
                } else {
                    setActiveGames([]);
                    setHasActiveGame(false);
                }
            } else {
                setActiveGames([]);
                setHasActiveGame(false);
            }
        } catch (e) {
            console.error("Błąd pobierania aktywnych gier z chmury:", e);
        } finally {
            setLoading(false);
        }
    };

    const routeToGame = (game: any) => {
        if (activeGames.length > 1) setIsModalVisible(false);

        const scores = game.game_scores || [];
        router.push({
            pathname: "/dashboard",
            params: {
                p1: scores[0]?.player_name,
                p2: scores[1]?.player_name,
                p3: game.player_count >= 3 ? scores[2]?.player_name : undefined,
                p4: game.player_count === 4 ? scores[3]?.player_name : undefined,
                s1: scores[0]?.score || 0,
                s2: scores[1]?.score || 0,
                s3: game.player_count >= 3 ? (scores[2]?.score || 0) : undefined,
                s4: game.player_count === 4 ? (scores[3]?.score || 0) : undefined,
                playerCount: game.player_count,
                elapsedTime: game.elapsed_time || 0,
                supabaseGameId: game.id,
                gameId: game.id.toString()
            }
        });
    };

    const handleResumeGame = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (activeGames.length === 1) {
            routeToGame(activeGames[0]);
        } else if (activeGames.length > 1) {
            setIsModalVisible(true);
        }
    };

    const handleDeleteGame = async (gameId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            "Usuń rozgrywkę",
            "Czy na pewno chcesz permanentnie skasować tę niedokończoną grę z chmury?",
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "Usuń",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await supabase.from('game_scores').delete().eq('game_id', gameId);
                            const { error } = await supabase.from('games').delete().eq('id', gameId);
                            if (error) throw error;

                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                            const updated = activeGames.filter(g => g.id !== gameId);
                            setActiveGames(updated);

                            if (updated.length === 0) {
                                setHasActiveGame(false);
                                setIsModalVisible(false);
                            }
                        } catch (err) {
                            console.error("Błąd usuwania gry:", err);
                        }
                    }
                }
            ]
        );
    };

    const formatDuration = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        return `${mins} min`;
    };

    return (
        <View style={styles.container}>
            <Header />

            <View style={styles.content}>

                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/images/logo.jpg')}
                        style={styles.logoImage}
                        resizeMode="cover"
                    />
                </View>

                <View style={styles.buttonContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#f4ebd0" />
                    ) : (
                        <>
                            <Pressable
                                style={styles.button}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    router.push('/setup');
                                }}
                            >
                                <Text style={styles.buttonText}>NOWA GRA</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.button, !hasActiveGame && styles.disabledButton]}
                                onPress={hasActiveGame ? handleResumeGame : undefined}
                            >
                                <Text style={[styles.buttonText, !hasActiveGame && styles.disabledButtonText]}>
                                    WZNÓW GRĘ {activeGames.length > 1 ? `(${activeGames.length})` : ''}
                                </Text>
                            </Pressable>
                        </>
                    )}
                </View>

            </View>

            <Modal visible={isModalVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>AKTYWNE ROZGRYWKI W TOKU</Text>

                        <ScrollView style={styles.modalScroll}>
                            {activeGames.map((game) => (
                                <View key={game.id} style={styles.gameCard}>
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardDate}>
                                            📅 {new Date(game.created_at).toLocaleDateString('pl-PL')} • ⏱️ {formatDuration(game.elapsed_time)}
                                        </Text>
                                        <Text style={styles.cardPlayers} numberOfLines={1}>
                                            {game.game_scores?.map((s: any) => `${s.player_name} (${s.score})`).join(' | ')}
                                        </Text>
                                    </View>
                                    <View style={styles.cardActions}>
                                        <Pressable style={styles.resumeActionBtn} onPress={() => routeToGame(game)}>
                                            <Ionicons name="play" size={16} color="#102a22" />
                                        </Pressable>
                                        <Pressable style={styles.deleteActionBtn} onPress={() => handleDeleteGame(game.id)}>
                                            <Ionicons name="trash" size={16} color="#ff4d4d" />
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        <Pressable
                            style={styles.closeModalButton}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setIsModalVisible(false);
                            }}
                        >
                            <Text style={styles.closeModalButtonText}>Zamknij panel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#102a22' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    logoContainer: {
        flex: 1.6,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingTop: 30,
    },
    logoImage: {
        width: '85%',
        height: '80%',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#c5a059',
    },
    buttonContainer: { flex: 1.2, width: '100%', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 10 },
    button: { backgroundColor: '#f4ebd0', width: '85%', paddingVertical: 16, marginBottom: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 30, borderWidth: 2, borderColor: '#c5a059', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 6 },
    buttonText: { color: '#102a22', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
    disabledButton: { backgroundColor: '#16352b', borderColor: '#22463b', shadowOpacity: 0, elevation: 0 },
    disabledButtonText: { color: '#22463b' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(13, 34, 34, 0.96)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#16352b', padding: 20, borderRadius: 16, borderWidth: 1.5, borderColor: '#c5a059', maxHeight: '75%' },
    modalTitle: { color: '#f4ebd0', fontSize: 14, textAlign: 'center', fontWeight: 'bold', letterSpacing: 1, marginBottom: 20 },
    modalScroll: { width: '100%', marginBottom: 15 },
    gameCard: { flexDirection: 'row', backgroundColor: '#0d221b', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(197, 160, 89, 0.3)', marginBottom: 12, alignItems: 'center', justifyContent: 'space-between' },
    cardInfo: { flex: 1, paddingRight: 10 },
    cardDate: { color: '#c5a059', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
    cardPlayers: { color: '#f4ebd0', fontSize: 13, fontWeight: '500' },
    cardActions: { flexDirection: 'row', gap: 10 },
    resumeActionBtn: { backgroundColor: '#f4ebd0', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#c5a059' },
    deleteActionBtn: { backgroundColor: 'rgba(255, 77, 77, 0.1)', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ff4d4d' },
    closeModalButton: { backgroundColor: 'transparent', padding: 14, borderRadius: 12, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#c5a059', marginTop: 5 },
    closeModalButtonText: { color: '#c5a059', fontWeight: 'bold', fontSize: 14 }
});