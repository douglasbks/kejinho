import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminScreen from '../screens/AdminScreen';
import CustomerScreen from '../screens/CustomerScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProdutosScreen from '../screens/ProductsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import NewProductScreen from '../screens/NewProductScreen';
import EditProductScreen from '../screens/EditProductScreen';
import NewOrderScreen from '../screens/NewOrderScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import EditOrderScreen from '../screens/EditOrderScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={RegisterScreen} />
        <Stack.Screen name="Painel Administrativo" component={AdminScreen} />
        <Stack.Screen name="Encomendas" component={CustomerScreen} />
        <Stack.Screen name="Gerenciar Encomendas" component={OrdersScreen} />
        <Stack.Screen name="Editar Encomenda" component={EditOrderScreen} />
        <Stack.Screen name="Produtos" component={ProdutosScreen} />
        <Stack.Screen name="Calendário" component={CalendarScreen} />
        <Stack.Screen name="Novo Produto" component={NewProductScreen} />
        <Stack.Screen name="Editar Produto" component={EditProductScreen} />
        <Stack.Screen name="Fazer Encomenda" component={NewOrderScreen} />
        <Stack.Screen name="Minhas Encomendas" component={MyOrdersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}