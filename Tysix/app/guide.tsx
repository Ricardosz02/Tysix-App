import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';

export default function GuideScreen() {
    return (
        <View style={styles.container}>
            <Header />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.titleContainer}>
                    <Text style={styles.pageTitle}>ZASADY GRY W TYSIĄCA</Text>
                </View>

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>🎯 Cel Gry</Text>
                    <Text style={styles.sectionText}>
                        Głównym celem jest uzbieranie równego 1000 punktów.
                        Każde rozdanie składa się z licytacji, wymiany kart (musik) oraz zbierania lew. W naszej aplikacji w wariancie na 4 osoby, jedna z osób w każdej rundzie pauzuje (wpisujemy jej 0).
                    </Text>
                </View>

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>🃏 Wartość Kart</Text>
                    <View style={styles.row}>
                        <Text style={styles.listItem}>As (A)</Text>
                        <Text style={styles.listValue}>11 pkt</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.listItem}>Dziesiątka (10)</Text>
                        <Text style={styles.listValue}>10 pkt</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.listItem}>Król (K)</Text>
                        <Text style={styles.listValue}>4 pkt</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.listItem}>Dama (D)</Text>
                        <Text style={styles.listValue}>3 pkt</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.listItem}>Walet (W)</Text>
                        <Text style={styles.listValue}>2 pkt</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.listItem}>Dziewiątka (9)</Text>
                        <Text style={styles.listValue}>0 pkt</Text>
                    </View>
                    <Text style={styles.noteText}>Razem do zdobycia w kartach: 120 punktów</Text>
                </View>

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>👑 Meldunki (Pary K+D)</Text>
                    <Text style={styles.sectionText}>
                        Posiadanie Króla i Damy w tym samym kolorze pozwala na zgłoszenie meldunku. Zgłasza się go rzucając jedną z tych kart, pod warunkiem wzięcia wcześniej chociaż jednej lewy:
                    </Text>
                    <View style={styles.row}>
                        <Text style={styles.listItem}>♠ Pik (Wino)</Text>
                        <Text style={styles.listValue}>40 pkt</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.listItem}>♣ Trefl (Żołądź)</Text>
                        <Text style={styles.listValue}>60 pkt</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.listItem, { color: '#ff4d4d' }]}>♦ Karo (Dzwonek)</Text>
                        <Text style={[styles.listValue, { color: '#ff4d4d' }]}>80 pkt</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.listItem, { color: '#ff4d4d' }]}>♥ Kier (Czerwień)</Text>
                        <Text style={[styles.listValue, { color: '#ff4d4d' }]}>100 pkt</Text>
                    </View>
                </View>

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>🥁 Zasada Bębna (800 pkt)</Text>
                    <Text style={styles.sectionText}>
                        Gdy gracz osiągnie 800 punktów, "wskakuje na bęben". Od tego momentu w naszej aplikacji obowiązują restrykcyjne zasady:
                    </Text>
                    <Text style={styles.bulletPoint}>• Małe punkty przepadają (wynik zatrzymuje się na 800).</Text>
                    <Text style={styles.bulletPoint}>• Aby wygrać, gracz musi ugrać brakujące punkty (do 1000) w jednym rozdaniu.</Text>
                    <Text style={styles.bulletPoint}>• Jeśli gracz wtopi (zdobędzie punkty ujemne), normalnie spada z bębna poniżej 800 punktów.</Text>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#102a22'
    },
    scrollContent: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 40
    },
    titleContainer: {
        backgroundColor: '#16352b',
        paddingVertical: 12,
        paddingHorizontal: 35,
        borderRadius: 20,
        marginBottom: 25,
        width: '90%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#c5a059'
    },
    pageTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f4ebd0',
        letterSpacing: 1
    },
    sectionCard: {
        backgroundColor: '#0d221b',
        width: '90%',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(197, 160, 89, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4
    },
    sectionTitle: {
        color: '#c5a059',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(197, 160, 89, 0.2)',
        paddingBottom: 6,
        letterSpacing: 0.5
    },
    sectionText: {
        color: '#f4ebd0',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 10,
        opacity: 0.9
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(197, 160, 89, 0.1)'
    },
    listItem: {
        color: '#f4ebd0',
        fontSize: 15,
        fontWeight: 'bold'
    },
    listValue: {
        color: '#c5a059',
        fontSize: 15,
        fontWeight: '600'
    },
    noteText: {
        color: '#c5a059',
        fontSize: 12,
        marginTop: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        opacity: 0.7
    },
    bulletPoint: {
        color: '#f4ebd0',
        fontSize: 14,
        lineHeight: 22,
        marginLeft: 6,
        marginBottom: 6,
        opacity: 0.9
    }
});