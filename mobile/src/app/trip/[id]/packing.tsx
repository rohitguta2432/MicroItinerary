import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { usePackingStore, PackingItem } from '../../../store/usePackingStore';
import { Ionicons } from '@expo/vector-icons';

export default function PackingScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { packingItems, isLoading, loadPackingItems, addPackingItem, togglePackingItem, deletePackingItem } = usePackingStore();
    const [newItemName, setNewItemName] = useState('');

    useEffect(() => {
        if (id) {
            loadPackingItems(id);
        }
    }, [id]);

    const handleAddItem = async () => {
        if (!newItemName.trim() || !id) return;
        try {
            await addPackingItem(id, newItemName.trim());
            setNewItemName('');
        } catch (e) {
            // Error handled in store
        }
    };

    const renderItem = ({ item }: { item: PackingItem }) => (
        <View style={styles.itemContainer}>
            <TouchableOpacity
                style={styles.checkbox}
                onPress={() => togglePackingItem(item.id, !item.isChecked)}
            >
                <Ionicons
                    name={item.isChecked ? "checkbox" : "square-outline"}
                    size={24}
                    color={item.isChecked ? "#4F46E5" : "#6B7280"}
                />
            </TouchableOpacity>

            <Text style={[styles.itemText, !!item.isChecked && styles.itemTextChecked]}>
                {item.name}
            </Text>

            <TouchableOpacity onPress={() => deletePackingItem(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Add item..."
                    value={newItemName}
                    onChangeText={setNewItemName}
                    onSubmitEditing={handleAddItem}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <Text style={styles.loadingText}>Loading...</Text>
            ) : (
                <FlatList
                    data={packingItems}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No items yet. Add one above!</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        padding: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    input: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: 8,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#4F46E5',
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    listContent: {
        paddingBottom: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    checkbox: {
        marginRight: 12,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
    },
    itemTextChecked: {
        textDecorationLine: 'line-through',
        color: '#9CA3AF',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#6B7280',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
});
