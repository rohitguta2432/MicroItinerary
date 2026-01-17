import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Button, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useTripStore, ItineraryItem } from '../../../store/useTripStore';

export default function ItineraryScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { itineraryItems, loadItinerary, addItineraryItem } = useTripStore();

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [newItemName, setNewItemName] = useState('');

    useFocusEffect(
        useCallback(() => {
            if (id) {
                loadItinerary(id);
            }
        }, [id])
    );

    const handleAddItem = async () => {
        if (!newItemName.trim()) {
            Alert.alert("Required", "Please enter an activity name");
            return;
        }
        if (!id) return;

        try {
            // Defaulting to day '1' for simpler MVP demo
            await addItineraryItem(id, newItemName, '1');
            setNewItemName('');
            setModalVisible(false);
        } catch (error) {
            Alert.alert("Error", "Failed to add activity");
        }
    };

    const renderItem = ({ item }: { item: ItineraryItem }) => (
        <View style={styles.timeBlock}>
            <Text style={styles.itemTitle}>{item.placeName}</Text>
            {item.startTime && <Text style={styles.itemTime}>{new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Itinerary</Text>
            <Text style={styles.subtext}>Day 1</Text>

            <FlatList
                data={itineraryItems}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 80 }}
                ListEmptyComponent={<Text style={styles.empty}>No activities planned.</Text>}
            />

            <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                <Text style={styles.addBtnText}>+ Add Activity</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>New Activity</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Activity Name (e.g. Eiffel Tower)"
                            value={newItemName}
                            onChangeText={setNewItemName}
                        />
                        <View style={styles.modalButtons}>
                            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
                            <Button title="Add" onPress={handleAddItem} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
    header: { fontSize: 20, fontWeight: 'bold' },
    subtext: { fontSize: 16, marginTop: 10, fontWeight: '600', marginBottom: 10 },
    timeBlock: { padding: 15, backgroundColor: 'white', marginVertical: 5, borderRadius: 8, elevation: 1 },
    itemTitle: { fontSize: 16, fontWeight: '500' },
    itemTime: { fontSize: 12, color: 'gray', marginTop: 4 },
    empty: { textAlign: 'center', marginTop: 20, color: 'gray' },
    addBtn: { position: 'absolute', bottom: 20, right: 20, backgroundColor: 'blue', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, elevation: 5 },
    addBtnText: { color: 'white', fontWeight: 'bold' },

    // Modal
    modalView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 20 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' }
});
