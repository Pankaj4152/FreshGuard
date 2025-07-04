import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/discounts`)
      .then((res) => res.json())
      .then((data) => {
        setDiscounts(data.discounts || []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Walmart Near-Expiry Offers</h2>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : discounts.length === 0 ? (
        <div className="text-gray-500">No discounts available.</div>
      ) : (
        <ul className="divide-y">
          {discounts.map((offer, idx) => (
            <li key={idx} className="py-2 flex justify-between items-center">
              <span>{offer.item} (x{offer.quantity})</span>
              <span className="text-sm text-gray-500">Expires: {offer.expiry}</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{offer.discount}% off</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Discounts; 