import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5000";
const USER_ID = "demo_user"; // For demo purposes

function Inventory() {
  // State for form
  const [item, setItem] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [storage, setStorage] = useState("refrigerated");
  const [message, setMessage] = useState("");
  // State for inventory list
  const [inventory, setInventory] = useState([]);

  // Fetch inventory on mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Fetch inventory from backend
  const fetchInventory = async () => {
    // For demo, fetch all items by calling alerts endpoint (shows all expiring soon)
    const res = await fetch(`${API_URL}/alerts/${USER_ID}`);
    const data = await res.json();
    setInventory(data.alerts || []);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    // Call backend to add item
    const res = await fetch(`${API_URL}/add_item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: USER_ID,
        item,
        purchase_date: purchaseDate,
        quantity,
        storage,
      }),
    });
    const data = await res.json();
    setMessage(data.message || "Item added.");
    fetchInventory();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Add Item to Inventory</h2>
      <form className="space-y-2 mb-4" onSubmit={handleSubmit}>
        <div className="flex space-x-2">
          <input
            className="border p-2 flex-1"
            placeholder="Item (e.g. milk)"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            required
          />
          <input
            className="border p-2 w-40"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
          />
          <input
            className="border p-2 w-20"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
          <select
            className="border p-2"
            value={storage}
            onChange={(e) => setStorage(e.target.value)}
          >
            <option value="refrigerated">Refrigerated</option>
            <option value="room_temp">Room Temp</option>
          </select>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          Add Item
        </button>
        {message && <div className="text-green-600 mt-2">{message}</div>}
      </form>
      <h3 className="text-lg font-semibold mb-1">Expiring Soon</h3>
      <ul className="divide-y">
        {inventory.length === 0 && <li className="text-gray-500">No items expiring soon.</li>}
        {inventory.map((inv, idx) => (
          <li key={idx} className="py-2 flex justify-between">
            <span>{inv.item} (x{inv.quantity})</span>
            <span className="text-sm text-gray-500">Expires: {inv.expiry}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Inventory; 