import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
    name: string;
    wins: number;
    avatarUrl: string | null;
}

export default function LeaderboardScreen() {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('game_scores')
                .select('player_name')
                .eq('is_winner', true);

            if (error) throw error;

            if (data) {
                const winsMap: { [key: string]: number } = {};

                data.forEach((row: any) => {
                    if (row.player_name) {
                        const name = row.player_name.trim();
                        winsMap[name] = (winsMap[name] || 0) + 1;
                    }
                });

                const sortedLeaders: LeaderboardEntry[] = Object.keys(winsMap)
                    .map(name => ({
                        name: name,
                        wins: winsMap[name],
                        avatarUrl: null
                    }))
                    .sort((a, b) => b.wins - a.wins)
                    .slice(0, 10);

                if (sortedLeaders.length > 0) {
                    const leaderNames = sortedLeaders.map(l => l.name);
                    const orFilter = leaderNames.map(name => `username.ilike.${name}`).join(',');

                    const { data: profilesData, error: profilesError } = await supabase
                        .from('profiles')
                        .select('username, avatar_url')
                        .or(orFilter);

                    if (profilesError) {
                        console.error("Błąd pobierania awatarów profili:", profilesError);
                    } else if (profilesData) {
                        sortedLeaders.forEach(leader => {
                            const foundProfile = profilesData.find(
                                p => p.username && p.username.toLowerCase() === leader.name.toLowerCase()
                            );
                            if (foundProfile) {
                                leader.avatarUrl = foundProfile.avatar_url;
                            }
                        });
                    }
                }

                setLeaders(sortedLeaders);
            }
        } catch (error) {
            console.error("Błąd pobierania rankingu globalnego:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header />

            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={styles.pageTitle}>RANKING GLOBALNY 🏆</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#4da6ff" style={{ marginTop: 50 }} />
                ) : leaders.length === 0 ? (
                    <Text style={styles.noData}>Brak zarejestrowanych zwycięstw w chmurze.</Text>
                ) : (
                    <FlatList
                        data={leaders}
                        keyExtractor={(item) => item.name}
                        style={styles.list}
                        contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
                        renderItem={({ item, index }) => (
                            <View style={styles.leaderCard}>
                                <View style={styles.leftSection}>
                                    <Text style={styles.rankText}>
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                    </Text>

                                    <View style={styles.avatarMiniContainer}>
                                        {item.avatarUrl ? (
                                            <Image source={{ uri: item.avatarUrl }} style={styles.avatarMini} />
                                        ) : (
                                            <View style={styles.avatarFallback}>
                                                <View style={styles.avatarFallbackHead} />
                                                <View style={styles.avatarFallbackBody} />
                                            </View>
                                        )}
                                    </View>

                                    <Text style={styles.nameText}>{item.name.toUpperCase()}</Text>
                                </View>
                                <Text style={styles.winsText}>
                                    {item.wins} {item.wins === 1 ? 'wygrana' : item.wins < 5 ? 'wygrane' : 'wygranych'}
                                </Text>
                            </View>
                        )}
                    />
                )}

                <Pressable
                    style={styles.backButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.replace('/');
                    }}
                >
                    <Text style={styles.backButtonText}>Powrót do menu głównego</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1e1e1e' },
    content: { flex: 1, alignItems: 'center', paddingTop: 20, width: '100%' },
    titleContainer: { backgroundColor: '#e0e0e0', paddingVertical: 10, paddingHorizontal: 40, borderRadius: 5, marginBottom: 20 },
    pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    noData: { color: '#888', marginTop: 50, fontSize: 16 },
    list: { width: '100%' },
    leaderCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e0e0e0', width: '90%', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#ccc' },
    leftSection: { flexDirection: 'row', alignItems: 'center' },
    rankText: { fontSize: 18, fontWeight: 'bold', marginRight: 10, width: 30, textAlign: 'center', color: '#000' },
    avatarMiniContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#b0b0b0', marginRight: 15, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#999' },
    avatarMini: { width: '100%', height: '100%' },
    avatarFallback: { width: '100%', height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
    avatarFallbackHead: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#444', marginBottom: 2 },
    avatarFallbackBody: { width: 26, height: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12, backgroundColor: '#444' },
    nameText: { fontSize: 15, fontWeight: 'bold', color: '#151515' },
    winsText: { color: '#4da6ff', fontWeight: 'bold', fontSize: 14 },
    backButton: { marginVertical: 20, padding: 10 },
    backButtonText: { color: '#e0e0e0', fontSize: 15, textDecorationLine: 'underline' }
});