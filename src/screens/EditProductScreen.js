import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Switch } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

export default function EditarProdutoScreen({ route, navigation }) {
  const extra =
  Constants.expoConfig?.extra || Constants.manifest?.expoClient?.extra || {};
  const apiUrl = extra.apiUrl;

  const { product } = route.params;
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(parseFloat(product.price).toFixed(2).replace('.', ','));
  const [isActive, setIsActive] = useState(product.active === 1);

  useEffect(() => {
    setIsActive(product.active === 1);
  }, [product]);

  const handleUpdate = async () => {
    try {
      const updatedProduct = {
        name,
        price: parseFloat(price.replace(',', '.')),
        active: isActive ? 1 : 0
      };

      await axios.put(`${apiUrl}/api/products/${product.id}`, updatedProduct);
      Alert.alert('Produto atualizado', 'As alterações foram salvas com sucesso');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível atualizar o produto');
    }
  };

  const toggleActiveStatus = () => {
    setIsActive((prevState) => !prevState);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome do Produto</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nome do produto"
      />
      
      <Text style={styles.label}>Preço</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Preço do produto"
        keyboardType="numeric"
      />

      <View style={styles.statusContainer}>
        <View style={styles.switchContainer}>
          <Text>Ativo</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            thumbColor={isActive ? '#4caf50' : '#f44336'}
            trackColor={ '#81b0ff' }
          />
        </View>
      </View>

      <Button title="Salvar Alterações" onPress={handleUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    label: {
      marginBottom: 8,
      fontSize: 16,
      fontWeight: 'bold',
    },
    input: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 16,
      paddingLeft: 8,
    },
    statusContainer: {
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
  });