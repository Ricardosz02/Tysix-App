import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
    const [username, setUsername] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);

            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                console.log("Brak aktywnej sesji.");
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error("Błąd pobierania danych z bazy:", error);
            } else if (data) {
                setUsername(data.username);
            }
        } catch (error) {
            console.error("Wystąpił nieoczekiwany błąd:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            Alert.alert("Błąd", "Nie udało się wylogować. Spróbuj ponownie.");
            console.error(error);
        } else {
            router.replace('/login');
        }
    };

    return (
        <View style={styles.container}>
            <Header />

            <View style={styles.content}>
                <View style={styles.profileCard}>

                    <View style={styles.avatarLarge}>
                        <View style={styles.avatarHead} />
                        <View style={styles.avatarBody} />
                    </View>

                    <View style={styles.nickContainer}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Text style={styles.nickText}>
                                {username ? username.toUpperCase() : 'NIEZNANY GRACZ'}
                            </Text>
                        )}
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>INFORMACJE O GRACZU</Text>
                    </View>

                    <Pressable style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>WYLOGUJ SIĘ</Text>
                    </Pressable>

                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e1e1e',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    profileCard: {
        backgroundColor: '#151515',
        width: '90%',
        height: '85%',
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 30,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    avatarLarge: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#e0e0e0',
        justifyContent: 'flex-end',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 30,
    },
    avatarHead: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#000',
        marginBottom: 5,
    },
    avatarBody: {
        width: 120,
        height: 60,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        backgroundColor: '#000',
    },
    nickContainer: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 5,
        marginBottom: 30,
        width: '80%',
        alignItems: 'center',
        height: 40,
        justifyContent: 'center',
    },
    nickText: {
        fontSize: 16,
        color: '#000',
        fontWeight: 'bold',
    },
    infoContainer: {
        backgroundColor: '#e0e0e0',
        width: '80%',
        flex: 1,
        marginBottom: 30,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        color: '#000',
        fontSize: 16,
    },
    logoutButton: {
        backgroundColor: '#ff4d4d',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 5,
        width: '80%',
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    }
});