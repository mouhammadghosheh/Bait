import { authentication, db } from '../Firebaseconfig';
import { collection, doc, getDocs } from "firebase/firestore";

const CustomDishesServices = async () => {
    try {
        const user = authentication.currentUser;
        if (user) {
            // Reference to the user's document
            const parentDocRef = doc(db, 'Users', user.uid);
            // Reference to the 'CustomDishes' sub-collection
            const subCollectionRef = collection(parentDocRef, 'CustomDishes');

            // Get all documents from the sub-collection
            const querySnapshot = await getDocs(subCollectionRef);
            const customDishes = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            return customDishes; // Return the list of custom dishes
        } else {
            console.log('No user is currently signed in.');
            return []; // Return an empty array if no user is signed in
        }
    } catch (err) {
        console.error('Error fetching custom dishes:', err);
        return []; // Handle the error as needed, returning an empty array for now
    }
};

export default CustomDishesServices;
