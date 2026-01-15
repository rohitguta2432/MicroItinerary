import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTripStore } from '../../src/store/useTripStore';
import dayjs from 'dayjs';

export default function TripModal() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { addTrip, updateTrip, trips, deleteTrip } = useTripStore();

    const isEditing = !!params.id;
    const existingTrip = trips.find(t => t.id === params.id);

    const [title, setTitle] = useState(existingTrip?.title || '');
    // Simplified date input for now (YYYY-MM-DD)
    const [startDate, setStartDate] = useState(existingTrip?.startDate || dayjs().format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(existingTrip?.endDate || dayjs().add(7, 'day').format('YYYY-MM-DD'));

    useEffect(() => {
        if (existingTrip) {
            setTitle(existingTrip.title);
            setStartDate(existingTrip.startDate);
            setEndDate(existingTrip.endDate);
        }
    }, [existingTrip]);

    const handleSave = async () => {
        if (!title || !startDate || !endDate) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            if (isEditing) {
                await updateTrip(params.id as string, title, startDate, endDate);
            } else {
                await addTrip(title, startDate, endDate);
            }
            router.back();
        } catch (e) {
            Alert.alert('Error', 'Failed to save trip');
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            "Delete Trip",
            "Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: 'destructive',
                    onPress: async () => {
                        await deleteTrip(params.id as string);
                        router.back();
                    }
                }
            ]
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Destination / Title</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g., Paris Trip"
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Start Date</Text>
                    <TextInput
                        style={styles.input}
                        value={startDate}
                        onChangeText={setStartDate}
                        placeholder="YYYY-MM-DD"
                    />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>End Date</Text>
                    <TextInput
                        style={styles.input}
                        value={endDate}
                        onChangeText={setEndDate}
                        placeholder="YYYY-MM-DD"
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>{isEditing ? 'Update Trip' : 'Create Trip'}</Text>
            </TouchableOpacity>

            {isEditing && (
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <Text style={styles.deleteBtnText}>Delete Trip</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    formGroup: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '600',
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    saveBtn: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    deleteBtn: {
        marginTop: 15,
        padding: 16,
        alignItems: 'center'
    },
    deleteBtnText: {
        color: 'red',
        fontSize: 16
    }
});
