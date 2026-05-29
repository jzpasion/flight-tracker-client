import React from "react";
import { Container, Row, Col, Stack, Card, Offcanvas } from "react-bootstrap";
import {
  PiAirplaneTiltFill,
  PiAirplaneLandingFill,
  PiAirplaneTakeoffFill,
} from "react-icons/pi";

type offCanvasProps = {
  offCanvasData: any;
  show: boolean;
  handleClose: () => void;
};

export const OffCanvasDetails: React.FC<offCanvasProps> = ({
  offCanvasData,
  show,
  handleClose,
}) => {
  const airlineCheck = offCanvasData?.airline?.name?.trim();
  const detailsAvailable: boolean = airlineCheck && airlineCheck !== "";
  return (
    <Offcanvas
      className="custom-offcanvas"
      backdrop={false}
      show={show}
      onHide={handleClose}
    >
      <Offcanvas.Header closeButton>
        <div className="w-100">
          <Offcanvas.Title>{offCanvasData?.flight}</Offcanvas.Title>
          <p className="mb-0" style={{ marginTop: "5px", color: "var(--text-muted)" }}>
            {detailsAvailable
              ? offCanvasData?.airline?.name
              : "Airline info not available"}
          </p>
        </div>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Card
          className="card-details flight-card-accent"
          style={{
            borderLeftColor: detailsAvailable
              ? offCanvasData.color
              : "transparent",
          }}
        >
          <Container className="py-3">
            {detailsAvailable ? (
              <>
                <Row className="mb-2">
                  <>
                    <Col className="d-flex align-items-start">
                      <Stack>
                        <div className="route-code">
                          {offCanvasData?.origin?.iata_code}
                        </div>
                        <div style={{ fontSize: ".8em" }}>
                          {offCanvasData?.origin?.name}
                        </div>
                        <div className="country">
                          {offCanvasData?.origin?.country_name}
                        </div>
                      </Stack>
                    </Col>
                    <Col
                      className="d-flex flex-column align-items-end mb-2"
                      style={{ height: "100%" }}
                    >
                      <Stack gap={0} style={{ textAlign: "right" }}>
                        <div className="route-code">
                          {offCanvasData?.destination?.iata_code}
                        </div>
                        <div style={{ fontSize: ".8em" }}>
                          {offCanvasData?.destination?.name}
                        </div>
                        <div className="country">
                          {offCanvasData?.destination?.country_name}
                        </div>
                      </Stack>
                    </Col>
                  </>
                </Row>
                <Row className="mb-4">
                  <Col
                    className="d-flex justify-content-center align-items-center"
                    xs={2}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <PiAirplaneTakeoffFill size={20} />
                    </div>
                  </Col>
                  <Col xs={8}>
                    <div className="d-flex align-items-center">
                      <div className="route-dash"></div>
                      <PiAirplaneTiltFill size={20} style={{ margin: "0 8px" }} />
                      <div className="route-dash"></div>
                    </div>
                  </Col>
                  <Col
                    className="d-flex justify-content-center align-items-center"
                    xs={2}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <PiAirplaneLandingFill size={20} />
                    </div>
                  </Col>
                </Row>
                <hr className="route-divider" style={{ marginBottom: "1em" }} />
              </>
            ) : (
              <Col className="d-flex align-items-start text-muted-soft">
                No route details
              </Col>
            )}
          </Container>
        </Card>
      </Offcanvas.Body>
    </Offcanvas>
  );
};
