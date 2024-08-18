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
    ActivityIndicator,
    Alert
} from "react-native";
import { ThemeContext } from "../../contexts/ThemeContext";
import { myColors as color } from "../Utils/MyColors";
import CustomDishesServices from '../../Services/CustomDishesServices';
import Logo from "../Components/Logo";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import {db} from "../../Firebaseconfig";
import {addDoc, collection, getDocs, query, serverTimestamp, where} from "firebase/firestore";
import {useUser} from "../../contexts/UserContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const SpecialDishScreen = () => {
    const [theme] = useContext(ThemeContext);
    const [customDishes, setCustomDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();
    const myColors = color[theme.mode];
    const styles = getStyles(myColors);
    const { user } = useUser();

    const userInfo = {
        name: user.name,
        email: user.email,
    };
    const uploadImage = async (uri, imageName) => {
        const storage = getStorage();
        const imageRef = ref(storage, 'dishes/' + imageName);

        // Convert URI to Blob
        const response = await fetch(uri);
        const blob = await response.blob();

        // Upload image
        await uploadBytes(imageRef, blob);

        // Get the public URL
        const downloadURL = await getDownloadURL(imageRef);

        return downloadURL;
    };
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

    const handleShareDish = (dish) => {
        Alert.alert(
            "Share Dish",
            "Do you want to share this dish to the Public Dishes?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Share",
                    onPress: async () => {
                        try {
                            // Reference to the 'PublicDishes' collection
                            const dishesCollectionRef = collection(db, 'PublicDishes');

                            // Check if the dish is already in the PublicDishes collection
                            const dishQuery = query(dishesCollectionRef, where('ID', '==', dish.ID));
                            const dishSnapshot = await getDocs(dishQuery);

                            if (dishSnapshot.empty) {
                                // Upload image and get public URL
                                const imageUrl = dish.Image ? await uploadImage(dish.Image, dish.ID) : null;

                                // Add the dish to the PublicDishes collection
                                await addDoc(dishesCollectionRef, {
                                    Name: dish.Name,
                                    ID: dish.ID,
                                    Image: imageUrl, // Use the public URL
                                    ingredients: dish.ingredients,
                                    steps: dish.steps,
                                    User: userInfo.name,
                                    likes: [],
                                    sharedAt: serverTimestamp()
                                });

                                Alert.alert("Success", `Dish ${dish.Name} shared to Public Dishes.`);
                            } else {
                                Alert.alert("Info", "This dish is already shared to Public Dishes.");
                            }
                        } catch (error) {
                            console.error("Error sharing dish: ", error);
                            Alert.alert("Error", "Failed to share the dish. Please try again later.");
                        }
                    }
                }
            ]
        );
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
            <TouchableOpacity onPress={() => handleShareDish(item)} style={styles.shareButton}>
                <Icon name="share" size={24} color={'white'} />
            </TouchableOpacity>
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
            <Text style={styles.text}>My Dishes</Text>
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
    text:{
        justifyContent: "center",
        textAlign: "center",
        fontSize: 24,
        fontWeight: 'bold',
      },
    addButton: {
        backgroundColor: myColors.clickable,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        margin : 15,
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
    addButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    dishItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        marginBottom: 1,
        margin : 15,
        borderWidth: 0.5,
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
    shareButton: {
        backgroundColor: myColors.clickable,
        padding: 10,
        borderRadius: 8,
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
