import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { getDb } from '../../../db/schema';
// Note: Actual Drag & Drop requires 'react-native-draggable-flatlist' setup which might be complex without native build.
// Using standard List with "Move" actions for MVP robustness in pure JS.

export default function ItineraryScreen() {
    const { id } = useLocalSearchParams();
    const [days, setDays] = useState([]);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = () => {
        // Mock data for now, actual implementation needs Day generation logic
        // In a real app, we'd fetch TripDays and Activities joined
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Itinerary for Trip {id}</Text>
            <Text style={styles.subtext}>Day 1 - Morning</Text>
            {/* Placeholder for Draggable List */}
            <View style={styles.timeBlock}>
                <Text>Actitivity 1: Visit Museum</Text>
            </View>
            <View style={styles.timeBlock}>
                <Text>Actitivity 2: Lunch</Text>
            </View>
            <TouchableOpacity style={styles.addBtn}>
                <Text style={{ color: 'white' }}>+ Add Activity</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    header: { fontSize: 20, fontWeight: 'bold' },
    subtext: { fontSize: 16, marginTop: 10, fontWeight: '600' },
    timeBlock: { padding: 10, backgroundColor: 'white', marginVertical: 5, borderRadius: 5, elevation: 1 },
    addBtn: { backgroundColor: 'blue', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' }
});
