import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTripStore, Trip } from '../src/store/useTripStore';
import { syncData } from '../src/services/SyncService';
import dayjs from 'dayjs';

export default function TripListScreen() {
    const router = useRouter();
    const { trips, loadTrips, isLoading } = useTripStore();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadTrips();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await syncData();
        await loadTrips();
        setRefreshing(false);
    };

    const renderItem = ({ item }: { item: Trip }) => (
        <Link href={`/trip/${item.id}`} asChild>
            <TouchableOpacity style={styles.card}>
                <View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDate}>
                        {dayjs(item.startDate).format('MMM D, YYYY')} - {dayjs(item.endDate).format('MMM D, YYYY')}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        router.push({
                            pathname: '/trip/modal', // TODO: Fix routing if needed, currently passing params via Global State or similar is tricky in Expo Router v2 without Search Params or Context. 
                            // For simplicity in this step, we will use query params or just support ADD for now.
                            // To support EDIT, we would pass ?id=...
                            params: { id: item.id }
                        });
                    }}
                    style={styles.editBtn}
                >
                    <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        </Link>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={trips}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No trips yet. Pull to sync or add one!</Text>
                }
            />

            <Link href="/trip/modal" asChild>
                <TouchableOpacity style={styles.fab}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardDate: {
        fontSize: 14,
        color: '#666',
    },
    editBtn: {
        padding: 8,
    },
    editBtnText: {
        color: '#007AFF',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#888',
        fontSize: 16
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
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fabText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
});
