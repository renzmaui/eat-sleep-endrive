import { useState } from 'react';

const SEATS = [
  { id: 'driver', label: 'Driver' },
  { id: 'passenger', label: 'Passenger' },
  { id: 'back1', label: 'Back Left' },
  { id: 'back2', label: 'Back Middle' },
  { id: 'back3', label: 'Back Right' },
  { id: 'back4', label: 'Back Extra' },
];

export default function MG1Seating({ playerName, enchins, onNext }) {
  const [seating, setSeating] = useState({});
  const [draggedId, setDraggedId] = useState(null);

  const handleDrop = (seatId) => {
    if (!draggedId) return;
    setSeating((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        if (updated[key] === draggedId) delete updated[key];
      });
      updated[seatId] = draggedId;
      return updated;
    });
    setDraggedId(null);
  };

  const handleNext = () => {
    const scores = {};
    if (seating.driver) {
      scores[seating.driver] = 3;
    }
    onNext(scores);
  };

  const isFull = Object.keys(seating).length === SEATS.length;

  return (
    <section className="game">
      <div className="game-box">
        <div className="game-head">
          <div className="game-location">ROAD TRIP PREP</div>
          <h1>Seat the Enchins</h1>
          <p>Click an Enchin, then click a seat.</p>
        </div>

        <div className="game-area">
          <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
            {/* Enchin Pool */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '16px', fontFamily: 'Space Mono', fontSize: '12px' }}>
                SELECT AN ENCHIN
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                {enchins.map((e) => {
                  const isSeated = Object.values(seating).includes(e.id);
                  const isSelected = draggedId === e.id;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setDraggedId(isSelected ? null : e.id)}
                      disabled={isSeated}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '999px',
                        border: isSelected ? '3px solid #f43f5e' : '3px solid #111',
                        background: isSeated ? '#666' : isSelected ? '#f43f5e' : 'linear-gradient(90deg, #60a5fa, #34d399)',
                        color: isSeated ? '#999' : '#fff',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: isSeated ? 'not-allowed' : 'pointer',
                        opacity: isSeated ? 0.5 : 1,
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 6px 0 #111' : '0 4px 0 #111',
                      }}
                    >
                      {e.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Car Seats */}
            <div style={{ background: 'rgba(15,23,42,0.6)', borderRadius: '16px', padding: '24px', border: '3px solid #111' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {SEATS.map((seat) => {
                  const occupiedId = seating[seat.id];
                  const occupied = enchins.find((e) => e.id === occupiedId);
                  return (
                    <button
                      key={seat.id}
                      onClick={() => draggedId && handleDrop(seat.id)}
                      style={{
                        minHeight: '80px',
                        borderRadius: '12px',
                        border: occupied ? '3px solid #10b981' : draggedId ? '3px dashed #f43f5e' : '3px dashed rgba(255,255,255,0.3)',
                        background: occupied ? 'rgba(16,185,129,0.2)' : 'rgba(15,23,42,0.8)',
                        display: 'grid',
                        placeItems: 'center',
                        cursor: draggedId ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Space Mono', fontSize: '10px', marginBottom: '6px', opacity: 0.7 }}>
                          {seat.label}
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: occupied ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                          {occupied ? occupied.name : 'Empty'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="game-message">
          <button className="game-btn" onClick={handleNext} disabled={!isFull} style={{ opacity: !isFull ? 0.5 : 1 }}>
            {isFull ? 'Start Road Trip' : 'Seat All Enchins First'}
          </button>
        </div>
      </div>
    </section>
  );
}