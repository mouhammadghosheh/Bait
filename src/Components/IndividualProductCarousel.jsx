import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import React, { useContext, useState } from "react";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { myColors as color } from "../Utils/MyColors";
import { ThemeContext } from "../../contexts/ThemeContext";
import Icon from 'react-native-vector-icons/FontAwesome';
import Popup from "../Components/PopUp";  // Import the Popup component

const IndividualProductCarousel = ({ data, seeMore = true }) => {
    const [theme] = useContext(ThemeContext);
    let myColors = color[theme.mode];
    const nav = useNavigation();

    const [selectedItem, setSelectedItem] = useState(null);  // State for selected item

    const extendedData = seeMore ? [...data.slice(0, 5), { seeMore: true }] : data.slice(0, 5);
    const navigateToCategoryProducts = (categoryName) => {
        nav.navigate("CategoryProducts", { categoryName });
    };

    return (
        <View>
            <FlatList
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={extendedData}
                renderItem={({ item }) => (
                    item.seeMore ? (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={{
                                backgroundColor: myColors.cardContainer,
                                marginBottom: 8,
                                height: responsiveHeight(23),
                                borderWidth: 1,
                                borderColor: myColors.border,
                                width: responsiveWidth(35),
                                marginRight: 10,
                                borderRadius: 10,
                                justifyContent: 'center',
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

                            }}
                            onPress={() => {
                                navigateToCategoryProducts(extendedData[1].Category.split('/')[2])
                            }}
                        >
                            <Text style={{
                                fontSize: 16,
                                fontWeight: "600",
                                color: myColors.text,
                                marginBottom: 10
                            }}>See More</Text>
                            <Icon name="angle-double-right" size={30} color={myColors.text} />
                        </TouchableOpacity>
                    ) : item.Stock > 0 ? (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={{
                                backgroundColor: myColors.cardContainer,
                                height: responsiveHeight(23),
                                borderWidth: 1,
                                borderColor: myColors.border,
                                width: responsiveWidth(35),
                                marginRight: 10,
                                borderRadius: 10,
                                shadowColor: myColors.text,
                                shadowOffset: {
                                    width: 3,
                                    height: 4,
                                },
                                shadowOpacity: 0.17,
                                shadowRadius: 4,
                                // Add shadow for Android
                                elevation: 3,
                            }}
                            onPress={() => setSelectedItem(item)}  // Open popup on item press
                        >
                            <Image style={{ height: 100, borderRadius: 20, resizeMode: "contain",margin : 5 ,marginVertical: 10 }}
                                   source={{ uri: item.Image }} />
                            <View style={{ paddingHorizontal: 10 }}>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: "600",
                                    height: 40,
                                    color: myColors.text,
                                    textAlign: 'center'
                                }}>{item.Name}</Text>
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    <Text style={{
                                        fontSize: 15,
                                        fontWeight: 'bold',
                                        color: myColors.text,
                                    }}>₪{item.Price} {item.Scale ? 'per Kg' : ''}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <View
                            style={{
                                height: responsiveHeight(23),
                                borderWidth: 1,
                                backgroundColor: myColors.cardContainer,
                                borderColor: myColors.border,
                                width: responsiveWidth(35),
                                marginRight: 10,
                                borderRadius: 10,
                                opacity: 0.5,
                                shadowColor: myColors.text,
                                shadowOffset: {
                                    width: 3,
                                    height: 4,
                                },
                                shadowOpacity: 0.17,
                                shadowRadius: 4,
                                // Add shadow for Android
                                elevation: 8,
                            }}
                        >
                            <Image style={{ height: 100, borderRadius: 10, resizeMode: "contain", marginVertical: 10 }}
                                   source={{ uri: item.Image }} />
                            <View style={{ paddingHorizontal: 10 }}>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: "600",
                                    height: 25,
                                    textAlign: 'center',
                                    color: myColors.text
                                }}>{item.Name}</Text>
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center", // Centering the price
                                }}>
                                    <Text style={{
                                        fontSize: 15,
                                        fontWeight: 'bold',
                                        color: myColors.text,
                                        textAlign: 'center',
                                    }}>₪{item.Price} {item.Scale ? 'per Kg' : ''}</Text>
                                </View>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    color: 'red',
                                    marginTop: 5
                                }}>Out of Stock</Text>
                            </View>
                        </View>
                    )
                )}
            />

            {/* Popup Component */}
            {selectedItem && (
                <Popup
                    item={selectedItem}
                    isVisible={Boolean(selectedItem)}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </View>
    );
}

export default IndividualProductCarousel;
