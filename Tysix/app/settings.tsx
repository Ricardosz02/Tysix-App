import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';

export default function SettingsScreen() {
    const [barrelThreshold, setBarrelThreshold] = useState(800);

    useEffect(() => {
        const loadSettings = async () => {
            const savedThreshold = await AsyncStorage.getItem('settings_barrel');
            if (savedThreshold) setBarrelThreshold(parseInt(savedThreshold));
        };
        loadSettings();
    }, []);

    const toggleThreshold = async () => {
        const newValue = barrelThreshold === 800 ? 900 : 800;
        setBarrelThreshold(newValue);
        await AsyncStorage.setItem('settings_barrel', newValue.toString());
    };

    const clearAllData = () => {
        Alert.alert(
            "⚠️ UWAGA!",
            "Czy na pewno chcesz usunąć całą historię gier i zresetować ustawienia? Tego nie da się cofnąć.",
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "TAK, USUŃ WSZYSTKO",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.clear();
                        setBarrelThreshold(800);
                        Alert.alert("Sukces", "Pamięć aplikacji została wyczyszczona.");
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Header />

            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={styles.pageTitle}>USTAWIENIA</Text>
                </View>

                <View style={styles.optionsContainer}>
                    <View style={styles.optionRow}>
                        <View>
                            <Text style={styles.optionLabel}>Próg Bębna</Text>
                            <Text style={styles.optionDesc}>Kiedy zaczyna się blokada punktów</Text>
                        </View>
                        <Pressable style={styles.toggleBtn} onPress={toggleThreshold}>
                            <Text style={styles.toggleBtnText}>{barrelThreshold} pkt</Text>
                        </Pressable>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.dangerZone}>
                        <Text style={styles.dangerTitle}>Strefa Niebezpieczna</Text>
                        <Pressable style={styles.clearButton} onPress={clearAllData}>
                            <Text style={styles.clearButtonText}>WYCZYŚĆ WSZYSTKIE DANE</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1e1e1e' },
    content: { flex: 1, alignItems: 'center', paddingTop: 20 },
    titleContainer: { backgroundColor: '#e0e0e0', paddingVertical: 10, paddingHorizontal: 40, borderRadius: 5, marginBottom: 30 },
    pageTitle: { fontSize: 20, color: '#000', fontWeight: 'bold' },
    optionsContainer: { backgroundColor: '#2a2a2a', width: '90%', padding: 20, borderRadius: 10, borderWidth: 1, borderColor: '#444' },
    optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    optionLabel: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    optionDesc: { color: '#888', fontSize: 12 },
    toggleBtn: { backgroundColor: '#4da6ff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    toggleBtnText: { color: '#fff', fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#444', marginVertical: 20 },
    dangerZone: { marginTop: 10 },
    dangerTitle: { color: '#ff4d4d', fontWeight: 'bold', marginBottom: 15 },
    clearButton: { backgroundColor: '#ff4d4d', padding: 15, borderRadius: 8, alignItems: 'center' },
    clearButtonText: { color: '#fff', fontWeight: 'bold' }
});