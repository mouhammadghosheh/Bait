import React, { useContext, useRef, useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { myColors as color } from "../Utils/MyColors";
import { addToCart } from "../../Redux/CartSlice";
import { useDispatch } from "react-redux";
import { ThemeContext } from "../../contexts/ThemeContext";
import Logo from "../Components/Logo";
import { TabView, TabBar } from 'react-native-tab-view';
import StepIndicator from 'react-native-step-indicator';

//Sample dish object with mock steps
// const dish = {
//     Name: 'Chocolate Cake',
//     ingredients: [
//         { ID: '1', Name: 'Flour', quantity: '2 cups', Price: '10', Image: 'https://example.com/flour.jpg' },
//         { ID: '2', Name: 'Sugar', quantity: '1 cup', Price: '5', Image: 'https://example.com/sugar.jpg' },
//         { ID: '3', Name: 'Cocoa Powder', quantity: '1/2 cup', Price: '15', Image: 'https://example.com/cocoa.jpg' },
//         { ID: '4', Name: 'Butter', quantity: '1/2 cup', Price: '20', Image: 'https://example.com/butter.jpg' },
//     ],
//     steps: [
//         { ID: '1', description: 'Preheat the oven to 350°F (175°C).' },
//         { ID: '2', description: 'In a bowl, mix the flour, sugar, and cocoa powder.' },
//         { ID: '3', description: 'Add melted butter and mix until smooth.' },
//         { ID: '4', description: 'Pour the mixture into a greased pan and bake for 30 minutes.' },
//         { ID: '5', description: 'Let it cool before serving.' },
//     ]
// };

export default function IngredientsScreen({ route }) {
    const [theme] = useContext(ThemeContext);
    const myColors = color[theme.mode];
    const styles = getStyles(myColors);
    const {dish} = route.params;
    const dispatch = useDispatch();

    const handleAddToCart = (item) => {
        dispatch(addToCart({ Image: item.Image, Name: item.Name, Price: item.Price, ID: item.ID, quantity: item.quantity }));
    };

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'ingredients', title: 'Ingredients' },
        { key: 'steps', title: 'Steps' },
    ]);

    const [stepIndex, setStepIndex] = useState(0);
    const flatListRef = useRef(null);

    const handleStepIndicatorPress = (stepIndex) => {
        setStepIndex(stepIndex);
        if (flatListRef.current) {
            flatListRef.current.scrollToIndex({ index: stepIndex, animated: true });
        }
    };



    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToIndex({ index: 0, animated: false });
        }
    }, []);

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'ingredients':
                return (
                    <FlatList
                        data={dish.ingredients}
                        keyExtractor={item => item.ID}
                        renderItem={({ item }) => (
                            <View style={styles.item}>
                                <Image style={styles.ingredientImage} source={{ uri: item.Image }} />
                                <View style={styles.ingredientDetails}>
                                    <Text style={styles.title}>{item.Name}: {item.quantity}</Text>
                                    <Text style={styles.price}>Price: ₪{item.Price}</Text>
                                </View>
                                <TouchableOpacity style={styles.addToCartButton} onPress={() => handleAddToCart(item)}>
                                    <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                );
            case 'steps':
                return (
                        <View style={styles.stepperContainer}>
                            <View style={styles.stepIndicatorWrapper}>
                                <StepIndicator
                                    customStyles={stepIndicatorStyles(myColors)}
                                    currentPosition={stepIndex}
                                    stepCount={dish.steps.length}
                                    direction="vertical"
                                    onPress={handleStepIndicatorPress}
                                />
                            </View>
                            <FlatList
                                ref={flatListRef}
                                data={dish.steps}
                                keyExtractor={item => item.ID}
                                renderItem={({ item, index: itemIndex }) => (
                                    itemIndex === stepIndex && (
                                        <View style={styles.stepContainer}>
                                            <Text style={styles.stepTitle}>Step {itemIndex + 1}</Text>
                                            <Text style={styles.stepDescription}>{item.description}</Text>
                                        </View>
                                    )
                                )}
                                scrollEnabled={false} // Disable internal scrolling to sync with StepIndicator
                            />
                        </View>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <Logo />
            <View style={styles.ing}>
                <Text style={styles.header}>{dish.Name} Ingredients</Text>
            </View>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                renderTabBar={props => (
                    <TabBar
                        {...props}
                        style={{ backgroundColor: myColors.primary }}
                        labelStyle={{ color: myColors.text }}
                        indicatorStyle={{ backgroundColor: myColors.clickable }}
                    />
                )}
                swipeEnabled={false} // Disable swipe gestures
                style={{ flex: 1 }}
            />
        </SafeAreaView>
    );
}

const stepIndicatorStyles = (myColors) => ({
    stepIndicatorSize: 40,
    currentStepIndicatorSize: 50,
    separatorStrokeWidth: 3,
    currentStepStrokeWidth: 5,
    stepStrokeCurrentColor: myColors.clickable,
    stepIndicatorCurrentColor: myColors.clickable,
    stepIndicatorLabelCurrentColor: myColors.text,
    labelSize : 16,
    currentStepIndicatorLabelFontSize: 19,
    labelColor: myColors.text,
    currentStepLabelColor: myColors.clickable,
        stepIndicatorUnFinishedColor : myColors.tertiary,
    stepIndicatorLabelUnFinishedColor : myColors.text
});

const getStyles = (myColors) => StyleSheet.create({
    safe: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: myColors.primary
    },
    logoContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    logo: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: myColors.text
    },
    ing: {
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: myColors.text
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
        borderBottomWidth: 1,
        borderColor: myColors.text
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: myColors.text
    },
    ingredientImage: {
        width: 70,
        height: 70,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    ingredientDetails: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 20,
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
        color: myColors.text
    },
    addToCartButton: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 10,
        alignSelf: 'center',
        backgroundColor: myColors.clickable
    },
    addToCartButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    recipeStepsContainer: {
        marginVertical: 30,
        paddingHorizontal: 16,
        paddingBottom: 20,
        backgroundColor: myColors.primary,
    },
    stepperContainer: {
        flex: 1,
        flexDirection: 'row', // Change this to row for RTL direction
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    stepIndicatorWrapper: {
        flexDirection: 'column', // Change this to column for RTL direction
        alignItems: 'flex-start', // Align the step indicator to the start
        marginRight: 20, // Space between step indicator and content
    },
    stepContainer: {
        marginBottom: 10,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: myColors.text,
        marginBottom: 5,
    },
    stepDescription: {
        fontSize: 16,
        color: myColors.text
    },
});
