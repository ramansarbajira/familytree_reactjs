// GiftListingPage.js
import React, { useState, useEffect } from 'react';
import ViewProductModal from '../Components/ViewProductModal';
import BuyConfirmationModal from '../Components/BuyConfirmationModal';
import { FiEye, FiShoppingCart, FiGift, FiChevronRight, FiHeart, FiStar, FiFilter, FiLoader, FiPackage, FiTrendingUp, FiMinus, FiPlus } from 'react-icons/fi';
import { useUser } from '../Contexts/UserContext';

const GiftListingPage = () => {
    const [gifts, setGifts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [selectedGift, setSelectedGift] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const [priceFilter, setPriceFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortOption, setSortOption] = useState('featured');
    const [quantities, setQuantities] = useState({});
    const { userInfo } = useUser();
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


    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Function to transform API data to match component structure
    const transformApiData = (apiData) => {
        return apiData.map(item => ({
            id: item.id.toString(),
            images: Array.isArray(item.images) && item.images.length > 0
                ? item.images
                : ['https://via.placeholder.com/400x300?text=No+Image'],
            title: item.name,
            description: item.description,
            price: parseFloat(item.price),
            stock: item.stock,
            buyLink: '#',
            rating: 4.5, // Default rating since API doesn't provide this
            category: item.category?.name || 'Other',
            categoryId: item.categoryId,
            bestSeller: item.stock > 20, // Consider items with high stock as best sellers
            status: item.status
        }));
    };

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                const response = await fetch(`${BASE_URL}/categories`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                // Filter only active categories (status: 1) if the API provides status
                const activeCategories = data.filter(category => category.status === 1 || !category.status);
                setCategories(activeCategories);
            } catch (err) {
                console.error('Error fetching categories:', err);
                // Fallback to empty array if categories API fails
                setCategories([]);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, [BASE_URL]);

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
    }, [BASE_URL]);

    // Function to open the Quick View Modal
    const handleViewProduct = (gift) => {
        console.log('🔍 handleViewProduct called with gift:', gift);
        console.log('🔍 Setting selectedGift and opening modal');
        setSelectedGift(gift);
        setIsViewModalOpen(true);
    };

    // Function to close the Quick View Modal
    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedGift(null);
    };

    // Function to open the Buy Confirmation Modal
    const handleOpenBuyModal = (gift, quantity = 1) => {
        console.log('🔍 handleOpenBuyModal called with:', { gift: gift.title, quantity });
        console.log('🔍 Setting selectedGift and opening BuyConfirmationModal');
        setSelectedGift(gift);
        // Update the quantities state with the quantity from ViewProductModal
        setQuantities(prev => ({
            ...prev,
            [gift.id]: quantity
        }));
        console.log('🔍 Setting isBuyModalOpen to true');
        setIsBuyModalOpen(true);
        console.log('🔍 BuyConfirmationModal should now be visible');
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

    // Quantity management functions
    const updateQuantity = (giftId, newQuantity) => {
        if (newQuantity >= 1 && newQuantity <= 10) {
            setQuantities(prev => ({
                ...prev,
                [giftId]: newQuantity
            }));
        }
    };

    const incrementQuantity = (giftId, currentStock) => {
        const currentQty = quantities[giftId] || 1;
        const maxQty = Math.min(currentStock, 10);
        if (currentQty < maxQty) {
            updateQuantity(giftId, currentQty + 1);
        }
    };

    const decrementQuantity = (giftId) => {
        const currentQty = quantities[giftId] || 1;
        if (currentQty > 1) {
            updateQuantity(giftId, currentQty - 1);
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

    // Get unique categories from loaded gifts for fallback
    const giftCategories = [...new Set(gifts.map(gift => gift.category))].sort();

    // Loading state
    if (loading) {
        return (
            <>
                <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center py-20">
                        <FiLoader className="text-6xl text-primary animate-spin mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Loading Products...</h2>
                        <p className="text-gray-500">Please wait while we fetch the latest products for you.</p>
                    </div>
                </div>
            </>
        );
    }

    // Error state
    if (error) {
        return (
            <>
                <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center py-20">
                        <FiGift className="text-6xl text-gray-400 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Oops! Something went wrong</h2>
                        <p className="text-gray-500 mb-6 text-center max-w-md">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
                {/* Hero Section with Primary Color */}
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 md:p-12 text-center text-white mb-12 shadow-2xl relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
                        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white rounded-full translate-x-8 -translate-y-8"></div>
                    </div>
                    
                    <div className="relative z-10">
                        <FiGift className="text-6xl mx-auto mb-6 animate-pulse" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Thoughtful Gifts for Everyone</h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
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
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                        <FiPackage className="text-3xl text-primary mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-gray-800">{gifts.length}</h3>
                        <p className="text-gray-600">Total Products</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                        <FiTrendingUp className="text-3xl text-primary mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-gray-800">{gifts.filter(g => g.bestSeller).length}</h3>
                        <p className="text-gray-600">Best Sellers</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                        <FiStar className="text-3xl text-primary mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-gray-800">{categories.length}</h3>
                        <p className="text-gray-600">Categories</p>
                    </div>
                </div>

                {/* Filters and Sorting */}
                <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex flex-wrap gap-3">
                            <span className="text-gray-700 font-semibold text-lg mr-2">Filter By:</span>
                            <div className="relative group">
                                <select
                                    onChange={(e) => setPriceFilter(e.target.value || '')}
                                    className="appearance-none bg-gray-50 border border-gray-200 rounded-full pl-5 pr-10 py-2 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer text-sm"
                                >
                                    <option value="">All Prices</option>
                                    <option value="under1000">Under ₹1000</option>
                                    <option value="1000-3000">₹1000 - ₹3000</option>
                                    <option value="over3000">Over ₹3000</option>
                                </select>
                                <FiFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors pointer-events-none" />
                            </div>

                            <div className="relative group">
                                <select
                                    onChange={(e) => setCategoryFilter(e.target.value || '')}
                                    className="appearance-none bg-gray-50 border border-gray-200 rounded-full pl-5 pr-10 py-2 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer text-sm"
                                    disabled={categoriesLoading}
                                >
                                    <option value="">All Categories</option>
                                    {categoriesLoading ? (
                                        <option value="" disabled>Loading categories...</option>
                                    ) : (
                                        categories.map(category => (
                                            <option key={category.id} value={category.name}>{category.name}</option>
                                        ))
                                    )}
                                </select>
                                <FiFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors pointer-events-none" />
                            </div>
                        </div>

                        <div className="relative group ml-auto md:ml-0">
                            <span className="text-gray-700 font-semibold text-lg mr-2 hidden md:inline">Sort By:</span>
                            <select
                                onChange={(e) => setSortOption(e.target.value)}
                                className="appearance-none bg-gray-50 border border-gray-200 rounded-full pl-5 pr-10 py-2 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer text-sm"
                            >
                                <option value="featured">Featured</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Top Rated</option>
                            </select>
                            <FiFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Gift Listing Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedGifts.map(gift => (
                        <div
                            key={gift.id}
                            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transform hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ease-in-out group flex flex-col relative"
                        >
                            {/* Best Seller Ribbon */}
                            {gift.bestSeller && (
                                <div className="absolute top-0 left-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-br-lg z-10">
                                    <FiStar className="inline mr-1" size={12} /> Best Seller
                                </div>
                            )}

                            {/* Product Image */}
                            <div
                                className="relative w-full h-56 bg-gray-100 overflow-hidden cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('🔍 Product image clicked for:', gift.title);
                                    handleViewProduct(gift);
                                }}
                            >
                                <img
                                    src={gift.images && gift.images.length > 0 ? gift.images[0] : 'https://placehold.co/400x300?text=No+Image'}
                                    alt={gift.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => {
                                        e.target.src = 'https://placehold.co/400x300?text=No+Image';
                                    }}
                                />

                                {/* Stock Indicator */}
                                <div className="absolute bottom-3 left-3 right-3">
                                    <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full ${
                                        gift.stock > 10 
                                            ? 'bg-green-100 text-green-700 border border-green-200' 
                                            : gift.stock > 0 
                                                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                                : 'bg-red-100 text-red-700 border border-red-200'
                                    }`}>
                                        {gift.stock > 10 
                                            ? `${gift.stock} In Stock` 
                                            : gift.stock > 0 
                                                ? `Only ${gift.stock} Left`
                                                : 'Out of Stock'
                                        }
                                    </span>
                                </div>

                                {/* Category Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 border border-primary-200">
                                        {gift.category}
                                    </span>
                                </div>
                            </div>

                            {/* Product Details & Actions */}
                            <div className="p-4 flex flex-col justify-between flex-grow">
                                <div className="mb-3">
                                    <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2 leading-tight">
                                        {gift.title}
                                    </h3>

                                    <p className="text-2xl font-bold text-primary mb-1">
                                        ₹{gift.price.toLocaleString('en-IN')}
                                    </p>
                                    {/* Show total price if quantity > 1 */}
                                    {(quantities[gift.id] || 1) > 1 && (
                                        <p className="text-sm text-gray-600">
                                            Total: ₹{(gift.price * (quantities[gift.id] || 1)).toLocaleString('en-IN')}
                                        </p>
                                    )}
                                </div>

                                {/* Quantity Selector */}
                                {gift.stock > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity:</label>
                                        <div className="flex items-center justify-center space-x-2">
                                            <button
                                                onClick={() => decrementQuantity(gift.id)}
                                                disabled={(quantities[gift.id] || 1) <= 1}
                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                            >
                                                <FiMinus size={14} />
                                            </button>
                                            <span className="w-12 text-center text-sm font-medium text-gray-700">
                                                {quantities[gift.id] || 1}
                                            </span>
                                            <button
                                                onClick={() => incrementQuantity(gift.id, gift.stock)}
                                                disabled={(quantities[gift.id] || 1) >= Math.min(gift.stock, 10)}
                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                            >
                                                <FiPlus size={14} />
                                            </button>
                                        </div>
                                        {/* Total Price Display */}
                                        <div className="mt-2 text-center">
                                            <span className="text-sm text-gray-600">
                                                Total: <span className="font-bold text-primary-600">₹{((gift.price * (quantities[gift.id] || 1)).toLocaleString('en-IN'))}</span>
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex space-x-2">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log('🔍 View button clicked for:', gift.title);
                                            handleViewProduct(gift);
                                        }}
                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm
                                                   hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 font-medium"
                                        title="Quick View"
                                    >
                                        <FiEye size={16} className="mr-1" /> View
                                    </button>
                                    <button
                                        onClick={() => handleOpenBuyModal(gift, quantities[gift.id] || 1)}
                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg bg-primary text-white text-sm shadow-md
                                                   hover:bg-primary-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Buy Now"
                                        disabled={gift.stock <= 0}
                                    >
                                        <FiShoppingCart size={16} className="mr-1" /> 
                                        {(quantities[gift.id] || 1) > 1 
                                            ? `Buy - ₹${(gift.price * (quantities[gift.id] || 1)).toLocaleString('en-IN')}`
                                            : 'Buy'
                                        }
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
                                className="inline-flex items-center px-8 py-3 bg-primary text-white rounded-full hover:bg-primary-700 transition-colors text-lg shadow-md"
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
                        initialQuantity={quantities[selectedGift.id] || 1}
                        onBuyNow={(gift, quantity) => {
                            console.log('🔍 ViewProductModal onBuyNow called with:', { gift: gift.title, quantity });
                            console.log('🔍 Closing ViewProductModal and opening BuyConfirmationModal');
                            setIsViewModalOpen(false);
                            handleOpenBuyModal(gift, quantity);
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
                        initialQuantity={quantities[selectedGift.id] || 1}
                        userInfo={userInfo}
                        onConfirmBuy={(giftId, quantity, details) => {
                            // Do not close the modal here! Let BuyConfirmationModal handle its own closing after order confirmation.
                        }}
                    />
                )}
            </div>
        </>
    );
};  

export default GiftListingPage;