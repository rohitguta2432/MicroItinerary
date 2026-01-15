import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import { ItineraryItem } from '../store/useTripStore';
import dayjs from 'dayjs';

interface ActivityItemProps {
    item: ItineraryItem;
    drag: () => void;
    isActive: boolean;
}

export const ActivityItem = ({ item, drag, isActive }: ActivityItemProps) => {
    return (
        <ScaleDecorator>
            <TouchableOpacity
                onLongPress={drag}
                disabled={isActive}
                style={[
                    styles.rowItem,
                    { backgroundColor: isActive ? '#f0f0f0' : 'white' },
                ]}
            >
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{dayjs(item.startTime).format('HH:mm')}</Text>
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.titleText}>{item.title}</Text>
                    {item.description ? <Text style={styles.descText}>{item.description}</Text> : null}
                </View>
                <View style={styles.dragHandle}>
                    <Text style={styles.dragText}>☰</Text>
                </View>
            </TouchableOpacity>
        </ScaleDecorator>
    );
};

const styles = StyleSheet.create({
    rowItem: {
        height: 80,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        elevation: 1
    },
    timeContainer: {
        width: 60,
        justifyContent: 'center'
    },
    timeText: {
        fontWeight: 'bold',
        color: '#555'
    },
    detailsContainer: {
        flex: 1,
        justifyContent: 'center'
    },
    titleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    descText: {
        fontSize: 12,
        color: '#777'
    },
    dragHandle: {
        width: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    dragText: {
        fontSize: 24,
        color: '#ccc'
    }
});
