import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { getDb } from '../db/schema';

export default function TripsListScreen() {
    const [trips, setTrips] = useState([]);

    useEffect(() => {
        refreshTrips();
    }, []);

    const refreshTrips = () => {
        getDb().transaction(tx => {
            tx.executeSql('SELECT * FROM trips', [], (_, { rows }) => {
                setTrips(rows._array);
            });
        });
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={trips}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <Link href={`./trip/${item.id}`} asChild>
                        <TouchableOpacity style={styles.card}>
                            <Text style={styles.title}>{item.name}</Text>
                            <Text>{item.location}</Text>
                            <Text style={styles.date}>{item.startDate} - {item.endDate}</Text>
                        </TouchableOpacity>
                    </Link>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No upcoming trips</Text>}
            />

            <Link href="/create-trip" asChild>
                <TouchableOpacity style={styles.fab}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
    card: { padding: 16, backgroundColor: 'white', marginBottom: 12, borderRadius: 8, elevation: 2 },
    title: { fontSize: 18, fontWeight: 'bold' },
    date: { color: 'gray', marginTop: 4 },
    empty: { textAlign: 'center', marginTop: 50, color: 'gray' },
    fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center' },
    fabText: { color: 'white', fontSize: 24, fontWeight: 'bold' }
});
