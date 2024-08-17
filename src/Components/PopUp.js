import React, { useContext, useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    Text,
    TouchableOpacity,
    Image,
    Pressable,
    Animated
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing icons
import { useDispatch } from 'react-redux';
import { addToCart } from '../../Redux/CartSlice'; // Adjust the import path as necessary
import { ThemeContext } from "../../contexts/ThemeContext";
import { myColors as color } from "../Utils/MyColors";

const Popup = ({ item, isVisible, onClose }) => {
    const [theme] = useContext(ThemeContext);
    let myColors = color[theme.mode];
    const styles = getStyles(myColors);

    const [quantity, setQuantity] = useState(1);
    const [showNotification, setShowNotification] = useState(false); // State to control notification visibility
    const dispatch = useDispatch();

    const scaleAnim = useRef(new Animated.Value(1)).current; // Initial scale value: 1
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for notification opacity: 0

    const increment = () => setQuantity(prev => prev + 1);
    const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = () => {
        // Animate the button to scale up and down
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.2, // Scale up
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1, // Scale back to original
                duration: 150,
                useNativeDriver: true,
            })
        ]).start(() => {
            dispatch(addToCart({ ...item, quantity }));
            onClose()
        });
    };



    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <Pressable style={styles.centeredView} onPress={onClose}>
                <Pressable style={styles.modalView} onPress={(e) => e.stopPropagation()}>
                    <Image source={{ uri: item.Image }} style={styles.image} />
                    <Text style={styles.modalText}>{item.Name}</Text>

                    <View style={styles.quantityContainer}>
                        <TouchableOpacity style={styles.quantityButton} onPress={decrement}>
                            <Icon name="remove" size={25} color={myColors.text} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity style={styles.quantityButton} onPress={increment}>
                            <Icon name="add" size={25} color={myColors.text} />
                        </TouchableOpacity>
                    </View>

                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonAddToCart]}
                            onPress={handleAddToCart}
                        >
                            <Text style={styles.textStyle}>Add to Cart</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Pressable>
            </Pressable>

            {showNotification && (
                <Animated.View
                    style={[
                        styles.notification,
                        { opacity: fadeAnim }
                    ]}
                >
                    <Text style={styles.notificationText}>{`${item.Name} added to cart`}</Text>
                </Animated.View>
            )}
        </Modal>
    );
};

const getStyles = (myColors) => StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 90,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    modalView: {

        margin: 20,
        marginTop: 100,
        backgroundColor: myColors.white,
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: myColors.text,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 7,
        elevation: 5,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
    },
    quantityButton: {
        backgroundColor : myColors.clickable,
        padding: 5,
        borderRadius: 5,
        marginHorizontal: 20,
    },
    quantityText: {
        fontSize: 25,
        color: myColors.text,
    },
    button: {
        borderRadius: 20,
        paddingHorizontal: 50,
        paddingVertical: 10,
        elevation: 2,
        marginTop: 10,
        width: '80%',
        alignItems: 'center',
    },
    buttonAddToCart: {
        backgroundColor: myColors.clickable,
    },
    buttonClose: {
        backgroundColor: myColors.clickable,
    },
    textStyle: {
        fontSize: 16,
        color: myColors.text,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 5,
        fontSize: 20,
        textAlign: 'center',
        color: myColors.text,
    },
    notification: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        backgroundColor: myColors.clickable,
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    notificationText: {
        color: 'white',
        fontSize: 16,
    },
});

export default Popup;
