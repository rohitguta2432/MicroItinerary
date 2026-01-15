import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import * as Crypto from 'expo-crypto';
import { getDb } from '../../../db/schema';
import { addToSyncQueue } from '../../../services/syncService';

export default function PlacesScreen() {
    const { id } = useLocalSearchParams();
    const [places, setPlaces] = useState([]);
    const [newPlace, setNewPlace] = useState('');

    useEffect(() => {
        refreshPlaces();
    }, [id]);

    const refreshPlaces = () => {
        getDb().transaction(tx => {
            tx.executeSql(
                'SELECT * FROM places WHERE tripId = ? AND isScheduled = 0',
                [id],
                (_, { rows }) => setPlaces(rows._array)
            );
        });
    };

    const addPlace = () => {
        if (!newPlace) return;
        const placeId = Crypto.randomUUID();
        const now = new Date().toISOString();

        // Quick heuristic for Google Maps URL
        let name = newPlace;
        let url = null;
        if (newPlace.includes('maps.google.com') || newPlace.includes('goo.gl')) {
            url = newPlace;
            name = "New Place (from URL)"; // Real app would extract title
        }

        const item = { id: placeId, tripId: id, name, sourceUrl: url, isScheduled: false, createdAt: now, updatedAt: now };

        getDb().transaction(tx => {
            tx.executeSql(
                'INSERT INTO places (id, tripId, name, sourceUrl, isScheduled, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [item.id, item.tripId, item.name, item.sourceUrl, 0, item.createdAt, item.updatedAt],
                () => {
                    addToSyncQueue('PLACE', placeId, 'CREATE', item);
                    setNewPlace('');
                    refreshPlaces();
                }
            );
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newPlace}
                    onChangeText={setNewPlace}
                    placeholder="Place name or Maps URL"
                />
                <Button title="Add" onPress={addPlace} />
            </View>

            <FlatList
                data={places}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.name}>{item.name}</Text>
                        {item.sourceUrl && <Text style={styles.link}>Link attached</Text>}
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    inputContainer: { flexDirection: 'row', marginBottom: 16 },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', marginRight: 10, padding: 8, borderRadius: 4 },
    card: { padding: 12, backgroundColor: 'white', marginBottom: 8, borderRadius: 4 },
    name: { fontSize: 16 },
    link: { color: 'blue', fontSize: 12 }
});
