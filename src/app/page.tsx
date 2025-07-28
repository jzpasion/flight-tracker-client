"use client";
import dynamic from "next/dynamic";
import { Container, Row, Col } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";

const Map = dynamic(
  () => import("@/app/component/map").then((component) => component.Map),
  { ssr: false }
);
const HomePage = () => {
  const locations = [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      lat: 35.7315444,
      lng: 140.0674687,
    },
  ];
  return (
    <Container>
      <Row>
        <Col className="align-items-start my-3">
          <h2>Flight Navigation Tracker</h2>
        </Col>
      </Row>
      <Row>
        <Map
          center={{ lng: locations[0].lng, lat: locations[0].lat }}
          locations={locations}
        />
      </Row>
    </Container>
  );
};

export default HomePage;
