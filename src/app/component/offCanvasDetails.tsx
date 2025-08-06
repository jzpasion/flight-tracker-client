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
      style={{ border: `1px solid ${offCanvasData?.color}` }}
    >
      <Offcanvas.Header closeButton>
        <div className="w-100">
          <Offcanvas.Title>{offCanvasData?.flight}</Offcanvas.Title>
          <p className="text-muted mb-0" style={{ marginTop: "5px" }}>
            {detailsAvailable
              ? offCanvasData?.airline?.name
              : "Airline info not available"}
          </p>
        </div>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Card
          style={{
            borderBottom: `4px solid ${
              detailsAvailable ? offCanvasData.color : "none"
            }`,
            cursor: "pointer",
          }}
        >
          <Container>
            {detailsAvailable ? (
              <>
                <Row className="mb-2    ">
                  <>
                    <Col className="d-flex align-items-start">
                      <Stack>
                        <div>{offCanvasData?.origin?.iata_code}</div>
                        <div style={{ fontSize: ".8em" }}>
                          {offCanvasData?.origin?.name}
                        </div>
                        <div>{offCanvasData?.origin?.country_name}</div>
                      </Stack>
                    </Col>
                    <Col
                      className="d-flex flex-column align-items-end mb-2"
                      style={{ height: "100%" }}
                    >
                      <Stack gap={0} style={{ textAlign: "right" }}>
                        <div>{offCanvasData?.destination?.iata_code}</div>
                        <div style={{ fontSize: ".8em" }}>
                          {offCanvasData?.destination?.name}
                        </div>
                        <div>{offCanvasData?.destination?.country_name}</div>
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
                      <div
                        style={{
                          flex: 1,
                          borderBottom: "2px dashed black",
                        }}
                      ></div>

                      <PiAirplaneTiltFill size={20} />

                      <div
                        style={{
                          flex: 1,
                          borderBottom: "2px dashed black",
                        }}
                      ></div>
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
                <div
                  style={{
                    flex: 1,
                    borderBottom: "1px solid black",
                    marginBottom: "1em",
                  }}
                />
              </>
            ) : (
              <Col className="d-flex align-items-start">No Route Details</Col>
            )}
          </Container>
        </Card>
      </Offcanvas.Body>
    </Offcanvas>
  );
};
