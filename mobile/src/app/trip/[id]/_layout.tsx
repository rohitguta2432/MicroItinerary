import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function TripDetailLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
            <Tabs.Screen
                name="itinerary"
                options={{
                    title: 'Itinerary',
                    tabBarIcon: ({ color }) => <FontAwesome name="calendar" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="places"
                options={{
                    title: 'Places',
                    tabBarIcon: ({ color }) => <FontAwesome name="map-marker" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="packing"
                options={{
                    title: 'Packing',
                    tabBarIcon: ({ color }) => <FontAwesome name="suitcase" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <FontAwesome name="cog" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
