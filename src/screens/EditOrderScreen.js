import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import Constants from 'expo-constants';

export default function EditOrderScreen({ route, navigation }) {
  const extra =
  Constants.expoConfig?.extra || Constants.manifest?.expoClient?.extra || {};
  const apiUrl = extra.apiUrl;

  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/orders/${orderId}`);
        
        const orderData = response.data.reduce((acc, item) => {
          if (!acc[item.order_id]) {
            acc[item.order_id] = {
              id: item.order_id,
              user_name: item.user_name,
              user_address: item.user_address,
              email: item.email,
              phone: item.phone,
              status: item.status,
              total_value: 0,
              created_at: item.created_at,
              day: item.status === 'Entregue' ? item.delivered_at : item.day,
              shift: item.shift,
              items: [],
            };
          }
          
          acc[item.order_id].items.push({
            product_name: item.product_name,
            product_price: parseFloat(item.product_price),
            quantity: item.quantity,
          });
          
          acc[item.order_id].total_value += parseFloat(item.product_price) * item.quantity;
          
          return acc;
        }, {});
  
        const order = Object.values(orderData)[0];
  
        setOrder(order);
        setStatus(order.status);
      } catch (error) {
        console.error('Erro ao buscar detalhes da encomenda:', error);
      }
    };
  
    fetchOrderDetails();
  }, [orderId]);
  

  const handleStatusChange = async () => {
    try {
      await axios.put(`${apiUrl}/api/orders/${orderId}`, { status });
      alert('Status atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar status.');
    }
  };

  if (!order) {
    return <Text>Carregando...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Detalhes da Encomenda #{order.id}</Text>
      <Text>Status Atual: {order.status}</Text>
      <Text>Cliente: {order.user_name}</Text>
      <Text>E-mail: {order.email}</Text>
      <Text>Telefone: {order.phone}</Text>
      <Text>Endereço: {order.user_address}</Text>
      <Text>Data do Pedido: {order.created_at}</Text>
      <Text>Data de Entrega: {order.day} - {order.shift}</Text>
      <Text>Total: R$ {parseFloat(order.total_value).toFixed(2)}</Text>

      <Text style={styles.subHeader}>Alterar Status</Text>
      <Picker
        selectedValue={status}
        onValueChange={(itemValue) => setStatus(itemValue)}
      >
        <Picker.Item label="Pendente" value="Pendente" />
        <Picker.Item label="Em Produção" value="Em Produção" />
        <Picker.Item label="Em Rota de Entrega" value="Em Rota de Entrega" />
        <Picker.Item label="Entregue" value="Entregue" />
      </Picker>

      <Button title="Atualizar Status" onPress={handleStatusChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
});