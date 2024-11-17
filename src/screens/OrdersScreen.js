import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';

export default function OrdersScreen({navigation}) {
  const extra =
  Constants.expoConfig?.extra || Constants.manifest?.expoClient?.extra || {};
  const apiUrl = extra.apiUrl;

  const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/orders`);
        const groupedOrders = groupOrders(response.data);
        const sortedOrders = groupedOrders.sort((a, b) => b.id - a.id);
        setOrders(sortedOrders);
      } catch (error) {
        console.error(error);
      }
    };

    const groupOrders = (data) => {
      const grouped = {};
      data.forEach((item) => {
        if (!grouped[item.order_id]) {
          grouped[item.order_id] = {
            id: item.order_id,
            user_name: item.user_name,
            user_address: item.user_address,
            status: item.status,
            total_value: 0,
            day: item.status === 'Entregue' ? item.delivered_at : item.day,
            shift: item.shift,
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
      fetchOrders();
    }, []);

    useFocusEffect(
      React.useCallback(() => {
        fetchOrders();
      }, [])
    );

  const getCardStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return styles.pendingCard;
      case 'entregue':
        return styles.deliveredCard;
      default:
        return styles.defaultCard;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('Editar Encomenda', {orderId: item.id})}>
          <View style={[styles.orderItem, getCardStyle(item.status)]}>
            <Text style={styles.header}>Encomenda #{item.id}</Text>
            <Text>
              <Text style={styles.bold}>Cliente: </Text>{item.user_name}
            </Text>
            <Text>
              <Text style={styles.bold}>Status: </Text>{item.status}
            </Text>
            <Text>
              <Text style={styles.bold}>Endereço: </Text>{item.user_address}
            </Text>
            <Text>
              <Text style={styles.bold}>Entrega: </Text>{item.day} - {item.shift}
            </Text>
            <Text>
              <Text style={styles.bold}>Total: </Text>R$ {parseFloat(item.total_value).toFixed(2)}
            </Text>
            <Text style={styles.subHeader}>Itens:</Text>
            {item.items.map((orderItem, index) => (
              <View key={index} style={styles.item}>
                <Text>
                  <Text style={styles.bold}>{orderItem.product_name} </Text>
                  (R$ {parseFloat(orderItem.product_price).toFixed(2)})
                </Text>
                <Text>
                  <Text style={styles.bold}>Quantidade: </Text>{orderItem.quantity}
                </Text>
              </View>
            ))}
             {item.status.toLowerCase() === 'entregue' && (
              <MaterialIcons name="check-circle" size={24} color="green" />
            )}
            {item.status.toLowerCase() === 'pendente' && (
              <MaterialIcons name="error" size={24} color="red" />
            )}
          </View>
          </TouchableOpacity>
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
  orderItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pendingCard: {
    backgroundColor: '#ffeb3b',
    borderColor: '#fbc02d',    
  },
  deliveredCard: {
    backgroundColor: '#e8f5e9',
    borderColor: '#81c784',    
  },
  defaultCard: {
    backgroundColor: '#f9f9f9',
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
  item: {
    marginBottom: 8,
  },
});