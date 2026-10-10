const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, get, remove } = require("firebase/database");
const firebaseConfig = {
    apiKey: "AIzaSyA422KuGv-lJ86IJrjAxo67OeM8QOfpdZ4",
    authDomain: "imk-fando-aufa.firebaseapp.com",
    databaseURL: "https://imk-fando-aufa-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "imk-fando-aufa",
    storageBucket: "imk-fando-aufa.firebasestorage.app",
    messagingSenderId: "142656276642",
    appId: "1:142656276642:web:bfa43814f9f5f2155beffb",
    measurementId: "G-9254JPQS09"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const staticMenus = [
    { id: 'nasi-goreng', name: 'Nasi Goreng', price: 15000, category: 'berat', image: 'Menu/Makanan/Nasi Goreng.jpg', hasVariants: true, rekomendasi: false, stock: true },
    { id: 'batagor', name: 'Batagor', price: 10000, category: 'cemilan', image: 'Menu/Makanan/Batagor.jpg', rekomendasi: false, stock: true },
    { id: 'bakso', name: 'Bakso Sapi', price: 12000, category: 'berat', image: 'Menu/Makanan/Bakso.jpg', hasVariants: true, rekomendasi: false, stock: true },
    { id: 'pecel-sayur', name: 'Pecel Sayur', price: 10000, category: 'berat', image: 'Menu/Makanan/pecel sayur.jpg', hasVariants: true, rekomendasi: false, stock: true },
    { id: 'indomie', name: 'Indomie', price: 8000, category: 'mie', image: 'Menu/Makanan/INDOMIE.jpg', hasVariants: true, rekomendasi: false, stock: { "Goreng Original": 10, "Goreng Aceh": 10, "Soto Spesial": 10, "Kari Ayam": 10 } },
    { id: 'kwetiau', name: 'Kwetiau Goreng', price: 15000, category: 'mie', image: 'Menu/Makanan/kwetiau goreng.jpg', hasVariants: true, rekomendasi: false, stock: true },
    { id: 'mie-ayam', name: 'Mie Ayam', price: 12000, category: 'mie', image: 'Menu/Makanan/mie ayam.jpg', hasVariants: true, rekomendasi: false, stock: true },
    { id: 'mie-dokdok', name: 'Mie Dok-Dok Spesial', price: 12000, category: 'mie', image: 'Menu/Makanan/mie dok dok.jpg', hasVariants: true, rekomendasi: true, stock: true },
    { id: 'es-teh', name: 'Es Teh', price: 4000, category: 'minuman-dingin', image: 'Menu/Minuman/Es Teh.jpg', hasVariants: true, rekomendasi: false, stock: true },
    { id: 'es-dawet', name: 'Es Dawet', price: 6000, category: 'minuman-dingin', image: 'Menu/Minuman/Es dawet.jpg', rekomendasi: false, stock: true },
    { id: 'soda-gembira', name: 'Soda Gembira', price: 10000, category: 'minuman-dingin', image: 'Menu/Minuman/Soda Gembira.jpg', rekomendasi: false, stock: true },
    { id: 'es-degan', name: 'Es Degan', price: 8000, category: 'minuman-dingin', image: 'Menu/Minuman/es degan dengan gula merah.jpg', rekomendasi: false, stock: true },
    { id: 'good-day-es', name: 'Good Day Es', price: 6000, category: 'minuman-dingin', image: 'Menu/Minuman/good day es.jpg', hasVariants: true, rekomendasi: false, stock: { "Mocacinno": 10, "Cappuccino": 10, "Original": 10, "Butterscotch": 10, "Hazelnut Macchiato": 10 } },
    { id: 'jus-buah', name: 'Jus Buah', price: 8000, category: 'minuman-dingin', image: 'Menu/Minuman/jus buah.jpg', hasVariants: true, rekomendasi: false, stock: { "Mangga": 10, "Alpukat": 10, "Melon": 10, "Jeruk": 10 } },
    { id: 'beng-beng', name: 'Beng Beng Drink', price: 6000, category: 'minuman-dingin', image: 'Menu/Minuman/beng beng drink.jpg', rekomendasi: false, stock: true },
    { id: 'chocolatos', name: 'Chocolatos Drink', price: 6000, category: 'minuman-dingin', image: 'Menu/Minuman/chocolatos drink.jpg', hasVariants: true, rekomendasi: false, stock: { "Cokelat Original": 10, "Matcha Latte": 10, "Creamy": 10, "Vanilla": 10 } },
    { id: 'milo', name: 'Milo', price: 7000, category: 'minuman-dingin', image: 'Menu/Minuman/milo.jpg', rekomendasi: false, stock: true },
    { id: 'teajus', name: 'Teajus', price: 3000, category: 'minuman-dingin', image: 'Menu/Minuman/Teajus.jpg', hasVariants: true, rekomendasi: false, stock: { "Gula Batu": 10, "Melati": 10, "Lemon": 10, "Apel": 10, "Madu": 10 } },
    { id: 'es-kopi', name: 'Es Kopi Aren', price: 10000, category: 'minuman-dingin', image: 'Menu/Minuman/es kopi.jpg', rekomendasi: true, stock: true },
    { id: 'good-day-panas', name: 'Good Day Panas', price: 5000, category: 'minuman-panas', image: 'Menu/Minuman/good day panas.jpg', hasVariants: true, rekomendasi: false, stock: { "Mocacinno": 10, "Cappuccino": 10, "Original": 10, "Butterscotch": 10, "Hazelnut Macchiato": 10 } },
    { id: 'teh-panas', name: 'Teh Manis Panas', price: 4000, category: 'minuman-panas', image: 'Menu/Minuman/teh panas.jpg', rekomendasi: false, stock: true },
    { id: 'beng-beng-panas', name: 'Beng Beng Panas', price: 6000, category: 'minuman-panas', image: 'Menu/Minuman/beng beng drink.jpg', rekomendasi: false, stock: true },
    { id: 'chocolatos-panas', name: 'Chocolatos Panas', price: 6000, category: 'minuman-panas', image: 'Menu/Minuman/chocolatos drink.jpg', hasVariants: true, rekomendasi: false, stock: { "Cokelat Original": 10, "Matcha Latte": 10, "Creamy": 10, "Vanilla": 10 } },
    { id: 'milo-panas', name: 'Milo Panas', price: 7000, category: 'minuman-panas', image: 'Menu/Minuman/milo panas.jpg', rekomendasi: false, stock: true },
    { id: 'nasi-ikan', name: 'Nasi Ikan Bakar', price: 20000, category: 'berat', image: 'Menu/Makanan/nasi ikan bakar.jpg', rekomendasi: false, stock: true },
    { id: 'ayam-geprek', name: 'Ayam Geprek', price: 15000, category: 'berat', image: 'Menu/Makanan/ayam geprek.jpg', rekomendasi: true, stock: true },
    { id: 'ice-cream', name: 'Ice Cream Cone', price: 8000, category: 'es', image: 'Menu/es krim.jpg', rekomendasi: true, stock: true },
    { id: 'kentang', name: 'Kentang Goreng', price: 10000, category: 'cemilan', image: 'Menu/Makanan/kentang goreng.avif', rekomendasi: false, stock: true }
];

async function seed() {
    console.log("Clearing menus...");
    const menusRef = ref(db, "menus");
    await remove(menusRef);

    console.log("Seeding menus...");
    for (let menu of staticMenus) {
        const itemRef = ref(db, "menus/" + menu.id);
        const { id, ...menuData } = menu; // Don't store 'id' field in the doc, just use doc ID
        await set(itemRef, menuData);
    }
    console.log("Done!");
    process.exit(0);
}
seed().catch(console.error);
