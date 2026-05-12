import { StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';

export default function ProfileScreen() {
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
                        <Text style={styles.nickText}>NICK GRACZA</Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>INFORMACJE O GRACZU</Text>
                    </View>

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
    },
    nickText: {
        fontSize: 16,
        color: '#000',
    },
    infoContainer: {
        backgroundColor: '#e0e0e0',
        width: '80%',
        flex: 1,
        marginBottom: 40,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        color: '#000',
        fontSize: 16,
    }
});