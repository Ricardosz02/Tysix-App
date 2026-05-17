import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

export interface LocalPlayer {
    id: string;
    name: string;
    imageUri: string | null;
}

interface PlayerStats {
    totalGames: number;
    totalWins: number;
    winRate: number;
    maxScore: number;
    bestPartner: string;
    worstEnemy: string;
    totalBlunders: number;
}

export default function PlayersScreen() {
    const [players, setPlayers] = useState<LocalPlayer[]>([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newName, setNewName] = useState('');
    const [newImage, setNewImage] = useState<string | null>(null);

    const [isStatsVisible, setIsStatsVisible] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<LocalPlayer | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [playerStats, setPlayerStats] = useState<PlayerStats>({
        totalGames: 0,
        totalWins: 0,
        winRate: 0,
        maxScore: 0,
        bestPartner: 'Brak gier 2vs2',
        worstEnemy: 'Brak porażek',
        totalBlunders: 0
    });

    useFocusEffect(
        React.useCallback(() => {
            loadPlayers();
        }, [])
    );

    const loadPlayers = async () => {
        try {
            const stored = await AsyncStorage.getItem('local_players');
            if (stored) setPlayers(JSON.parse(stored));
        } catch (e) {
            console.error("Błąd ładowania graczy", e);
        }
    };

    const savePlayers = async (newPlayers: LocalPlayer[]) => {
        try {
            await AsyncStorage.setItem('local_players', JSON.stringify(newPlayers));
            setPlayers(newPlayers);
        } catch (e) {
            console.error("Błąd zapisu graczy", e);
        }
    };

    const pickImage = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && result.assets[0].uri) {
            setNewImage(result.assets[0].uri);
        }
    };

    const handleAddPlayer = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const trimmedName = newName.trim();
        if (!trimmedName) {
            Alert.alert("Brak imienia", "Wpisz ksywę gracza!");
            return;
        }

        const newPlayer: LocalPlayer = {
            id: Date.now().toString(),
            name: trimmedName,
            imageUri: newImage
        };

        await savePlayers([...players, newPlayer]);
        setNewName('');
        setNewImage(null);
        setIsModalVisible(false);
    };

    const handleDeletePlayer = (id: string, name: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            "Usuń gracza",
            `Czy na pewno chcesz usunąć gracza ${name} ze swojej ekipy?`,
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "Usuń",
                    style: "destructive",
                    onPress: async () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        const filtered = players.filter(p => p.id !== id);
                        await savePlayers(filtered);
                    }
                }
            ]
        );
    };

    const openPlayerStats = async (player: LocalPlayer) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedPlayer(player);
        setIsStatsVisible(true);
        setStatsLoading(true);

        try {
            let totalGames = 0;
            let totalWins = 0;
            let maxScore = 0;
            let totalBlunders = 0;
            const targetName = player.name.toLowerCase();

            const partnerWins: { [key: string]: number } = {};
            const partnerGames: { [key: string]: number } = {};
            const enemyWinsWhenLast: { [key: string]: number } = {};

            const { data: { user } } = await supabase.auth.getUser();
            let allGames: any[] = [];

            if (user) {
                const { data: cloudGames, error } = await supabase
                    .from('games')
                    .select(`id, created_at, game_scores(player_name, score, is_winner)`)
                    .eq('user_id', user.id);

                if (!error && cloudGames) {
                    allGames = cloudGames.map((g: any) => ({
                        id: g.id,
                        players: g.game_scores.map((s: any) => ({
                            name: s.player_name,
                            score: s.score,
                            isWinner: s.is_winner
                        }))
                    }));
                }
            }

            if (allGames.length === 0) {
                const localData = await AsyncStorage.getItem('games_history');
                if (localData) {
                    allGames = JSON.parse(localData);
                }
            }

            allGames.forEach((game: any) => {
                if (!game.players) return;

                const currentPlayers = game.players;
                const isTeamGame = currentPlayers.some((p: any) => p.name.includes('&'));

                const pIndex = currentPlayers.findIndex((p: any) => p.name && p.name.toLowerCase() === targetName);

                let pRecord = currentPlayers[pIndex];
                let inThisGame = pIndex !== -1;
                let isWinner = pRecord?.isWinner;
                let currentScore = pRecord?.score || 0;

                let teamPartnerName = '';
                if (isTeamGame) {
                    const teamIndex = currentPlayers.findIndex((p: any) => p.name && p.name.toLowerCase().includes(targetName));
                    if (teamIndex !== -1) {
                        inThisGame = true;
                        pRecord = currentPlayers[teamIndex];
                        isWinner = pRecord.isWinner;
                        currentScore = pRecord.score;

                        const names = pRecord.name.split('&').map((n: string) => n.trim());
                        teamPartnerName = names.find((n: string) => n.toLowerCase() !== targetName) || '';
                    }
                }

                if (inThisGame) {
                    totalGames++;
                    if (isWinner) totalWins++;
                    if (currentScore > maxScore) maxScore = currentScore;

                    if (currentScore < 0 || currentScore === 800 || currentScore === 900) {
                        totalBlunders++;
                    }

                    if (isTeamGame && teamPartnerName) {
                        partnerGames[teamPartnerName] = (partnerGames[teamPartnerName] || 0) + 1;
                        if (isWinner) {
                            partnerWins[teamPartnerName] = (partnerWins[teamPartnerName] || 0) + 1;
                        }
                    }

                    const minScoreInGame = Math.min(...currentPlayers.map((p: any) => p.score));
                    if (currentScore === minScoreInGame && !isWinner) {
                        const winnerOfGame = currentPlayers.find((p: any) => p.isWinner);
                        if (winnerOfGame && winnerOfGame.name.toLowerCase() !== targetName) {
                            const enemyName = winnerOfGame.name;
                            enemyWinsWhenLast[enemyName] = (enemyWinsWhenLast[enemyName] || 0) + 1;
                        }
                    }
                }
            });

            let bestPartner = 'Brak gier 2vs2';
            let maxPartnerWinRate = -1;
            Object.keys(partnerGames).forEach(partner => {
                const wins = partnerWins[partner] || 0;
                const total = partnerGames[partner];
                const rate = wins / total;
                if (rate > maxPartnerWinRate) {
                    maxPartnerWinRate = rate;
                    bestPartner = `${partner.toUpperCase()} (${Math.round(rate * 100)}% WR)`;
                }
            });

            let worstEnemy = 'Brak porażek';
            let maxEnemyWins = 0;
            Object.keys(enemyWinsWhenLast).forEach(enemy => {
                if (enemyWinsWhenLast[enemy] > maxEnemyWins) {
                    maxEnemyWins = enemyWinsWhenLast[enemy];
                    worstEnemy = `${enemy.toUpperCase()} (${maxEnemyWins}x)`;
                }
            });

            const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

            setPlayerStats({
                totalGames,
                totalWins,
                winRate,
                maxScore,
                bestPartner,
                worstEnemy,
                totalBlunders
            });

        } catch (e) {
            console.error("Błąd ładowania statystyk gracza", e);
        } finally {
            setStatsLoading(false);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <Header />

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>MOJA EKIPA 👥</Text>
                </View>

                <Pressable
                    style={styles.addButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setIsModalVisible(true);
                    }}
                >
                    <Text style={styles.addButtonText}>+ DODAJ NOWEGO GRACZA</Text>
                </Pressable>

                <View style={styles.grid}>
                    {players.map((player) => (
                        <Pressable
                            key={player.id}
                            style={styles.playerCard}
                            onPress={() => openPlayerStats(player)}
                        >
                            <Pressable
                                style={styles.deleteIcon}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleDeletePlayer(player.id, player.name);
                                }}
                            >
                                <Ionicons name="trash" size={16} color="#ff4d4d" />
                            </Pressable>

                            <View style={styles.avatarContainer}>
                                {player.imageUri ? (
                                    <Image source={{ uri: player.imageUri }} style={styles.avatar} />
                                ) : (
                                    <Ionicons name="person" size={40} color="#c5a059" />
                                )}
                            </View>
                            <Text style={styles.playerName} numberOfLines={1}>{player.name.toUpperCase()}</Text>
                        </Pressable>
                    ))}
                </View>

                {players.length === 0 && (
                    <Text style={styles.emptyText}>Nie masz jeszcze nikogo w ekipie. Dodaj znajomych, aby szybko wybierać ich do nowej gry!</Text>
                )}
            </ScrollView>

            <Modal visible={isModalVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>NOWY GRACZ</Text>

                        <Pressable style={styles.imagePickerBtn} onPress={pickImage}>
                            {newImage ? (
                                <Image source={{ uri: newImage }} style={styles.previewImage} />
                            ) : (
                                <>
                                    <Ionicons name="camera" size={32} color="#c5a059" />
                                    <Text style={styles.imagePickerText}>Wybierz zdjęcie</Text>
                                </>
                            )}
                        </Pressable>

                        <TextInput
                            style={styles.input}
                            value={newName}
                            onChangeText={setNewName}
                            placeholder="Wpisz imię / ksywę..."
                            placeholderTextColor="#557c6f"
                        />

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={styles.cancelButton}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setIsModalVisible(false);
                                    setNewName('');
                                    setNewImage(null);
                                }}
                            >
                                <Text style={{ color: '#c5a059', fontWeight: 'bold' }}>Anuluj</Text>
                            </Pressable>
                            <Pressable style={styles.saveButton} onPress={handleAddPlayer}>
                                <Text style={{ color: '#102a22', fontWeight: 'bold' }}>Zapisz</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={isStatsVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.statsModalContent}>
                        <Pressable
                            style={styles.closeStatsBtn}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setIsStatsVisible(false);
                            }}
                        >
                            <Ionicons name="close" size={26} color="#c5a059" />
                        </Pressable>

                        {selectedPlayer && (
                            <>
                                <View style={styles.statsAvatarWrapper}>
                                    {selectedPlayer.imageUri ? (
                                        <Image source={{ uri: selectedPlayer.imageUri }} style={styles.statsAvatar} />
                                    ) : (
                                        <Ionicons name="person" size={45} color="#c5a059" />
                                    )}
                                </View>
                                <Text style={styles.statsName}>{selectedPlayer.name.toUpperCase()}</Text>

                                <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                                    <View style={styles.infoContainer}>
                                        <Text style={styles.infoTitle}>OGÓLNE STATYSTYKI Z TOBĄ</Text>

                                        {statsLoading ? (
                                            <ActivityIndicator size="large" color="#c5a059" style={{ marginVertical: 20 }} />
                                        ) : (
                                            <View style={styles.statsWrapper}>
                                                <View style={styles.statRow}>
                                                    <Text style={styles.statLabel}>Rozegrane bitwy:</Text>
                                                    <Text style={styles.statValue}>{playerStats.totalGames}</Text>
                                                </View>

                                                <View style={styles.statRow}>
                                                    <Text style={styles.statLabel}>Wygrane partie 👑:</Text>
                                                    <Text style={[styles.statValue, { color: '#c5a059' }]}>{playerStats.totalWins}</Text>
                                                </View>

                                                <View style={styles.statRow}>
                                                    <Text style={styles.statLabel}>Win Rate:</Text>
                                                    <Text style={styles.statValue}>{playerStats.winRate}%</Text>
                                                </View>

                                                <View style={styles.statRow}>
                                                    <Text style={styles.statLabel}>Najwyższy wynik:</Text>
                                                    <Text style={[styles.statValue, { color: '#4da6ff' }]}>{playerStats.maxScore}</Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    {!statsLoading && (
                                        <View style={[styles.infoContainer, { marginTop: 15, borderColor: '#ff4d4d' }]}>
                                            <Text style={[styles.infoTitle, { color: '#ff4d4d', borderBottomColor: 'rgba(255, 77, 77, 0.2)' }]}>
                                                ANALIZA RYWALIZACJI 🔥
                                            </Text>

                                            <View style={styles.statsWrapper}>
                                                <View style={styles.statRow}>
                                                    <Text style={styles.statLabel}>🤝 Najlepszy Partner:</Text>
                                                    <Text style={[styles.statValue, { color: '#66ff66', fontSize: 13 }]}>
                                                        {playerStats.bestPartner}
                                                    </Text>
                                                </View>

                                                <View style={styles.statRow}>
                                                    <Text style={styles.statLabel}>⚔️ Największy Wróg:</Text>
                                                    <Text style={[styles.statValue, { color: '#ff4d4d', fontSize: 13 }]}>
                                                        {playerStats.worstEnemy}
                                                    </Text>
                                                </View>

                                                <View style={[styles.statRow, { borderBottomWidth: 0, marginBottom: 0 }]}>
                                                    <Text style={styles.statLabel}>💥 Liczba wpadek (Wtopy/Bębny):</Text>
                                                    <Text style={[styles.statValue, { color: '#ff9900' }]}>
                                                        {playerStats.totalBlunders}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#102a22' },
    container: { alignItems: 'center', padding: 20, paddingBottom: 40 },
    titleContainer: { backgroundColor: '#16352b', paddingVertical: 10, paddingHorizontal: 40, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#c5a059' },
    title: { fontSize: 16, color: '#f4ebd0', fontWeight: 'bold', letterSpacing: 1 },
    addButton: { backgroundColor: '#f4ebd0', padding: 16, borderRadius: 30, width: '100%', alignItems: 'center', marginBottom: 25, borderWidth: 2, borderColor: '#c5a059', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
    addButtonText: { color: '#102a22', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
    playerCard: { backgroundColor: '#0d221b', width: '48%', alignItems: 'center', padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(197, 160, 89, 0.4)', position: 'relative' },
    deleteIcon: { position: 'absolute', top: 8, right: 8, padding: 5, zIndex: 10 },
    avatarContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#16352b', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1.5, borderColor: '#c5a059', overflow: 'hidden' },
    avatar: { width: '100%', height: '100%' },
    playerName: { color: '#f4ebd0', fontWeight: 'bold', fontSize: 13, textAlign: 'center', letterSpacing: 0.5 },
    emptyText: { color: '#c5a059', textAlign: 'center', marginTop: 30, fontSize: 14, opacity: 0.8, paddingHorizontal: 20, lineHeight: 22 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(13, 34, 34, 0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: '#16352b', padding: 25, borderRadius: 20, borderWidth: 1.5, borderColor: '#c5a059', alignItems: 'center', width: '100%' },
    modalTitle: { color: '#f4ebd0', fontSize: 16, marginBottom: 25, fontWeight: 'bold', letterSpacing: 1 },
    imagePickerBtn: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#0d221b', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1.5, borderColor: 'rgba(197, 160, 89, 0.5)', overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%' },
    imagePickerText: { color: '#c5a059', fontSize: 10, marginTop: 5 },
    input: { backgroundColor: '#0d221b', color: '#f4ebd0', padding: 14, borderRadius: 10, marginBottom: 25, textAlign: 'center', fontSize: 16, borderWidth: 1.5, borderColor: 'rgba(197, 160, 89, 0.2)', fontWeight: 'bold', width: '100%' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    cancelButton: { backgroundColor: 'transparent', padding: 14, borderRadius: 10, width: '45%', alignItems: 'center', borderWidth: 1, borderColor: '#c5a059' },
    saveButton: { backgroundColor: '#f4ebd0', padding: 14, borderRadius: 10, width: '45%', alignItems: 'center', borderWidth: 1, borderColor: '#c5a059' },

    statsModalContent: { backgroundColor: '#16352b', padding: 25, borderRadius: 20, borderWidth: 1.5, borderColor: '#c5a059', alignItems: 'center', width: '100%', position: 'relative', maxHeight: '85%' },
    closeStatsBtn: { position: 'absolute', top: 12, right: 12, padding: 5, zIndex: 10 },
    statsAvatarWrapper: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#0d221b', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#c5a059', overflow: 'hidden' },
    statsAvatar: { width: '100%', height: '100%' },
    statsName: { color: '#f4ebd0', fontSize: 18, fontWeight: 'bold', letterSpacing: 1, marginBottom: 20 },
    infoContainer: { backgroundColor: '#0d221b', width: '100%', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(197, 160, 89, 0.2)' },
    infoTitle: { color: '#c5a059', fontSize: 13, fontWeight: 'bold', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(197, 160, 89, 0.2)', width: '100%', textAlign: 'center', paddingBottom: 6, letterSpacing: 1 },
    statsWrapper: { width: '100%' },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(197, 160, 89, 0.1)', paddingBottom: 6, alignItems: 'center' },
    statLabel: { color: '#f4ebd0', fontSize: 13, fontWeight: '600', opacity: 0.85, flex: 1 },
    statValue: { color: '#f4ebd0', fontSize: 14, fontWeight: 'bold', textAlign: 'right' },
});