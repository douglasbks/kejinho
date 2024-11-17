import React from 'react';
import { View, Text, Button, Linking, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export default function CustomerScreen({ navigation }) {
  const extra =
  Constants.expoConfig?.extra || Constants.manifest?.expoClient?.extra || {};
  const phoneNumber = extra.phoneNumber;

  const handleContact = () => {
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}`;

    // Verificar se o WhatsApp pode ser aberto
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          // Se o WhatsApp está instalado, abrir o WhatsApp
          Linking.openURL(whatsappUrl);
        } else {
          // Caso o WhatsApp não esteja instalado, abrir o telefone diretamente
          const phoneUrl = `tel:${phoneNumber}`;
          Linking.openURL(phoneUrl); // Abre o aplicativo de chamadas
        }
      })
      .catch((err) => console.error('Erro ao tentar abrir o app', err));
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user_id');
    navigation.replace('Login')
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Fazer Encomenda" onPress={() => navigation.navigate('Fazer Encomenda')} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Minhas Encomendas" onPress={() => navigation.navigate('Minhas Encomendas')} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Contato" onPress={handleContact} />
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