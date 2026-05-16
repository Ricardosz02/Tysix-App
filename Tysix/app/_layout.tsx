import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Session } from '@supabase/supabase-js';
import { router, useSegments } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from '../lib/supabase';

function CustomDrawerContent(props: any) {
    return (
        <DrawerContentScrollView {...props} style={{ backgroundColor: '#0d221b' }}>
            <View style={styles.drawerHeader}>
                <Image
                    source={require('../assets/images/logo.jpg')}
                    style={styles.drawerLogo}
                    resizeMode="contain"
                />
                <View style={styles.goldDivider} />
            </View>
            <DrawerItemList {...props} />
            <View style={styles.drawerFooter}>
                <Text style={styles.footerVersion}>TYSIX PREMIUM • v1.2</Text>
            </View>
        </DrawerContentScrollView>
    );
}

export default function RootLayout() {
    const [session, setSession] = useState<Session | null>(null);
    const [authInitialized, setAuthInitialized] = useState(false);
    const segments = useSegments();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setAuthInitialized(true);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setAuthInitialized(true);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!authInitialized) return;
        const currentSegment = segments[0];
        const protectedRoutes = ['profile'];

        if (!session && protectedRoutes.includes(currentSegment)) {
            router.replace('/login');
        }
    }, [session, segments, authInitialized]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    headerShown: false,
                    drawerStyle: {
                        backgroundColor: '#0d221b',
                        width: 280
                    },
                    drawerActiveBackgroundColor: '#c5a059',
                    drawerActiveTintColor: '#102a22',
                    drawerInactiveTintColor: '#f4ebd0',
                    drawerLabelStyle: {
                        fontWeight: 'bold',
                        fontSize: 14,
                        letterSpacing: 1,
                    },
                    drawerItemStyle: {
                        borderRadius: 10,
                        marginVertical: 4,
                    }
                }}
            >
                <Drawer.Screen
                    name="index"
                    options={{
                        drawerLabel: 'Ekran Startowy',
                        drawerIcon: ({ color }) => <Ionicons name="home" size={20} color={color} />
                    }}
                />

                <Drawer.Screen
                    name="dashboard"
                    options={{
                        drawerLabel: 'Tabela Wyników',
                        drawerIcon: ({ color }) => <Ionicons name="grid" size={20} color={color} />
                    }}
                />

                <Drawer.Screen
                    name="leaderboard"
                    options={{
                        drawerLabel: 'Ranking Globalny 🏆',
                        drawerIcon: ({ color }) => <Ionicons name="trophy" size={20} color={color} />
                    }}
                />

                <Drawer.Screen
                    name="history"
                    options={{
                        drawerLabel: 'Historia Gier',
                        drawerIcon: ({ color }) => <Ionicons name="time" size={20} color={color} />
                    }}
                />

                <Drawer.Screen
                    name="profile"
                    options={{
                        drawerLabel: 'Mój Profil',
                        drawerIcon: ({ color }) => <Ionicons name="person" size={20} color={color} />,
                        drawerItemStyle: { display: session ? 'flex' : 'none' }
                    }}
                />

                <Drawer.Screen
                    name="settings"
                    options={{
                        drawerLabel: 'Ustawienia',
                        drawerIcon: ({ color }) => <Ionicons name="settings" size={20} color={color} />
                    }}
                />

                <Drawer.Screen
                    name="guide"
                    options={{
                        drawerLabel: 'Jak grać?',
                        drawerIcon: ({ color }) => <Ionicons name="book" size={20} color={color} />
                    }}
                />

                <Drawer.Screen
                    name="login"
                    options={{
                        drawerLabel: 'Zaloguj się',
                        drawerIcon: ({ color }) => <Ionicons name="log-in" size={20} color={color} />,
                        drawerItemStyle: { display: session ? 'none' : 'flex' }
                    }}
                />

                <Drawer.Screen name="setup" options={{ drawerItemStyle: { display: 'none' } }} />
                <Drawer.Screen name="register" options={{ drawerItemStyle: { display: 'none' } }} />
            </Drawer>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    drawerHeader: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    drawerLogo: {
        width: 180,
        height: 100,
        marginBottom: 10,
    },
    goldDivider: {
        height: 1,
        backgroundColor: '#c5a059',
        width: '100%',
        marginTop: 10,
        opacity: 0.5,
    },
    drawerFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(197, 160, 89, 0.2)',
        marginTop: 20,
    },
    footerVersion: {
        color: '#c5a059',
        fontSize: 10,
        textAlign: 'center',
        opacity: 0.5,
        letterSpacing: 1,
    }
});