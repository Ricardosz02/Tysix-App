import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';

export default function MainMenuScreen() {

    const handleResumeGame = async () => {
        try {
            const savedGame = await AsyncStorage.getItem('active_game');
            if (savedGame !== null) {
                const gameData = JSON.parse(savedGame);
                router.push({
                    pathname: "/dashboard",
                    params: {
                        p1: gameData.p1, p2: gameData.p2, p3: gameData.p3, p4: gameData.p4,
                        s1: gameData.s1, s2: gameData.s2, s3: gameData.s3, s4: gameData.s4,
                        gameId: gameData.gameId
                    }
                });
            } else {
                Alert.alert("Brak zapisu", "Nie znaleziono żadnej rozpoczętej gry.");
            }
        } catch (e) {
            Alert.alert("Błąd", "Nie udało się wczytać gry.");
        }
    };

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.content}>
                <Pressable
                    style={styles.button}
                    onPress={() => router.push('/setup')}
                >
                    <Text style={styles.buttonText}>NOWA GRA</Text>
                </Pressable>

                <Pressable
                    style={styles.button}
                    onPress={handleResumeGame}
                >
                    <Text style={styles.buttonText}>WZNÓW GRĘ</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1e1e1e' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    button: {
        backgroundColor: '#e0e0e0',
        width: '80%',
        paddingVertical: 20,
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
    },
    buttonText: { color: '#000', fontSize: 24 }
});