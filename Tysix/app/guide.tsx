import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';

export default function GuideScreen() {
    return (
        <View style={styles.container}>
            <Header />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.titleContainer}>
                    <Text style={styles.pageTitle}>PORADNIK O TYSIĄCU</Text>
                </View>

                <View style={styles.guideContainer}>
                    {/* Tutaj w przyszłości wkleisz prawdziwe zasady gry */}
                    <Text style={styles.placeholderText}>PORADNIK</Text>

                    <Text style={styles.dummyText}>
                        1. Cel gry: Zdobycie 1000 punktów.{"\n\n"}
                        2. Wartości kart:{"\n"}
                        - As: 11 pkt{"\n"}
                        - Dziesiątka: 10 pkt{"\n"}
                        - Król: 4 pkt{"\n"}
                        - Dama: 3 pkt{"\n"}
                        - Walet: 2 pkt{"\n"}
                        - Dziewiątka: 0 pkt{"\n\n"}
                        3. Meldunki:{"\n"}
                        - Pik (♠): 40 pkt{"\n"}
                        - Trefl (♣): 60 pkt{"\n"}
                        - Karo (♦): 80 pkt{"\n"}
                        - Kier (♥): 100 pkt
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e1e1e', // Dark mode background
    },
    scrollContent: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 40,
    },
    titleContainer: {
        backgroundColor: '#e0e0e0', // Jasne tło tytułu
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 5,
        marginBottom: 30,
        width: '85%',
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 20,
        color: '#000',
    },
    guideContainer: {
        backgroundColor: '#e0e0e0', // Jasne tło kontenera
        width: '85%',
        minHeight: 400,
        padding: 30,
        borderRadius: 5,
        alignItems: 'center',
    },
    placeholderText: {
        color: '#000',
        fontSize: 28,
        marginBottom: 30,
    },
    dummyText: {
        color: '#333',
        fontSize: 14,
        lineHeight: 24,
        textAlign: 'left',
        width: '100%',
    }
});