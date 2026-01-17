import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { getDb } from '../db/schema';
import { addToSyncQueue } from '../services/syncService';
import dayjs from 'dayjs';

export default function CreateTripScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(dayjs().add(5, 'day').format('YYYY-MM-DD'));

    const handleCreate = async () => {
        if (!name || !location) {
            Alert.alert('Error', 'Please fill required fields');
            return;
        }

        const tripId = Crypto.randomUUID();
        const now = new Date().toISOString();

        const trip = {
            id: tripId,
            name,
            location,
            startDate,
            endDate,
            travelType: 'LEISURE',
            createdAt: now,
            updatedAt: now
        };

        try {
            // 1. Local Write
            const db = getDb();
            await db.runAsync(
                'INSERT INTO trips (id, name, location, startDate, endDate, travelType, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)',
                [trip.id, trip.name, trip.location, trip.startDate, trip.endDate, trip.travelType, trip.createdAt, trip.updatedAt]
            );

            // 2. Queue for Sync
            // Ensure addToSyncQueue supports async as well if refactored, or is fire-and-forget
            addToSyncQueue('TRIP', tripId, 'CREATE', trip);

            // 3. Navigate back
            router.replace('/');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to create trip');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Trip Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Summer Vacation" />

            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g. Paris, France" />

            <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} />

            <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} />

            <Button title="Create Trip" onPress={handleCreate} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    label: { fontSize: 16, marginBottom: 5, marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 }
});
