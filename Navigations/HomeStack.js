import React from 'react';
import Home from '../src/Screens/Home';
import CategoryProducts from "../src/Screens/CategoryProducts";
import ProductDetailsPopup from "../src/Screens/ProductDetailsPopup";
import UserProfile from "../src/Screens/UserProfile";
import MyOrdersScreen from "../src/Screens/MyOrdersScreen";
import PaymentMethodsScreen from "../src/Screens/PaymentMethodsScreen";
import IngredientsScreen from "../src/Screens/IngredientsScreen";
import Dishes from "../src/Screens/Dishes";
import RegionalDishesScreen from "../src/Screens/RegionalDishesScreen";
import CheckoutScreen from "../src/Screens/CheckoutScreen";
import OrderConfirmationScreen from "../src/Screens/OrderConfirmationScreen";
import SettingsScreen from "../src/Screens/SettingsScreen";
import Cart from "../src/Screens/Cart";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import SpecialDishScreen from "../src/Screens/SpecialDishScreen";
import AddDishScreen from "../src/Screens/AddDishScreen";
import AddRecipeStepsScreen from "../src/Screens/AddRecipeStepsScreen";
import PublicDishes from "../src/Screens/PublicDishes";

const Stack = createNativeStackNavigator();

export const HomeStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                animationEnabled: false ,
                animation: 'slide_from_right'

            }}>
            <Stack.Screen name="HomeMain" component={Home} />
            <Stack.Screen name="CategoryProducts" component={CategoryProducts} />
            <Stack.Screen name="ProductDetailsPopup" component={ProductDetailsPopup} />



        </Stack.Navigator>
    );
};

export const CartStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                animationEnabled: false ,
                animation: 'slide_from_right'
            }}>
            <Stack.Screen name="Cart" component={Cart} />

            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
        </Stack.Navigator>
    );
};

export const DishesStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                animation: 'slide_from_bottom'
            }}>
            <Stack.Screen name="RegionalDishes" component={RegionalDishesScreen} />
            <Stack.Screen name="Dishes" component={Dishes} />
            <Stack.Screen name="DishDetails" component={IngredientsScreen} />
            <Stack.Screen name="SpecialDishScreen" component={SpecialDishScreen} />
            <Stack.Screen name="AddDish" component={AddDishScreen} />
            <Stack.Screen name="AddRecipeStepsScreen" component={AddRecipeStepsScreen} />
            <Stack.Screen name="PublicDishes" component={PublicDishes} />

        </Stack.Navigator>
    );
};

export const ProfileStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                animationEnabled: false,
                animation: 'slide_from_bottom'

            }}>
            <Stack.Screen name="Profile" component={UserProfile} />
            <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
    );
};
