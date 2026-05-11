import { DrawerActions } from '@react-navigation/native';
import { router, useNavigation } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Header() {
    // Hook pozwalający na komunikację z menu bocznym
    const navigation = useNavigation();

    return (
        <View style={styles.headerContainer}>

            {/* Przycisk Logo/Menu - Teraz OTWIERA MENU BOCZNE */}
            <Pressable
                style={styles.menuButton}
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
                <Text style={styles.menuText}>LOGO/{"\n"}MENU</Text>
            </Pressable>

            {/* Prawa strona: Nick i Awatar - Przenosi do Logowania */}
            <Pressable
                style={styles.userSection}
                onPress={() => router.push('/login')}
            >
                <View style={styles.nickBox}>
                    <Text style={styles.nickText}>NICK GRACZA</Text>
                </View>
                <View style={styles.avatar}>
                    {/* Miejsce na ikonę */}
                </View>
            </Pressable>

        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#1e1e1e',
    },
    menuButton: {
        backgroundColor: '#e0e0e0',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
    },
    menuText: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nickBox: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 5,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    nickText: {
        fontWeight: 'bold',
        color: '#000',
        fontSize: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
    }
});