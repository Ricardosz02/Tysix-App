import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Header from '../components/Header';

export default function SetupScreen() {
    const [gameMode, setGameMode] = useState<'individual' | 'team'>('individual');
    const [playerCount, setPlayerCount] = useState(4);

    const [p1, setP1] = useState('Gracz 1');
    const [p2, setP2] = useState('Gracz 2');
    const [p3, setP3] = useState('Gracz 3');
    const [p4, setP4] = useState('Gracz 4');

    const handleStartGame = () => {
        if (gameMode === 'team') {
            router.push({
                pathname: "/dashboard",
                params: {
                    p1: `${p1} & ${p3}`,
                    p2: `${p2} & ${p4}`,
                    playerCount: 2,
                    gameId: Date.now().toString()
                }
            });
        } else {
            router.push({
                pathname: "/dashboard",
                params: {
                    p1, p2,
                    p3: playerCount >= 3 ? p3 : undefined,
                    p4: playerCount === 4 ? p4 : undefined,
                    playerCount,
                    gameId: Date.now().toString()
                }
            });
        }
    };

    return (
        <View style={styles.mainContainer}>
            <Header />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.pageTitle}>KONFIGURACJA GRY</Text>
                </View>

                <View style={styles.modeToggle}>
                    <Pressable
                        style={[styles.modeTab, gameMode === 'individual' && styles.activeTab]}
                        onPress={() => { setGameMode('individual'); setPlayerCount(4); }}
                    >
                        <Text style={[styles.tabText, gameMode === 'individual' && styles.activeTabText]}>
                            Indywidualnie (2-4)
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.modeTab, gameMode === 'team' && styles.activeTab]}
                        onPress={() => setGameMode('team')}
                    >
                        <Text style={[styles.tabText, gameMode === 'team' && styles.activeTabText]}>
                            Drużyny (2vs2)
                        </Text>
                    </Pressable>
                </View>

                {gameMode === 'individual' ? (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Imię Gracza 1:</Text>
                        <TextInput style={styles.input} value={p1} onChangeText={setP1} placeholder="Imię..." placeholderTextColor="#888" />

                        <Text style={styles.label}>Imię Gracza 2:</Text>
                        <TextInput style={styles.input} value={p2} onChangeText={setP2} placeholder="Imię..." placeholderTextColor="#888" />

                        {playerCount >= 3 && (
                            <>
                                <Text style={styles.label}>Imię Gracza 3:</Text>
                                <TextInput style={styles.input} value={p3} onChangeText={setP3} placeholder="Imię..." placeholderTextColor="#888" />
                            </>
                        )}

                        {playerCount >= 4 && (
                            <>
                                <Text style={styles.label}>Imię Gracza 4:</Text>
                                <TextInput style={styles.input} value={p4} onChangeText={setP4} placeholder="Imię..." placeholderTextColor="#888" />
                            </>
                        )}

                        <View style={styles.buttonRow}>
                            {playerCount < 4 && (
                                <Pressable style={styles.smallButton} onPress={() => setPlayerCount(p => p + 1)}>
                                    <Text style={styles.smallButtonText}>+ Dodaj gracza</Text>
                                </Pressable>
                            )}
                            {playerCount > 2 && (
                                <Pressable style={[styles.smallButton, { backgroundColor: '#ff4d4d' }]} onPress={() => setPlayerCount(p => p - 1)}>
                                    <Text style={styles.smallButtonText}>- Usuń gracza</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                ) : (
                    <View style={styles.inputContainer}>
                        <View style={styles.teamBox}>
                            <Text style={styles.teamTitle}>🔵 Drużyna 1</Text>
                            <TextInput style={styles.input} value={p1} onChangeText={setP1} placeholder="Gracz 1..." placeholderTextColor="#888" />
                            <TextInput style={styles.input} value={p3} onChangeText={setP3} placeholder="Gracz 3 (Partner)..." placeholderTextColor="#888" />
                        </View>
                        <View style={styles.teamBox}>
                            <Text style={styles.teamTitle}>🔴 Drużyna 2</Text>
                            <TextInput style={styles.input} value={p2} onChangeText={setP2} placeholder="Gracz 2..." placeholderTextColor="#888" />
                            <TextInput style={styles.input} value={p4} onChangeText={setP4} placeholder="Gracz 4 (Partner)..." placeholderTextColor="#888" />
                        </View>
                    </View>
                )}

                <Pressable onPress={handleStartGame} style={styles.mainButton}>
                    <Text style={styles.mainButtonText}>
                        Rozpocznij ({gameMode === 'team' ? '2 Drużyny' : `${playerCount} Graczy`})
                    </Text>
                </Pressable>

                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Anuluj i wróć</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#1e1e1e' },
    container: { flexGrow: 1, alignItems: 'center', padding: 20, paddingBottom: 40 },

    titleContainer: { backgroundColor: '#e0e0e0', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 5, marginBottom: 20, marginTop: 10 },
    pageTitle: { fontSize: 20, color: '#000', fontWeight: 'bold' },

    modeToggle: { flexDirection: 'row', width: '100%', marginBottom: 20, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#444' },
    modeTab: { flex: 1, padding: 15, alignItems: 'center', backgroundColor: '#2a2a2a' },
    activeTab: { backgroundColor: '#4da6ff' },
    tabText: { fontSize: 14, fontWeight: 'bold', color: '#888' },
    activeTabText: { color: '#fff' },

    inputContainer: { width: '100%', marginBottom: 10 },
    label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#e0e0e0' },

    input: { backgroundColor: '#333', color: '#fff', borderWidth: 1, borderColor: 'transparent', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },

    teamBox: { backgroundColor: '#2a2a2a', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#444' },
    teamTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#e0e0e0' },

    buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 20, width: '100%' },
    smallButton: { backgroundColor: '#4da6ff', padding: 15, borderRadius: 8, flex: 1, alignItems: 'center' },
    smallButtonText: { color: 'white', fontWeight: 'bold' },

    mainButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 10 },
    mainButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    backButton: { marginTop: 20, padding: 10 },
    backButtonText: { color: '#888', fontSize: 16, textDecorationLine: 'underline' }
});