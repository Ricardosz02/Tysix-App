import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function DashboardScreen() {
    // 1. Odbieranie imion
    const { p1, p2, p3 } = useLocalSearchParams();
    const player1Name = p1 || 'Gracz 1';
    const player2Name = p2 || 'Gracz 2';
    const player3Name = p3 || 'Gracz 3';

    // 2. Główne wyniki w tabeli
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);
    const [score3, setScore3] = useState(0);

    // 3. Stan sterujący widocznością okienka (Modala)
    const [isModalVisible, setIsModalVisible] = useState(false);

    // 4. Tymczasowe stany dla wpisywanych punktów w danej rundzie
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [input3, setInput3] = useState('');

    // 5. Funkcja zapisująca rundę (NASZ PIERWSZY ALGORYTM!)
    const handleSaveRound = () => {
        // Zamieniamy tekst z inputa na liczbę (jeśli ktoś nic nie wpisał, traktujemy to jako 0)
        const points1 = parseInt(input1) || 0;
        const points2 = parseInt(input2) || 0;
        const points3 = parseInt(input3) || 0;

        // Dodajemy nowe punkty do starych wyników
        setScore1(prevScore => prevScore + points1);
        setScore2(prevScore => prevScore + points2);
        setScore3(prevScore => prevScore + points3);

        // Czyścimy inputy na następną rundę i zamykamy okienko
        setInput1('');
        setInput2('');
        setInput3('');
        setIsModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tabela Wyników</Text>

            {/* --- GŁÓWNA TABELA --- */}
            <View style={styles.table}>
                <View style={styles.row}>
                    <Text style={[styles.cell, styles.header]}>{player1Name}</Text>
                    <Text style={[styles.cell, styles.header]}>{player2Name}</Text>
                    <Text style={[styles.cell, styles.header, styles.noBorder]}>{player3Name}</Text>
                </View>
                <View style={[styles.row, styles.noBorder]}>
                    <Text style={styles.cellScore}>{score1}</Text>
                    <Text style={styles.cellScore}>{score2}</Text>
                    <Text style={[styles.cellScore, styles.noBorder]}>{score3}</Text>
                </View>
            </View>

            {/* Przycisk otwierający Modal */}
            <Pressable style={styles.addScoreButton} onPress={() => setIsModalVisible(true)}>
                <Text style={styles.addScoreText}>+ Dodaj wynik rundy</Text>
            </Pressable>

            <Link href="/history" style={styles.historyButton}>Pokaż historię rozdań</Link>
            <Link href="/" style={styles.exitButton}>Zakończ grę i wróć do Startu</Link>

            {/* --- OKIENKO DODAWANIA PUNKTÓW (MODAL) --- */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nowe Rozdanie</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{player1Name}:</Text>
                            <TextInput style={styles.input} keyboardType="numeric" value={input1} onChangeText={setInput1} placeholder="0" />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{player2Name}:</Text>
                            <TextInput style={styles.input} keyboardType="numeric" value={input2} onChangeText={setInput2} placeholder="0" />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{player3Name}:</Text>
                            <TextInput style={styles.input} keyboardType="numeric" value={input3} onChangeText={setInput3} placeholder="0" />
                        </View>

                        <View style={styles.modalButtons}>
                            <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Anuluj</Text>
                            </Pressable>

                            <Pressable style={[styles.modalButton, styles.saveButton]} onPress={handleSaveRound}>
                                <Text style={styles.saveButtonText}>Zapisz rundę</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: 'black', marginBottom: 20 },

    table: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 30, overflow: 'hidden' },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd' },
    cell: { flex: 1, padding: 15, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#ddd' },
    header: { fontWeight: 'bold', backgroundColor: '#f4f4f4', fontSize: 16 },
    cellScore: { flex: 1, padding: 20, textAlign: 'center', fontSize: 24, fontWeight: 'bold', color: '#5D3FD3', borderRightWidth: 1, borderRightColor: '#ddd' },
    noBorder: { borderRightWidth: 0, borderBottomWidth: 0 },

    addScoreButton: { backgroundColor: '#5D3FD3', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 20 },
    addScoreText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    historyButton: { fontSize: 16, color: 'white', backgroundColor: '#6c757d', padding: 12, borderRadius: 8, width: '100%', textAlign: 'center', marginBottom: 15, overflow: 'hidden' },
    exitButton: { fontSize: 16, color: 'red', borderColor: 'red', borderWidth: 1, padding: 12, borderRadius: 8, width: '100%', textAlign: 'center' },

    // Style dla Modala
    modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
    modalContent: { backgroundColor: 'white', padding: 25, borderRadius: 12, elevation: 5 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    inputGroup: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    inputLabel: { flex: 1, fontSize: 16, fontWeight: 'bold' },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, textAlign: 'center' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    modalButton: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
    cancelButton: { backgroundColor: '#f4f4f4' },
    cancelButtonText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
    saveButton: { backgroundColor: '#28a745' },
    saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});