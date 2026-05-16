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
                    <Text style={styles.pageTitle}>USTAWIENIA APLIKACJI</Text>
                </View>

                <View style={styles.optionsContainer}>
                    <View style={styles.optionRow}>
                        <View style={styles.textWrapper}>
                            <Text style={styles.optionLabel}>Próg Bębna</Text>
                            <Text style={styles.optionDesc}>Kiedy zaczyna się blokada punktów</Text>
                        </View>
                        <Pressable style={styles.toggleBtn} onPress={toggleThreshold}>
                            <Text style={styles.toggleBtnText}>{barrelThreshold} PKT</Text>
                        </Pressable>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.dangerZone}>
                        <Text style={styles.dangerTitle}>STREFA NIEBEZPIECZNA</Text>
                        <Pressable style={styles.clearButton} onPress={clearAllData}>
                            <Text style={styles.clearButtonText}>WYCZYŚĆ WSZYSTKIE DATA</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#102a22'
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20
    },
    titleContainer: {
        backgroundColor: '#16352b',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#c5a059'
    },
    pageTitle: {
        fontSize: 16,
        color: '#f4ebd0',
        fontWeight: 'bold',
        letterSpacing: 1
    },
    optionsContainer: {
        backgroundColor: '#0d221b',
        width: '90%',
        padding: 22,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(197, 160, 89, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    textWrapper: {
        flex: 1,
        paddingRight: 10
    },
    optionLabel: {
        color: '#f4ebd0',
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 0.5
    },
    optionDesc: {
        color: '#c5a059',
        fontSize: 12,
        opacity: 0.8,
        marginTop: 3
    },
    toggleBtn: {
        backgroundColor: '#f4ebd0',
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#c5a059',
        minWidth: 100,
        alignItems: 'center'
    },
    toggleBtnText: {
        color: '#102a22',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 0.5
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(197, 160, 89, 0.2)',
        marginVertical: 22
    },
    dangerZone: {
        marginTop: 5
    },
    dangerTitle: {
        color: '#ff4d4d',
        fontWeight: 'bold',
        marginBottom: 15,
        fontSize: 13,
        letterSpacing: 1
    },
    clearButton: {
        backgroundColor: 'rgba(255, 77, 77, 0.06)',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#ff4d4d'
    },
    clearButtonText: {
        color: '#ff4d4d',
        fontWeight: 'bold',
        letterSpacing: 1,
        fontSize: 13
    }
});