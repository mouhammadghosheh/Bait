import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    FlatList,
    Image,
    ActivityIndicator
} from "react-native";
import { useProducts } from "../../contexts/ProductContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import { myColors as color } from "../Utils/MyColors";
import CustomDishesServices from '../../Services/CustomDishesServices';
import Logo from "../Components/Logo";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const SpecialDishScreen = () => {
    const { products } = useProducts();
    const [theme] = useContext(ThemeContext);
    const [customDishes, setCustomDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();
    const myColors = color[theme.mode];
    const styles = getStyles(myColors);

    const fetchDishes = async () => {
        setLoading(true);
        try {
            const dishes = await CustomDishesServices();
            setCustomDishes(dishes);
            setError(null);
        } catch (err) {
            setError('Failed to load dishes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDishes();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchDishes();
        }, [])
    );

    const handleAddDish = () => {
        navigation.navigate('AddDish');
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('DishDetails', { dish: item })} style={styles.dishItem}>
            {item.Image && (
                <Image source={{ uri: item.Image }} style={styles.dishImage} />
            )}
            <View style={styles.dishTextContainer}>
                <Text style={styles.dishName}>{item.Name}</Text>
                <Text style={styles.dishIngredients}>
                    Ingredients: {item.ingredients.map(ing => ing.Name).join(', ')}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <Logo />
                <ActivityIndicator size="large" color={myColors.text} style={styles.loader} />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.safe}>
                <Logo />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddDish}>
                    <Text style={styles.addButtonText}>Add Dish</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <Logo />
            <FlatList
                data={customDishes}
                keyExtractor={(item) => item.ID}
                renderItem={renderItem}
                ListHeaderComponent={() => (
                    <TouchableOpacity style={styles.addButton} onPress={handleAddDish}>
                        <Text style={styles.addButtonText}>Add Dish</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>You have no custom dishes. Click 'Add Dish' to get started.</Text>

                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const getStyles = (myColors) => StyleSheet.create({
    safe: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: myColors.primary,
        paddingHorizontal: 16,
    },
    addButton: {
        backgroundColor: myColors.clickable,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 20,
    },
    addButtonText: {
        color: myColors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    dishItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: myColors.secondary,
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
    },
    dishImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        resizeMode: 'cover',
    },
    dishTextContainer: {
        flex: 1,
    },
    dishName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: myColors.text,
    },
    dishIngredients: {
        fontSize: 16,
        color: myColors.text,
        marginTop: 5,
    },
    loader: {
        marginTop: 20,
    },
    errorText: {
        textAlign: 'center',
        color: myColors.error,
        fontSize: 16,
        marginTop: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: myColors.text,
        marginBottom: 10,
    },
});

export default SpecialDishScreen;
