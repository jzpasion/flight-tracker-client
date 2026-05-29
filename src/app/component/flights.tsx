import { Stack, Card } from "react-bootstrap";
import { Slide } from "react-awesome-reveal";
import { PiAirplaneFill } from "react-icons/pi";

type flistProps = {
  flightRouteData: any;
  handleMarkerClick: (flight: any) => void;
  handleShow: (callsign: any) => void;
};

export const FList: React.FC<flistProps> = ({
  flightRouteData,
  handleMarkerClick,
  handleShow,
}) => {
  return (
    <Stack className="listStyle" gap={3}>
      <div className="list-heading">
        <span className="list-title">Nearby Flights</span>
        <span className="list-count">{flightRouteData.length}</span>
      </div>

      {flightRouteData.length === 0 ? (
        <Slide direction="right">
          <Card className="card-details">
            <div className="fc-empty">
              <span className="fc-empty-icon">
                <PiAirplaneFill size={26} />
              </span>
              <span className="fc-empty-title">No flights nearby</span>
              <span className="fc-empty-hint">
                Click anywhere on the map to scan for live aircraft
              </span>
            </div>
          </Card>
        </Slide>
      ) : (
        flightRouteData.map((flights: any) => {
          const activate = () => {
            handleMarkerClick(flights.callsign);
            handleShow(flights.callsign);
          };
          return (
            <Slide key={flights.callsign_iata} direction="right">
              <Card
                className="card-details flight-card-accent"
                role="button"
                tabIndex={0}
                aria-label={`View details for flight ${flights.callsign}`}
                style={{ borderLeftColor: flights.color, cursor: "pointer" }}
                onClick={activate}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    activate();
                  }
                }}
              >
                <div className="fc-body">
                  <div className="fc-top">
                    <span className="callsign" style={{ color: flights.color }}>
                      {flights.callsign}
                    </span>
                    <span className="airline" title={flights.airline.name}>
                      {flights.airline.name}
                    </span>
                  </div>

                  <div className="fc-route">
                    <div className="fc-end">
                      <span className="route-code">
                        {flights.origin.iata_code}
                      </span>
                      <span
                        className="country"
                        title={flights.origin.country_name}
                      >
                        {flights.origin.country_name}
                      </span>
                    </div>

                    <div className="fc-line">
                      <span className="fc-track" />
                      <PiAirplaneFill size={16} className="fc-plane" />
                      <span className="fc-track" />
                    </div>

                    <div className="fc-end fc-end-right">
                      <span className="route-code">
                        {flights.destination.iata_code}
                      </span>
                      <span
                        className="country"
                        title={flights.destination.country_name}
                      >
                        {flights.destination.country_name}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Slide>
          );
        })
      )}
    </Stack>
  );
};
