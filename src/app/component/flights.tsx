import { Container, Row, Col, Stack, Card, Offcanvas } from "react-bootstrap";
import { Slide } from "react-awesome-reveal";
import {
  PiAirplaneTakeoffFill,
  PiAirplaneLandingFill,
  PiAirplaneFill,
} from "react-icons/pi";

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
      {flightRouteData.length === 0 ? (
        <Slide direction="right">
          <Card>
            <div
              className="d-flex align-items-center gap-2"
              style={{ padding: "20px" }}
            >
              No Flights Nearby
              <PiAirplaneFill size={20} />
            </div>
          </Card>
        </Slide>
      ) : (
        flightRouteData.map((flights: any) => (
          <Slide key={flights.callsign_iata} direction="right">
            <Card
              className="card-details"
              key={flights.callsign_iata}
              style={{
                borderBottom: `4px solid ${flights.color}`,
                cursor: "pointer",
              }}
              onClick={() => {
                handleMarkerClick(flights.callsign);
                handleShow(flights.callsign);
              }}
            >
              <Container>
                <Row>
                  <Col className="align-items-start my-3">
                    <Card.Title style={{ color: `${flights.color}` }}>
                      {flights.callsign}
                    </Card.Title>
                    <Card.Subtitle>{flights.airline.name}</Card.Subtitle>
                  </Col>
                </Row>
                <Row>
                  <Col className="d-flex justify-content-center align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      {flights.origin.iata_code}
                      <PiAirplaneTakeoffFill size={20} />
                    </div>
                  </Col>
                  <Col>
                    <div className="d-flex align-items-center">
                      <div
                        style={{
                          flex: 1,
                          borderBottom: "2px dashed black",
                        }}
                      ></div>

                      <PiAirplaneFill size={20} style={{ margin: "0 10px" }} />

                      <div
                        style={{
                          flex: 1,
                          borderBottom: "2px dashed black",
                        }}
                      ></div>
                    </div>
                  </Col>
                  <Col className="d-flex justify-content-center align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <PiAirplaneLandingFill size={20} />
                      {flights.destination.iata_code}
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col className="d-flex justify-content-center align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      {flights.origin.country_name}
                    </div>
                  </Col>
                  <Col></Col>
                  <Col className="d-flex justify-content-center align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      {flights.destination.country_name}
                    </div>
                  </Col>
                </Row>
                <Row className="my-2"></Row>
              </Container>
            </Card>
          </Slide>
        ))
      )}
    </Stack>
  );
};
