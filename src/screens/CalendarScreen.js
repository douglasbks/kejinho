import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

export default function DiasEntregaScreen() {
  const extra =
  Constants.expoConfig?.extra || Constants.manifest?.expoClient?.extra || {};
  const apiUrl = extra.apiUrl;

  const [days, setDays] = useState([]);

  useEffect(() => {
    const fetchDays = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/delivery-days`);
        setDays(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDays();
  }, []);

  const toggleAtivo = async (id, active) => {
    try {
      await axios.put(`${apiUrl}/api/delivery-days/${id}`, { active: !active });
      setDays(days.map(day => day.id === id ? { ...day, active: !active } : day));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={days}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.dayItem}>
            <Text>{item.day} ({item.formattedDate})</Text>
            <Text>{item.shift}</Text>
            <Button
              title={item.active ? 'Desativar' : 'Ativar'}
              onPress={() => toggleAtivo(item.id, item.active)}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  dayItem: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
});