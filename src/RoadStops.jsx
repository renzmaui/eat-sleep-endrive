export default function RoadStops({
  completedGames,
  onSelectGame,
}) {
  const allGamesComplete =
    completedGames.mg1 &&
    completedGames.mg2 &&
    completedGames.mg3;

  const locations = [
    {
      id: "mg1",
      className: "waiting-shed-location",
      title: "WAITING SHED",
      subtitle: completedGames.mg1
        ? "COMPLETED"
        : "SEAT THE ENCHINS",
      completed: completedGames.mg1,
      illustration: (
        <div className="landmark waiting-shed">
          <span className="landmark-glow" />
          <span className="shed-lamp" />
          <span className="shed-roof" />
          <span className="shed-back-panel" />
          <span className="shed-glass shed-glass-left" />
          <span className="shed-glass shed-glass-right" />
          <span className="shed-frame shed-frame-left" />
          <span className="shed-frame shed-frame-right" />
          <span className="shed-bench" />
          <span className="shed-sign">W</span>
        </div>
      ),
    },
    {
      id: "mg2",
      className: "bus-stop-location",
      title: "BUS STOP",
      subtitle: completedGames.mg2
        ? "COMPLETED"
        : "PICK THE VIBE",
      completed: completedGames.mg2,
      illustration: (
        <div className="landmark bus-stop">
          <span className="landmark-glow" />
          <span className="bus-shelter-roof" />
          <span className="bus-shelter-glass" />
          <span className="bus-shelter-frame bus-frame-left" />
          <span className="bus-shelter-frame bus-frame-right" />
          <span className="bus-stop-pole" />
          <span className="bus-stop-sign">BUS</span>
          <span className="bus-stop-bench" />
          <span className="bus-stop-route">06</span>
        </div>
      ),
    },
    {
      id: "mg3",
      className: "gas-station-location",
      title: "GASOLINE STATION",
      subtitle: completedGames.mg3
        ? "COMPLETED"
        : "CUSTOMIZE THE RIDE",
      completed: completedGames.mg3,
      illustration: (
        <div className="landmark gas-station">
          <span className="landmark-glow" />
          <span className="gas-canopy" />
          <span className="gas-canopy-stripe" />
          <span className="gas-pillar gas-pillar-left" />
          <span className="gas-pillar gas-pillar-right" />
          <span className="gas-pump gas-pump-left" />
          <span className="gas-pump gas-pump-right" />
          <span className="gas-price-board">$</span>
          <span className="gas-station-light" />
        </div>
      ),
    },
  ];

  return (
    <section className="road-stops">
      <div className="road-sky" aria-hidden="true">
        <span className="sun-glow" />
        <span className="sun" />
        <span className="cloud cloud-one" />
        <span className="cloud cloud-two" />
        <span className="cloud cloud-three" />
        <span className="mountain mountain-back" />
        <span className="mountain mountain-front" />
      </div>

      <header className="road-header">
        <div className="road-eyebrow">
          EN-DRIVE ROUTE
        </div>

        <h1 className="road-title">
          THREE STOPS.
          <span>ONE ROAD TRIP.</span>
        </h1>

        <p className="road-subtitle">
          Take your time. The road is yours.
        </p>
      </header>

      <div className="road-world">
        <div className="route-line" aria-hidden="true" />

        <div className="road-scenery" aria-hidden="true">
          <span className="tree tree-one" />
          <span className="tree tree-two" />
          <span className="tree tree-three" />
          <span className="roadside-flower flower-one" />
          <span className="roadside-flower flower-two" />
          <span className="roadside-flower flower-three" />
        </div>

        <div className="road-landmarks">
          {locations.map((location) => (
            <button
              key={location.id}
              className={`road-location ${location.className} ${
                location.completed ? "is-complete" : ""
              }`}
              onClick={() => onSelectGame(location.id)}
              disabled={location.completed}
              aria-label={`${location.title}: ${location.subtitle}`}
            >
              <span className="location-art">
                {location.illustration}
              </span>

              <span className="location-caption">
                <strong>{location.title}</strong>
                <small>{location.subtitle}</small>
              </span>

              {location.completed && (
                <span className="location-complete">
                  ✓
                </span>
              )}
            </button>
          ))}

          {allGamesComplete && (
            <button
              className="destination-gateway"
              onClick={() => onSelectGame("mg4")}
              aria-label="Enter the next place"
            >
              <span className="gateway-light" />
              <span className="gateway-arch">
                <span className="gateway-opening">
                  →
                </span>
              </span>

              <span className="gateway-sign">
                <small>NOW ENTERING</small>
                <strong>THE NEXT PLACE</strong>
              </span>

              <span className="gateway-caption">
                CONTINUE JOURNEY
              </span>
            </button>
          )}
        </div>

        <div className="road-surface" aria-hidden="true">
          <span className="road-center-markings" />
          <span className="road-edge road-edge-left" />
          <span className="road-edge road-edge-right" />
        </div>
      </div>
    </section>
  );
}