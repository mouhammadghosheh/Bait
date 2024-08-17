import React from "react";
import {
    SafeAreaView,
    Text,
    TouchableOpacity,
    FlatList,
    View,
    Image,
    StyleSheet,
    Platform,
    StatusBar,
    Dimensions
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { removeFromCart, decrementQuantity, incrementQuantity } from "../../Redux/CartSlice";
import { myColors as color } from "../Utils/MyColors";
import { AntDesign } from '@expo/vector-icons';
import { ThemeContext } from "../../contexts/ThemeContext";
import AwesomeButton from "react-native-really-awesome-button";

const Cart = () => {
    const [theme] = React.useContext(ThemeContext);
    const myColors = color[theme.mode];
    const styles = getStyles(myColors);

    const { width: windowWidth } = Dimensions.get('window');
    const nav = useNavigation();
    const dispatch = useDispatch();
    const storeData = useSelector((state) => state.cart);
    const totalAmount = storeData.products.reduce((acc, curr) => acc + (curr.quantity * curr.Price), 0).toFixed(2);

    return (
        <SafeAreaView style={styles.safe}>
            <Text style={styles.title}>My Cart</Text>
            <FlatList
                data={storeData.products}
                bounces={true}
                numColumns={3} // Three items per row
                columnWrapperStyle={{ justifyContent: "flex-start" }} // Even spacing between columns
                renderItem={({ item }) => (
                    <View style={styles.productContainer}>
                        <Image style={styles.image} source={{ uri: item.Image }} />
                        <Text style={styles.productName}>{item.Name}</Text>
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity onPress={() => dispatch(decrementQuantity(item))}>
                                <AntDesign name="minus" size={20} color={myColors.text} />
                            </TouchableOpacity>
                            <Text style={styles.quantity}>{item.quantity} {item.Scale ? 'Kg' : ''}</Text>
                            <TouchableOpacity onPress={() => dispatch(incrementQuantity(item))}>
                                <AntDesign name="plus" size={20} color={myColors.text} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.price}>₪ {(item.quantity * item.Price).toFixed(2)}</Text>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => dispatch(removeFromCart(item))}>
                            <AntDesign name="delete" size={20} color={myColors.text} />
                        </TouchableOpacity>
                    </View>
                )}
                keyExtractor={(item, index) => index.toString()}
            />
            <View style={styles.footer}>
                <Text style={styles.totalAmount}>Total Amount: ₪ {totalAmount}</Text>
                <AwesomeButton
                    backgroundDarker={myColors.clickable}
                    borderRadius={14}
                    springRelease={false}
                    textSize={18}
                    width={windowWidth - 40}
                    backgroundColor={myColors.clickable}
                    onPress={() => nav.navigate("Checkout", { totalAmount, items: storeData.products })}
                >
                    Go to Checkout
                </AwesomeButton>
            </View>
        </SafeAreaView>
    );
};

const getStyles = (myColors) => StyleSheet.create({
    safe: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: myColors.primary,
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
        paddingBottom: 15,
        color: myColors.text,
    },
    productContainer: {
        backgroundColor: myColors.cardContainer,
        borderColor: myColors.border,
        borderWidth: 1,
        borderRadius: 10,
        padding: 8,
        width: '30%', // Adjusted width for three columns
        marginBottom: 10,
        marginRight: 1,
        marginLeft: 10,
        // Add shadow for iOS
        shadowColor: myColors.text,
        shadowOffset: {
            width: 3,
            height: 5,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        // Add shadow for Android
        elevation: 8,
    },
    image: {
        resizeMode: 'contain',
        width: "100%",
        height: 70, // Adjusted height to fit smaller cards
        borderRadius: 10,
        marginBottom: 8,
    },
    productName: {
        fontSize: 14, // Adjusted font size
        fontWeight: 'bold',
        color: myColors.text,
        textAlign: 'center',
        marginBottom: 5,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    quantity: {
        fontSize: 14, // Adjusted font size
        fontWeight: 'bold',
        color: myColors.text,
        textAlign: 'center',
    },
    price: {
        fontSize: 14, // Adjusted font size
        fontWeight: 'bold',
        color: myColors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    deleteButton: {
        alignSelf: 'center',
        marginTop: 5,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: myColors.background,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: myColors.text,
        textAlign: 'center',
        marginTop: 10,
    },
});

export default Cart;
