import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminScreen({ navigation }) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('user_id');
    navigation.replace('Login')
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Gerenciar Encomendas" onPress={() => navigation.navigate('Gerenciar Encomendas')} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Editar Cardápio" onPress={() => navigation.navigate('Produtos')} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Editar Calendário de Encomendas" onPress={() => navigation.navigate('Calendário')} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Sair" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  buttonContainer: {
    marginBottom: 16,
  },
});