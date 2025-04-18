import React, { useEffect, useState, useContext } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Platform, Image } from 'react-native';
import regionsServices from '../../Services/regionsServices';
import { myColors as color } from "../Utils/MyColors";
import { ThemeContext } from "../../contexts/ThemeContext";
import Logo from "../Components/Logo";

export default function RegionalDishesScreen({ navigation }) {
    const [theme] = useContext(ThemeContext);
    let myColors = color[theme.mode];
    const styles = getStyles(myColors);
    const [Regions, setRegions] = useState([]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const regionsData = await regionsServices();
                setRegions([{ id: 'customCard' }, ...regionsData]);
            } catch (err) {
                console.error(err);
            }
        };
        fetch();
    }, []);

    const renderItem = ({ item }) => {
        if (item.id === 'customCard') {
            return (
                <View style={styles.customCard}>
                    <Text style={styles.customCardTitle}>Add Your Own Dish</Text>
                    <Image
                        style={styles.customCardImage}
                        source={{ uri: 'https://esmmweighless.com/wp-content/uploads/2019/12/Carolyn-Cooking-Blog.jpg' }} // Replace with a real image URL
                    />
                    <Text style={styles.customCardDescription}>
                        Add your dish from our product list and enjoy ordering your favorite dish's recipe in one click
                    </Text>
                    <TouchableOpacity
                        style={styles.customCardButton}
                        onPress={() => navigation.navigate('SpecialDishScreen')}
                    >
                        <Text style={styles.customCardButtonText}>My Dishes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.customCardButton}
                        onPress={() => navigation.navigate('PublicDishes')}
                    >
                        <Text style={styles.customCardButtonText}>View Public Dishes</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <TouchableOpacity
                style={styles.item}
                onPress={() => navigation.navigate('Dishes', { regionId: item.id, name: item.name, image: item.image })}
            >
                <Image style={styles.regionImage} source={{ uri: item.image }} />
                <Text style={styles.title}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <Logo width={100} height={100} />
            <View style={styles.ing}>
                <Text style={styles.header}>Select a Region</Text>
            </View>
            <FlatList
                keyExtractor={(item) => item.id.toString()}
                data={Regions}
                renderItem={renderItem}
            />
        </SafeAreaView>
    );
}

const getStyles = (myColors) => StyleSheet.create({
    safe: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: myColors.primary,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: myColors.text,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: myColors.border,
        backgroundColor: myColors.cardContainer,
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
    title: {
        paddingLeft: 40,
        fontSize: 24,
        fontWeight: 'bold',
        color: myColors.text,

    },
    regionImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    customCard: {
        margin: 16,
        padding: 16,
        borderRadius : 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: myColors.border,
        backgroundColor: myColors.searchBar,
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
    customCardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: myColors.text,
        marginBottom: 10,
    },
    customCardImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        resizeMode: 'cover',
        marginBottom: 10,
    },
    customCardDescription: {
        fontSize: 16,
        color: myColors.text,
        textAlign: 'center',
        marginBottom: 10,
    },
    customCardButton: {
        padding: 10,
        backgroundColor: myColors.clickable,
        width : '100%',
        alignItems : 'center',
        borderRadius: 10,
        marginBottom  : 10,
    },
    customCardButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize : 15,
    },
});
