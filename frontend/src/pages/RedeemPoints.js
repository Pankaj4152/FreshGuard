import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import apiService from '../services/api'; // Fixed import
import { Gift, Award } from 'react-feather';
import '../styles/redeem-points.css';

const RedeemPoints = () => {
  const { user, loadUserData } = useUser();
  const [redeemableItems, setRedeemableItems] = useState([]);
  const [redeemableProducts, setRedeemableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRedeemableItems();
    fetchRedeemableProducts();
  }, []);

  const fetchRedeemableItems = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRedeemableItems();
      setRedeemableItems(response.items || []);
    } catch (err) {
      setError('Failed to load redeemable items');
      console.error('Error loading redeemable items:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRedeemableProducts = async () => {
    try {
      const response = await apiService.request('/api/loyalty/redeemable-products');
      setRedeemableProducts(response.products || []);
    } catch (err) {
      setError('Failed to load redeemable products');
      console.error('Error loading redeemable products:', err);
    }
  };

  const handleRedeem = async (itemId, pointsCost) => {
    try {
      if (user.loyaltyPoints < pointsCost) {
        setError('Not enough points to redeem this item');
        return;
      }

      const response = await apiService.redeemPoints(user.id, itemId, pointsCost);
      if (response.success) {
        // Refresh user data to update points
        await loadUserData();
        // Refresh redeemable items
        await fetchRedeemableItems();
      } else {
        setError(response.message || 'Failed to redeem points');
      }
    } catch (err) {
      setError('Error redeeming points');
      console.error('Error redeeming points:', err);
    }
  };

  return (
    <div className="redeem-points-container">
      {/* Points Dashboard */}
      <div className="redeem-dashboard">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Award size={32} className="text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Your Loyalty Points</h2>
              <p className="text-gray-600">Earn points by purchasing near-expiry items</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{user.loyaltyPoints}</div>
            <div className="text-sm text-gray-600">Available Points</div>
          </div>
        </div>
      </div>

    
      {/* Special Offers Section */}
      <h3 className="redeem-items-title" style={{marginTop:32}}>Special Offers</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
        {redeemableItems.slice(0,4).map((item, idx) => (
          <div key={item.id} className="redeem-item-card" style={{background: idx%2===0 ? '#f0f7ff' : '#fff8f0', border: '1.5px solid #e0e7ef'}}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold">{item.name}</h4>
                <p className="text-gray-600">{item.description}</p>
              </div>
              <Gift className="text-primary" size={24} />
            </div>
            <div className="flex justify-between items-center">
              <div className="font-bold text-xl text-primary">{item.pointsCost} Points</div>
              <button
                onClick={() => handleRedeem(item.id, item.pointsCost)}
                disabled={user.loyaltyPoints < item.pointsCost}
                className={`px-4 py-2 rounded-lg ${user.loyaltyPoints >= item.pointsCost ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
              >
                Redeem Now
              </button>
            </div>
            {user.loyaltyPoints < item.pointsCost && (
              <p className="text-sm text-red-500 mt-2">
                You need {item.pointsCost - user.loyaltyPoints} more points
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Redeemable Products Section */}
      <h3 className="redeem-items-title">Redeem Points for Products</h3>
      {error && (
        <div className="redeem-error bg-red-500 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {redeemableProducts.map((product) => (
            <div key={product.id} className="redeem-item-card" style={{background:'#f8fff0', border:'1.5px solid #e0efdf'}}>
              <div className="flex items-center gap-4 mb-2">
                <img src={require(`../assets/${product.image}`)} alt={product.name} style={{width:48, height:48, borderRadius:8, background:'#fff'}} />
                <div>
                  <h4 className="text-lg font-semibold">{product.name}</h4>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="font-bold text-xl text-green-700">{product.pointsCost} Points</div>
                <button
                  onClick={() => handleRedeem(product.id, product.pointsCost)}
                  disabled={user.loyaltyPoints < product.pointsCost}
                  className={`px-4 py-2 rounded-lg ${user.loyaltyPoints >= product.pointsCost ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  Redeem Now
                </button>
              </div>
              {user.loyaltyPoints < product.pointsCost && (
                <p className="text-sm text-red-500 mt-2">
                  You need {product.pointsCost - user.loyaltyPoints} more points
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RedeemPoints;
