import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
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

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [input3, setInput3] = useState('');
    const [input4, setInput4] = useState('');

    const [focusedInput, setFocusedInput] = useState<number>(1);
    const [threshold, setThreshold] = useState(800);

    useEffect(() => {
        const loadThreshold = async () => {
            const saved = await AsyncStorage.getItem('settings_barrel');
            if (saved) setThreshold(parseInt(saved));
        };
        loadThreshold();
    }, []);

    useEffect(() => {
        if (params.s1 === undefined) {
            setScore1(0); setScore2(0); setScore3(0); setScore4(0);
        }
    }, [params.gameId]);

    useEffect(() => {
        const saveGameState = async () => {
            try {
                const gameState = {
                    p1: player1Name, p2: player2Name, p3: player3Name, p4: player4Name,
                    s1: score1, s2: score2, s3: score3, s4: score4,
                    gameId: params.gameId,
                    playerCount: playerCount
                };
                await AsyncStorage.setItem('active_game', JSON.stringify(gameState));
            } catch (e) {
                console.error("Błąd zapisu stanu gry", e);
            }
        };
        saveGameState();
    }, [score1, score2, score3, score4]);

    const saveGameToHistory = async (finalScores: number[]) => {
        try {
            const historyData = await AsyncStorage.getItem('games_history');
            const history = historyData ? JSON.parse(historyData) : [];

            const newHistoryEntry = {
                id: Date.now(),
                date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
                players: [
                    { name: player1Name, score: finalScores[0] },
                    { name: player2Name, score: finalScores[1] },
                    ...(playerCount >= 3 ? [{ name: player3Name, score: finalScores[2] }] : []),
                    ...(playerCount >= 4 ? [{ name: player4Name, score: finalScores[3] }] : []),
                ]
            };

            const updatedHistory = [newHistoryEntry, ...history];
            await AsyncStorage.setItem('games_history', JSON.stringify(updatedHistory));
        } catch (e) {
            console.error("Błąd zapisu do historii", e);
        }
    };

    const saveGameToSupabase = async (finalScores: number[], winnerName: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: gameData, error: gameError } = await supabase
                .from('games')
                .insert([{ user_id: user.id }])
                .select()
                .single();

            if (gameError) throw gameError;
            const gameId = gameData.id;

            const scoresToInsert = [
                { game_id: gameId, player_name: player1Name, score: finalScores[0], is_winner: winnerName === player1Name },
                { game_id: gameId, player_name: player2Name, score: finalScores[1], is_winner: winnerName === player2Name },
            ];

            if (playerCount >= 3) {
                scoresToInsert.push({ game_id: gameId, player_name: player3Name, score: finalScores[2], is_winner: winnerName === player3Name });
            }
            if (playerCount >= 4) {
                scoresToInsert.push({ game_id: gameId, player_name: player4Name, score: finalScores[3], is_winner: winnerName === player4Name });
            }

            await supabase.from('game_scores').insert(scoresToInsert);
        } catch (error) {
            console.error("Błąd synchronizacji z chmurą:", error);
        }
    };

    const handleAddMeld = (meldValue: number) => {
        if (focusedInput === 1) setInput1(String((parseInt(input1) || 0) + meldValue));
        else if (focusedInput === 2) setInput2(String((parseInt(input2) || 0) + meldValue));
        else if (focusedInput === 3) setInput3(String((parseInt(input3) || 0) + meldValue));
        else if (focusedInput === 4) setInput4(String((parseInt(input4) || 0) + meldValue));
    };

    const handleSaveRound = async () => {
        const calculateNewScore = (currentScore: number, pointsToAdd: number) => {
            let newScore = currentScore + pointsToAdd;
            if (currentScore >= threshold) {
                if (pointsToAdd < 0) return newScore;
                if (newScore < 1000 && pointsToAdd > 0) {
                    Alert.alert("Bęben!", `Na bębnie (${threshold}) musisz ugrać do 1000!`);
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

        if (nextS1 >= 1000 || nextS2 >= 1000 || (playerCount >= 3 && nextS3 >= 1000) || (playerCount >= 4 && nextS4 >= 1000)) {
            let winner = "";
            if (nextS1 >= 1000) winner = player1Name;
            else if (nextS2 >= 1000) winner = player2Name;
            else if (nextS3 >= 1000) winner = player3Name;
            else if (nextS4 >= 1000) winner = player4Name;

            const finalScores = [nextS1, nextS2, nextS3, nextS4];

            await saveGameToHistory(finalScores);
            await AsyncStorage.removeItem('active_game');
            saveGameToSupabase(finalScores, winner);

            Alert.alert("WYGRANA!", `${winner} wygrywa grę! 🎉`, [
                { text: "OK", onPress: () => router.replace('/') }
            ]);
        }

        setScore1(nextS1);
        setScore2(nextS2);
        if (playerCount >= 3) setScore3(nextS3);
        if (playerCount >= 4) setScore4(nextS4);

        setInput1(''); setInput2(''); setInput3(''); setInput4('');
        setIsModalVisible(false);
    };

    const handleExitGame = () => {
        Alert.alert("Zakończyć grę?", "Postęp zostanie trwale usunięty.", [
            { text: "Anuluj", style: "cancel" },
            {
                text: "Tak, usuń", style: "destructive", onPress: async () => {
                    await AsyncStorage.removeItem('active_game');
                    router.replace('/');
                }
            }
        ]);
    };

    return (
        <View style={styles.mainContainer}>
            <Header />

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>STAN ROZGRYWKI</Text>
                </View>

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

                <Pressable style={styles.addScoreButton} onPress={() => setIsModalVisible(true)}>
                    <Text style={styles.addScoreText}>+ DODAJ WYNIK RUNDY</Text>
                </Pressable>

                <Pressable style={styles.menuButton} onPress={() => router.replace('/')}>
                    <Text style={styles.menuButtonText}>Menu główne</Text>
                </Pressable>

                <Pressable style={styles.exitButton} onPress={handleExitGame}>
                    <Text style={styles.exitButtonText}>Porzuć i usuń grę</Text>
                </Pressable>
            </ScrollView>

            <Modal visible={isModalVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
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
                            <Pressable style={styles.cancelButton} onPress={() => setIsModalVisible(false)}><Text style={{ color: '#c5a059', fontWeight: 'bold' }}>Anuluj</Text></Pressable>
                            <Pressable style={styles.saveButton} onPress={handleSaveRound}><Text style={{ color: '#102a22', fontWeight: 'bold' }}>Zapisz wynik</Text></Pressable>
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
    titleContainer: { backgroundColor: '#16352b', paddingVertical: 8, paddingHorizontal: 35, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#c5a059' },
    title: { fontSize: 15, color: '#f4ebd0', fontWeight: 'bold', letterSpacing: 1 },

    table: { width: '100%', backgroundColor: '#0d221b', borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#c5a059', marginTop: 5 },
    row: { flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: '#c5a059' },
    headerCell: { flex: 1, padding: 12, color: '#f4ebd0', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#16352b', borderRightWidth: 1.5, borderRightColor: '#c5a059', fontSize: 11, letterSpacing: 0.5 },
    scoreCell: { flex: 1, paddingVertical: 20, paddingHorizontal: 5, color: '#f4ebd0', textAlign: 'center', fontSize: 18, fontWeight: 'bold', borderRightWidth: 1.5, borderRightColor: '#c5a059' },
    barrelScore: { flex: 1, paddingVertical: 12, paddingHorizontal: 5, color: '#c5a059', textAlign: 'center', fontSize: 14, fontWeight: '900', borderRightWidth: 1.5, borderRightColor: '#c5a059', backgroundColor: '#16352b' },

    addScoreButton: { backgroundColor: '#f4ebd0', padding: 16, borderRadius: 30, width: '100%', alignItems: 'center', marginTop: 25, borderWidth: 2, borderColor: '#c5a059', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
    addScoreText: { color: '#102a22', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
    menuButton: { backgroundColor: '#16352b', padding: 14, borderRadius: 25, width: '100%', alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: '#c5a059' },
    menuButtonText: { color: '#f4ebd0', fontWeight: '600', fontSize: 14 },
    exitButton: { marginTop: 25, padding: 5 },
    exitButtonText: { color: '#ff4d4d', textDecorationLine: 'underline', fontSize: 15, fontWeight: '500' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(13, 34, 34, 0.95)', justifyContent: 'center', padding: 20 },
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