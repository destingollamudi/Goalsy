import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useState } from 'react';
import DailyCheckIn from './screens/DailyCheckIn';

export default function App() {
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);

  if (showDailyCheckIn) {
    return (
      <DailyCheckIn 
        onClose={() => setShowDailyCheckIn(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goalsy</Text>
      <Text>Track your goals with daily photos!</Text>
      
      <Button 
        title="📸 Take Daily Check-in" 
        onPress={() => setShowDailyCheckIn(true)}
      />
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});