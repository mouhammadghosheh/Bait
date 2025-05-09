import React from 'react';
import { Image, StyleSheet, View } from "react-native";

const Logo = ({ width = 150, height = 150 }) => {
    return (
        <View style={styles.header}>
            <Image style={[styles.logo, { width, height }]} source={require('../../src/assets/logo.png')} />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
    },
    logo: {
    },
});

export default Logo;
