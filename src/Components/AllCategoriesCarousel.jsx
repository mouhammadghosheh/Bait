import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from "react-native";
import Categories from "../../Services/CategoryServices";
import { useNavigation } from "@react-navigation/native";
import { myColors as color } from "../Utils/MyColors";
import { ThemeContext } from "../../contexts/ThemeContext";

const AllCategoriesCarousel = () => {
    const [theme] = useContext(ThemeContext);
    let myColors = color[theme.mode];

    const [categories, setCategories] = useState([]);
    const navigation = useNavigation();
    const styles = getStyles(myColors);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoriesData = await Categories();
                setCategories(categoriesData);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchData();
    }, []);

    const navigateToCategoryProducts = (categoryName) => {
        navigation.navigate("CategoryProducts", { categoryName });
    };

    const renderProductItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigateToCategoryProducts(item.Name)}>
            <View style={styles.productItem}>
                <Image source={{ uri: item.Image }} style={styles.image} />
                <Text style={styles.productTitle  }>{item.Name}</Text>
            </View>
        </TouchableOpacity>
    );



    return (
        <View style={styles.container}>
            <FlatList
                data={categories}
                horizontal={true}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.flatListContent}
            />
        </View>
    );
};

const getStyles = (myColors) => StyleSheet.create({
    container: {
        padding: 10,
        borderColor : myColors.borderColor,
        borderWidth : 0.1,
        backgroundColor: myColors.cardContainer,
        borderRadius: 20,
        shadowColor: myColors.text,
        shadowOffset: {
            width: 3,
            height: 4,
        },
        shadowOpacity: 0.17,
        shadowRadius: 4,
        // Add shadow for Android
        elevation: 8,
        margin:6


    },
    productItem: {
        width: 150,
        marginRight: 1,
        alignItems : "center"

    },
    image: {
        resizeMode: 'cover',
        width: 120,
        height: 120,
        borderRadius: 25,
        marginBottom: 10,
    },
    productTitle: {
        fontSize: 16,
        color: myColors.text,
        fontFamily : 'System',
        fontWeight : 'bold',
       marginBottom : 8
    },
    flatListContent: {
    },

});

export default AllCategoriesCarousel;
