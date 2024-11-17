import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';

export default function MyOrdersScreen() {
  const extra =
  Constants.expoConfig?.extra || Constants.manifest?.expoClient?.extra || {};
  const apiUrl = extra.apiUrl;

  const [encomendas, setEncomendas] = useState([]);

  const groupOrders = (data) => {
    const grouped = {};

    data.forEach((item) => {
      if (!grouped[item.order_id]) {
        grouped[item.order_id] = {
          id: item.order_id,
          day: item.status === 'Entregue' ? item.delivered_at : item.day,
          shift: item.shift,
          status: item.status,
          total_value: 0,
          items: [],
        };
      }
      grouped[item.order_id].items.push({
        product_name: item.product_name,
        product_price: item.product_price,
        quantity: item.quantity,
      });

      grouped[item.order_id].total_value += parseFloat(item.product_price) * item.quantity;
    });

    return Object.values(grouped);
  };

  useEffect(() => {
    const fetchEncomendas = async () => {
      const userId = await getUserId();
      if (!userId) {
        alert('Sessão expirada. Faça login novamente!');
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/api/my-orders/${userId}`);
        const groupedOrders = groupOrders(response.data);
        const sortedOrders = groupedOrders.sort((a, b) => b.id - a.id);
        setEncomendas(sortedOrders);
      } catch (error) {
        console.error('Erro ao buscar encomendas', error);
      }
    };

    fetchEncomendas();
  }, []);

  const getUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      return userId ? parseInt(userId, 10) : null;
    } catch (error) {
      console.error('Erro ao recuperar user_id', error);
      return null;
    }
  };

  return (
    <View style={styles.container}>
      {encomendas.length === 0 ? (
        <Text style={styles.message}>Você ainda não fez nenhuma encomenda :(</Text>
      ) : (
        <FlatList
          data={encomendas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <View style={styles.cardHeader}>
                <Text style={styles.header}>Encomenda #{item.id}</Text>
              </View>
              <View style={styles.encomendaItem}>
                <Text>
                  <Text style={styles.bold}>Dia: </Text>
                  {item.day}
                </Text>
                <Text>
                  <Text style={styles.bold}>Turno: </Text>
                  {item.shift}
                </Text>
                <Text>
                  <Text style={styles.bold}>Status: </Text>
                  {item.status}
                </Text>
                <Text>
                  <Text style={styles.bold}>Total: </Text>
                  R$ {parseFloat(item.total_value).toFixed(2)}
                </Text>
                <Text style={styles.subHeader}>Itens:</Text>
                {item.items.map((product, index) => (
                  <Text key={index} style={styles.product}>
                    {product.product_name} - R$ {parseFloat(product.product_price).toFixed(2)} x {product.quantity}
                  </Text>
                ))}
                 {item.status.toLowerCase() === 'entregue' && (
              <MaterialIcons name="check-circle" size={24} color="green" />
              )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: 'gray',
  },
  encomendaItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  product: {
    fontSize: 14,
    marginBottom: 4,
  },
  encomendaItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,          
    shadowColor: '#000',       
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,            
    borderWidth: 1,
    borderColor: '#ddd',     
  },
  cardHeader: {
    padding: 8,
    backgroundColor: '#f1f1f1',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 8,
  },
  cardContainer: {
    marginBottom: 16,
  borderRadius: 10,
  overflow: 'hidden',
  backgroundColor: '#e0e0e0',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 5,
  elevation: 3,
  borderWidth: 1,
  borderColor: '#b0b0b0',
  },
});