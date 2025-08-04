import { useEffect, useRef, useState } from "react";
import ReactDOMServer from "react-dom/server"; // Import for rendering JSX to HTML string
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
import { Icon, latLng, LatLngLiteral, Control, divIcon } from "leaflet";

import {
  PiAirplaneTakeoffFill,
  PiAirplaneLandingFill,
  PiAirplaneFill,
  PiAirplaneTaxiingFill,
} from "react-icons/pi";
import { IoMdAirplane } from "react-icons/io";
import { IoLocationSharp } from "react-icons/io5";

import {
  Container,
  Row,
  Col,
  Stack,
  Card,
  OverlayTrigger,
  Tooltip,
  Offcanvas,
} from "react-bootstrap";
import Marquee from "react-fast-marquee";
import { Slide } from "react-awesome-reveal";
import { PulseLoader } from "react-spinners";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-rotatedmarker";
import "../css/map.css";

type MapType = "roadmap" | "satellite" | "hybrid" | "terrain";

type MapLocation = LatLngLiteral & { id: string };

type MapProps = {
  center: LatLngLiteral;
  radiusData: any;
  flightRouteData: any;
  flightDetails: any;
  loading: boolean;
  enableMap: boolean;
  loadingState: (isLoading: boolean) => void;
};

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

export const Map: React.FC<MapProps> = ({
  center,
  radiusData,
  flightRouteData,
  flightDetails,
  loading,
  enableMap,
  loadingState,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<
    MapLocation | undefined
  >();

  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const maxRadius = 5;
  const handleMapClick = async (latLng: any) => {
    if (enableMap && !loading) {
      loadingState(true);
      setSelectedLocation(latLng);
      if (mapRef.current) {
        mapRef.current.panTo(latLng, { animate: true });
      }
      socket.emit("getFlightsOnLocation", latLng.lat, latLng.lng, maxRadius);
      socket.emit("getRadiusMap", latLng.lat, latLng.lng, maxRadius + 5);
    }
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

  const mapMarkIcon = () =>
    divIcon({
      className: "map-marker",
      html: ReactDOMServer.renderToString(
        <IoLocationSharp size={25} color="red" />
      ),
      iconSize: [25, 36],
      iconAnchor: [12, 36],
    });
  const airplaneIcon = (color: any) =>
    divIcon({
      className: "airplane-icon",
      html: ReactDOMServer.renderToString(
        <IoMdAirplane size={40} color={color} />
      ),
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

  const popup = (data: any) => {
    return ReactDOMServer.renderToString(
      <div
        style={{
          color: `${data.color}`,
          fontSize: "1rem",
        }}
      >
        <strong>{data.flight}</strong>
      </div>
    );
  };

  const renderAirplanes = () => {
    return flightDetails.map((flight: any, index: number) => {
      const marker = (
        <Marker
          key={flight.hex}
          icon={airplaneIcon(flight.color)}
          position={{ lat: flight.lat, lng: flight.lon }}
          rotationAngle={flight.track}
          ref={(ref: any) => (markersRef.current[index] = ref)}
          eventHandlers={{
            click: () => {},
            mouseover: (e) => {
              const popupContent = popup(flight);
              e.target
                .bindPopup(popupContent, {
                  closeButton: false,
                  offset: [5, -10],
                })
                .openPopup();
            },
            mouseout: (e) => {
              e.target.closePopup();
            },
          }}
        />
      );
      return marker;
    });
  };
  useEffect(() => {
    // update the rotation of markers when flightDetails change
    markersRef.current.forEach((marker: any, index: number) => {
      const flight = flightDetails[index];
      if (marker && flight && flight.track !== undefined) {
        marker.setRotationAngle(flight.track);
      }
    });
  }, [flightDetails]);
  return (
    <Container>
      <Row>
        <Col lg={9}>
          <div style={{ position: "relative" }}>
            <MapContainer
              className="mapContainer"
              center={center}
              zoom={9}
              minZoom={4}
              zoomControl={false}
              attributionControl={false}
              dragging={enableMap}
              touchZoom={enableMap}
              boxZoom={enableMap}
              doubleClickZoom={enableMap}
              scrollWheelZoom={enableMap}
            >
              {tileOverLay()}
              {renderAirplanes()}
              {/* {selectedLocation && <SelectedLocation center={selectedLocation} />} */}
              {selectedLocation && (
                <Marker
                  position={selectedLocation}
                  icon={mapMarkIcon()}
                  eventHandlers={{
                    click: () => {
                      setSelectedLocation(selectedLocation);
                      if (mapRef.current) {
                        mapRef.current.panTo(selectedLocation, {
                          animate: true,
                        });
                      }
                    },
                  }}
                />
              )}
              <ZoomControl position="topright" />
              <LocationClick onClick={handleMapClick} />
              <Polygon
                positions={radiusData}
                fillColor="lightgreen"
                color="green"
                weight={1}
                opacity={0.5}
                fillOpacity={0.2}
              />
            </MapContainer>
            <div className={`overlay ${loading ? "show" : ""}`}>
              <PiAirplaneTaxiingFill size={50} color="#162930" />
              <PulseLoader size={17} speedMultiplier={0.8} color="#162930" />
            </div>
          </div>
        </Col>
        <Col>
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
                    key={flights.callsign_iata}
                    style={{ borderBottom: `4px solid ${flights.color}` }}
                    onClick={() => {}}
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
        </Col>
      </Row>
    </Container>
  );
};
