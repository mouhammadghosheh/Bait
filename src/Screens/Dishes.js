import React, { useContext, useState, useEffect } from 'react';
import { SafeAreaView, Text, StyleSheet, FlatList, View, Image, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';
import { myColors as color } from '../Utils/MyColors';
import { useRoute } from '@react-navigation/native';
import DishesServices from '../../Services/DishesServices';
import Logo from "../Components/Logo";

const Dishes = ({ navigation }) => {
    const [theme] = useContext(ThemeContext);
    const myColors = color[theme.mode];
    const styles = createStyles(myColors);
    const route = useRoute();
    const { regionId, name, image } = route.params;

    const [dishes, setDishes] = useState([]);

    useEffect(() => {
        const fetchDishes = async () => {
            const fetchedDishes = await DishesServices(regionId);
            setDishes(fetchedDishes);
        };

        fetchDishes();
    }, [regionId]);

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.dishItem} onPress={() => navigation.navigate('DishDetails', { dish: item })}>
            <Image source={{ uri: item.Image }} style={styles.dishImage} />
            <Text style={styles.dishName}>{item.Name}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <Logo width={120}  height={120}/>
            <View style={styles.regionContainer}>

            <Image source={{ uri: image }} style={styles.regionImage} />
            </View>
            <Text style={styles.headerText}>Dishes in {name} Region</Text>
            <FlatList
                data={dishes}
                renderItem={renderItem}
                keyExtractor={(item) => item.ID}
                numColumns={2} // Display two columns
                columnWrapperStyle={styles.columnWrapper} // Ensures even spacing
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>No dishes found.</Text>}
            />
        </SafeAreaView>
    );
};

const createStyles = (myColors) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: myColors.primary,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: myColors.text,
        margin: 10,
    },
    listContainer: {
        padding: 10,
    },
    columnWrapper: {
        justifyContent: 'space-between', // Even spacing between columns
    },
    dishItem: {
        backgroundColor: myColors.cardContainer,
        padding: 15,
        margin: 2,
       marginBottom : 8,
        borderRadius: 10,
        alignItems: 'center',
        width: '48%', // Ensures two items fit in a row
        shadowColor: myColors.text,
        shadowOffset: {
            width: 3,
            height: 4,
        },
        shadowOpacity: 0.17,
        shadowRadius: 4,
        // Add shadow for Android
        elevation: 3,

    },
    dishImage: {
        width: '100%',
        height: 120,
        borderRadius: 10,
        marginBottom: 10,
    },
    dishName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: myColors.text,
        textAlign: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: myColors.text,
    },
    regionImage: {
        width: '100%',
        height: 200,
        alignSelf: 'center',
        resizeMode: 'cover',
        borderRadius: 30,
        margin : 10

    },
    regionContainer: {
        shadowColor: myColors.text,
        shadowOffset: {
            width: 3,
            height: 4,
        },
        shadowOpacity: 0.17,
        shadowRadius: 4,
        elevation: 3,
        margin : 10
    }
});

export default Dishes;
