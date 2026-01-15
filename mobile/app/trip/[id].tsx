import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import { useTripStore, ItineraryItem } from '../../src/store/useTripStore';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityItem } from '../../src/components/ActivityItem';
import dayjs from 'dayjs';

export default function TripDetails() {
    const { id } = useLocalSearchParams();
    const navigation = useNavigation();
    const { trips, itineraryItems, loadItinerary, addItineraryItem, reorderItineraryItems } = useTripStore();

    const trip = trips.find(t => t.id === id);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const [newActivityTitle, setNewActivityTitle] = useState('');
    const [newActivityTime, setNewActivityTime] = useState('09:00'); // Simple text for now

    useEffect(() => {
        if (id) {
            loadItinerary(id as string);
        }
    }, [id]);

    useEffect(() => {
        navigation.setOptions({ title: trip?.title || 'Trip Details' });
    }, [trip]);

    // Filter items for the selected day
    const dayItems = useMemo(() => {
        return itineraryItems.filter(item => item.dayIndex === selectedDayIndex);
    }, [itineraryItems, selectedDayIndex]);

    // Calculate days
    const days = useMemo(() => {
        if (!trip) return [];
        const start = dayjs(trip.startDate);
        const end = dayjs(trip.endDate);
        const diff = end.diff(start, 'day');
        return Array.from({ length: diff + 1 }, (_, i) => i);
    }, [trip]);

    const handleDragEnd = async ({ data }: { data: ItineraryItem[] }) => {
        // data is the new ordered list for this day
        // We need to merge this back into the full list
        // Actually reorderItineraryItems expects the FULL list or logic should be smart.
        // Current Store implementation: reorderItineraryItems takes a list and updates their orderIndex matching the array index.
        // So we need to only pass the items of this day, but update their orderIndex based on their new position.

        // Correct implementation:
        // 1. Map `data` to have updated orderIndex (0, 1, 2...)
        // 2. Call store action which updates DB

        const updatedItems = data.map((item, index) => ({
            ...item,
            orderIndex: index
        }));

        // Update local state is tricky if we just replace `itineraryItems`.
        // We should probably just pass these updated items to the store to update
        await reorderItineraryItems(updatedItems);
    };

    const handleAddActivity = async () => {
        if (!newActivityTitle) return;
        try {
            await addItineraryItem(id as string, newActivityTitle, selectedDayIndex);
            setAddModalVisible(false);
            setNewActivityTitle('');
        } catch (e) {
            Alert.alert("Error", "Could not add activity");
        }
    };

    if (!trip) return <View style={styles.center}><Text>Trip not found</Text></View>;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* Day Tabs */}
                <View style={styles.tabsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {days.map(dayIndex => (
                            <TouchableOpacity
                                key={dayIndex}
                                style={[styles.tab, selectedDayIndex === dayIndex && styles.activeTab]}
                                onPress={() => setSelectedDayIndex(dayIndex)}
                            >
                                <Text style={[styles.tabText, selectedDayIndex === dayIndex && styles.activeTabText]}>
                                    Day {dayIndex + 1}
                                </Text>
                                <Text style={styles.tabDate}>
                                    {dayjs(trip.startDate).add(dayIndex, 'day').format('MMM D')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Itinerary List */}
                <View style={styles.listContainer}>
                    <DraggableFlatList
                        data={dayItems}
                        onDragEnd={handleDragEnd}
                        keyExtractor={(item) => item.id}
                        renderItem={(props) => <ActivityItem {...props} />}
                        ListEmptyComponent={<Text style={styles.emptyText}>No activities for this day.</Text>}
                    />
                </View>

                <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>

                {/* Add Modal */}
                <Modal visible={isAddModalVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Add Activity (Day {selectedDayIndex + 1})</Text>
                            <TextInput
                                placeholder="Activity Title"
                                style={styles.input}
                                value={newActivityTitle}
                                onChangeText={setNewActivityTitle}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.cancelBtn}>
                                    <Text>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleAddActivity} style={styles.addBtn}>
                                    <Text style={{ color: 'white' }}>Add</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabsContainer: {
        height: 70,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    tab: {
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent'
    },
    activeTab: {
        borderBottomColor: '#007AFF'
    },
    tabText: {
        fontWeight: '600',
        color: '#666'
    },
    activeTabText: {
        color: '#007AFF'
    },
    tabDate: {
        fontSize: 10,
        color: '#999'
    },
    listContainer: {
        flex: 1,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#888'
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        backgroundColor: '#007AFF',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5
    },
    fabText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20
    },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
    cancelBtn: { padding: 10, marginRight: 10 },
    addBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5 }
});
