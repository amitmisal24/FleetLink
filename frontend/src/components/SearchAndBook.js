import React, { useState } from 'react';

export default function SearchAndBook({ baseUrl }) {
  const [capacityRequired, setCapacityRequired] = useState('');
  const [fromPincode, setFromPincode] = useState('');
  const [toPincode, setToPincode] = useState('');
  const [startTime, setStartTime] = useState('');
  const [results, setResults] = useState([]);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setResults([]);
    try {
      const params = new URLSearchParams({
        capacityRequired: capacityRequired,
        fromPincode,
        toPincode,
        startTime
      });
      const res = await fetch(`${baseUrl}/api/vehicles/available?${params.toString()}`);
      const data = await res.json();
      if (res.status === 200) {
        setResults(data);
        if (data.length === 0) setMsg({ type: 'info', text: 'No vehicles available' });
      } else {
        setMsg({ type: 'error', text: data.message || 'Error searching' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: String(err) });
    } finally {
      setLoading(false);
    }
  }

  async function handleBook(vehicleId) {
    setMsg(null);
    try {
      // hardcoded customerId for demo
      const payload = {
        vehicleId,
        fromPincode,
        toPincode,
        startTime,
        customerId: 'demo-customer-1'
      };
      const res = await fetch(`${baseUrl}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.status === 201) {
        setMsg({ type: 'success', text: `Booking confirmed (ID: ${data._id})` });
        // remove that vehicle from results (it is now booked)
        setResults(prev => prev.filter(r => r._id !== vehicleId));
      } else if (res.status === 409) {
        setMsg({ type: 'error', text: 'Vehicle became unavailable (conflict).' });
        // refresh search maybe
      } else {
        setMsg({ type: 'error', text: data.message || 'Booking failed' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: String(err) });
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="form">
        <label>Capacity Required<input value={capacityRequired} onChange={e=>setCapacityRequired(e.target.value)} required type="number"/></label>
        <label>From Pincode<input value={fromPincode} onChange={e=>setFromPincode(e.target.value)} required/></label>
        <label>To Pincode<input value={toPincode} onChange={e=>setToPincode(e.target.value)} required/></label>
        <label>Start Date & Time<input value={startTime} onChange={e=>setStartTime(e.target.value)} required type="datetime-local"/></label>
        <button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search Availability'}</button>
      </form>

      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="results">
        {results.map(v => (
          <div key={v._id} className="vehicle">
            <div><strong>{v.name}</strong></div>
            <div>Capacity: {v.capacityKg} kg</div>
            <div>Tyres: {v.tyres}</div>
            <div>Estimated Ride Duration: {v.estimatedRideDurationHours} hours</div>
            <button onClick={() => handleBook(v._id)}>Book Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}
