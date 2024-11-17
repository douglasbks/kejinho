import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export default function LoginScreen({ navigation }) {
  const extra =
  Constants.expoConfig?.extra || Constants.manifest?.expoClient?.extra || {};
  const apiUrl = extra.apiUrl;

  useEffect(() => {
    const checkAuthStatus = async () => {
      const id = await AsyncStorage.getItem('user_id');
      if (id) {
        try {
          const response = await axios.get(`${apiUrl}/api/user/${id}`, {
            username,
            password,
          });
    
            if (response.data.user.admin === 1) {
              navigation.replace('Painel Administrativo');
            } else {
              navigation.replace('Encomendas');
              }
        } catch (error) {
          console.error(error);
          Alert.alert('Erro', 'Sessão expirada, faça login novamente');
        }
      }
    };

    checkAuthStatus();
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${apiUrl}/login`, {
        username,
        password,
      });

      if (response.data.success) {
        try {
          await AsyncStorage.setItem('user_id', response.data.user.id.toString());
        } catch (error) {
          console.error('Erro ao salvar user_id', error);
        }
        if (response.data.user.admin === 1) {
          navigation.replace('Painel Administrativo');
        } else {
          navigation.replace('Encomendas');
        }
      } else {
        Alert.alert('Erro', response.data.message || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar fazer login');
    }
  };

  const handleRegister = () => {
    navigation.navigate('Cadastro');
  }

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />

      <Text>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />

      <View style={styles.registerButtonContainer}>
        <Button title="Cadastrar" onPress={handleRegister} color="green" />
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
  logo: {
    width: 200,
    height: 200,
    marginBottom: 24,
    alignSelf: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  registerButtonContainer: {
    marginTop: 16,
  },
});