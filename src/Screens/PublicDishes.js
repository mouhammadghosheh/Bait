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

const PublicDishes = () => {
    const [publicDishes, setPublicDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('likes');
    const [menuVisible, setMenuVisible] = useState(false);
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

                if (auth.currentUser) {
                    const docSnap = await getDoc(doc.ref);
                    const dish = docSnap.data();
                    if (dish.likes && Array.isArray(dish.likes)) {
                        dishData.isLiked = dish.likes.includes(auth.currentUser.uid);
                    }
                }

                return dishData;
            }));

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
    }, [sortOption]);

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

            if (isLiked) {
                await updateDoc(dishRef, {
                    likes: dishData.likes.filter(uid => uid !== auth.currentUser.uid)
                });
            } else {
                await updateDoc(dishRef, {
                    likes: arrayUnion(auth.currentUser.uid)
                });
            }

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
                user: user.name || "Anonymous"
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

            <View style={styles.sortContainer}>
                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => setMenuVisible(!menuVisible)}
                >
                    <Text style={styles.sortLabel}>Sort by: {sortOption}</Text>
                    <FontAwesome name={menuVisible ? 'chevron-up' : 'chevron-down'} size={16} color={myColors.text} />
                </TouchableOpacity>
                {menuVisible && (
                    <View style={styles.sortMenu}>
                        <TouchableOpacity
                            style={styles.sortMenuItem}
                            onPress={() => {
                                setSortOption('likes');
                                setMenuVisible(false);
                            }}
                        >
                            <Text style={styles.sortMenuItemText}>Likes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.sortMenuItem}
                            onPress={() => {
                                setSortOption('reviews');
                                setMenuVisible(false);
                            }}
                        >
                            <Text style={styles.sortMenuItemText}>Reviews</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <FlatList
                data={publicDishes}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContentContainer}
            />
        </SafeAreaView>
    );
};

const getStyles = (myColors) => StyleSheet.create({
    safe: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: myColors.primary,
    },
    loader: {
        marginTop: 20,
    },
    errorText: {
        textAlign: 'center',
        color: myColors.text,
        fontSize: 18,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: myColors.text,
    },
    sortContainer: {
        marginHorizontal: 16,
        marginBottom: 8,
    },
    sortButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        backgroundColor: myColors.secondary,
    },
    sortLabel: {
        color: myColors.text,
        fontSize: 16,
    },
    sortMenu: {
        backgroundColor: myColors.secondary,
        borderRadius: 8,
        marginTop: 8,
    },
    sortMenuItem: {
        padding: 8,
    },
    sortMenuItemText: {
        color: myColors.text,
        fontSize: 16,
    },
    listContentContainer: {
        paddingHorizontal: 16,
    },
    dishItem: {
        marginBottom: 16,
        borderRadius: 8,
        backgroundColor: myColors.secondary,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
    },
    dishImage: {
        width: '100%',
        height: 200,
    },
    dishTextContainer: {
        padding: 12,
    },
    dishName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: myColors.text,
        marginBottom: 4,
    },
    dishSteps: {
        fontSize: 16,
        color: myColors.text,
        marginBottom: 8,
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    likeCount: {
        fontSize: 16,
        marginLeft: 8,
        color: myColors.text,
    },
    commentContainer: {
        padding: 12,
    },
    commentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: myColors.text,
    },
    commentText: {
        fontSize: 14,
        color: myColors.text,
        marginBottom: 4,
    },
    noComments: {
        fontSize: 14,
        color: myColors.text,
        marginBottom: 8,
    },
    commentInput: {
        fontSize: 16,
        padding: 8,
        borderRadius: 8,
        backgroundColor: myColors.secondary,
        color: myColors.text,
    },
    reviewContainer: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
        color: myColors.text,
    },
    starContainer: {
        flexDirection: 'row',
    },
    commentUser: {
        fontWeight: 'bold',
    },
});

export default PublicDishes;
