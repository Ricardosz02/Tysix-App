import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

interface LocalPlayer {
    id: string;
    name: string;
    imageUri: string | null;
}

export default function SetupScreen() {
    const [gameMode, setGameMode] = useState<'individual' | 'team'>('individual');
    const [playerCount, setPlayerCount] = useState(4);

    const [p1, setP1] = useState('Gracz 1');
    const [p2, setP2] = useState('Gracz 2');
    const [p3, setP3] = useState('Gracz 3');
    const [p4, setP4] = useState('Gracz 4');

    const [localPlayers, setLocalPlayers] = useState<LocalPlayer[]>([]);
    const [focusedInput, setFocusedInput] = useState<number>(1);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [activeTargetField, setActiveTargetField] = useState<number | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            const loadPlayers = async () => {
                try {
                    let playersList: LocalPlayer[] = [];
                    let currentUserLoaded = false;

                    try {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (user) {
                            const { data: profileData } = await supabase
                                .from('profiles')
                                .select('username, avatar_url')
                                .eq('id', user.id)
                                .single();

                            if (profileData) {
                                const userObj = {
                                    id: 'current_user',
                                    name: profileData.username || 'JA',
                                    imageUri: profileData.avatar_url || null
                                };
                                playersList.push(userObj);
                                currentUserLoaded = true;

                                await AsyncStorage.setItem('cached_user_profile', JSON.stringify(userObj));
                            }
                        }
                    } catch (netError) {
                        console.log("Supabase niedostępne (tryb offline), szukam profilu w cache...");
                    }

                    if (!currentUserLoaded) {
                        const cachedProfile = await AsyncStorage.getItem('cached_user_profile');
                        if (cachedProfile) {
                            playersList.push(JSON.parse(cachedProfile));
                        }
                    }

                    const stored = await AsyncStorage.getItem('local_players');
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        playersList = [...playersList, ...parsed];
                    }

                    setLocalPlayers(playersList);
                } catch (e) {
                    console.error("Błąd ładowania ekipy w konfiguracji gier", e);
                }
            };
            loadPlayers();
        }, [])
    );

    const openPlayerSelect = (fieldNumber: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveTargetField(fieldNumber);
        setIsModalVisible(true);
    };

    const handleSelectFromCrew = (name: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (activeTargetField === 1) setP1(name);
        else if (activeTargetField === 2) setP2(name);
        else if (activeTargetField === 3) setP3(name);
        else if (activeTargetField === 4) setP4(name);

        setIsModalVisible(false);
        setActiveTargetField(null);
    };

    const handleStartGame = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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

            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.titleContainer}>
                    <Text style={styles.pageTitle}>KONFIGURACJA ROZGRYWKI</Text>
                </View>

                <View style={styles.modeToggle}>
                    <Pressable
                        style={[styles.modeTab, gameMode === 'individual' && styles.activeTab]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setGameMode('individual');
                            setPlayerCount(4);
                        }}
                    >
                        <Text style={[styles.tabText, gameMode === 'individual' && styles.activeTabText]}>
                            Indywidualnie (2-4)
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.modeTab, gameMode === 'team' && styles.activeTab]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setGameMode('team');
                        }}
                    >
                        <Text style={[styles.tabText, gameMode === 'team' && styles.activeTabText]}>
                            Drużyny (2vs2)
                        </Text>
                    </Pressable>
                </View>

                {gameMode === 'individual' ? (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Imię Gracza 1:</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={[styles.inputFlex, focusedInput === 1 && styles.inputFocused]}
                                value={p1}
                                onChangeText={setP1}
                                onFocus={() => setFocusedInput(1)}
                                placeholder="Wpisz imię..."
                                placeholderTextColor="#557c6f"
                            />
                            <Pressable style={styles.addFromCrewBtn} onPress={() => openPlayerSelect(1)}>
                                <Ionicons name="person-add" size={20} color="#c5a059" />
                            </Pressable>
                        </View>

                        <Text style={styles.label}>Imię Gracza 2:</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={[styles.inputFlex, focusedInput === 2 && styles.inputFocused]}
                                value={p2}
                                onChangeText={setP2}
                                onFocus={() => setFocusedInput(2)}
                                placeholder="Wpisz imię..."
                                placeholderTextColor="#557c6f"
                            />
                            <Pressable style={styles.addFromCrewBtn} onPress={() => openPlayerSelect(2)}>
                                <Ionicons name="person-add" size={20} color="#c5a059" />
                            </Pressable>
                        </View>

                        {playerCount >= 3 && (
                            <>
                                <Text style={styles.label}>Imię Gracza 3:</Text>
                                <View style={styles.inputRow}>
                                    <TextInput
                                        style={[styles.inputFlex, focusedInput === 3 && styles.inputFocused]}
                                        value={p3}
                                        onChangeText={setP3}
                                        onFocus={() => setFocusedInput(3)}
                                        placeholder="Wpisz imię..."
                                        placeholderTextColor="#557c6f"
                                    />
                                    <Pressable style={styles.addFromCrewBtn} onPress={() => openPlayerSelect(3)}>
                                        <Ionicons name="person-add" size={20} color="#c5a059" />
                                    </Pressable>
                                </View>
                            </>
                        )}

                        {playerCount >= 4 && (
                            <>
                                <Text style={styles.label}>Imię Gracza 4:</Text>
                                <View style={styles.inputRow}>
                                    <TextInput
                                        style={[styles.inputFlex, focusedInput === 4 && styles.inputFocused]}
                                        value={p4}
                                        onChangeText={setP4}
                                        onFocus={() => setFocusedInput(4)}
                                        placeholder="Wpisz imię..."
                                        placeholderTextColor="#557c6f"
                                    />
                                    <Pressable style={styles.addFromCrewBtn} onPress={() => openPlayerSelect(4)}>
                                        <Ionicons name="person-add" size={20} color="#c5a059" />
                                    </Pressable>
                                </View>
                            </>
                        )}

                        <View style={styles.buttonRow}>
                            {playerCount < 4 && (
                                <Pressable
                                    style={styles.smallButton}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setPlayerCount(p => p + 1);
                                    }}
                                >
                                    <Text style={styles.smallButtonText}>+ Dodaj pole</Text>
                                </Pressable>
                            )}
                            {playerCount > 2 && (
                                <Pressable
                                    style={[styles.smallButton, styles.removeButton]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setPlayerCount(p => p - 1);
                                    }}
                                >
                                    <Text style={styles.smallButtonText}>- Usuń pole</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                ) : (
                    <View style={styles.inputContainer}>
                        <View style={styles.teamBox}>
                            <Text style={[styles.teamTitle, { color: '#4da6ff' }]}>🔵 DRUŻYNA 1</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={[styles.inputFlex, focusedInput === 1 && styles.inputFocused]}
                                    value={p1}
                                    onChangeText={setP1}
                                    onFocus={() => setFocusedInput(1)}
                                    placeholder="Pierwszy gracz..."
                                    placeholderTextColor="#557c6f"
                                />
                                <Pressable style={styles.addFromCrewBtn} onPress={() => openPlayerSelect(1)}>
                                    <Ionicons name="person-add" size={20} color="#c5a059" />
                                </Pressable>
                            </View>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={[styles.inputFlex, focusedInput === 3 && styles.inputFocused]}
                                    value={p3}
                                    onChangeText={setP3}
                                    onFocus={() => setFocusedInput(3)}
                                    placeholder="Drugi gracz (Partner)..."
                                    placeholderTextColor="#557c6f"
                                />
                                <Pressable style={styles.addFromCrewBtn} onPress={() => openPlayerSelect(3)}>
                                    <Ionicons name="person-add" size={20} color="#c5a059" />
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.teamBox}>
                            <Text style={[styles.teamTitle, { color: '#ff4d4d' }]}>🔴 DRUŻYNA 2</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={[styles.inputFlex, focusedInput === 2 && styles.inputFocused]}
                                    value={p2}
                                    onChangeText={setP2}
                                    onFocus={() => setFocusedInput(2)}
                                    placeholder="Pierwszy gracz..."
                                    placeholderTextColor="#557c6f"
                                />
                                <Pressable style={styles.addFromCrewBtn} onPress={() => openPlayerSelect(2)}>
                                    <Ionicons name="person-add" size={20} color="#c5a059" />
                                </Pressable>
                            </View>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={[styles.inputFlex, focusedInput === 4 && styles.inputFocused]}
                                    value={p4}
                                    onChangeText={setP4}
                                    onFocus={() => setFocusedInput(4)}
                                    placeholder="Drugi gracz (Partner)..."
                                    placeholderTextColor="#557c6f"
                                />
                                <Pressable style={styles.addFromCrewBtn} onPress={() => openPlayerSelect(4)}>
                                    <Ionicons name="person-add" size={20} color="#c5a059" />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                )}

                <Pressable onPress={handleStartGame} style={styles.mainButton}>
                    <Text style={styles.mainButtonText}>
                        ROZPOCZNIJ ({gameMode === 'team' ? '2 DRUŻYNY' : `${playerCount} GRACZY`})
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.backButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.back();
                    }}
                >
                    <Text style={styles.backButtonText}>Anuluj i wróć</Text>
                </Pressable>
            </ScrollView>

            <Modal visible={isModalVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>WYBIERZ Z MOJEJ EKIPY</Text>

                        {localPlayers.length === 0 ? (
                            <Text style={styles.emptyModalText}>Nie masz jeszcze nikogo w ekipie. Przejdź do zakładki "Moja Ekipa" w menu, aby dodać znajomych.</Text>
                        ) : (
                            <ScrollView style={styles.modalScroll}>
                                {localPlayers.map((player) => (
                                    <Pressable
                                        key={player.id}
                                        style={[
                                            styles.ekipaModalChip,
                                            player.id === 'current_user' && styles.currentUserModalChip
                                        ]}
                                        onPress={() => handleSelectFromCrew(player.name)}
                                    >
                                        <View style={styles.ekipaAvatarWrapper}>
                                            {player.imageUri ? (
                                                <Image source={{ uri: player.imageUri }} style={styles.ekipaAvatar} />
                                            ) : (
                                                <Ionicons
                                                    name={player.id === 'current_user' ? "star" : "person"}
                                                    size={18}
                                                    color={player.id === 'current_user' ? "#102a22" : "#c5a059"}
                                                />
                                            )}
                                        </View>
                                        <Text style={[
                                            styles.ekipaName,
                                            player.id === 'current_user' && styles.currentUserName
                                        ]}>
                                            {player.id === 'current_user' ? `${player.name.toUpperCase()} (JA)` : player.name.toUpperCase()}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        )}

                        <Pressable
                            style={styles.cancelModalButton}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setIsModalVisible(false);
                                setActiveTargetField(null);
                            }}
                        >
                            <Text style={styles.cancelModalButtonText}>Zamknij</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#102a22' },
    container: { flexGrow: 1, alignItems: 'center', padding: 20, paddingBottom: 40 },
    titleContainer: { backgroundColor: '#16352b', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 20, marginBottom: 25, marginTop: 10, borderWidth: 1, borderColor: '#c5a059' },
    pageTitle: { fontSize: 16, color: '#f4ebd0', fontWeight: 'bold', letterSpacing: 1 },
    modeToggle: { flexDirection: 'row', width: '100%', marginBottom: 20, borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: '#c5a059', backgroundColor: '#16352b' },
    modeTab: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: 'transparent' },
    activeTab: { backgroundColor: '#c5a059' },
    tabText: { fontSize: 14, fontWeight: 'bold', color: '#f4ebd0', opacity: 0.6 },
    activeTabText: { color: '#102a22', opacity: 1 },
    inputContainer: { width: '100%', marginBottom: 10 },
    label: { fontSize: 13, fontWeight: 'bold', marginBottom: 6, color: '#c5a059', letterSpacing: 1, paddingLeft: 4 },
    inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, width: '100%' },
    addFromCrewBtn: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#0d221b', borderWidth: 1.5, borderColor: 'rgba(197, 160, 89, 0.4)', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
    inputFlex: { flex: 1, backgroundColor: '#16352b', color: '#f4ebd0', borderWidth: 1, borderColor: 'rgba(197, 160, 89, 0.3)', borderRadius: 12, padding: 14, fontSize: 16, fontWeight: '500' },
    inputFocused: { borderColor: '#c5a059', borderWidth: 1.5 },
    teamBox: { backgroundColor: '#0d221b', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#c5a059' },
    teamTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1 },
    buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 20, width: '100%' },
    smallButton: { backgroundColor: '#16352b', padding: 12, borderRadius: 20, flex: 1, alignItems: 'center', borderWidth: 1, borderColor: '#c5a059' },
    removeButton: { borderColor: '#ff4d4d' },
    smallButtonText: { color: '#f4ebd0', fontWeight: 'bold', fontSize: 13 },
    mainButton: { backgroundColor: '#f4ebd0', paddingVertical: 16, borderRadius: 30, width: '100%', alignItems: 'center', marginTop: 10, borderWidth: 2, borderColor: '#c5a059', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
    mainButtonText: { color: '#102a22', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
    backButton: { marginTop: 22, padding: 10 },
    backButtonText: { color: '#c5a059', fontSize: 15, textDecorationLine: 'underline' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(13, 34, 34, 0.95)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#16352b', padding: 22, borderRadius: 16, borderWidth: 1.5, borderColor: '#c5a059', maxHeight: '70%' },
    modalTitle: { color: '#f4ebd0', fontSize: 15, marginBottom: 20, textAlign: 'center', fontWeight: 'bold', letterSpacing: 1 },
    emptyModalText: { color: '#c5a059', textAlign: 'center', marginBottom: 20, fontSize: 14, opacity: 0.8 },
    modalScroll: { width: '100%', marginBottom: 15 },
    ekipaModalChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d221b', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(197, 160, 89, 0.3)', marginBottom: 10 },
    currentUserModalChip: { backgroundColor: '#c5a059', borderColor: '#f4ebd0' },
    ekipaAvatarWrapper: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#16352b', justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#c5a059' },
    ekipaAvatar: { width: '100%', height: '100%' },
    ekipaName: { color: '#f4ebd0', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5 },
    currentUserName: { color: '#102a22' },
    cancelModalButton: { backgroundColor: 'transparent', padding: 14, borderRadius: 10, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#c5a059' },
    cancelModalButtonText: { color: '#c5a059', fontWeight: 'bold', fontSize: 14 }
});