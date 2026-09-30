import { useState } from 'react';

const CARS = [
  { id: 'jungwon', label: 'Silver & Black', color: 'linear-gradient(90deg,#cbd5e1,#0f172a)', papa: 'Jungwon' },
  { id: 'jay', label: 'Navy & Yellow', color: 'linear-gradient(90deg,#1e3a8a,#fbbf24)', papa: 'Jay' },
  { id: 'jake', label: 'Papaya & Blue', color: 'linear-gradient(90deg,#fb923c,#3b82f6)', papa: 'Jake' },
  { id: 'sunghoon', label: 'Red', color: 'linear-gradient(90deg,#ef4444,#b91c1c)', papa: 'Sunghoon' },
  { id: 'sunoo', label: 'Pink & Blue', color: 'linear-gradient(90deg,#f472b6,#60a5fa)', papa: 'Sunoo' },
  { id: 'niki', label: 'Green', color: 'linear-gradient(90deg,#10b981,#047857)', papa: 'Ni-ki' },
];

export default function MG3Customize({ playerName, enchins, onNext }) {
  const [selected, setSelected] = useState(null);

  const handleChoose = (carId) => {
    setSelected(carId);
    const idx = CARS.findIndex((c) => c.id === carId);
    const enchinId = enchins[idx]?.id;
    onNext({ [enchinId]: 2, carId });
  };

  return (
    <section className="game">
      <div className="game-box">
        <div className="game-head">
          <div className="game-location">CHOOSE YOUR RIDE</div>
          <h1>Pick Your Car</h1>
          <p>Each has a different vibe.</p>
        </div>

        <div className="game-area">
          <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {CARS.map((car) => (
                <div
                  key={car.id}
                  style={{
                    background: 'rgba(15,23,42,0.6)',
                    border: selected === car.id ? '3px solid #f43f5e' : '3px solid #111',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'grid',
                    gap: '12px',
                    placeItems: 'center',
                    transition: 'all 0.2s ease',
                    transform: selected === car.id ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div style={{ width: '100%', height: '60px', borderRadius: '10px', border: '2px solid rgba(255,255,255,0.2)', background: car.color }} />
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{car.label}</div>
                  <div style={{ fontFamily: 'Space Mono', fontSize: '10px', opacity: 0.6 }}>Papa {car.papa}</div>
                  <button
                    className="game-btn"
                    onClick={() => handleChoose(car.id)}
                    disabled={selected !== null && selected !== car.id}
                    style={{
                      width: '100%',
                      background: selected === car.id ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f43f5e, #8b5cf6)',
                      opacity: selected !== null && selected !== car.id ? 0.4 : 1,
                    }}
                  >
                    {selected === car.id ? 'Selected ✓' : 'Choose This'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="game-message">
          {selected ? (
            <button className="game-btn" onClick={() => onNext({})}>
              Let's Go!
            </button>
          ) : (
            <span style={{ fontSize: '12px', color: '#666' }}>Choose a car to continue</span>
          )}
        </div>
      </div>
    </section>
  );
}