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
                    <Text style={styles.pageTitle}>KONFIGURACJA ROZGRYWKI</Text>
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
                        <TextInput style={styles.input} value={p1} onChangeText={setP1} placeholder="Wpisz imię..." placeholderTextColor="#557c6f" />

                        <Text style={styles.label}>Imię Gracza 2:</Text>
                        <TextInput style={styles.input} value={p2} onChangeText={setP2} placeholder="Wpisz imię..." placeholderTextColor="#557c6f" />

                        {playerCount >= 3 && (
                            <>
                                <Text style={styles.label}>Imię Gracza 3:</Text>
                                <TextInput style={styles.input} value={p3} onChangeText={setP3} placeholder="Wpisz imię..." placeholderTextColor="#557c6f" />
                            </>
                        )}

                        {playerCount >= 4 && (
                            <>
                                <Text style={styles.label}>Imię Gracza 4:</Text>
                                <TextInput style={styles.input} value={p4} onChangeText={setP4} placeholder="Wpisz imię..." placeholderTextColor="#557c6f" />
                            </>
                        )}

                        <View style={styles.buttonRow}>
                            {playerCount < 4 && (
                                <Pressable style={styles.smallButton} onPress={() => setPlayerCount(p => p + 1)}>
                                    <Text style={styles.smallButtonText}>+ Dodaj gracza</Text>
                                </Pressable>
                            )}
                            {playerCount > 2 && (
                                <Pressable style={[styles.smallButton, styles.removeButton]} onPress={() => setPlayerCount(p => p - 1)}>
                                    <Text style={styles.smallButtonText}>- Usuń gracza</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                ) : (
                    <View style={styles.inputContainer}>
                        <View style={styles.teamBox}>
                            <Text style={[styles.teamTitle, { color: '#4da6ff' }]}>🔵 DRUŻYNA 1</Text>
                            <TextInput style={styles.input} value={p1} onChangeText={setP1} placeholder="Pierwszy gracz..." placeholderTextColor="#557c6f" />
                            <TextInput style={styles.input} value={p3} onChangeText={setP3} placeholder="Drugi gracz (Partner)..." placeholderTextColor="#557c6f" />
                        </View>

                        <View style={styles.teamBox}>
                            <Text style={[styles.teamTitle, { color: '#ff4d4d' }]}>🔴 DRUŻYNA 2</Text>
                            <TextInput style={styles.input} value={p2} onChangeText={setP2} placeholder="Pierwszy gracz..." placeholderTextColor="#557c6f" />
                            <TextInput style={styles.input} value={p4} onChangeText={setP4} placeholder="Drugi gracz (Partner)..." placeholderTextColor="#557c6f" />
                        </View>
                    </View>
                )}

                <Pressable onPress={handleStartGame} style={styles.mainButton}>
                    <Text style={styles.mainButtonText}>
                        ROZPOCZNIJ ({gameMode === 'team' ? '2 DRUŻYNY' : `${playerCount} GRACZY`})
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
    mainContainer: {
        flex: 1,
        backgroundColor: '#102a22'
    },
    container: {
        flexGrow: 1,
        alignItems: 'center',
        padding: 20,
        paddingBottom: 40
    },
    titleContainer: {
        backgroundColor: '#16352b',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 20,
        marginBottom: 25,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#c5a059'
    },
    pageTitle: {
        fontSize: 16,
        color: '#f4ebd0',
        fontWeight: 'bold',
        letterSpacing: 1
    },
    modeToggle: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 25,
        borderRadius: 25,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#c5a059',
        backgroundColor: '#16352b'
    },
    modeTab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    activeTab: {
        backgroundColor: '#c5a059'
    },
    tabText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#f4ebd0',
        opacity: 0.6
    },
    activeTabText: {
        color: '#102a22',
        opacity: 1
    },
    inputContainer: {
        width: '100%',
        marginBottom: 10
    },
    label: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#c5a059',
        letterSpacing: 1,
        paddingLeft: 4
    },
    input: {
        backgroundColor: '#16352b',
        color: '#f4ebd0',
        borderWidth: 1,
        borderColor: 'rgba(197, 160, 89, 0.3)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 18,
        fontSize: 16,
        fontWeight: '500'
    },
    teamBox: {
        backgroundColor: '#0d221b',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#c5a059'
    },
    teamTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 12,
        letterSpacing: 1
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
        width: '100%'
    },
    smallButton: {
        backgroundColor: '#16352b',
        padding: 12,
        borderRadius: 20,
        flex: 1,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#c5a059'
    },
    removeButton: {
        borderColor: '#ff4d4d',
    },
    smallButtonText: {
        color: '#f4ebd0',
        fontWeight: 'bold',
        fontSize: 13
    },
    mainButton: {
        backgroundColor: '#f4ebd0',
        paddingVertical: 16,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 2,
        borderColor: '#c5a059',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    mainButtonText: {
        color: '#102a22',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    backButton: {
        marginTop: 22,
        padding: 10
    },
    backButtonText: {
        color: '#c5a059',
        fontSize: 15,
        textDecorationLine: 'underline'
    }
});