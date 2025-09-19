import React, { useState } from 'react';
import AddVehicle from './components/AddVehicle';
import SearchAndBook from './components/SearchAndBook';

export default function App() {
  const [baseUrl, setBaseUrl] = useState(() => {
    // default backend URL (adjust as needed)
    return process.env.REACT_APP_API_URL || 'http://localhost:4000';
  });

  return (
    <div className="container">
      <h1>🚚 FleetLink – Logistics Vehicle Booking System</h1>
      <div className="section">
        <h2>Add Vehicle</h2>
        <AddVehicle baseUrl={baseUrl} />
      </div>
      <div className="section">
        <h2>Search & Book</h2>
        <SearchAndBook baseUrl={baseUrl} />
      </div>
    </div>
  );
}
