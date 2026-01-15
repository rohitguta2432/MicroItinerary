import { View, Text, Button } from 'react-native';
import { triggerSync } from '../../../services/syncService';
import { useSyncStore } from '../../../store/syncStore';

export default function SettingsScreen() {
    const { isSycing, lastSync } = useSyncStore();

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 20, marginBottom: 20 }}>Settings</Text>

            <View style={{ marginBottom: 20 }}>
                <Text>Last Sync: {lastSync ? lastSync.toLocaleString() : 'Never'}</Text>
                <Text>Status: {isSycing ? 'Syncing...' : 'Idle'}</Text>
            </View>

            <Button title="Force Sync Now" onPress={triggerSync} disabled={isSycing} />
        </View>
    );
}
