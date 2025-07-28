import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  ZoomControl,
  useMapEvents,
  Polygon,
  LayersControl,
} from "react-leaflet";
import { socket } from "./server";
import { Icon, latLng, LatLngLiteral, Control } from "leaflet";

import {
  PiAirplaneTakeoffFill,
  PiAirplaneLandingFill,
  PiAirplaneFill,
} from "react-icons/pi";

import { Container, Row, Col, Stack, Card, Button } from "react-bootstrap";
import Marquee from "react-fast-marquee";
import { Slide } from "react-awesome-reveal";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "../css/map.css";

type MapType = "roadmap" | "satellite" | "hybrid" | "terrain";

type MapLocation = LatLngLiteral & { id: string };

type MapProps = {
  center: LatLngLiteral;
  locations: MapLocation[];
};

const testFlights: any = [
  {
    flightName: "test1",
    CountryofOrigin: "Japan",
    CountryofDestination: "Philippines",
    AirportOrigin: "NRT",
    AirportDestination: "MNL",
  },
  {
    flightName: "test2",
    CountryofOrigin: "Japan",
    CountryofDestination: "Philippines",
    AirportOrigin: "NRT",
    AirportDestination: "MNL",
  },
  {
    flightName: "test3",
    CountryofOrigin: "Japan",
    CountryofDestination: "Philippines",
    AirportOrigin: "NRT",
    AirportDestination: "MNL",
  },
  // {
  //   flightName: "test4",
  //   CountryofOrigin: "Japan",
  //   CountryofDestination: "Philippines",
  //   AirportOrigin: "NRT",
  //   AirportDestination: "MNL",
  // },
];

const SelectedLocation = ({ center }: { center: LatLngLiteral }) => {
  const map = useMap();
  map.panTo(center, { animate: true });
  return null;
};

const LocationClick = ({ onClick }: any) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
};

// degrees to radian
const toRadians = (degrees: number) => {
  return (degrees * Math.PI) / 180;
};

// radian to degress
const toDegrees = (radians: number) => {
  return (radians * 180) / Math.PI;
};

//getting the radius
const destinationPoint = (lat: any, lon: any, distance: any, bearing: any) => {
  const R = 6371; // Earth radius in km
  const δ = distance / R; // Angular distance in radians
  const θ = toRadians(bearing);
  const φ1 = toRadians(lat);
  const λ1 = toRadians(lon);

  const sinφ1 = Math.sin(φ1);
  const cosφ1 = Math.cos(φ1);
  const sinδ = Math.sin(δ);
  const cosδ = Math.cos(δ);
  const sinθ = Math.sin(θ);
  const cosθ = Math.cos(θ);

  const sinφ2 = sinφ1 * cosδ + cosφ1 * sinδ * cosθ;
  const φ2 = Math.asin(sinφ2);

  const y = sinθ * sinδ * cosφ1;
  const x = cosδ - sinφ1 * sinφ2;
  const λ2 = λ1 + Math.atan2(y, x);

  // Normalize longitude to be between -180° and +180°
  const lon2 = ((toDegrees(λ2) + 540) % 360) - 180;
  const lat2 = toDegrees(φ2);

  return { lat: lat2, lon: lon2 };
};

export const Map: React.FC<MapProps> = ({ center, locations }) => {
  const [radiusLat, setRadiusLat] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState<
    MapLocation | undefined
  >();

  // Reference to the Leaflet map instance
  const mapRef = useRef<any>(null);

  const handleMapClick = async (latLng: any) => {
    console.log(latLng);
    setSelectedLocation(latLng);
    if (mapRef.current) {
      mapRef.current.panTo(latLng, { animate: true });
    }
    // socket.emit("getFlightsOnLocation", latLng.lat, latLng.lng, 4);
  };

  // getting url for map style
  const getUrl = (style: MapType) => {
    const mapTypeUrls: Record<MapType, string> = {
      roadmap: "http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}",
      satellite: "http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}",
      hybrid: "http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}",
      terrain: "http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}",
    };

    return mapTypeUrls[style];
  };

  const mapMarkIcon = new Icon({
    iconUrl: "map-marker.png",
    iconSize: [35, 46],
    iconAnchor: [17, 46],
  });

  const mapMarkActiveIcon = new Icon({
    iconUrl: "active-map-marker.png",
    iconSize: [57, 65],
  });

  const tileOverLay = () => {
    return (
      <LayersControl position="bottomright">
        <LayersControl.BaseLayer checked name="Roadmap">
          <TileLayer url={getUrl("roadmap")} />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Satellite">
          <TileLayer url={getUrl("satellite")} />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Hybrid">
          <TileLayer url={getUrl("hybrid")} />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Terrain">
          <TileLayer url={getUrl("terrain")} />
        </LayersControl.BaseLayer>

        <LayersControl.Overlay name="Tile Overlay">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </LayersControl.Overlay>
      </LayersControl>
    );
  };

  const renderMarks = () => {
    return locations.map((location) => (
      <div key={location.id}>
        <Marker
          icon={
            location.id === selectedLocation?.id
              ? mapMarkActiveIcon
              : mapMarkIcon
            // mapAirplaneIcon
          }
          position={{ lat: location.lat, lng: location.lng }}
          eventHandlers={{
            click: () => {
              console.log("pressed", location);

              setSelectedLocation(location);
              if (mapRef.current) {
                mapRef.current.panTo(latLng, { animate: true });
              }
            },
          }}
        />
      </div>
    ));
  };

  return (
    <Container>
      <Row>
        <Col lg={9}>
          <MapContainer
            className="mapContainer"
            center={center}
            zoom={9}
            minZoom={4}
            zoomControl={false}
            attributionControl={false}
            whenReady={() => {
              // socket.connect();

              // socket.on("flightsOnLocation", (data) => {
              //   console.log("Flights near location:", data);
              // });

              // putting the radius mark
              if (locations && locations.length > 0) {
                let tempRadiusLat: any = [];
                for (let i = 0; i <= 360; i++) {
                  let dest = destinationPoint(
                    locations[0].lat,
                    locations[0].lng,
                    5,
                    i
                  );
                  tempRadiusLat.push([dest.lat, dest.lon]);
                }
                setRadiusLat(tempRadiusLat);
              }
            }}
          >
            {tileOverLay()}
            {selectedLocation && <SelectedLocation center={selectedLocation} />}
            {selectedLocation && (
              <Marker
                position={selectedLocation}
                icon={mapMarkIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedLocation(selectedLocation);
                    if (mapRef.current) {
                      mapRef.current.panTo(latLng, { animate: true });
                    }
                  },
                }}
              />
            )}
            {renderMarks()}
            <ZoomControl position="topright" />
            <LocationClick onClick={handleMapClick} />
            <Polygon positions={radiusLat} fillColor="red" />
          </MapContainer>
        </Col>
        <Col>
          <Stack className="listStyle" gap={3}>
            <Slide direction="right">
              {testFlights.length === 0 ? (
                <Card>
                  <div
                    className="d-flex align-items-center gap-2"
                    style={{ padding: "20px" }}
                  >
                    No Flights Nearby
                    <PiAirplaneFill size={20} />
                  </div>
                </Card>
              ) : (
                testFlights.map((flights: any) => (
                  <Card key={flights.flightName}>
                    <Container>
                      <Row>
                        <Col className="align-items-start my-3">
                          <Card.Title>{flights.flightName}</Card.Title>
                          <Card.Subtitle>Airline name</Card.Subtitle>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="d-flex justify-content-center align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            {flights.AirportOrigin}
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

                            <PiAirplaneFill
                              size={20}
                              style={{ margin: "0 10px" }}
                            />

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
                            {flights.AirportDestination}
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="d-flex justify-content-center align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            {flights.CountryofOrigin}
                          </div>
                        </Col>
                        <Col></Col>
                        <Col className="d-flex justify-content-center align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            {flights.CountryofDestination}
                          </div>
                        </Col>
                      </Row>
                      <Row className="my-2">
                        <Marquee direction="right">Altitude: 102030</Marquee>
                      </Row>
                    </Container>
                  </Card>
                ))
              )}
            </Slide>
          </Stack>
        </Col>
      </Row>
    </Container>
  );
};
