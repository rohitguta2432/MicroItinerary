import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDatabase } from './../db/schema';

export default function RootLayout() {
    useEffect(() => {
        initDatabase();
    }, []);

    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Trips' }} />
            <Stack.Screen name="trip/[id]" options={{ title: 'Trip Details' }} />
        </Stack>
    );
}
