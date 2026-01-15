import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDatabase } from '../src/db/Database';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {

    useEffect(() => {
        initDatabase().then(() => {
            console.log("Database initialized");
        }).catch(e => {
            console.error("Database init failed", e);
        });
    }, []);

    return (
        <>
            <StatusBar style="auto" />
            <Stack>
                <Stack.Screen
                    name="index"
                    options={{ title: 'My Trips' }}
                />
                <Stack.Screen
                    name="trip/modal"
                    options={{ presentation: 'modal', title: 'Trip Details' }}
                />
                <Stack.Screen
                    name="trip/[id]"
                    options={{ title: 'Itinerary' }}
                />
            </Stack>
        </>
    );
}
