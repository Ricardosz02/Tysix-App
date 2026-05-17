import { decode } from 'base64-arraybuffer';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

interface UserStats {
    totalGames: number;
    totalWins: number;
    winRate: number;
    maxScore: number;
    bestPartner: string;
    worstEnemy: string;
    totalBlunders: number;
}

export default function ProfileScreen() {
    const [username, setUsername] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [stats, setStats] = useState<UserStats>({
        totalGames: 0,
        totalWins: 0,
        winRate: 0,
        maxScore: 0,
        bestPartner: 'Brak gier 2vs2',
        worstEnemy: 'Brak porażek',
        totalBlunders: 0
    });

    useEffect(() => {
        fetchProfileAndStats();
    }, []);

    const fetchProfileAndStats = async () => {
        try {
            setLoading(true);
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                setLoading(false);
                return;
            }

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error("Błąd pobierania profilu:", profileError);
                setLoading(false);
                return;
            }

            if (profileData) {
                setUsername(profileData.username);
                setAvatarUrl(profileData.avatar_url);

                const { data: gamesData, error: gamesError } = await supabase
                    .from('games')
                    .select(`
                        id,
                        game_scores (
                            player_name,
                            score,
                            is_winner
                        )
                    `)
                    .eq('user_id', user.id);

                if (gamesError) {
                    console.error("Błąd pobierania statystyk gier:", gamesError);
                } else if (gamesData) {
                    let totalGames = 0;
                    let totalWins = 0;
                    let maxScore = 0;
                    let totalBlunders = 0;

                    const currentUsername = profileData.username.toLowerCase();

                    const partnerWins: { [key: string]: number } = {};
                    const partnerGames: { [key: string]: number } = {};
                    const enemyWinsWhenLast: { [key: string]: number } = {};

                    gamesData.forEach((game: any) => {
                        if (!game.game_scores) return;

                        const currentPlayers = game.game_scores;
                        const isTeamGame = currentPlayers.some((p: any) => p.player_name && p.player_name.includes('&'));

                        const pIndex = currentPlayers.findIndex(
                            (s: any) => s.player_name && s.player_name.toLowerCase() === currentUsername
                        );

                        let pRecord = currentPlayers[pIndex];
                        let inThisGame = pIndex !== -1;
                        let isWinner = pRecord?.is_winner;
                        let currentScore = pRecord?.score || 0;

                        let teamPartnerName = '';
                        if (isTeamGame) {
                            const teamIndex = currentPlayers.findIndex(
                                (s: any) => s.player_name && s.player_name.toLowerCase().includes(currentUsername)
                            );
                            if (teamIndex !== -1) {
                                inThisGame = true;
                                pRecord = currentPlayers[teamIndex];
                                isWinner = pRecord.is_winner;
                                currentScore = pRecord.score;

                                const names = pRecord.player_name.split('&').map((n: string) => n.trim());
                                teamPartnerName = names.find((n: string) => n.toLowerCase() !== currentUsername) || '';
                            }
                        }

                        if (inThisGame) {
                            totalGames++;
                            if (isWinner) totalWins++;
                            if (currentScore > maxScore) maxScore = currentScore;

                            // Liczenie wpadek (Wtopy / Progi Bębnów)
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
                                const winnerOfGame = currentPlayers.find((p: any) => p.is_winner);
                                if (winnerOfGame && winnerOfGame.player_name.toLowerCase() !== currentUsername) {
                                    const enemyName = winnerOfGame.player_name;
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

                    setStats({
                        totalGames,
                        totalWins,
                        winRate,
                        maxScore,
                        bestPartner,
                        worstEnemy,
                        totalBlunders
                    });
                }
            }
        } catch (error) {
            console.error("Wystąpił nieoczekiwany błąd:", error);
        } {
            setLoading(false);
        }
    };

    const uploadAvatar = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.3,
                base64: true,
            });

            if (result.canceled || !result.assets[0].base64) {
                return;
            }

            setUploading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Brak sesji użytkownika');

            const base64Str = result.assets[0].base64;
            const filePath = `${user.id}/${Date.now()}.jpg`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, decode(base64Str), {
                    contentType: 'image/jpeg',
                });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const newAvatarUrl = publicUrlData.publicUrl;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: newAvatarUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setAvatarUrl(newAvatarUrl);
            Alert.alert('Sukces!', 'Zdjęcie profilowe zostało zaktualizowane.');

        } catch (error: any) {
            console.error("Błąd wgrywania zdjęcia:", error);
            Alert.alert('Błąd', 'Nie udało się wgrać zdjęcia.');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const { error } = await supabase.auth.signOut();
        if (!error) {
            router.replace('/login');
        }
    };

    return (
        <View style={styles.container}>
            <Header />

            <View style={styles.content}>
                <View style={styles.profileCard}>

                    <View style={styles.avatarWrapper}>
                        <Pressable
                            style={styles.avatarLarge}
                            onPress={uploadAvatar}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator size="large" color="#c5a059" />
                            ) : avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarFallbackContainer}>
                                    <View style={styles.avatarHead} />
                                    <View style={styles.avatarBody} />
                                </View>
                            )}
                        </Pressable>

                        {!uploading && (
                            <Pressable style={styles.editBadge} onPress={uploadAvatar}>
                                <Text style={styles.editBadgeText}>+</Text>
                            </Pressable>
                        )}
                    </View>

                    <View style={styles.nickContainer}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#f4ebd0" />
                        ) : (
                            <Text style={styles.nickText}>
                                {username ? username.toUpperCase() : 'NIEZNANY GRACZ'}
                            </Text>
                        )}
                    </View>

                    <View style={styles.infoContainer}>
                        <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>

                            <Text style={styles.infoTitle}>STATYSTYKI GRACZA</Text>
                            {loading ? (
                                <ActivityIndicator size="large" color="#c5a059" style={{ marginTop: 20 }} />
                            ) : (
                                <View style={styles.statsWrapper}>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Rozegrane bitwy:</Text>
                                        <Text style={styles.statValue}>{stats.totalGames}</Text>
                                    </View>

                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Wygrane partie 👑:</Text>
                                        <Text style={[styles.statValue, { color: '#c5a059' }]}>{stats.totalWins}</Text>
                                    </View>

                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Win Rate:</Text>
                                        <Text style={styles.statValue}>{stats.winRate}%</Text>
                                    </View>

                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Najwyższy wynik:</Text>
                                        <Text style={[styles.statValue, { color: '#4da6ff' }]}>{stats.maxScore}</Text>
                                    </View>
                                </View>
                            )}

                            {!loading && (
                                <View style={{ marginTop: 25, borderTopWidth: 1, borderTopColor: 'rgba(197, 160, 89, 0.2)', paddingTop: 15 }}>
                                    <Text style={[styles.infoTitle, { color: '#ff4d4d' }]}>ANALIZA RYWALIZACJI 🔥</Text>
                                    <View style={styles.statsWrapper}>
                                        <View style={styles.statRow}>
                                            <Text style={styles.statLabel}>🤝 Najlepszy Partner:</Text>
                                            <Text style={[styles.statValue, { color: '#66ff66', fontSize: 13 }]}>
                                                {stats.bestPartner}
                                            </Text>
                                        </View>

                                        <View style={styles.statRow}>
                                            <Text style={styles.statLabel}>⚔️ Największy Wróg:</Text>
                                            <Text style={[styles.statValue, { color: '#ff4d4d', fontSize: 13 }]}>
                                                {stats.worstEnemy}
                                            </Text>
                                        </View>

                                        <View style={[styles.statRow, { borderBottomWidth: 0, marginBottom: 0 }]}>
                                            <Text style={styles.statLabel}>💥 Liczba wpadek (Wtopy/Bębny):</Text>
                                            <Text style={[styles.statValue, { color: '#ff9900' }]}>
                                                {stats.totalBlunders}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    </View>

                    <Pressable style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>WYLOGUJ SIĘ</Text>
                    </Pressable>

                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#102a22' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    profileCard: { backgroundColor: '#0d221b', width: '95%', height: '88%', alignItems: 'center', paddingTop: 35, paddingBottom: 25, borderRadius: 20, borderWidth: 1.5, borderColor: '#c5a059', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6 },
    avatarWrapper: { position: 'relative', marginBottom: 25, alignSelf: 'center' },
    avatarLarge: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#16352b', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2.5, borderColor: '#c5a059' },
    avatarImage: { width: '100%', height: '100%', borderRadius: 65 },
    avatarFallbackContainer: { width: '100%', height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
    avatarHead: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#c5a059', marginBottom: 4 },
    avatarBody: { width: 86, height: 44, borderTopLeftRadius: 44, borderTopRightRadius: 44, backgroundColor: '#c5a059' },
    editBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#f4ebd0', width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: '#0d221b', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 2, elevation: 5 },
    editBadgeText: { color: '#102a22', fontWeight: 'bold', fontSize: 20, marginTop: -3 },
    nickContainer: { backgroundColor: '#16352b', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 20, marginBottom: 20, width: '85%', alignItems: 'center', height: 44, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(197, 160, 89, 0.4)' },
    nickText: { fontSize: 16, color: '#f4ebd0', fontWeight: 'bold', letterSpacing: 1.5 },
    infoContainer: { backgroundColor: '#16352b', width: '85%', flex: 1, marginBottom: 25, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(197, 160, 89, 0.2)' },
    infoTitle: { color: '#c5a059', fontSize: 14, fontWeight: 'bold', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(197, 160, 89, 0.2)', width: '100%', textAlign: 'center', paddingBottom: 6, letterSpacing: 1 },
    statsWrapper: { width: '100%' },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(197, 160, 89, 0.1)', paddingBottom: 6, alignItems: 'center' },
    statLabel: { color: '#f4ebd0', fontSize: 13, fontWeight: '600', opacity: 0.85, flex: 1 },
    statValue: { color: '#f4ebd0', fontSize: 14, fontWeight: 'bold', textAlign: 'right' },
    logoutButton: { backgroundColor: 'rgba(255, 77, 77, 0.06)', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 25, width: '85%', alignItems: 'center', borderWidth: 1.5, borderColor: '#ff4d4d' },
    logoutButtonText: { color: '#ff4d4d', fontSize: 13, fontWeight: 'bold', letterSpacing: 1 }
});