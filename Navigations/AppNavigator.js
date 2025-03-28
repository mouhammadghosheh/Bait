import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import AuthStack from './AuthStack'; // Import your authentication stack
import HomeStack from './BottomTabBar'; // Import your home stack
import { onAuthStateChanged } from "firebase/auth";
import { authentication, db } from "../Firebaseconfig";
import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import { useUser } from "../contexts/UserContext";
import LoadingScreen from "../src/Components/LoadingScreen";
import { useProducts } from "../contexts/ProductContext";
import { enableScreens } from 'react-native-screens';

enableScreens();
const Stack = createStackNavigator();

const AppNavigator = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    const { setUser } = useUser();
    const { setProducts } = useProducts();
    const [isLoading, setIsLoading] = useState(true); // State to control loading

    // Function to handle successful login
    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    // Function to fetch user data
    const fetchUserData = async () => {
        const user = authentication.currentUser;
        if (user) {
            try {
                const userDocRef = doc(db, "Users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setUser(userData);
                    setUserData(userData);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }
    };

    // Function to fetch products
    const fetchProducts = async () => {
        try {
            const productRef = collection(db, 'Products');
            const q = query(productRef);
            const querySnapshot = await getDocs(q);
            setProducts(querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })));
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // Check authentication status
    const checkAuthentication = () => {
        onAuthStateChanged(authentication, async (user) => {
            if (user) {
                setIsAuthenticated(true);
                await fetchUserData();
                await fetchProducts();
            } else {
                setIsAuthenticated(false);
            }
            setIsLoading(false); // Set loading to false after checking auth state
        });
    };

    // Check authentication status when component mounts
    useEffect(() => {
        checkAuthentication();
    }, []);

    if (isLoading) {
        // Show loading indicator or splash screen while data is being fetched
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: true,
                    gestureDirection: 'horizontal',
                    ...TransitionPresets.SlideFromRightIOS // Use slide-in animation
                }}
            >
                {isAuthenticated ? (
                    <Stack.Screen name="HomeStack">
                        {(props) => <HomeStack {...props} userData={userData} />}
                    </Stack.Screen>
                ) : (
                    <Stack.Screen
                        name="Auth"
                        options={{ animationTypeForReplace: 'pop' }}
                    >
                        {(props) => <AuthStack {...props} handleLoginSuccess={handleLoginSuccess} />}
                    </Stack.Screen>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
