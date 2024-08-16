import React, { useContext, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Text,
    FlatList,
    View,
    Alert
} from 'react-native';
import { myColors as color } from "../Utils/MyColors";
import { useNavigation, useRoute } from '@react-navigation/native';
import { db, authentication } from "../../Firebaseconfig";
import { addDoc, collection, doc } from "firebase/firestore";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useProducts } from "../../contexts/ProductContext";
import Logo from "../Components/Logo";

const AddRecipeStepsScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { dishName, selectedIngredients, quantities, dishImage, dishID } = route.params;
    const { products } = useProducts();
    const [steps, setSteps] = useState([]);
    const [newStep, setNewStep] = useState('');
    const [theme] = useContext(ThemeContext);
    let myColors = color[theme.mode];
    const styles = getStyles(myColors);

    const addStep = () => {
        if (newStep.trim()) {
            const newStepID = (steps.length + 1).toString();
            setSteps([...steps, { ID: newStepID, description: newStep }]);
            setNewStep('');
        }
    };

    const handleSaveDishWithSteps = async () => {
        if (steps.length === 0) {
            Alert.alert('Validation Error', 'Please add at least one step to the recipe.');
            return;
        }

        const user = authentication.currentUser;
        if (user) {
            const ingredients = selectedIngredients.map(ID => {
                const product = products.find(p => p.ID === ID);
                return {
                    ID,
                    Name: product ? product.Name : 'Unknown',
                    quantity: quantities[ID],
                    Price: product ? product.Price : 0,
                    Image: product ? product.Image : ''
                };
            });

            const newDish = {
                ID: dishID,
                Name: dishName,
                ingredients,
                Image: dishImage,
                steps,
            };

            await addDoc(collection(doc(db, "Users", user.uid), "CustomDishes"), newDish);
            navigation.navigate('SpecialDishScreen');
            Alert.alert(`${dishName} is added successfully`);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <Logo/>
            <Text style={styles.sectionTitle}>Add Recipe Steps</Text>
            <Text style={styles.SubHeading}>Add Your recipe step by step so you can cook it later!</Text>

            <View style={styles.stepContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Add a step"
                    placeholderTextColor={myColors.placeholder}
                    value={newStep}
                    onChangeText={setNewStep}
                />
                <TouchableOpacity style={styles.addButton} onPress={addStep}>
                    <Text style={styles.addButtonText}>Add Step</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={steps}
                keyExtractor={(item) => item.ID}
                renderItem={({ item }) => (
                    <Text style={styles.stepText}>{item.ID}. {item.description}</Text>
                )}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveDishWithSteps}>
                <Text style={styles.saveButtonText}>Save Dish</Text>
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
        marginBottom: 10,
        color: myColors.text,
    },
    stepText: {
        fontSize: 18,
        color: myColors.text,
        marginTop : 5,
    },
    SubHeading: {
        fontSize: 18,
        color: myColors.text,
        marginTop : 10,
    },
    addButton: {
        backgroundColor: myColors.secondary,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    addButtonText: {
        color: myColors.text,
        fontSize: 18,
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
    sectionTitle: {
        fontSize: 20,
        color: myColors.text,
        marginBottom: 10,
        marginTop: 30,
        fontWeight: 'bold',
    },
    stepContainer: {
        marginTop: 30,
    },
});

export default AddRecipeStepsScreen;
