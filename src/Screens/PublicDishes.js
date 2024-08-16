import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    ActivityIndicator,
    StyleSheet,
    SafeAreaView,
    Platform,
    StatusBar,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { collection, getDocs, updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore';
import { authentication, db } from '../../Firebaseconfig';
import { myColors as color } from "../Utils/MyColors";
import { ThemeContext } from "../../contexts/ThemeContext";
import Logo from "../Components/Logo";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from '@expo/vector-icons';
import { useUser } from "../../contexts/UserContext";
import {Picker} from "@react-native-picker/picker";

const PublicDishes = () => {
    const [publicDishes, setPublicDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('likes');
    const [theme] = useContext(ThemeContext);
    const { user } = useUser();
    const navigation = useNavigation();
    const auth = authentication;
    const myColors = color[theme.mode];
    const styles = getStyles(myColors);

    const fetchPublicDishes = async () => {
        setLoading(true);
        try {
            const dishesCollectionRef = collection(db, 'PublicDishes');
            const querySnapshot = await getDocs(dishesCollectionRef);

            const dishes = await Promise.all(querySnapshot.docs.map(async (doc) => {
                const data = doc.data();
                const dishId = doc.id;
                const dishData = {
                    id: dishId,
                    ...data,
                };

                // Check if the current user has liked this dish
                if (auth.currentUser) {
                    const docSnap = await getDoc(doc.ref);
                    const dish = docSnap.data();
                    if (dish.likes && Array.isArray(dish.likes)) {
                        dishData.isLiked = dish.likes.includes(auth.currentUser.uid);
                    }
                }

                return dishData;
            }));

            // Sort the dishes based on the selected sort option
            dishes.sort((a, b) => {
                if (sortOption === 'likes') {
                    return (b.likes?.length || 0) - (a.likes?.length || 0);
                } else if (sortOption === 'reviews') {
                    return (b.rating || 0) - (a.rating || 0);
                }
            });

            setPublicDishes(dishes);
            setError(null);
        } catch (err) {
            setError('Failed to load public dishes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicDishes();
    }, [sortOption]); // Fetch dishes again when the sort option changes

    const handleLikeDish = async (dishId) => {
        if (!auth.currentUser) {
            console.error('User is not logged in or user ID is missing');
            return;
        }

        try {
            const dishRef = doc(db, 'PublicDishes', dishId);
            const docSnap = await getDoc(dishRef);

            if (!docSnap.exists()) {
                console.error('Dish does not exist');
                return;
            }

            const dishData = docSnap.data();
            if (!Array.isArray(dishData.likes)) {
                console.error('Likes field is not an array');
                return;
            }

            const isLiked = dishData.likes.includes(auth.currentUser.uid);

            // Toggle like status
            if (isLiked) {
                // Unlike the dish
                await updateDoc(dishRef, {
                    likes: dishData.likes.filter(uid => uid !== auth.currentUser.uid)
                });
            } else {
                // Like the dish
                await updateDoc(dishRef, {
                    likes: arrayUnion(auth.currentUser.uid)
                });
            }

            // Update the local state immediately
            setPublicDishes(prevDishes => prevDishes.map(dish =>
                dish.id === dishId
                    ? { ...dish, isLiked: !isLiked, likes: isLiked ? dish.likes.filter(uid => uid !== auth.currentUser.uid) : [...dish.likes, auth.currentUser.uid] }
                    : dish
            ));
        } catch (err) {
            console.error('Failed to like/unlike the dish:', err);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.dishItem} onPress={() => navigation.navigate('DishDetails', { dish: item })}>
            {item.Image && (
                <Image source={{ uri: item.Image }} style={styles.dishImage} />
            )}
            <View style={styles.dishTextContainer}>
                <Text style={styles.dishName}>{item.Name}</Text>
                <Text style={styles.dishSteps}>
                    Made By: {item.User}
                </Text>
                <TouchableOpacity
                    style={styles.likeButton}
                    onPress={() => handleLikeDish(item.id)}
                >
                    <FontAwesome name="heart" size={24} color={item.isLiked ? 'red' : myColors.text} />
                    <Text style={styles.likeCount}>{item.likes?.length || 0}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.commentContainer}>
                <Text style={styles.commentTitle}>Comments</Text>
                {item.comments?.length > 0 ? (
                    item.comments.map((comment, index) => (
                        <Text key={index} style={styles.commentText}>
                            <Text style={styles.commentUser}>{comment.user}:</Text> {comment.text}
                        </Text>
                    ))
                ) : (
                    <Text style={styles.noComments}>No comments yet.</Text>
                )}
                <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment"
                    placeholderTextColor={myColors.placeholder}
                    onSubmitEditing={(e) => handleCommentDish(item.id, e.nativeEvent.text)}
                />
            </View>

            <View style={styles.reviewContainer}>
                <Text style={styles.reviewTitle}>Review</Text>
                <View style={styles.starContainer}>
                    {[...Array(5)].map((_, index) => (
                        <FontAwesome
                            key={index}
                            name={index < item.rating ? 'star' : 'star-o'}
                            size={24}
                            color={myColors.text}
                            onPress={() => handleRatingDish(item.id, index + 1)}
                        />
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );

    const handleCommentDish = async (dishId, comment) => {
        try {
            const dishRef = doc(db, 'PublicDishes', dishId);
            const commentData = {
                text: comment,
                user: user.name || "Anonymous" // Assuming displayName holds the user's name
            };
            await updateDoc(dishRef, {
                comments: arrayUnion(commentData)
            });
            fetchPublicDishes();
        } catch (err) {
            console.error('Failed to comment on the dish:', err);
        }
    };

    const handleRatingDish = async (dishId, rating) => {
        try {
            const dishRef = doc(db, 'PublicDishes', dishId);
            await updateDoc(dishRef, {
                rating
            });
            fetchPublicDishes();
        } catch (err) {
            console.error('Failed to rate the dish:', err);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <Logo />
                <ActivityIndicator size="large" color={myColors.text} style={styles.loader} />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.safe}>
                <Logo />
                <Text style={styles.errorText}>{error}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <Logo />
            <Text style={styles.heading}>Public Dishes</Text>

            {/* Sorting Options */}
            <View style={styles.sortContainer}>
                <Text style={styles.sortLabel}>Sort by:</Text>
                <Picker
                    selectedValue={sortOption}
                    style={styles.picker}
                    onValueChange={(itemValue) => setSortOption(itemValue)}
                >
                    <Picker.Item label="Likes" value="likes" />
                    <Picker.Item label="Reviews" value="reviews" />
                </Picker>
            </View>

            <FlatList
                data={publicDishes}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No public dishes available.</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const getStyles = (myColors) => StyleSheet.create({
    safe: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: myColors.primary,
        paddingHorizontal: 16,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: myColors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    dishItem: {
        backgroundColor: myColors.secondary,
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
    },
    dishImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    dishTextContainer: {
        marginTop: 10,
    },
    dishName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: myColors.text,
    },
    dishSteps: {
        fontSize: 14,
        color: myColors.text,
        marginTop: 5,
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    likeCount: {
        fontSize: 16,
        color: myColors.text,
        marginLeft: 5,
    },
    commentContainer: {
        marginTop: 10,
    },
    commentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: myColors.text,
    },
    commentText: {
        fontSize: 14,
        color: myColors.text,
        marginTop: 5,
    },
    commentUser: {
        fontWeight: 'bold',
    },
    noComments: {
        fontSize: 14,
        color: myColors.text,
        marginTop: 5,
    },
    commentInput: {
        borderColor: myColors.border,
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
        marginTop: 10,
        color: myColors.text,
    },
    reviewContainer: {
        marginTop: 10,
    },
    reviewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: myColors.text,
    },
    starContainer: {
        flexDirection: 'row',
        marginTop: 5,
    },
    loader: {
        marginTop: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: myColors.text,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 10,
    },
    sortLabel: {
        fontSize: 16,
        color: myColors.text,
        marginRight: 10,
    },
    picker: {
        height: 50,
        width: 150,
        color: myColors.text,
    },
});

export default PublicDishes;
