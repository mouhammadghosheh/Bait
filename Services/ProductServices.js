// import {useProducts} from "../contexts/ProductContext";
// //fetch products from db
// const ProductServices =  (CategoryID) => {
//     const {products} = useProducts()
//     if (!products) {
//         return []; // Return empty array or handle the null case as needed
//     }
//     const filteredProducts = products.filter(product => product.Category === "/Categories/"+CategoryID);
//
//     return filteredProducts
// };
//

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../Firebaseconfig";

const ProductServices = async (CategoryID) => {
    try {
        const productRef = collection(db, 'Products');
        // Create a query to fetch only the products with the specific CategoryID
        const q = query(productRef, where("Category", "==", `/Categories/${CategoryID}`));
        const querySnapshot = await getDocs(q);

        // Map through the documents and return the products array
        const filteredProducts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return filteredProducts; // Return the filtered products
    } catch (error) {
        console.error("Error fetching products:", error);
        return []; // Return an empty array in case of an error
    }
}

export default ProductServices;

