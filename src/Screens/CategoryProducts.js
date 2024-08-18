import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from "../../contexts/ThemeContext";
import ProductServices from "../../Services/ProductServices";
import Popup from "../Components/PopUp";
import { myColors as color } from '../Utils/MyColors';

const CategoryProducts = () => {
    const [theme] = useContext(ThemeContext);
    const myColors = color[theme.mode];
    const styles = getStyles(myColors);
    const [selectedItem, setSelectedItem] = useState(null);  // State for selected item

    const route = useRoute();
    const navigation = useNavigation();
    const { categoryName } = route.params;

    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const fetchedProducts = await ProductServices(categoryName);
            setProducts(fetchedProducts);
        };

        fetchProducts();
    }, [categoryName]);

    const renderProductItem = ({ item }) => (
        <TouchableOpacity onPress={() => setSelectedItem(item)} disabled={!item.Stock} style={styles.productItemContainer}>
            <View style={styles.productItem}>
                <Image source={{ uri: item.Image }} style={item.Stock ? styles.image : styles.outOfStockImage} />
                <Text style={styles.productName}>{item.Name}</Text>
                <Text style={styles.price}>{`₪ ${item.Price}`}</Text>
                {!item.Stock && <Text style={styles.outOfStockText}>Out of Stock</Text>}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={28} color={myColors.text} />
                    </TouchableOpacity>
                    <Text style={styles.header}>{categoryName}</Text>
                    <View style={styles.invisibleView} />
                </View>
                <FlatList
                    data={products}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.flatListContent}
                    showsVerticalScrollIndicator={false}
                    numColumns={3}  // Set number of columns to 2
                />
                {selectedItem && (
                    <Popup
                        item={selectedItem}
                        isVisible={Boolean(selectedItem)}
                        onClose={() => setSelectedItem(null)}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const getStyles = (myColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.primary,
    },
    contentContainer: {
        flex: 1,
        padding: 10,
        paddingVertical: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: 'center',
        flex: 1,
        color: myColors.text,
    },
    invisibleView: {
        width: 28,
        height: 28,
    },
    productItemContainer: {
        flex: 1,
        padding: 5,

    },
    productItem: {
        backgroundColor: myColors.cardContainer,
        borderColor: myColors.border,
        borderWidth: 1,
        borderRadius: 10,
        alignItems: "center",
        padding: 10,
        height: 220, // Fixed height for consistency
        justifyContent: "space-between", // Evenly space content
        shadowColor: myColors.text,
        shadowOffset: {
            width: 3,
            height: 5,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        // Add shadow for Android
        elevation: 8,    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    outOfStockImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        opacity: 0.4,
    },
    productName: {
        fontSize: 16,
        fontWeight: "bold",
        color: myColors.text,
        textAlign: "center",
    },
    price: {
        fontSize: 14,
        fontWeight: "bold",
        color: myColors.text,
    },
    flatListContent: {
        paddingBottom: 20,
    },
    outOfStockText: {
        fontSize: 14,
        fontWeight: "bold",
        color: 'red',
    },
});

export default CategoryProducts;
