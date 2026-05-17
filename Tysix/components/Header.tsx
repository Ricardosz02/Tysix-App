import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { router, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Header() {
    const navigation = useNavigation();

    const [username, setUsername] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setIsLoggedIn(true);
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('username, avatar_url')
                    .eq('id', user.id)
                    .single();

                if (profileData) {
                    setUsername(profileData.username);
                    setAvatarUrl(profileData.avatar_url);
                }
            } else {
                setIsLoggedIn(false);
                setUsername(null);
                setAvatarUrl(null);
            }
        };

        fetchUserData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                fetchUserData();
            } else {
                setIsLoggedIn(false);
                setUsername(null);
                setAvatarUrl(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleProfilePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (isLoggedIn) {
            router.push('/profile');
        } else {
            router.push('/login');
        }
    };

    return (
        <View style={styles.headerContainer}>

            <Pressable
                style={styles.menuButton}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.dispatch(DrawerActions.openDrawer());
                }}
            >
                <Ionicons name="menu" size={24} color="#c5a059" style={styles.menuIcon} />
                <Text style={styles.menuTextLabel}>MENU</Text>
            </Pressable>

            <Pressable
                style={styles.userBanner}
                onPress={handleProfilePress}
            >
                <View style={styles.nickBox}>
                    <Text style={styles.nickText}>
                        {isLoggedIn && username ? username.toUpperCase() : 'ZALOGUJ SIĘ'}
                    </Text>
                </View>

                <View style={styles.avatar}>
                    {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarFallbackContainer}>
                            <View style={styles.avatarFallbackHead} />
                            <View style={styles.avatarFallbackBody} />
                        </View>
                    )}
                </View>
            </Pressable>

        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, backgroundColor: '#0d221b', borderBottomWidth: 1, borderColor: '#c5a059' },
    menuButton: { backgroundColor: '#16352b', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignItems: 'center', justifyContent: 'center', minWidth: 70, borderWidth: 1, borderColor: '#c5a059', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
    menuIcon: { marginBottom: -2 },
    menuTextLabel: { fontSize: 9, fontWeight: 'bold', textAlign: 'center', color: '#c5a059', letterSpacing: 1 },
    userBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16352b', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 25, borderWidth: 1.5, borderColor: '#c5a059', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
    nickBox: { marginRight: 10, justifyContent: 'center' },
    nickText: { fontWeight: 'bold', color: '#f4ebd0', fontSize: 11, letterSpacing: 1 },
    avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0d221b', borderWidth: 1, borderColor: '#c5a059', overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    avatarFallbackContainer: { width: '100%', height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
    avatarFallbackHead: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#c5a059', marginBottom: 1 },
    avatarFallbackBody: { width: 18, height: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: '#c5a059' }
});