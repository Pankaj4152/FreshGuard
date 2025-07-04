import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";
const USER_ID = "demo_user";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/alerts/${USER_ID}`)
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data.alerts || []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Expiration Alerts</h2>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : alerts.length === 0 ? (
        <div className="text-gray-500">No items expiring soon.</div>
      ) : (
        <ul className="divide-y">
          {alerts.map((alert, idx) => (
            <li key={idx} className="py-2 flex justify-between">
              <span>{alert.item} (x{alert.quantity})</span>
              <span className="text-red-600 font-semibold">Expires: {alert.expiry}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Alerts; 