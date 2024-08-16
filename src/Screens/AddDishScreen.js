import React, { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, View, TextInput, TouchableOpacity, Text, FlatList, Image, Alert } from 'react-native';
import { useProducts } from "../../contexts/ProductContext";
import { myColors as color } from "../Utils/MyColors";
import { addDoc, collection, doc } from "firebase/firestore";
import { db, authentication } from "../../Firebaseconfig";
import { ThemeContext } from "../../contexts/ThemeContext";
import * as ImagePicker from 'expo-image-picker';

const AddDishScreen = ({ navigation }) => {
    const { products } = useProducts();
    const [dishName, setDishName] = useState('');
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [theme] = useContext(ThemeContext);
    const [dishImage, setDishImage] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); // Search query state

    let myColors = color[theme.mode];
    const styles = getStyles(myColors);

    const generateDishID = () => {
        return Math.floor(100000 + Math.random() * 900000);
    };
    const DishID = generateDishID();

    const toggleIngredientSelection = (product) => {
        if (selectedIngredients.includes(product.ID)) {
            setSelectedIngredients(selectedIngredients.filter(ID => ID !== product.ID));
            const updatedQuantities = { ...quantities };
            delete updatedQuantities[product.ID];
            setQuantities(updatedQuantities);
        } else {
            setSelectedIngredients([...selectedIngredients, product.ID]);
            setQuantities({
                ...quantities,
                [product.ID]: 1, // Set default quantity to 1 when selected
            });
        }
    };

    const incrementQuantity = (productId) => {
        setQuantities({
            ...quantities,
            [productId]: (quantities[productId] || 1) + 1,
        });
    };

    const decrementQuantity = (productId) => {
        if (quantities[productId] > 1) {
            setQuantities({
                ...quantities,
                [productId]: quantities[productId] - 1,
            });
        }
    };

    const handleQuantityChange = (productId, text) => {
        const quantity = parseInt(text, 10);
        if (!isNaN(quantity)) {
            setQuantities({
                ...quantities,
                [productId]: quantity,
            });
        } else {
            // Set quantity to 1 if invalid input
            setQuantities({
                ...quantities,
                [productId]: 1,
            });
        }
    };

    const handleProceedToSteps = () => {
        if (!dishName || !dishImage || selectedIngredients.length === 0) {
            Alert.alert('Validation Error', 'Please fill out all required fields: Dish Name, Image, and at least one ingredient.');
            return;
        }

        navigation.navigate('AddRecipeStepsScreen', {
            dishName,
            selectedIngredients,
            quantities,
            dishImage,
            dishID: DishID,
        });
    };

    const handleSaveDish = async () => {
        const user = authentication.currentUser;
        if (user) {
            const ingredients = selectedIngredients.map(ID => {
                const product = products.find(p => p.ID === ID);
                return {
                    ID,
                    Name: product ? product.Name : 'Unknown',
                    quantity: quantities[ID],
                    Price: product ? product.Price : 0,  // Adding price
                    Image: product ? product.Image : ''  // Adding image
                };
            });

            const newDish = {
                ID: DishID,
                Name: dishName,
                ingredients,
                Image: dishImage,
            };

            await addDoc(collection(doc(db, "Users", user.uid), "CustomDishes"), newDish);
            navigation.goBack();
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            setDishImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            setDishImage(result.assets[0].uri);
        }
    };

    const filteredProducts = products.filter(product =>
        product.Name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.safe}>
            <TextInput
                style={styles.input}
                placeholder="Dish Name"
                placeholderTextColor={myColors.placeholder}
                value={dishName}
                onChangeText={setDishName}
            />
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                <Text style={styles.imagePickerText}>Pick an Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imagePickerButton} onPress={takePhoto}>
                <Text style={styles.imagePickerText}>Take a Photo</Text>
            </TouchableOpacity>
            {dishImage ? <Text style={styles.PickDish}>Image Picked Successfully</Text>: <Text style={styles.PickDish}>Image Not Picked Yet</Text>}
            <TextInput
                style={styles.searchInput}
                placeholder="Search Ingredients"
                placeholderTextColor={myColors.placeholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.ID}
                renderItem={({ item }) => (
                    <View style={styles.productItem}>
                        <TouchableOpacity onPress={() => toggleIngredientSelection(item)}>
                            <View style={styles.productContent}>
                                <Image style={styles.productImage} source={{ uri: item.Image }} />
                                <Text style={styles.productName}>
                                    {item.Name} {selectedIngredients.includes(item.ID) && '(Selected)'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        {selectedIngredients.includes(item.ID) && (
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity onPress={() => decrementQuantity(item.ID)} style={styles.quantityButton}>
                                    <Text style={styles.quantityButtonText}>-</Text>
                                </TouchableOpacity>
                                <TextInput
                                    style={styles.quantityInput}
                                    keyboardType="numeric"
                                    value={quantities[item.ID]?.toString() || '1'}
                                    onChangeText={(text) => handleQuantityChange(item.ID, text)}
                                />
                                <TouchableOpacity onPress={() => incrementQuantity(item.ID)} style={styles.quantityButton}>
                                    <Text style={styles.quantityButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleProceedToSteps}>
                <Text style={styles.saveButtonText}>Next</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const getStyles = (myColors) => StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: myColors.primary,
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: myColors.text,
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        color: myColors.text,
    },
    imagePickerButton: {
        backgroundColor: myColors.secondary,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    imagePickerText: {
        color: myColors.text,
        fontSize: 18,
    },
    dishImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 20,
    },
    productItem: {
        marginBottom: 10,
    },
    productContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 10,
    },
    productName: {
        fontSize: 18,
        color: myColors.text,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    quantityButton: {
        backgroundColor: myColors.secondary,
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 18,
        color: myColors.text,
    },
    quantityInput: {
        borderWidth: 1,
        borderColor: myColors.text,
        padding: 8,
        borderRadius: 5,
        width: 60,
        textAlign: 'center',
        color: myColors.text,
    },
    saveButton: {
        backgroundColor: myColors.clickable,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: myColors.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: myColors.text,
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        color: myColors.text,
    },
    PickDish: {
        textAlign: "center",
        color: myColors.placeholder,
        fontSize: 15,
        marginBottom: 5
    },
});

export default AddDishScreen;
