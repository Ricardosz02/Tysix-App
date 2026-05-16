import { Session } from '@supabase/supabase-js';
import { Drawer } from 'expo-router/drawer';
import { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                screenOptions={{
                    headerShown: false,
                    drawerStyle: { backgroundColor: '#1e1e1e' },
                    drawerActiveTintColor: '#ffffff',
                    drawerInactiveTintColor: '#888888',
                }}
            >
                <Drawer.Screen name="settings" options={{ drawerLabel: 'Ustawienia' }} />
                <Drawer.Screen name="history" options={{ drawerLabel: 'Historia Gier i Statystyki' }} />
                <Drawer.Screen name="dashboard" options={{ drawerLabel: 'Tabela wyników' }} />

                <Drawer.Screen
                    name="profile"
                    options={{
                        drawerLabel: 'Profil gracza',
                        drawerItemStyle: { display: session ? 'flex' : 'none' }
                    }}
                />

                <Drawer.Screen name="guide" options={{ drawerLabel: 'Poradnik o tysiącu' }} />
                <Drawer.Screen name="index" options={{ drawerLabel: 'Ekran startowy' }} />

                <Drawer.Screen
                    name="login"
                    options={{
                        drawerLabel: 'Logowanie',
                        drawerItemStyle: { display: session ? 'none' : 'flex' }
                    }}
                />

                <Drawer.Screen name="setup" options={{ drawerItemStyle: { display: 'none' } }} />
                <Drawer.Screen name="register" options={{ drawerItemStyle: { display: 'none' } }} />
            </Drawer>
        </GestureHandlerRootView>
    );
}