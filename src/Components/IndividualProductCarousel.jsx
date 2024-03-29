import {FlatList, Image, Text, TouchableOpacity, View} from "react-native";
import React from "react";
import {responsiveHeight, responsiveWidth} from "react-native-responsive-dimensions";
import {Entypo} from '@expo/vector-icons';
import {useNavigation} from "@react-navigation/native";
import {myColors as color} from "../Utils/MyColors";
import {ThemeContext} from "../../contexts/ThemeContext";
import {useContext} from "react";

const IndividualProductCarousel = ({data}) => {
    const [theme] = useContext(ThemeContext);
    let myColors = color[theme.mode];
    const nav = useNavigation();
    return (
        <View>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={data}
                renderItem={({item, index}) => (
                    // product card
                    <TouchableOpacity
                        onPress={() => nav.navigate('ProductDetailsPopup', {
                            main: item
                        })
                        }
                        activeOpacity={0.7}
                        style={{
                            backgroundColor:myColors.white,
                            height: responsiveHeight(23),
                            borderWidth: 2,
                            borderColor: myColors.white,
                            width: responsiveWidth(30),
                            marginRight: 15,
                            borderRadius: 10,

                        }}
                    >
                        <Image style={{height: 100,borderRadius:30,resizeMode: "contain", marginVertical:10}} source={{uri: item.img}}/>
                        <View style={{paddingHorizontal: 10}}>
                            {/* product name */}
                            <Text style={{
                                fontSize: 16,
                                fontWeight: "600",
                                color:myColors.text
                            }}>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</Text>
                            {/* product price */}
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: 18
                            }}>
                                <Text style={{fontSize: 14, fontWeight: 'bold', color:myColors.text}}>₪ {item.price}</Text>
                                <Entypo name="squared-plus" size={33} color="#04AA6D"/>
                            </View>


                        </View>

                    </TouchableOpacity>
                )}/>
        </View>
    )
}


export default IndividualProductCarousel;
