import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export default function NewOrderScreen({navigation}) {
  const extra =
  Constants.expoConfig?.extra || Constants.manifest?.expoClient?.extra || {};
  const apiUrl = extra.apiUrl;

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState([]);
  const [deliveryDays, setDeliveryDays] = useState([]);
  const [selectedDeliveryDay, setSelectedDeliveryDay] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/active-products`);
        setProducts(response.data);
      } catch (error) {
        console.error('Erro ao carregar os produtos:', error);
      }
    };

    const fetchDeliveryDays = async () => {
        try {
          const response = await axios.get(`${apiUrl}/api/active-delivery-days`);
          setDeliveryDays(response.data);
        } catch (error) {
          console.error('Erro ao carregar os dias de entrega:', error);
        }
      };

    fetchProducts();
    fetchDeliveryDays();
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

  const handleAddProduct = () => {
    if (selectedProduct) {
      const productItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: quantity,
        productPrice: selectedProduct.price,
      };
      setOrderItems([...orderItems, productItem]);
    }
  };

  const handleRemoveItem = (index) => {
    const updatedOrderItems = orderItems.filter((item, i) => i !== index);
    setOrderItems(updatedOrderItems);
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
        alert('Por favor, selecione ao menos um produto antes de enviar o pedido.');
        return;
      }

    const userId = await getUserId();
    if (!userId) {
      alert('Sessão expirada. Faça login novamente!');
      return;
    }

    try {
      const orderData = {
        user_id: userId,
        items: orderItems,
        total_value: calculateTotalValue(),
        delivery_at: selectedDeliveryDay.id,
      };
      const response = await axios.post(`${apiUrl}/api/orders`, orderData);
      Alert.alert(
        'Sucesso!',
        'Seu pedido foi enviado com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            }
          }
        ]
      );
      console.log('Pedido enviado:', response.data);
    } catch (error) {
      console.error('Erro ao enviar o pedido:', error);
      Alert.alert(
        'Erro!',
        'Ocorreu um erro ao enviar o seu pedido. Por favor, tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  // Função para calcular o valor total do pedido
  const calculateTotalValue = () => {
    return orderItems.reduce((total, item) => total + item.quantity * item.productPrice, 0);
  };

  const total = calculateTotalValue();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Fazer Encomenda</Text>

        <View style={styles.pickerContainer}>
          <Text>Escolha um Produto</Text>
          <Picker
            selectedValue={selectedProduct}
            onValueChange={(itemValue) => setSelectedProduct(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Selecione o Produto" value={null} />
            {products.map((product) => (
              <Picker.Item
                key={product.id}
                label={`${product.name} - R$ ${parseFloat(product.price).toFixed(2)}`}
                value={product}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text>Quantidade</Text>
          <TextInput
            style={styles.input}
            value={String(quantity)}
            onChangeText={(text) => setQuantity(Number(text))}
            keyboardType="numeric"
          />
        </View>

        <Button title="Adicionar Produto" onPress={handleAddProduct} />

        <View style={styles.orderItems}>
          <Text style={styles.subTitle}>Itens do Pedido:</Text>
          {orderItems.length > 0 ? (
            orderItems.map((item, index) => (
              <View key={index} style={styles.orderItemContainer}>
                <Text>
                  {item.productName} - R$ {parseFloat(item.productPrice).toFixed(2)} x {item.quantity} = R$ {(item.quantity * parseFloat(item.productPrice)).toFixed(2)}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(index)}
                >
                  <Text style={styles.removeButtonText}>Remover</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text>Você ainda não adicionou nenhum produto.</Text>
          )}
        </View>

        <View style={styles.pickerContainer}>
          <Text>Escolha o Dia da Entrega</Text>
          <Picker
            selectedValue={selectedDeliveryDay}
            onValueChange={(itemValue) => setSelectedDeliveryDay(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Selecione o Dia de Entrega" value={null} />
            {deliveryDays.map((day) => (
              <Picker.Item key={day.id} label={`${day.formattedDate} - ${day.shift}`} value={day} />
            ))}
          </Picker>
        </View>

        {orderItems.length > 0 && (
          <Text style={styles.totalText}>Total: R$ {total.toFixed(2).replace('.', ',')}</Text>
        )}

        <Button title="Enviar Pedido" onPress={handleSubmitOrder} />
        
        <Text>Obs: Trabalhamos apenas com pagamento na entrega (Dinheiro, PIX e Cartão)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  pickerContainer: {
    marginVertical: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  inputContainer: {
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginTop: 8,
  },
  orderItems: {
    marginTop: 20,
  },
  orderItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  removeButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
});