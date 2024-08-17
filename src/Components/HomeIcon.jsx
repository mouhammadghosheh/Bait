import React, { useState, useContext } from "react";
import { View, TouchableOpacity, StyleSheet, Modal, TextInput, FlatList, Text, Image, Platform } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { myColors as color } from "../Utils/MyColors";
import { ThemeContext } from "../../contexts/ThemeContext";
import Logo from "./Logo";
import { useProducts } from "../../contexts/ProductContext";
import Popup from "./PopUp";

const HomeIcon = () => {
    const [theme] = useContext(ThemeContext);
    let myColors = color[theme.mode];
    const { products } = useProducts();
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const styles = getStyles(myColors);

    // Filter products based on search query
    const filteredProducts = products.filter(product =>
        product.Name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            style={item.Stock > 0 ? styles.productItem : styles.outOfStock}
            onPress={() => {
                if (item.Stock > 0) {
                    setSelectedItem(item);
                    setSearchVisible(false)
                }
            }}
            disabled={item.Stock <= 0}
        >
            <Image source={{ uri: item.Image }} style={styles.image} />
            <Text style={styles.productName}>{item.Name}</Text>
            {item.Stock > 0 ?
                <Text style={styles.price}>{`₪ ${item.Price}`}</Text>
                : (
                    <Text style={styles.outOfStockText}>Out of Stock</Text>
                )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.leftEmptySpace} />
            <Logo width={130} height={130} />
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => setSearchVisible(true)}>
                <Icon name="search" size={30} color={myColors.text} />
            </TouchableOpacity>

            {/* Modal for search */}
            <Modal
                transparent={true}
                visible={searchVisible}
                animationType="none"
                hardwareAccelerated={true}
                onRequestClose={() => setSearchVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Logo width={130} height={130} />
                    <View style={styles.searchBar}>
                        <TextInput
                            placeholder="Search"
                            placeholderTextColor={myColors.placeholder}
                            style={styles.input}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* Display filtered products in a two-column grid */}
                    <FlatList
                        data={filteredProducts}
                        keyExtractor={(item) => item.id}
                        renderItem={renderProductItem}
                        contentContainerStyle={styles.flatListContent}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyList}>
                                <Text style={{ color: myColors.text }}>No products found</Text>
                            </View>
                        )}
                        numColumns={2}  // Set number of columns to 2
                        columnWrapperStyle={styles.columnWrapper}  // Additional style for the row
                    />

                    <TouchableOpacity style={styles.closeButton} onPress={() => setSearchVisible(false)}>
                        <Text style={{ color: 'white', fontSize: 16 }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Popup Component */}
            {selectedItem && (
                <Popup
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </View>
    );
};

const getStyles = (myColors) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    leftEmptySpace: {
        marginRight: 20,
    },
    modalContainer: {
        backgroundColor: myColors.primary,
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    searchBar: {
        backgroundColor: myColors.searchBar,
        height: 50,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    input: {
        color: myColors.text,
        fontSize: 18,
        flex: 1,
    },
    columnWrapper: {
        justifyContent: 'space-between', // Ensures even spacing between columns
    },
    productItem: {
        backgroundColor: myColors.cardContainer,
        borderColor: myColors.border,
        borderWidth: 1,
        borderRadius: 10,
        alignItems: "center",
        padding: 10,
        marginBottom: 15,
        flex: 1,
        margin: 5,
    },
    outOfStock: {
        backgroundColor: myColors.cardContainer,
        borderColor: myColors.border,
        borderWidth: 1,
        borderRadius: 10,
        alignItems: "center",
        padding: 10,
        marginBottom: 15,
        flex: 1,
        margin: 5,
        opacity: 0.6,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginBottom: 10,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: myColors.text,
        textAlign: 'center',
        marginBottom: 5,
    },
    price: {
        fontSize: 15,
        color: myColors.text,
    },
    flatListContent: {
        paddingBottom: 20,
    },
    emptyList: {
        padding: 10,
        alignItems: 'center',
    },
    closeButton: {
        backgroundColor: myColors.clickable,
        padding: 15,
        borderRadius: 10,
        marginTop: 11,
        marginBottom: Platform.OS === 'ios' ? 25 : 0,
        alignItems: 'center',
    },
    outOfStockText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'red',
    },
});

export default HomeIcon;
