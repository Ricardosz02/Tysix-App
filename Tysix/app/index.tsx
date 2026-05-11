import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header'; // Importujemy nasz nowy nagłówek!

export default function MainMenuScreen() {
    return (
        <View style={styles.container}>
            {/* Wstawiamy nagłówek na samą górę */}
            <Header />

            {/* Główna zawartość ekranu */}
            <View style={styles.content}>
                <Pressable
                    style={styles.button}
                    onPress={() => router.push('/setup')} // Przejście do konfiguracji
                >
                    <Text style={styles.buttonText}>NOWA GRA</Text>
                </Pressable>

                <Pressable
                    style={styles.button}
                    onPress={() => router.push('/dashboard')} // Przejście do obecnej gry
                >
                    <Text style={styles.buttonText}>WZNÓW GRĘ</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e1e1e', // Zgodnie z makietą - ciemne tło całej aplikacji
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: '#e0e0e0', // Jasnoszary przycisk
        width: '80%',
        paddingVertical: 20,
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
    },
    buttonText: {
        color: '#000', // Czarny tekst na jasnym tle
        fontSize: 24,
        fontWeight: 'normal', // Na makiecie czcionka jest prosta, niespogrubiona
    }
});