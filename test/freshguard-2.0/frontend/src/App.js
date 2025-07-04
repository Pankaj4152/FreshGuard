import React, { useState } from "react";
import Inventory from "./components/Inventory";
import Alerts from "./components/Alerts";
import Discounts from "./components/Discounts";
import Rewards from "./components/Rewards";
import Dashboard from "./components/Dashboard";
import "./App.css";

// Tab names and mapping
const TABS = [
  { name: "Inventory", component: <Inventory /> },
  { name: "Alerts", component: <Alerts /> },
  { name: "Discounts", component: <Discounts /> },
  { name: "Rewards", component: <Rewards /> },
  { name: "Dashboard", component: <Dashboard /> },
];

function App() {
  const [tab, setTab] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white p-4 shadow">
        <h1 className="text-2xl font-bold">FreshGuard 2.0</h1>
        <p className="text-sm">Walmart Hackathon - Reduce Food Waste</p>
      </header>
      {/* Tab Navigation */}
      <nav className="flex justify-center space-x-4 bg-blue-100 py-2">
        {TABS.map((t, i) => (
          <button
            key={t.name}
            className={`px-4 py-2 rounded ${tab === i ? "bg-blue-600 text-white" : "bg-white text-blue-700"}`}
            onClick={() => setTab(i)}
          >
            {t.name}
          </button>
        ))}
      </nav>
      <main className="max-w-2xl mx-auto p-4">
        {/* Render selected tab */}
        {TABS[tab].component}
      </main>
      <footer className="text-center text-xs text-gray-400 py-4">&copy; 2025 FreshGuard 2.0</footer>
    </div>
  );
}

export default App; 