import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Button, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';

export default function ProdutosScreen({ navigation }) {
  const extra =
  Constants.expoConfig?.extra || Constants.manifest?.expoClient?.extra || {};
  const apiUrl = extra.apiUrl;

  const [products, setProducts] = useState([]);

 
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/products`);
        setProducts(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    useEffect(() => {
      fetchProducts();
    }, []);

  const handleDelete = (id) => {
    Alert.alert('Confirmação', 'Deseja excluir este produto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'OK', onPress: async () => {
          await axios.delete(`${apiUrl}/api/products/${id}`);
          setProducts(products.filter((product) => product.id !== id));
        }
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Button title="Adicionar Produto" onPress={() => navigation.navigate('Novo Produto')} />
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Text>Produto: {item.name}</Text>
            <Text>Preço: R$ {parseFloat(item.price).toFixed(2).replace('.', ',')}</Text>
            <Text style={[styles.statusText, { color: item.active ? '#4caf50' : '#f44336' }]}>
            {item.active ? 'Ativo' : 'Desativado'}
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('Editar Produto', { 
                  product: item
                })}
              >
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
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
  productItem: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
  },
});