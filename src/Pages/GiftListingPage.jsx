// GiftListingPage.js
import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout';
import ViewProductModal from '../Components/ViewProductModal';
import BuyConfirmationModal from '../Components/BuyConfirmationModal';
import { FiEye, FiShoppingCart, FiGift, FiChevronRight, FiHeart, FiStar, FiFilter, FiLoader } from 'react-icons/fi';
import { useUser } from '../Contexts/UserContext';

const GiftListingPage = () => {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [selectedGift, setSelectedGift] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const [priceFilter, setPriceFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortOption, setSortOption] = useState('featured');
     const { userInfo} = useUser();
     const token = localStorage.getItem('access_token');
const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
const [receiverId, setRecipientUserId] = useState(null);


let userId = userInfo?.userId || storedUserInfo.userId;
let familyCode = userInfo?.familyCode || storedUserInfo.familyCode;

if (!userId && token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    userId = payload.id;
  } catch (e) {
    console.error('Failed to decode JWT:', e);
  }
}

console.log('✅ userId:', userId);
console.log('✅ familyCode:', familyCode);

    const BASE_URL = 'https://familytree-backend-trs6.onrender.com';

    // Function to transform API data to match component structure
    const transformApiData = (apiData) => {
        return apiData.map(item => ({
            id: item.id.toString(),
            images: item.image && item.image !== 'string' && item.image !== '' 
                ? [`${BASE_URL}/uploads/${item.image}`] 
                : ['https://via.placeholder.com/400x300?text=No+Image'],
            title: item.name,
            description: item.description,
            price: parseFloat(item.price),
            stock: item.stock,
            buyLink: '#',
            rating: 4.5, // Default rating since API doesn't provide this
            category: getCategoryName(item.categoryId),
            bestSeller: item.stock > 20, // Consider items with high stock as best sellers
            status: item.status
        }));
    };

    // Function to get category name based on categoryId
    const getCategoryName = (categoryId) => {
        const categories = {
            1: 'Electronics',
            2: 'Fashion',
            3: 'Games',
            4: 'Home',
            5: 'Sports',
            6: 'Beauty',
            7: 'Food'
        };
        return categories[categoryId] || 'Other';
    };

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${BASE_URL}/product`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Filter only active products (status: 1)
                const activeProducts = data.filter(product => product.status === 1);
                const transformedData = transformApiData(activeProducts);
                
                setGifts(transformedData);
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

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


    const getUserAddress = () => {
    if (userInfo?.address && userInfo.address.trim()) {
        return userInfo.address;
    }
    return "Address not provided"; // Or prompt user to add address
};

    // Filter and sort functions
    const filteredGifts = gifts.filter(gift => {
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

    // Get unique categories from loaded gifts
    const categories = [...new Set(gifts.map(gift => gift.category))].sort();

    // Loading state
    if (loading) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center py-20">
                        <FiLoader className="text-6xl text-primary-600 animate-spin mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Loading Products...</h2>
                        <p className="text-gray-500">Please wait while we fetch the latest products for you.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Error state
    if (error) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center py-20">
                        <FiGift className="text-6xl text-gray-400 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Oops! Something went wrong</h2>
                        <p className="text-gray-500 mb-6 text-center max-w-md">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

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
                                onClick={(e) => { e.stopPropagation(); toggleWishlist(gift.id); }}
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
    <img
        src={gift.image && gift.image !== "string" ? gift.image : 'https://placehold.co/400x300?text=No+Image'}
        alt={gift.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={(e) => {
            e.target.src = 'https://placehold.co/400x300?text=No+Image';
        }}
    />
    {/* Stock Indicator */}
    <span className={`absolute bottom-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${gift.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
        {gift.stock > 0 ? `${gift.stock} In Stock` : 'Out of Stock'}
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
                {sortedGifts.length === 0 && !loading && (
                    <div className="text-center py-16 bg-gray-50 rounded-xl mt-8 shadow-sm">
                        <FiGift className="mx-auto text-6xl text-gray-400 mb-4" />
                        <h3 className="text-2xl font-medium text-gray-700 mb-2">No products found!</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            {gifts.length === 0 
                                ? "No products available at the moment. Please check back later."
                                : "It seems your current filters are a bit too specific. Try broadening your search."
                            }
                        </p>
                        {gifts.length > 0 && (
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
                        )}
                    </div>
                )}

                {/* Gift Product View Modal */}
                {selectedGift && (
                    <ViewProductModal
                        isOpen={isViewModalOpen}
                        onClose={handleCloseViewModal}
                        gift={selectedGift}
                        onBuyNow={() => {
                            setIsViewModalOpen(false);
                            handleOpenBuyModal(selectedGift);
                        }}
                    />
                )}

                {/* Buy Confirmation Modal */}
                {selectedGift && (
    <BuyConfirmationModal
  isOpen={isBuyModalOpen}
  onClose={handleCloseBuyModal}
  gift={selectedGift}
  userId={userId}
  familyCode={familyCode}
  receiverId={receiverId}
  from={getUserAddress()}
  onConfirmBuy={(giftId, quantity, details) => {
    console.log('Order confirmed:', giftId, quantity, details);
    // Handle success (e.g., show toast, redirect, etc.)
  }}
/>

)}
            </div>
        </Layout>
    );
};  

export default GiftListingPage;