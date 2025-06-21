// GiftListingPage.js
import React, { useState } from 'react';
import Layout from '../Components/Layout';
import ViewProductModal from '../Components/ViewProductModal';
import BuyConfirmationModal from '../Components/BuyConfirmationModal';
import { FiEye, FiShoppingCart, FiGift, FiChevronRight, FiHeart, FiStar, FiFilter } from 'react-icons/fi';

const GiftListingPage = () => {
    // Real product images with more gift items
    // IMPORTANT: To make the image slider in ViewProductModal fully functional,
    // update your DUMMY_GIFTS to include an 'images' array for each product, e.g.:
    // images: ['url1', 'url2', 'url3'] instead of just 'image: "url1"'
    const DUMMY_GIFTS = [
    {
        id: 'g1',
        images: [
            'https://m.media-amazon.com/images/I/71h6PpG9tQL._AC_UL480_FMwebp_QL65_.jpg',
            'https://m.media-amazon.com/images/I/81P2h8y541L._AC_UL480_FMwebp_QL65_.jpg',
            'https://m.media-amazon.com/images/I/71uK-V3M2ZL._AC_UL480_FMwebp_QL65_.jpg'
        ],
        title: 'Artisan Ceramic Mug Set',
        description: 'Hand-crafted ceramic mugs with unique glaze finishes...',
        price: 799,
        stock: 50,
        buyLink: '#',
        rating: 4.5,
        category: 'Home',
        bestSeller: true
    },
    {
        id: 'g2',
        images: [
            'https://m.media-amazon.com/images/I/71Kj9JQqZVL._AC_UL480_FMwebp_QL65_.jpg',
            'https://m.media-amazon.com/images/I/71iYM5pG1sL._AC_UL480_FMwebp_QL65_.jpg'
        ],
        title: 'Premium Bluetooth Headphones',
        description: 'Crystal clear sound with active noise cancellation...',
        price: 3499,
        stock: 20,
        buyLink: '#',
        rating: 4.8,
        category: 'Electronics',
        bestSeller: true
    },
    {
        id: 'g3',
        images: ['https://m.media-amazon.com/images/I/71qod7ufN4L._AC_UL480_FMwebp_QL65_.jpg'], // Single image - no slider
        title: 'Luxury Scented Candle Set',
        description: 'Hand-poured soy wax candles with premium fragrances...',
        price: 1299,
        stock: 35,
        buyLink: '#',
        rating: 4.6,
        category: 'Home'
    },
    {
        id: 'g4',
        images: [
            'https://m.media-amazon.com/images/I/71Y1S1m-QAL._AC_UL480_FMwebp_QL65_.jpg',
            'https://m.media-amazon.com/images/I/717tHT7L+CL._AC_UL480_FMwebp_QL65_.jpg',
            'https://m.media-amazon.com/images/I/71W61pQd00L._AC_UL480_FMwebp_QL65_.jpg'
        ],
        title: 'Personalized Leather Journal',
        description: 'Genuine full-grain leather notebook with custom embossing...',
        price: 899,
        stock: 28,
        buyLink: '#',
        rating: 4.4,
        category: 'Office'
    },
    {
        id: 'g5',
        images: ['https://m.media-amazon.com/images/I/71Z+5d-D9VL._AC_UL480_FMwebp_QL65_.jpg'], // Single image - no slider
        title: 'Wireless Charging Station',
        description: 'Fast charging pad compatible with all Qi-enabled devices...',
        price: 1599,
        stock: 15,
        buyLink: '#',
        rating: 4.3,
        category: 'Electronics'
    },
    {
        id: 'g6',
        images: [
            'https://m.media-amazon.com/images/I/71QN0xJDxRL._AC_UL480_FMwebp_QL65_.jpg',
            'https://m.media-amazon.com/images/I/81q74WzqC7L._AC_UL480_FMwebp_QL65_.jpg'
        ],
        title: 'Gourmet Chocolate Box',
        description: 'Assorted luxury chocolates from around the world...',
        price: 1499,
        stock: 40,
        buyLink: '#',
        rating: 4.7,
        category: 'Food',
        bestSeller: true
    },
    // Add 'images' arrays for other gifts as needed
    {
        id: 'g7',
        images: ['https://m.media-amazon.com/images/I/71yZQ4X3HVL._AC_UL480_FMwebp_QL65_.jpg'],
        title: 'Stainless Steel Water Bottle',
        description: 'Insulated bottle that keeps drinks hot for 12 hours...',
        price: 999,
        stock: 30,
        buyLink: '#',
        rating: 4.5,
        category: 'Outdoor'
    },
    {
        id: 'g8',
        images: ['https://m.media-amazon.com/images/I/61n+Q++X1LL._AC_UL480_FMwebp_QL65_.jpg'],
        title: 'Smart Watch Fitness Tracker',
        description: 'Track heart rate, sleep, steps, and calories burned...',
        price: 2999,
        stock: 12,
        buyLink: '#',
        rating: 4.2,
        category: 'Electronics'
    },
    {
        id: 'g9',
        images: ['https://m.media-amazon.com/images/I/61g+McQpg7L._AC_UL480_FMwebp_QL65_.jpg'],
        title: 'Aromatherapy Essential Oils Set',
        description: '100% pure therapeutic grade essential oils...',
        price: 899,
        stock: 25,
        buyLink: '#',
        rating: 4.6,
        category: 'Wellness'
    },
    {
        id: 'g10',
        images: ['https://m.media-amazon.com/images/I/71YHjVXyR0L._AC_UL480_FMwebp_QL65_.jpg'],
        title: 'Premium Coffee Gift Basket',
        description: 'A curated selection of gourmet coffees...',
        price: 1799,
        stock: 18,
        buyLink: '#',
        rating: 4.8,
        category: 'Food',
        bestSeller: true
    },
    {
        id: 'g11',
        images: ['https://m.media-amazon.com/images/I/71Gg4U1dMmL._AC_UL480_FMwebp_QL65_.jpg'],
        title: 'Designer Silk Scarf',
        description: 'Hand-rolled edges with unique artistic patterns...',
        price: 2499,
        stock: 8,
        buyLink: '#',
        rating: 4.9,
        category: 'Fashion'
    },
    {
        id: 'g12',
        images: ['https://m.media-amazon.com/images/I/71X8N9O5QBL._AC_UL480_FMwebp_QL65_.jpg'],
        title: 'Portable Bluetooth Speaker',
        description: 'Waterproof speaker with 20-hour playtime and rich bass...',
        price: 2299,
        stock: 22,
        buyLink: '#',
        rating: 4.4,
        category: 'Electronics'
    },
    {
        id: 'g13',
        images: ['https://m.media-amazon.com/images/I/71X8N9O5QBL._AC_UL480_FMwebp_QL65_.jpg'],
        title: 'Handmade Wooden Chess Set',
        description: 'Artisanal chess pieces with walnut and maple board...',
        price: 3499,
        stock: 10,
        buyLink: '#',
        rating: 4.7,
        category: 'Games'
    },
    {
        id: 'g14',
        images: ['https://m.media-amazon.com/images/I/71X8N9O5QBL._AC_UL480_FMwebp_QL65_.jpg'],
        title: 'Personalized Photo Frame',
        description: 'Custom engraved frame with high-quality glass...',
        price: 699,
        stock: 45,
        buyLink: '#',
        rating: 4.5,
        category: 'Home'
    },
    {
        id: 'g15',
        images: ['https://m.media-amazon.com/images/I/71X8N9O5QBL._AC_UL480_FMwebp_QL65_.jpg'],
        title: 'Yoga Mat & Accessories Set',
        description: 'Eco-friendly mat with straps and blocks...',
        price: 1999,
        stock: 15,
        buyLink: '#',
        rating: 4.6,
        category: 'Fitness'
    },
    {
        id: 'g16',
        images: ['https://m.media-amazon.com/images/I/71X8N9O5QBL._AC_UL480_FMwebp_QL65_.jpg'],
        title: 'Gourmet Tea Sampler',
        description: '20 premium loose leaf teas from around the world...',
        price: 1299,
        stock: 30,
        buyLink: '#',
        rating: 4.8,
        category: 'Food'
    }
    ];

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [selectedGift, setSelectedGift] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const [priceFilter, setPriceFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortOption, setSortOption] = useState('featured');

    // Function to open the Quick View Modal
    const handleViewProduct = (gift) => {
        setSelectedGift(gift);
        setIsViewModalOpen(true);
    };

    // Function to close the Quick View Modal
    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedGift(null);
    };

    // Function to open the Buy Confirmation Modal
    const handleOpenBuyModal = (gift) => {
        setSelectedGift(gift);
        setIsBuyModalOpen(true);
    };

    // Function to close the Buy Confirmation Modal
    const handleCloseBuyModal = () => {
        setIsBuyModalOpen(false);
        setSelectedGift(null);
    };

    // Final purchase action (e.g., add to cart, redirect)
    const handleFinalBuy = (giftId, quantity) => {
        // Here you would implement your actual add-to-cart logic
        console.log(`Adding gift ${giftId} with quantity ${quantity} to cart.`);
        // For demonstration, we'll just log and let the modal close.
        // In a real app, you might update global cart state, show a toast notification, etc.
    };


    const toggleWishlist = (giftId) => {
        if (wishlist.includes(giftId)) {
            setWishlist(wishlist.filter(id => id !== giftId));
        } else {
            setWishlist([...wishlist, giftId]);
        }
    };

    // Filter and sort functions
    const filteredGifts = DUMMY_GIFTS.filter(gift => {
        if (priceFilter === 'under1000' && gift.price >= 1000) return false;
        if (priceFilter === '1000-3000' && (gift.price < 1000 || gift.price > 3000)) return false;
        if (priceFilter === 'over3000' && gift.price <= 3000) return false;
        if (categoryFilter && gift.category !== categoryFilter) return false;
        return true;
    });

    const sortedGifts = [...filteredGifts].sort((a, b) => {
        if (sortOption === 'price-low') return a.price - b.price;
        if (sortOption === 'price-high') return b.price - a.price;
        if (sortOption === 'rating') return b.rating - a.rating;
        // Default (featured): best sellers first, then by rating
        if (a.bestSeller && !b.bestSeller) return -1;
        if (!a.bestSeller && b.bestSeller) return 1;
        return b.rating - a.rating;
    });

    // Get unique categories
    const categories = [...new Set(DUMMY_GIFTS.map(gift => gift.category))].sort();

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
                {/* Hero Section with Primary Color */}
                <div className="bg-primary rounded-3xl p-8 md:p-12 text-center text-white mb-12 shadow-2xl">
                    <FiGift className="text-6xl mx-auto mb-6 animate-pulse-slow" />
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Thoughtful Gifts for Everyone</h1>
                    <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                        Discover perfect presents for every occasion and budget
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="px-8 py-3 bg-white text-primary font-bold rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center gap-2 group">
                            Shop Best Sellers <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-primary transition-all">
                            Holiday Gift Guide
                        </button>
                    </div>
                </div>

                {/* Filters and Sorting */}
                <div className="mb-8 p-4 bg-white rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-wrap gap-3">
                        <span className="text-gray-700 font-semibold text-lg mr-2">Filter By:</span>
                        <div className="relative group">
                            <select
                                onChange={(e) => setPriceFilter(e.target.value || '')}
                                className="appearance-none bg-gray-50 border border-gray-200 rounded-full pl-5 pr-10 py-2 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all cursor-pointer text-sm"
                            >
                                <option value="">All Prices</option>
                                <option value="under1000">Under ₹1000</option>
                                <option value="1000-3000">₹1000 - ₹3000</option>
                                <option value="over3000">Over ₹3000</option>
                            </select>
                            <FiFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary-600 transition-colors pointer-events-none" />
                        </div>

                        <div className="relative group">
                            <select
                                onChange={(e) => setCategoryFilter(e.target.value || '')}
                                className="appearance-none bg-gray-50 border border-gray-200 rounded-full pl-5 pr-10 py-2 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all cursor-pointer text-sm"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            <FiFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary-600 transition-colors pointer-events-none" />
                        </div>
                    </div>

                    <div className="relative group ml-auto md:ml-0">
                        <span className="text-gray-700 font-semibold text-lg mr-2 hidden md:inline">Sort By:</span>
                        <select
                            onChange={(e) => setSortOption(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 rounded-full pl-5 pr-10 py-2 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all cursor-pointer text-sm"
                        >
                            <option value="featured">Featured</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                        </select>
                        <FiFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary-600 transition-colors pointer-events-none" />
                    </div>
                </div>

                {/* Gift Listing Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                    {sortedGifts.map(gift => (
                        <div
                            key={gift.id}
                            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transform hover:scale-[1.01] hover:shadow-xl transition-all duration-300 ease-in-out group flex flex-col relative"
                        >
                            {/* Best Seller Ribbon */}
                            {gift.bestSeller && (
                                <div className="absolute top-0 left-0 bg-gradient-to-r from-primary-400 to-primary-500 text-white text-xs font-bold px-3 py-1.5 rounded-br-lg z-10 animate-fade-in">
                                    <FiStar className="inline mr-1" size={12} /> Best Seller
                                </div>
                            )}

                            {/* Wishlist Button (Top Right) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleWishlist(gift.id); }} // Stop propagation to prevent card click
                                className={`absolute top-3 right-3 z-20 p-2 rounded-full shadow-sm transition-all duration-300 ${
                                    wishlist.includes(gift.id) ? 'text-red-500 bg-white' : 'text-gray-500 bg-white hover:text-red-500'
                                }`}
                            >
                                <FiHeart className={`${wishlist.includes(gift.id) ? 'fill-current' : ''}`} size={18} />
                            </button>

                            {/* Product Image */}
                            <div
                                className="relative w-full h-60 bg-gray-100 overflow-hidden cursor-pointer"
                                onClick={() => handleViewProduct(gift)}
                            >
                                {/* Use gift.images[0] or gift.image directly for the main card image */}
                                <img
                                    src={gift.images ? gift.images[0] : gift.image} // Use first image from array or original single image
                                    alt={gift.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                {/* Stock Indicator */}
                                <span className={`absolute bottom-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${gift.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {gift.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>

                            {/* Product Details & Actions */}
                            <div className="p-5 flex flex-col justify-between flex-grow">
                                <h3 className="font-semibold text-xl text-gray-800 mb-2 line-clamp-2 leading-tight text-center">
                                    {gift.title}
                                </h3>

                                {/* Rating */}
                                <div className="flex items-center justify-center mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar
                                            key={i}
                                            className={`${i < Math.floor(gift.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                            size={16}
                                        />
                                    ))}
                                    <span className="text-sm text-gray-600 ml-2 font-medium">({gift.rating})</span>
                                </div>

                                <p className="text-3xl font-extrabold text-gray-900 mb-4 text-center tracking-tight">
                                    ₹{gift.price.toLocaleString('en-IN')}
                                </p>

                                {/* Quick View & Buy Now Buttons with text */}
                                <div className="flex space-x-3 mt-auto justify-center">
                                    <button
                                        onClick={() => handleViewProduct(gift)}
                                        className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-base
                                                   hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1 text-sm font-medium"
                                        title="Quick View"
                                    >
                                        <FiEye size={18} className="mr-1" /> View
                                    </button>
                                    <button
                                        onClick={() => handleOpenBuyModal(gift)}
                                        className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary-600 text-white text-base shadow-lg
                                                   hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 text-sm font-medium"
                                        title="Buy Now"
                                        disabled={gift.stock <= 0}
                                    >
                                        <FiShoppingCart size={18} className="mr-1" /> {gift.stock > 0 ? 'Buy Now' : 'Sold Out'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {sortedGifts.length === 0 && (
                    <div className="text-center py-16 bg-gray-50 rounded-xl mt-8 shadow-sm">
                        <FiGift className="mx-auto text-6xl text-gray-400 mb-4" />
                        <h3 className="text-2xl font-medium text-gray-700 mb-2">No gifts found for your selection!</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            It seems your current filters are a bit too specific. Try broadening your search.
                        </p>
                        <button
                            onClick={() => {
                                setPriceFilter('');
                                setCategoryFilter('');
                                setSortOption('featured');
                            }}
                            className="inline-flex items-center px-8 py-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-lg shadow-md"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}

                {/* Load More Button - Only show if there are more items to load (beyond current displayed) */}
                {DUMMY_GIFTS.length > sortedGifts.length && sortedGifts.length > 0 && (
                     <div className="text-center mt-10">
                         <button className="px-8 py-3 border border-primary-600 text-primary-600 font-medium rounded-full hover:bg-primary-600 hover:text-white transition-colors">
                             Load More Gifts
                         </button>
                     </div>
                 )}


                {/* Gift Product View Modal */}
                {selectedGift && (
                    <ViewProductModal
                        isOpen={isViewModalOpen}
                        onClose={handleCloseViewModal}
                        gift={selectedGift}
                        onBuyNow={() => {
                            setIsViewModalOpen(false); // Close view modal
                            handleOpenBuyModal(selectedGift); // Open buy modal
                        }}
                        // No isInWishlist and onToggleWishlist props passed here anymore
                    />
                )}

                {/* Buy Confirmation Modal */}
                {selectedGift && (
                    <BuyConfirmationModal
                        isOpen={isBuyModalOpen}
                        onClose={handleCloseBuyModal}
                        gift={selectedGift}
                        onConfirmBuy={handleFinalBuy}
                    />
                )}
            </div>
        </Layout>
    );
};

export default GiftListingPage;