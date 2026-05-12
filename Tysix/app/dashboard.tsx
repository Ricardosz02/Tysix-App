import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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
            await saveGameToHistory([nextS1, nextS2, nextS3, nextS4]);
            await AsyncStorage.removeItem('active_game');

            let winner = "";
            if (nextS1 >= 1000) winner = player1Name;
            else if (nextS2 >= 1000) winner = player2Name;
            else if (nextS3 >= 1000) winner = player3Name;
            else if (nextS4 >= 1000) winner = player4Name;

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
        <View style={styles.container}>
            <Text style={styles.title}>Tabela Wyników</Text>

            <View style={styles.table}>
                <View style={styles.row}>
                    <Text style={styles.headerCell}>{player1Name}</Text>
                    <Text style={styles.headerCell}>{player2Name}</Text>
                    {playerCount >= 3 && <Text style={styles.headerCell}>{player3Name}</Text>}
                    {playerCount >= 4 && <Text style={[styles.headerCell, { borderRightWidth: 0 }]}>{player4Name}</Text>}
                    {playerCount === 2 && <View style={{ flex: 0 }} />}
                </View>
                <View style={styles.row}>
                    <Text style={score1 >= threshold ? styles.barrelScore : styles.scoreCell}>{score1 >= threshold ? `${score1}\n(BĘBEN)` : score1}</Text>
                    <Text style={score2 >= threshold ? styles.barrelScore : styles.scoreCell}>{score2 >= threshold ? `${score2}\n(BĘBEN)` : score2}</Text>
                    {playerCount >= 3 && <Text style={score3 >= threshold ? styles.barrelScore : styles.scoreCell}>{score3 >= threshold ? `${score3}\n(BĘBEN)` : score3}</Text>}
                    {playerCount >= 4 && <Text style={[score4 >= threshold ? styles.barrelScore : styles.scoreCell, { borderRightWidth: 0 }]}>{score4 >= threshold ? `${score4}\n(BĘBEN)` : score4}</Text>}
                </View>
            </View>

            <Pressable style={styles.addScoreButton} onPress={() => setIsModalVisible(true)}>
                <Text style={styles.addScoreText}>+ Dodaj wynik rundy</Text>
            </Pressable>

            <Pressable style={styles.menuButton} onPress={() => router.replace('/')}>
                <Text style={styles.menuButtonText}>Powrót do menu głównego</Text>
            </Pressable>

            <Pressable style={styles.exitButton} onPress={handleExitGame}>
                <Text style={styles.exitButtonText}>Zakończ i Usuń Grę</Text>
            </Pressable>

            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Wpisz punkty lub meldunek</Text>

                        <View style={styles.meldContainer}>
                            <Pressable style={styles.meldButton} onPress={() => handleAddMeld(40)}><Text style={[styles.meldText, { color: '#fff' }]}>♠ 40</Text></Pressable>
                            <Pressable style={styles.meldButton} onPress={() => handleAddMeld(60)}><Text style={[styles.meldText, { color: '#fff' }]}>♣ 60</Text></Pressable>
                            <Pressable style={styles.meldButton} onPress={() => handleAddMeld(80)}><Text style={[styles.meldText, { color: '#ff4d4d' }]}>♦ 80</Text></Pressable>
                            <Pressable style={styles.meldButton} onPress={() => handleAddMeld(100)}><Text style={[styles.meldText, { color: '#ff4d4d' }]}>♥ 100</Text></Pressable>
                        </View>

                        <TextInput style={[styles.input, focusedInput === 1 && styles.inputFocused]} onFocus={() => setFocusedInput(1)} keyboardType="numbers-and-punctuation" value={input1} onChangeText={setInput1} placeholder={player1Name} placeholderTextColor="#888" />
                        <TextInput style={[styles.input, focusedInput === 2 && styles.inputFocused]} onFocus={() => setFocusedInput(2)} keyboardType="numbers-and-punctuation" value={input2} onChangeText={setInput2} placeholder={player2Name} placeholderTextColor="#888" />

                        {playerCount >= 3 && (
                            <TextInput style={[styles.input, focusedInput === 3 && styles.inputFocused]} onFocus={() => setFocusedInput(3)} keyboardType="numbers-and-punctuation" value={input3} onChangeText={setInput3} placeholder={player3Name} placeholderTextColor="#888" />
                        )}

                        {playerCount >= 4 && (
                            <TextInput style={[styles.input, focusedInput === 4 && styles.inputFocused]} onFocus={() => setFocusedInput(4)} keyboardType="numbers-and-punctuation" value={input4} onChangeText={setInput4} placeholder={player4Name} placeholderTextColor="#888" />
                        )}

                        <View style={styles.modalButtons}>
                            <Pressable style={styles.cancelButton} onPress={() => setIsModalVisible(false)}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Anuluj</Text></Pressable>
                            <Pressable style={styles.saveButton} onPress={handleSaveRound}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Zapisz</Text></Pressable>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1e1e1e', padding: 10, paddingTop: 50, alignItems: 'center' },
    title: { fontSize: 24, color: '#e0e0e0', fontWeight: 'bold', marginBottom: 20 },
    table: { width: '100%', backgroundColor: '#2a2a2a', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#444' },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#444' },
    headerCell: { flex: 1, padding: 10, color: '#fff', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#333', borderRightWidth: 1, borderRightColor: '#444', fontSize: 10 },
    scoreCell: { flex: 1, padding: 15, color: '#4da6ff', textAlign: 'center', fontSize: 14, fontWeight: 'bold', borderRightWidth: 1, borderRightColor: '#444' },
    barrelScore: { flex: 1, padding: 10, color: '#ff9900', textAlign: 'center', fontSize: 13, fontWeight: 'bold', borderRightWidth: 1, borderRightColor: '#444' },
    addScoreButton: { backgroundColor: '#e0e0e0', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 20 },
    addScoreText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    menuButton: { backgroundColor: '#444', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 15 },
    menuButtonText: { color: '#e0e0e0', fontWeight: 'bold' },
    exitButton: { marginTop: 20 },
    exitButtonText: { color: '#ff4d4d', textDecorationLine: 'underline', fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#2a2a2a', padding: 20, borderRadius: 10, maxHeight: '90%' },
    modalTitle: { color: '#fff', fontSize: 16, marginBottom: 15, textAlign: 'center', fontWeight: 'bold' },
    meldContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    meldButton: { backgroundColor: '#444', paddingVertical: 10, flex: 1, marginHorizontal: 3, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#555' },
    meldText: { fontSize: 14, fontWeight: 'bold' },
    input: { backgroundColor: '#333', color: '#fff', padding: 12, borderRadius: 5, marginBottom: 15, textAlign: 'center', fontSize: 16, borderWidth: 2, borderColor: 'transparent' },
    inputFocused: { borderColor: '#4da6ff', backgroundColor: '#3a3a3a' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, paddingBottom: 20 },
    cancelButton: { backgroundColor: '#555', padding: 15, borderRadius: 5, width: '45%', alignItems: 'center' },
    saveButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 5, width: '45%', alignItems: 'center' }
});