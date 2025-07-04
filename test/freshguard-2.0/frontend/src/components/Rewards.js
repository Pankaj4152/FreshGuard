import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";
const USER_ID = "demo_user";

function Rewards() {
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch metrics to get points (waste saved)
    fetch(`${API_URL}/metrics/${USER_ID}`)
      .then((res) => res.json())
      .then((data) => {
        setPoints(data.waste_saved_kg || 0);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Loyalty Rewards</h2>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="text-2xl font-bold text-green-700">{points} points</div>
      )}
      <p className="text-sm text-gray-500 mt-2">Earn points by redeeming discounts on near-expiry items!</p>
    </div>
  );
}

export default Rewards; 