import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';

export default function HistoryScreen() {
    // Przykładowe dane dla widoku (później zastąpimy je danymi z AsyncStorage)
    const gamesHistory = [
        { id: 1, title: 'GRA NR 1', score: '80 : 65', group1: ['P1', 'P2'], group2: ['P3', 'P4'] },
        { id: 2, title: 'GRA NR 2', score: '91 : 23', group1: ['P1', 'P2'], group2: ['P3', 'P4'] },
        { id: 3, title: 'GRA NR 3', score: '21 : 37', group1: ['P1', 'P2'], group2: ['P3', 'P4'] },
    ];

    return (
        <View style={styles.container}>
            <Header />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.titleContainer}>
                    <Text style={styles.pageTitle}>HISTORIA GIER</Text>
                </View>

                {gamesHistory.map((game) => (
                    <View key={game.id} style={styles.gameCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardHeaderText}>{game.title}</Text>
                        </View>

                        <View style={styles.cardBody}>
                            <View style={styles.groupSection}>
                                <Text style={styles.groupLabel}>GRUPA NR 1</Text>
                                <View style={styles.iconsRow}>
                                    <View style={styles.smallAvatar} />
                                    <View style={styles.smallAvatar} />
                                </View>
                            </View>

                            <View style={styles.scoreSection}>
                                <Text style={styles.scoreLabel}>WYNIK:</Text>
                                <Text style={styles.scoreValue}>{game.score}</Text>
                            </View>

                            <View style={styles.groupSection}>
                                <Text style={styles.groupLabel}>GRUPA NR 2</Text>
                                <View style={styles.iconsRow}>
                                    <View style={styles.smallAvatar} />
                                    <View style={styles.smallAvatar} />
                                </View>
                            </View>
                        </View>
                    </View>
                ))}

                <Pressable
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Wstecz</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e1e1e',
    },
    scrollContent: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    titleContainer: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 5,
        marginVertical: 20,
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    gameCard: {
        backgroundColor: '#e0e0e0',
        width: '90%',
        borderRadius: 8,
        marginBottom: 20,
        overflow: 'hidden',
    },
    cardHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 8,
        alignItems: 'center',
    },
    cardHeaderText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#000',
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        alignItems: 'center',
    },
    groupSection: {
        alignItems: 'center',
    },
    groupLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    iconsRow: {
        flexDirection: 'row',
    },
    smallAvatar: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        backgroundColor: '#000',
        marginHorizontal: 2,
    },
    scoreSection: {
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: 8,
        fontWeight: 'bold',
    },
    scoreValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    backButton: {
        marginTop: 10,
        padding: 10,
    },
    backButtonText: {
        color: '#e0e0e0',
        fontSize: 16,
        textDecorationLine: 'underline',
    }
});