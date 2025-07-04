import React, { useEffect, useRef } from "react";

const API_URL = "http://localhost:5000";
const USER_ID = "demo_user";

function Dashboard() {
  const chartRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/metrics/${USER_ID}`)
      .then((res) => res.json())
      .then((data) => {
        // Render Chart.js bar chart
        if (window.Chart && chartRef.current) {
          new window.Chart(chartRef.current, {
            type: "bar",
            data: {
              labels: ["You", "Walmart"],
              datasets: [
                {
                  label: "Waste Saved (kg)",
                  data: [data.waste_saved_kg || 0, data.walmart_waste_saved_kg || 0],
                  backgroundColor: ["#2563eb", "#22c55e"],
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: { beginAtZero: true, title: { display: true, text: "kg" } },
              },
            },
          });
        }
      });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Waste Saved Dashboard</h2>
      <canvas ref={chartRef} width={400} height={200}></canvas>
      <p className="text-sm text-gray-500 mt-2">Track your impact and Walmart's waste reduction!</p>
    </div>
  );
}

export default Dashboard; 