import { Drawer } from 'expo-router/drawer';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
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
                <Drawer.Screen name="profile" options={{ drawerLabel: 'Profil gracza' }} />
                <Drawer.Screen name="guide" options={{ drawerLabel: 'Poradnik o tysiącu' }} />
                <Drawer.Screen name="index" options={{ drawerLabel: 'Ekran startowy' }} />

                <Drawer.Screen name="setup" options={{ drawerItemStyle: { display: 'none' } }} />
                <Drawer.Screen name="login" options={{ drawerItemStyle: { display: 'none' } }} />
                <Drawer.Screen name="register" options={{ drawerItemStyle: { display: 'none' } }} />
            </Drawer>
        </GestureHandlerRootView>
    );
}