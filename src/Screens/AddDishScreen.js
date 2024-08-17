import React, { useContext, useState, useMemo } from 'react';
import { SafeAreaView, StyleSheet, View, TextInput, TouchableOpacity, Text, FlatList, Image, Alert, Dimensions } from 'react-native';
import { useProducts } from "../../contexts/ProductContext";
import { myColors as color } from "../Utils/MyColors";
import { ThemeContext } from "../../contexts/ThemeContext";
import * as ImagePicker from 'expo-image-picker';
import Logo from "../Components/Logo";

const { width } = Dimensions.get('window');

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
            quality: 0,
        });

        if (!result.canceled) {
            setDishImage(result.assets[0].uri);
        }
    };

    const filteredProducts = products.filter(product =>
        product.Name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Memoize the header component to prevent re-renders
    const renderHeader = useMemo(() => (
        <View>
            <Logo width={80} height={80} />
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
            {dishImage ? <Text style={styles.PickDish}>Image Picked Successfully</Text> : <Text style={styles.PickDish}>Image Not Picked Yet</Text>}
            <TextInput
                style={styles.searchInput}
                placeholder="Search Ingredients"
                placeholderTextColor={myColors.placeholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>
    ), [dishName, searchQuery, dishImage]); // Only re-render if dishName, searchQuery, or dishImage changes

    return (
        <SafeAreaView style={styles.safe}>
            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.ID}
                ListHeaderComponent={renderHeader} // Render the header with other inputs
                numColumns={3} // Set 3 items per row
                columnWrapperStyle={styles.columnWrapper} // Adjust space between columns
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
                contentContainerStyle={{ paddingBottom: 20 }}
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
        margin: 15,
        borderWidth: 1,
        borderColor: myColors.text,
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        color: myColors.text,
    },
    imagePickerButton: {
        backgroundColor: myColors.clickable,
        padding: 10,
        margin: 15,
        marginBottom: 1,
        borderRadius: 8,
        alignItems: 'center',
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
    imagePickerText: {
        color: 'white',
        fontSize: 18,
    },
    dishImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-around', // Ensure even spacing between columns
    },
    productItem: {
        backgroundColor: myColors.cardContainer,
        borderColor: myColors.border,
        borderWidth: 1,
        borderRadius: 10,
        padding: 8,
        width: (width / 3) - 20, // Adjust card width to fit three columns
        marginBottom: 0.5,
        margin:15,
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
    productContent: {
        alignItems: 'center',
    },
    productImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginBottom: 10,
    },
    productName: {
        fontSize: 14, // Adjust font size
        color: myColors.text,
        textAlign: 'center',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        justifyContent: 'center',
    },
    quantityButton: {
        backgroundColor: myColors.secondary,
        padding: 5,
        borderRadius: 5,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 16,
        color: myColors.text,
    },
    quantityInput: {
        borderWidth: 1,
        borderColor: myColors.text,
        padding: 5,
        borderRadius: 5,
        width: 40,
        textAlign: 'center',
        color: myColors.text,
    },
    saveButton: {
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
    saveButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: myColors.text,
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        color: myColors.text,
        margin: 15
    },
    PickDish: {
        textAlign: "center",
        color: myColors.placeholder,
        fontSize: 15,
        marginBottom: 8,
        marginTop: 8
    },
});

export default AddDishScreen;
