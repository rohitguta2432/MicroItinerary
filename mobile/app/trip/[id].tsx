import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function TripDetails() {
    const { id } = useLocalSearchParams();

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Trip Details for ID: {id}</Text>
            <Text>Itinerary Planning coming in Phase 2b</Text>
        </View>
    );
}
