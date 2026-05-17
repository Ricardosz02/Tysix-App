import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

export default function SettingsScreen() {
    const [barrelThreshold, setBarrelThreshold] = useState(800);
    const [hapticsEnabled, setHapticsEnabled] = useState(true);
    const [soundsEnabled, setSoundsEnabled] = useState(true);

    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            loadSettings();
        }, [])
    );

    const loadSettings = async () => {
        const savedThreshold = await AsyncStorage.getItem('settings_barrel');
        if (savedThreshold) setBarrelThreshold(parseInt(savedThreshold));

        const savedHaptics = await AsyncStorage.getItem('settings_haptics');
        if (savedHaptics !== null) setHapticsEnabled(savedHaptics === 'true');

        const savedSounds = await AsyncStorage.getItem('settings_sounds');
        if (savedSounds !== null) setSoundsEnabled(savedSounds === 'true');

        const pendingGames = await AsyncStorage.getItem('pending_sync_games');
        if (pendingGames) {
            setPendingCount(JSON.parse(pendingGames).length);
        } else {
            setPendingCount(0);
        }
    };

    const toggleThreshold = async () => {
        if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newValue = barrelThreshold === 800 ? 900 : 800;
        setBarrelThreshold(newValue);
        await AsyncStorage.setItem('settings_barrel', newValue.toString());
    };

    const toggleHaptics = async () => {
        const newValue = !hapticsEnabled;
        if (newValue) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setHapticsEnabled(newValue);
        await AsyncStorage.setItem('settings_haptics', newValue.toString());
    };

    const toggleSounds = async () => {
        if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newValue = !soundsEnabled;
        setSoundsEnabled(newValue);
        await AsyncStorage.setItem('settings_sounds', newValue.toString());
    };

    const handleSyncOfflineGames = async () => {
        if (pendingCount === 0 || isSyncing) return;
        if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        setIsSyncing(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert("Brak logowania", "Zaloguj się w aplikacji, aby przesłać gry na swoje konto chmurowe.");
                setIsSyncing(false);
                return;
            }

            const stored = await AsyncStorage.getItem('pending_sync_games');
            if (!stored) {
                setIsSyncing(false);
                return;
            }

            const pendingGames = JSON.parse(stored);
            let successCount = 0;

            for (const game of pendingGames) {
                const { data: gameData, error: gameError } = await supabase
                    .from('games')
                    .insert([{ user_id: user.id, created_at: game.createdAt }])
                    .select()
                    .single();

                if (gameError) throw gameError;

                const gameId = gameData.id;
                const scoresToInsert = game.scores.map((s: any) => ({
                    game_id: gameId,
                    player_name: s.player_name,
                    score: s.score,
                    is_winner: s.is_winner
                }));

                const { error: scoresError } = await supabase
                    .from('game_scores')
                    .insert(scoresToInsert);

                if (scoresError) throw scoresError;
                successCount++;
            }

            await AsyncStorage.removeItem('pending_sync_games');
            setPendingCount(0);

            if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Synchronizacja ukończona! 🎉", `Pomyślnie wysłano zaległe rozgrywki (${successCount}) do bazy danych.`);

        } catch (error) {
            console.error("Błąd synchronizacji offline:", error);
            Alert.alert("Błąd połączenia", "Nie udało się połączyć z bazą Supabase. Spróbuj ponownie, gdy będziesz mieć lepszy zasięg internetu.");
        } finally {
            setIsSyncing(false);
        }
    };

    const clearAllData = () => {
        if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            "⚠️ UWAGA!",
            "Czy na pewno chcesz usunąć całą historię gier i zresetować ustawienia? Tego nie da się cofnąć.",
            [
                {
                    text: "Anuluj",
                    style: "cancel",
                    onPress: () => hapticsEnabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                },
                {
                    text: "TAK, USUŃ WSZYSTKO",
                    style: "destructive",
                    onPress: async () => {
                        if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        await AsyncStorage.clear();

                        setBarrelThreshold(800);
                        setHapticsEnabled(true);
                        setSoundsEnabled(true);
                        setPendingCount(0);

                        Alert.alert("Sukces", "Pamięć aplikacji została wyczyszczona.");
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Header />

            <ScrollView contentContainerStyle={styles.content}>
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

                    <View style={styles.optionRow}>
                        <View style={styles.textWrapper}>
                            <Text style={styles.optionLabel}>Wibracje</Text>
                            <Text style={styles.optionDesc}>Reakcja telefonu na dotyk</Text>
                        </View>
                        <Pressable
                            style={[styles.toggleBtn, !hapticsEnabled && styles.toggleBtnDisabled]}
                            onPress={toggleHaptics}
                        >
                            <Text style={[styles.toggleBtnText, !hapticsEnabled && styles.toggleBtnTextDisabled]}>
                                {hapticsEnabled ? 'WŁĄCZONE' : 'WYŁĄCZONE'}
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.optionRow}>
                        <View style={styles.textWrapper}>
                            <Text style={styles.optionLabel}>Dźwięki w grze</Text>
                            <Text style={styles.optionDesc}>Żetony meldunków i fanfary wygranej</Text>
                        </View>
                        <Pressable
                            style={[styles.toggleBtn, !soundsEnabled && styles.toggleBtnDisabled]}
                            onPress={toggleSounds}
                        >
                            <Text style={[styles.toggleBtnText, !soundsEnabled && styles.toggleBtnTextDisabled]}>
                                {soundsEnabled ? 'WŁĄCZONE' : 'WYŁĄCZONE'}
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.optionRow}>
                        <View style={styles.textWrapper}>
                            <Text style={styles.optionLabel}>Gry w pamięci offline</Text>
                            <Text style={styles.optionDesc}>
                                {pendingCount === 0
                                    ? 'Wszystkie dane są aktualne ✓'
                                    : `Mecze czekające na internet: ${pendingCount}`}
                            </Text>
                        </View>
                        <Pressable
                            style={[
                                styles.toggleBtn,
                                pendingCount === 0 && styles.toggleBtnDisabled,
                                isSyncing && { backgroundColor: '#16352b' }
                            ]}
                            onPress={handleSyncOfflineGames}
                            disabled={pendingCount === 0 || isSyncing}
                        >
                            {isSyncing ? (
                                <ActivityIndicator size="small" color="#c5a059" />
                            ) : (
                                <Text style={[styles.toggleBtnText, pendingCount === 0 && styles.toggleBtnTextDisabled]}>
                                    {pendingCount === 0 ? 'SYNCHRO ✓' : 'WYŚLIJ'}
                                </Text>
                            )}
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
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#102a22' },
    content: { alignItems: 'center', paddingTop: 20, paddingBottom: 40 },
    titleContainer: { backgroundColor: '#16352b', paddingVertical: 10, paddingHorizontal: 40, borderRadius: 20, marginBottom: 30, borderWidth: 1, borderColor: '#c5a059' },
    pageTitle: { fontSize: 16, color: '#f4ebd0', fontWeight: 'bold', letterSpacing: 1 },
    optionsContainer: { backgroundColor: '#0d221b', width: '90%', padding: 22, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(197, 160, 89, 0.4)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },
    optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    textWrapper: { flex: 1, paddingRight: 10 },
    optionLabel: { color: '#f4ebd0', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
    optionDesc: { color: '#c5a059', fontSize: 11, opacity: 0.8, marginTop: 3 },
    toggleBtn: { backgroundColor: '#f4ebd0', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 25, borderWidth: 1, borderColor: '#c5a059', minWidth: 115, alignItems: 'center' },
    toggleBtnText: { color: '#102a22', fontWeight: 'bold', fontSize: 12, letterSpacing: 0.5 },
    toggleBtnDisabled: { backgroundColor: '#16352b', borderColor: 'rgba(197, 160, 89, 0.3)' },
    toggleBtnTextDisabled: { color: '#c5a059', opacity: 0.7 },
    divider: { height: 1, backgroundColor: 'rgba(197, 160, 89, 0.2)', marginVertical: 18 },
    dangerZone: { marginTop: 5 },
    dangerTitle: { color: '#ff4d4d', fontWeight: 'bold', marginBottom: 15, fontSize: 13, letterSpacing: 1 },
    clearButton: { backgroundColor: 'rgba(255, 77, 77, 0.06)', padding: 15, borderRadius: 25, alignItems: 'center', borderWidth: 1.5, borderColor: '#ff4d4d' },
    clearButtonText: { color: '#ff4d4d', fontWeight: 'bold', letterSpacing: 1, fontSize: 13 }
});