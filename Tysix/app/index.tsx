import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';

export default function MainMenuScreen() {
    const [hasActiveGame, setHasActiveGame] = useState(false);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            const checkActiveGame = async () => {
                try {
                    const savedGame = await AsyncStorage.getItem('active_game');
                    setHasActiveGame(savedGame !== null);
                } catch (e) {
                    console.error("Błąd sprawdzania aktywnej gry", e);
                } finally {
                    setLoading(false);
                }
            };
            checkActiveGame();
        }, [])
    );

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
                        gameId: gameData.gameId,
                        playerCount: gameData.playerCount
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

                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/images/logo.jpg')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.buttonContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#f4ebd0" />
                    ) : (
                        <>
                            <Pressable
                                style={styles.button}
                                onPress={() => router.push('/setup')}
                            >
                                <Text style={styles.buttonText}>NOWA GRA</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.button, !hasActiveGame && styles.disabledButton]}
                                onPress={handleResumeGame}
                            >
                                <Text style={[styles.buttonText, !hasActiveGame && styles.disabledButtonText]}>
                                    WZNÓW GRĘ
                                </Text>
                            </Pressable>
                        </>
                    )}
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20
    },
    logoContainer: {
        flex: 1.8,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingTop: 20,
    },
    logoImage: {
        width: '90%',
        height: '90%',
    },
    buttonContainer: {
        flex: 1.2,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    button: {
        backgroundColor: '#f4ebd0',
        width: '85%',
        paddingVertical: 16,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#c5a059',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 6,
    },
    buttonText: {
        color: '#102a22',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 2
    },
    disabledButton: {
        backgroundColor: '#16352b',
        borderColor: '#22463b',
        shadowOpacity: 0,
        elevation: 0,
    },
    disabledButtonText: {
        color: '#22463b',
    }
});