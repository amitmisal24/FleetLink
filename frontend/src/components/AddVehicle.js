import React, { useState } from 'react';

export default function AddVehicle({ baseUrl }) {
  const [name, setName] = useState('');
  const [capacityKg, setCapacityKg] = useState('');
  const [tyres, setTyres] = useState('');
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const payload = {
        name,
        capacityKg: Number(capacityKg),
        tyres: Number(tyres)
      };
      const res = await fetch(`${baseUrl}/api/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.status === 201) {
        setMessage({ type: 'success', text: `Vehicle added: ${data.name}` });
        setName(''); setCapacityKg(''); setTyres('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Error adding vehicle' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: String(err) });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>Name<input value={name} onChange={e=>setName(e.target.value)} required/></label>
      <label>Capacity (KG)<input value={capacityKg} onChange={e=>setCapacityKg(e.target.value)} required type="number" min="0"/></label>
      <label>Tyres<input value={tyres} onChange={e=>setTyres(e.target.value)} required type="number" min="0"/></label>
      <button type="submit">Add Vehicle</button>
      {message && <div className={`msg ${message.type}`}>{message.text}</div>}
    </form>
  );
}
