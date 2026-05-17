import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

export default function DashboardScreen() {
    const params = useLocalSearchParams();

    const playerCount = parseInt(params.playerCount as string) || 3;

    const player1Name = (params.p1 as string) || 'Gracz 1';
    const player2Name = (params.p2 as string) || 'Gracz 2';
    const player3Name = (params.p3 as string) || 'Gracz 3';
    const player4Name = (params.p4 as string) || 'Gracz 4';

    const [score1, setScore1] = useState(parseInt(params.s1 as string) || 0);
    const [score2, setScore2] = useState(parseInt(params.s2 as string) || 0);
    const [score3, setScore3] = useState(parseInt(params.s3 as string) || 0);
    const [score4, setScore4] = useState(parseInt(params.s4 as string) || 0);

    const [scoreHistory, setScoreHistory] = useState<number[][]>([]);

    const [elapsedTime, setElapsedTime] = useState(parseInt(params.elapsedTime as string) || 0);
    const [isTimerActive, setIsTimerActive] = useState(true);

    const [supabaseGameId, setSupabaseGameId] = useState<string | null>(
        params.supabaseGameId ? (params.supabaseGameId as string) : null
    );

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [input3, setInput3] = useState('');
    const [input4, setInput4] = useState('');

    const [focusedInput, setFocusedInput] = useState<number>(1);
    const [threshold, setThreshold] = useState(800);

    const [hapticsEnabled, setHapticsEnabled] = useState(true);
    const [soundsEnabled, setSoundsEnabled] = useState(true);

    const meldSound = useAudioPlayer(require('../assets/sounds/chips.mp3'));
    const winSound = useAudioPlayer(require('../assets/sounds/win.mp3'));

    useEffect(() => {
        let timerInterval: any = null;
        if (isTimerActive) {
            timerInterval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [isTimerActive]);

    useEffect(() => {
        const loadThreshold = async () => {
            const saved = await AsyncStorage.getItem('settings_barrel');
            if (saved) setThreshold(parseInt(saved));
        };
        loadThreshold();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            const loadPreferences = async () => {
                const savedHaptics = await AsyncStorage.getItem('settings_haptics');
                if (savedHaptics !== null) setHapticsEnabled(savedHaptics === 'true');

                const savedSounds = await AsyncStorage.getItem('settings_sounds');
                if (savedSounds !== null) setSoundsEnabled(savedSounds === 'true');
            };
            loadPreferences();
        }, [])
    );

    useEffect(() => {
        if (params.s1 === undefined) {
            setScore1(0); setScore2(0); setScore3(0); setScore4(0);
            setHistoryLogAndScores();
            setElapsedTime(0);
            setIsTimerActive(true);
            setSupabaseGameId(null);
        }
    }, [params.gameId]);

    const setHistoryLogAndScores = () => {
        setScoreHistory([]);
    };

    useEffect(() => {
        if (score1 >= 1000 || score2 >= 1000 || score3 >= 1000 || score4 >= 1000) {
            return;
        }

        const saveLiveGameToCloud = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                let currentGameId = supabaseGameId;

                if (!currentGameId) {
                    const { data, error } = await supabase
                        .from('games')
                        .insert([{
                            user_id: user.id,
                            status: 'w_toku',
                            elapsed_time: elapsedTime,
                            player_count: playerCount
                        }])
                        .select().single();

                    if (error) throw error;
                    currentGameId = data.id;
                    setSupabaseGameId(data.id);
                } else {
                    await supabase
                        .from('games')
                        .update({ elapsed_time: elapsedTime })
                        .eq('id', currentGameId);
                }

                await supabase.from('game_scores').delete().eq('game_id', currentGameId);

                const liveScores = [
                    { game_id: currentGameId, player_name: player1Name, score: score1, is_winner: false },
                    { game_id: currentGameId, player_name: player2Name, score: score2, is_winner: false },
                ];
                if (playerCount >= 3) liveScores.push({ game_id: currentGameId, player_name: player3Name, score: score3, is_winner: false });
                if (playerCount >= 4) liveScores.push({ game_id: currentGameId, player_name: player4Name, score: score4, is_winner: false });

                await supabase.from('game_scores').insert(liveScores);
            } catch (e) {
                console.error("Błąd zapisu stanu gry w toku do chmury", e);
            }
        };
        saveLiveGameToCloud();
    }, [score1, score2, score3, score4]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const playSoundEffect = (type: 'meld' | 'win') => {
        if (!soundsEnabled) return;

        if (type === 'meld') {
            meldSound.seekTo(0);
            meldSound.play();
        } else {
            winSound.seekTo(0);
            winSound.play();
        }
    };

    const saveGameToHistory = async (finalScores: number[], roundsData: number[][]) => {
        try {
            const historyData = await AsyncStorage.getItem('games_history');
            const history = historyData ? JSON.parse(historyData) : [];

            const cleanTime = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

            const newHistoryEntry = {
                id: Date.now(),
                date: new Date().toLocaleDateString('pl-PL') + ' ' + cleanTime,
                duration: elapsedTime,
                players: [
                    { name: player1Name, score: finalScores[0] },
                    { name: player2Name, score: finalScores[1] },
                    ...(playerCount >= 3 ? [{ name: player3Name, score: finalScores[2] }] : []),
                    ...(playerCount >= 4 ? [{ name: player4Name, score: finalScores[3] }] : []),
                ],
                rounds: roundsData
            };

            const updatedHistory = [newHistoryEntry, ...history];
            await AsyncStorage.setItem('games_history', JSON.stringify(updatedHistory));
        } catch (e) {
            console.error("Błąd zapis do historii", e);
        }
    };

    const saveGameToSupabase = async (finalScores: number[], winnerName: string) => {
        try {
            let currentGameId = supabaseGameId;

            if (!currentGameId) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: gameData, error: gameError } = await supabase
                    .from('games')
                    .insert([{ user_id: user.id, status: 'zakonczona', elapsed_time: elapsedTime, player_count: playerCount }])
                    .select().single();

                if (gameError) throw gameError;
                currentGameId = gameData.id;
            } else {
                await supabase
                    .from('games')
                    .update({ status: 'zakonczona', elapsed_time: elapsedTime })
                    .eq('id', currentGameId);
            }

            await supabase.from('game_scores').delete().eq('game_id', currentGameId);

            const scoresToInsert = [
                { game_id: currentGameId, player_name: player1Name, score: finalScores[0], is_winner: winnerName === player1Name },
                { game_id: currentGameId, player_name: player2Name, score: finalScores[1], is_winner: winnerName === player2Name },
            ];

            if (playerCount >= 3) {
                scoresToInsert.push({ game_id: currentGameId, player_name: player3Name, score: finalScores[2], is_winner: winnerName === player3Name });
            }
            if (playerCount >= 4) {
                scoresToInsert.push({ game_id: currentGameId, player_name: player4Name, score: finalScores[3], is_winner: winnerName === player4Name });
            }

            await supabase.from('game_scores').insert(scoresToInsert);
        } catch (error) {
            console.error("Błąd finalizowania gry w chmurze:", error);
        }
    };

    const handleAddMeld = (meldValue: number) => {
        if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        playSoundEffect('meld');

        if (focusedInput === 1) setInput1(String((parseInt(input1) || 0) + meldValue));
        else if (focusedInput === 2) setInput2(String((parseInt(input2) || 0) + meldValue));
        else if (focusedInput === 3) setInput3(String((parseInt(input3) || 0) + meldValue));
        else if (focusedInput === 4) setInput4(String((parseInt(input4) || 0) + meldValue));
    };

    const handleSaveRound = async () => {
        if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const calculateNewScore = (currentScore: number, pointsToAdd: number) => {
            let newScore = currentScore + pointsToAdd;
            if (currentScore >= threshold) {
                if (pointsToAdd < 0) return newScore;
                if (newScore < 1000 && pointsToAdd > 0) {
                    Alert.alert("Bęben!", `Na bębnie (${threshold}) musisz ugrać do 1000!`);
                    if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    return currentScore;
                }
            }
            if (currentScore < threshold && newScore >= threshold && newScore < 1000) return threshold;
            return newScore;
        };

        const nextS1 = calculateNewScore(score1, parseInt(input1) || 0);
        const nextS2 = calculateNewScore(score2, parseInt(input2) || 0);
        const nextS3 = playerCount >= 3 ? calculateNewScore(score3, parseInt(input3) || 0) : 0;
        const nextS4 = playerCount >= 4 ? calculateNewScore(score4, parseInt(input4) || 0) : 0;

        const finalScores = [nextS1, nextS2, nextS3, nextS4];

        if (nextS1 >= 1000 || nextS2 >= 1000 || (playerCount >= 3 && nextS3 >= 1000) || (playerCount >= 4 && nextS4 >= 1000)) {
            setIsTimerActive(false);

            let winner = "";
            if (nextS1 >= 1000) winner = player1Name;
            else if (nextS2 >= 1000) winner = player2Name;
            else if (nextS3 >= 1000) winner = player3Name;
            else if (nextS4 >= 1000) winner = player4Name;

            const roundsData = [...scoreHistory, finalScores];

            await saveGameToHistory(finalScores, roundsData);
            await saveGameToSupabase(finalScores, winner);

            if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            playSoundEffect('win');

            Alert.alert("WYGRANA!", `${winner} wygrywa grę! 🎉`, [
                { text: "OK", onPress: () => router.replace('/') }
            ]);
        } else {
            setScoreHistory(prev => [...prev, finalScores]);
            setScore1(nextS1);
            setScore2(nextS2);
            if (playerCount >= 3) setScore3(nextS3);
            if (playerCount >= 4) setScore4(nextS4);
        }

        setInput1(''); setInput2(''); setInput3(''); setInput4('');
        setIsModalVisible(false);
    };

    const handleUndoRound = () => {
        if (scoreHistory.length === 0) return;
        if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        Alert.alert(
            "Cofnąć rozdanie?",
            "Punkty z ostatnio dodanej rundy zostaną bezpowrotnie anulowane.",
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "Tak, cofnij",
                    style: "destructive",
                    onPress: () => {
                        if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                        const newHistory = scoreHistory.slice(0, -1);
                        setScoreHistory(newHistory);

                        const previousScores = newHistory.length > 0
                            ? newHistory[newHistory.length - 1]
                            : [0, 0, 0, 0];

                        setScore1(previousScores[0]);
                        setScore2(previousScores[1]);
                        setScore3(previousScores[2]);
                        setScore4(previousScores[3]);
                    }
                }
            ]
        );
    };

    const handleExitGame = () => {
        if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert("Porzucić grę?", "Ta gra zostanie całkowicie i bezpowrotnie usunięta z chmury.", [
            { text: "Anuluj", style: "cancel" },
            {
                text: "Tak, usuń",
                style: "destructive",
                onPress: async () => {
                    try {
                        if (supabaseGameId) {
                            await supabase.from('game_scores').delete().eq('game_id', supabaseGameId);
                            const { error } = await supabase.from('games').delete().eq('id', supabaseGameId);
                            if (error) throw error;
                        }
                        router.replace('/');
                    } catch (err) {
                        console.error("Błąd podczas usuwania porzuconej gry z chmury:", err);
                        router.replace('/');
                    }
                }
            }
        ]);
    };

    return (
        <View style={styles.mainContainer}>
            <Header />

            <ScrollView contentContainerStyle={styles.container}>
                <Pressable
                    style={styles.titleContainer}
                    onPress={() => {
                        if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setIsTimerActive(prev => !prev);
                    }}
                >
                    <Text style={styles.title}>
                        STAN ROZGRYWKI • {isTimerActive ? '⏱️' : '⏸️'} {formatTime(elapsedTime)} {!isTimerActive && '(PAUZA)'}
                    </Text>
                </Pressable>

                <View style={styles.table}>
                    <View style={styles.row}>
                        <Text style={styles.headerCell}>{player1Name.toUpperCase()}</Text>
                        <Text style={styles.headerCell}>{player2Name.toUpperCase()}</Text>
                        {playerCount >= 3 && <Text style={styles.headerCell}>{player3Name.toUpperCase()}</Text>}
                        {playerCount >= 4 && <Text style={[styles.headerCell, { borderRightWidth: 0 }]}>{player4Name.toUpperCase()}</Text>}
                    </View>
                    <View style={[styles.row, { borderBottomWidth: 0 }]}>
                        <Text style={score1 >= threshold ? styles.barrelScore : styles.scoreCell}>{score1 >= threshold ? `${score1}\n👑 BĘBEN` : score1}</Text>
                        <Text style={score2 >= threshold ? styles.barrelScore : styles.scoreCell}>{score2 >= threshold ? `${score2}\n👑 BĘBEN` : score2}</Text>
                        {playerCount >= 3 && <Text style={score3 >= threshold ? styles.barrelScore : styles.scoreCell}>{score3 >= threshold ? `${score3}\n👑 BĘBEN` : score3}</Text>}
                        {playerCount >= 4 && <Text style={[score4 >= threshold ? styles.barrelScore : styles.scoreCell, { borderRightWidth: 0 }]}>{score4 >= threshold ? `${score4}\n👑 BĘBEN` : score4}</Text>}
                    </View>
                </View>

                <Pressable
                    style={styles.addScoreButton}
                    onPress={() => {
                        if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setIsModalVisible(true);
                    }}
                >
                    <Text style={styles.addScoreText}>+ DODAJ WYNIK RUNDY</Text>
                </Pressable>

                <Pressable
                    style={[styles.undoButton, scoreHistory.length === 0 && styles.undoButtonDisabled]}
                    onPress={handleUndoRound}
                    disabled={scoreHistory.length === 0}
                >
                    <Text style={[styles.undoButtonText, scoreHistory.length === 0 && styles.undoButtonTextDisabled]}>
                        ⤺ COFNIJ OSTATNIĄ RUNDĘ
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.menuButton}
                    onPress={() => {
                        if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.replace('/');
                    }}
                >
                    <Text style={styles.menuButtonText}>Menu główne</Text>
                </Pressable>

                <Pressable style={styles.exitButton} onPress={handleExitGame}>
                    <Text style={styles.exitButtonText}>Porzuć i wyjdź z gry</Text>
                </Pressable>
            </ScrollView>

            <Modal visible={isModalVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <ScrollView contentContainerStyle={styles.modalScrollCenter} keyboardShouldPersistTaps="handled">
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>WPISZ PUNKTY LUB MELDUNEK</Text>

                            <View style={styles.meldContainer}>
                                <Pressable style={styles.meldButton} onPress={() => handleAddMeld(40)}><Text style={[styles.meldText, { color: '#f4ebd0' }]}>♠ 40</Text></Pressable>
                                <Pressable style={styles.meldButton} onPress={() => handleAddMeld(60)}><Text style={[styles.meldText, { color: '#f4ebd0' }]}>♣ 60</Text></Pressable>
                                <Pressable style={[styles.meldButton, styles.meldRed]} onPress={() => handleAddMeld(80)}><Text style={[styles.meldText, { color: '#ff4d4d' }]}>♦ 80</Text></Pressable>
                                <Pressable style={[styles.meldButton, styles.meldRed]} onPress={() => handleAddMeld(100)}><Text style={[styles.meldText, { color: '#ff4d4d' }]}>♥ 100</Text></Pressable>
                            </View>

                            <TextInput style={[styles.input, focusedInput === 1 && styles.inputFocused]} onFocus={() => setFocusedInput(1)} keyboardType="numeric" value={input1} onChangeText={setInput1} placeholder={player1Name} placeholderTextColor="#557c6f" />
                            <TextInput style={[styles.input, focusedInput === 2 && styles.inputFocused]} onFocus={() => setFocusedInput(2)} keyboardType="numeric" value={input2} onChangeText={setInput2} placeholder={player2Name} placeholderTextColor="#557c6f" />

                            {playerCount >= 3 && (
                                <TextInput style={[styles.input, focusedInput === 3 && styles.inputFocused]} onFocus={() => setFocusedInput(3)} keyboardType="numeric" value={input3} onChangeText={setInput3} placeholder={player3Name} placeholderTextColor="#557c6f" />
                            )}

                            {playerCount >= 4 && (
                                <TextInput style={[styles.input, focusedInput === 4 && styles.inputFocused]} onFocus={() => setFocusedInput(4)} keyboardType="numeric" value={input4} onChangeText={setInput4} placeholder={player4Name} placeholderTextColor="#557c6f" />
                            )}

                            <View style={styles.modalButtons}>
                                <Pressable
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setIsModalVisible(false);
                                    }}
                                >
                                    <Text style={{ color: '#c5a059', fontWeight: 'bold' }}>Anuluj</Text>
                                </Pressable>
                                <Pressable style={styles.saveButton} onPress={handleSaveRound}>
                                    <Text style={{ color: '#102a22', fontWeight: 'bold' }}>Zapisz wynik</Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#102a22' },
    container: { alignItems: 'center', padding: 15 },
    titleContainer: { backgroundColor: '#16352b', paddingVertical: 8, paddingHorizontal: 25, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#c5a059' },
    title: { fontSize: 14, color: '#f4ebd0', fontWeight: 'bold', letterSpacing: 1 },
    table: { width: '100%', backgroundColor: '#0d221b', borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#c5a059', marginTop: 5 },
    row: { flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: '#c5a059' },
    headerCell: { flex: 1, padding: 12, color: '#f4ebd0', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#16352b', borderRightWidth: 1.5, borderRightColor: '#c5a059', fontSize: 11, letterSpacing: 0.5 },
    scoreCell: { flex: 1, paddingVertical: 20, paddingHorizontal: 5, color: '#f4ebd0', textAlign: 'center', fontSize: 18, fontWeight: 'bold', borderRightWidth: 1.5, borderRightColor: '#c5a059' },
    barrelScore: { flex: 1, paddingVertical: 12, paddingHorizontal: 5, color: '#c5a059', textAlign: 'center', fontSize: 14, fontWeight: '900', borderRightWidth: 1.5, borderRightColor: '#c5a059', backgroundColor: '#16352b' },
    addScoreButton: { backgroundColor: '#f4ebd0', padding: 16, borderRadius: 30, width: '100%', alignItems: 'center', marginTop: 25, borderWidth: 2, borderColor: '#c5a059', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
    addScoreText: { color: '#102a22', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
    undoButton: { backgroundColor: '#16352b', padding: 14, borderRadius: 25, width: '100%', alignItems: 'center', marginTop: 15, borderWidth: 1.5, borderColor: '#c5a059' },
    undoButtonDisabled: { borderColor: 'rgba(197, 160, 89, 0.2)', opacity: 0.4 },
    undoButtonText: { color: '#f4ebd0', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },
    undoButtonTextDisabled: { color: '#557c6f' },
    menuButton: { backgroundColor: '#16352b', padding: 14, borderRadius: 25, width: '100%', alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: '#c5a059' },
    menuButtonText: { color: '#f4ebd0', fontWeight: '600', fontSize: 14 },
    exitButton: { marginTop: 25, padding: 5 },
    exitButtonText: { color: '#ff4d4d', textDecorationLine: 'underline', fontSize: 15, fontWeight: '500' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(13, 34, 34, 0.95)' },
    modalScrollCenter: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#16352b', padding: 22, borderRadius: 16, borderWidth: 1.5, borderColor: '#c5a059' },
    modalTitle: { color: '#f4ebd0', fontSize: 15, marginBottom: 20, textAlign: 'center', fontWeight: 'bold', letterSpacing: 1 },
    meldContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
    meldButton: { backgroundColor: '#0d221b', paddingVertical: 12, flex: 1, marginHorizontal: 4, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(197, 160, 89, 0.4)' },
    meldRed: { borderColor: 'rgba(255, 77, 77, 0.4)' },
    meldText: { fontSize: 15, fontWeight: 'bold' },
    input: { backgroundColor: '#0d221b', color: '#f4ebd0', padding: 14, borderRadius: 10, marginBottom: 16, textAlign: 'center', fontSize: 18, borderWidth: 1.5, borderColor: 'rgba(197, 160, 89, 0.2)', fontWeight: 'bold' },
    inputFocused: { borderColor: '#c5a059', backgroundColor: '#102a22' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    cancelButton: { backgroundColor: 'transparent', padding: 14, borderRadius: 10, width: '45%', alignItems: 'center', borderWidth: 1, borderColor: '#c5a059' },
    saveButton: { backgroundColor: '#f4ebd0', padding: 14, borderRadius: 10, width: '45%', alignItems: 'center', borderWidth: 1, borderColor: '#c5a059' }
});