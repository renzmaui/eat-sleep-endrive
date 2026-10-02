import { useState, useRef, useEffect } from 'react';
import './MG1Seating.css';

const SEATS = [
  { id: 'seat1', label: 'Driver' },          // 1 (front)
  { id: 'seat2', label: 'Passenger Princess' }, // 2 (front)
  { id: 'seat3', label: 'Middle Left' },     // 3
  { id: 'seat4', label: 'Middle Right' },    // 4
  { id: 'seat5', label: 'Back Left' },       // 5
  { id: 'seat6', label: 'Back Right' },      // 6
];

const ENCHINS = [
  { id: 'wonchu',  name: 'Wonchu',  image: '/images/wonchu-flower.png' },
  { id: 'jakey',   name: 'Jakey',   image: '/images/jakey-flower.png' },
  { id: 'noxstar', name: 'Noxstar', image: '/images/noxstar-flower.png' },
  { id: 'snowe',   name: 'Snowe',   image: '/images/snowe-flower.png' },
  { id: 'kishu',   name: 'Kishu',   image: '/images/kishu-flower.png' },
  { id: 'pu-ni',   name: 'Pu Ni',   image: '/images/pu-ni-flower.png' },
];

// Map enchin id to their driver result image
const DRIVER_RESULT_IMAGES = {
  wonchu:  '/images/mg1driver-wonchu.png',
  jakey:   '/images/mg1driver-jakey.png',
  noxstar: '/images/mg1driver-noxstar.png',
  snowe:   '/images/mg1driver-snowe.png',
  kishu:   '/images/mg1driver-kishu.png',
  'pu-ni': '/images/mg1driver-pu-ni.png',
};

// Visual layout:
// Row 0: 5 3 1
// Row 1: 6 4 2
const SEAT_ORDER = [
  ['seat5', 'seat3', 'seat1'],
  ['seat6', 'seat4', 'seat2'],
];

export default function MG1Seating({ playerName, onNext }) {
  return (
    <MG1SeatingInner
      playerName={playerName}
      enchins={ENCHINS}
      driverResultImages={DRIVER_RESULT_IMAGES}
      onNext={onNext}
    />
  );
}

function MG1SeatingInner({ playerName, enchins, driverResultImages, onNext }) {
  const [seating, setSeating] = useState({}); // seatId -> enchinId
  const [draggedId, setDraggedId] = useState(null);

  // Main video ref (stays on last frame)
  const videoRef = useRef(null);

  // Confirmation & result state
  const [showConfirm, setShowConfirm] = useState(false);
  const [locked, setLocked] = useState(false);
  const [driverEnchin, setDriverEnchin] = useState(null);

  // Debug: log seating whenever it changes
  useEffect(() => {
    console.log('Current seating:', seating);
  }, [seating]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay blocked; user may need to interact first.
        });
      }
    }
  }, []);

  const isFull = Object.keys(seating).length === SEATS.length;

  const handleLockIn = () => {
    console.log('handleLockIn called, isFull:', isFull, 'seating:', seating);
    if (!isFull) return;
    setShowConfirm(true);
  };

  const handleConfirmLock = () => {
    console.log('handleConfirmLock called');
    console.log('seating before lock:', seating);

    setShowConfirm(false);
    setLocked(true);

    const driverId = seating.seat1;
    const driver = enchins.find((e) => e.id === driverId) || null;

    console.log('driverId:', driverId);
    console.log('driver:', driver);

    setDriverEnchin(driver);

    // Do NOT call onNext here; call it on Continue button
  };

  const handleCancelLock = () => {
    setShowConfirm(false);
  };

  const handleDragStartPool = (e, enchinId) => {
    console.log('Drag start from pool:', enchinId);
    setDraggedId(enchinId);
    e.dataTransfer.setData('text/plain', enchinId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragStartSeat = (e, enchinId) => {
    console.log('Drag start from seat:', enchinId);
    setDraggedId(enchinId);
    e.dataTransfer.setData('text/plain', enchinId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropSeat = (e, seatId) => {
    e.preventDefault();
    const enchinId = e.dataTransfer.getData('text/plain');
    console.log('Drop on seat:', seatId, 'enchinId:', enchinId);
    if (!enchinId) return;

    setSeating((prev) => {
      const updated = { ...prev };
      const existingInTarget = updated[seatId];

      // Remove dragged Enchin from its old seat (if any)
      Object.keys(updated).forEach((key) => {
        if (updated[key] === enchinId) {
          delete updated[key];
        }
      });

      // If there was someone in the target seat, swap them
      if (existingInTarget && existingInTarget !== enchinId) {
        let oldSeatId = null;
        Object.keys(prev).forEach((key) => {
          if (prev[key] === enchinId) oldSeatId = key;
        });

        if (oldSeatId) {
          updated[oldSeatId] = existingInTarget;
        } else {
          // Dragged from pool: find any empty seat for the existing one
          const allSeatIds = SEATS.map((s) => s.id);
          const used = new Set(Object.keys(updated));
          const free = allSeatIds.find((id) => !used.has(id));
          if (free) {
            updated[free] = existingInTarget;
          }
        }
      }

      // Place dragged Enchin in the target seat
      updated[seatId] = enchinId;

      console.log('New seating after drop:', updated);
      return updated;
    });

    setDraggedId(null);
  };

  // Result screen after lock-in (chosen driver)
  if (locked && driverEnchin) {
    const resultImageUrl = driverResultImages[driverEnchin.id];

    console.log('Rendering result screen for driver:', driverEnchin);

    return (
      <section className="game">
        <div className="game-box">
          <div className="game-head">
            <div className="game-location">ROAD TRIP PREP</div>
            <h1>Your Mission 1 : Seat the ENCHIN chosen driver is...</h1>
            <p>
              Driver: <strong>{driverEnchin.name}</strong>
            </p>
          </div>

          <div className="game-area">
            <div
              style={{
                display: 'grid',
                placeItems: 'center',
                gap: '18px',
                padding: '24px',
              }}
            >
              <img
                src={resultImageUrl}
                alt={`${driverEnchin.name} driver result`}
                style={{
                  width: 'min(900px, 96vw)',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: '16px',
                  border: '3px solid #0f172a',
                  boxShadow: '0 12px 30px rgba(2,6,23,0.45)',
                }}
              />
            </div>
          </div>

          <div className="game-message">
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <a
                href={resultImageUrl}
                download
                className="game-btn"
                style={{
                  textDecoration: 'none',
                  background: '#fbbf24',      // yellow
                  color: '#18221f',
                  border: '2px solid #0f172a',
                  boxShadow: '0 4px 0 #0f172a',
                }}
              >
                Save Image
              </a>

              <button
                className="game-btn"
                onClick={() => {
                  console.log('Continue clicked');

                  const driverId = seating.seat1;
                  const scores = {};
                  if (driverId) {
                    scores[driverId] = 3;
                  }

                  onNext(scores);
                }}
                style={{
                  background: '#10b981',      // green
                  color: '#fff',
                  border: '2px solid #0f172a',
                  boxShadow: '0 4px 0 #0f172a',
                }}
              >
                Continue journey
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Seating UI
  return (
    <section className="game">
      <div className="game-box">
        <div className="game-head">
          <div className="game-location">ROAD TRIP PREP</div>
          <h1>SEAT THE ENCHIN</h1>
          <p>Drag any ENCHIN into a seat. Swap by dragging one onto another.</p>
        </div>

        <div className="game-area">
          <div className="seating-content">
            {/* Enchin Pool */}
            <div className="seating-pool">
              <h3 className="seating-pool-title">DRAG THE ENCHIN</h3>
              <div className="seating-enchin-list">
                {enchins.map((e) => {
                  const isSeated = Object.values(seating).includes(e.id);
                  return (
                    <div
                      key={e.id}
                      draggable={!isSeated}
                      onDragStart={(dragEvt) => handleDragStartPool(dragEvt, e.id)}
                      style={{
                        opacity: isSeated ? 0.25 : 1,
                        cursor: isSeated ? 'not-allowed' : 'grab',
                        transition: 'opacity 0.18s ease, transform 0.18s ease',
                      }}
                      title={isSeated ? 'Already seated' : e.name}
                    >
                      <img
                        src={e.image}
                        alt={e.name}
                        draggable={false}
                        style={{
                          width: 72,
                          height: 'auto',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Car + Video (held on last frame) + Seats */}
            <div className="seating-car">
              {/* Intro video (stays on last frame) */}
              <div className="seating-car-media">
                <video
                  ref={videoRef}
                  src="/images/mg1seatingintrovid.mp4"
                  controls={false}
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    borderRadius: '18px',
                  }}
                />
              </div>

              {/* Seat grid on top */}
              <div className="seating-grid">
                {SEAT_ORDER.map((row, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="seating-row">
                    {row.map((seatId) => {
                      const seat = SEATS.find((s) => s.id === seatId);
                      const occupiedId = seating[seat.id];
                      const occupied = enchins.find((en) => en.id === occupiedId);

                      let className = 'seating-seat';
                      if (occupied) className += ' occupied';
                      else if (draggedId) className += ' ready';

                      return (
                        <div
                          key={seat.id}
                          className={className}
                          data-seat-id={seat.id}
                          onDragOver={handleDragOver}
                          onDrop={(dropEvt) => handleDropSeat(dropEvt, seat.id)}
                          aria-label={`${seat.label} seat${occupied ? ` occupied by ${occupied.name}` : ''}`}
                        >
                          <div style={{ textAlign: 'center' }}>
                            <div className="seating-seat-label">{seat.label}</div>
                            <div className="seating-seat-name">
                              {occupied ? (
                                <div
                                  draggable
                                  onDragStart={(dragEvt) =>
                                    handleDragStartSeat(dragEvt, occupied.id)
                                  }
                                  title={`Drag ${occupied.name} to another seat`}
                                  style={{
                                    cursor: 'grab',
                                    display: 'inline-block',
                                  }}
                                >
                                  <img
                                    src={occupied.image}
                                    alt={occupied.name}
                                    draggable={false}
                                    style={{
                                      width: 80,
                                      height: 'auto',
                                      objectFit: 'contain',
                                      display: 'block',
                                    }}
                                  />
                                </div>
                              ) : (
                                <span></span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="game-message">
          <button
            className="game-btn"
            onClick={handleLockIn}
            disabled={!isFull}
            style={{ opacity: !isFull ? 0.5 : 1 }}
          >
            LOCK IN
          </button>
        </div>
      </div>

      {/* Confirmation Modal (no preview, just text + buttons) */}
      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2,6,23,0.7)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: '#fffdf7',
              color: '#18221f',
              padding: '24px',
              borderRadius: '16px',
              border: '3px solid #0f172a',
              maxWidth: '420px',
              width: '90vw',
              boxShadow: '0 20px 40px rgba(2,6,23,0.45)',
            }}
          >
            <h2
              style={{
                margin: '0 0 8px',
                fontSize: '18px',
                fontWeight: 800,
              }}
            >
              CONFIRM SEATING CHART
            </h2>
            <p
              style={{
                margin: '0 0 12px',
                fontSize: '13px',
                opacity: 0.8,
              }}
            >
              {playerName ? (
                <>
                  <strong>{playerName}</strong>, are you sure this is the seating chart you want to lock in?
                </>
              ) : (
                'Are you sure this is the seating chart you want to lock in?'
              )}
            </p>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '18px',
              }}
            >
              <button
                className="game-btn"
                onClick={handleCancelLock}
                style={{
                  background: '#e2e8f0',
                  color: '#18221f',
                  border: '2px solid #0f172a',
                  boxShadow: '0 4px 0 #0f172a',
                }}
              >
                Cancel
              </button>
              <button
                className="game-btn"
                onClick={handleConfirmLock}
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: '2px solid #0f172a',
                  boxShadow: '0 4px 0 #0f172a',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}