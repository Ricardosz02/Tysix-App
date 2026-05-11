import { StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';

export default function SettingsScreen() {
    return (
        <View style={styles.container}>
            <Header />

            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={styles.pageTitle}>USTAWIENIA</Text>
                </View>

                <View style={styles.optionsContainer}>
                    <Text style={styles.placeholderText}>
                        WSZYSTKIE{"\n"}OPCJE{"\n"}USTAWIEŃ
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e1e1e', // Dark mode
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
    },
    titleContainer: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 5,
        marginBottom: 30,
    },
    pageTitle: {
        fontSize: 20,
        color: '#000',
    },
    optionsContainer: {
        backgroundColor: '#e0e0e0',
        width: '80%',
        flex: 0.7, // Zajmuje 70% dostępnej przestrzeni pod spodem
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    placeholderText: {
        color: '#000',
        fontSize: 24,
        textAlign: 'center',
        lineHeight: 35,
    }
});