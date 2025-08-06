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
import { LatLngLiteral, divIcon } from "leaflet";

import { PiAirplaneTaxiingFill } from "react-icons/pi";
import { IoMdAirplane } from "react-icons/io";
import { IoLocationSharp } from "react-icons/io5";

import { Container, Row, Col, Stack, Card, Offcanvas } from "react-bootstrap";
import { PulseLoader } from "react-spinners";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-rotatedmarker";
import "../css/map.css";
import { FList } from "./flights";
import { OffCanvasDetails } from "./offCanvasDetails";

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
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [show, setShow] = useState(false);
  const [offCanvasData, setOffCanvasData] = useState<any>({});

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

  const handleClose = () => {
    setShow(false);
    setSelectedMarker(null);
  };
  const handleShow = (callsign: any) => {
    let tempData = {};
    const aircraftDetails = flightDetails.filter((ac: any) => {
      return ac.flight.trim() === callsign.trim();
    });

    const routeDetails = flightRouteData.filter((route: any) => {
      return route.callsign.trim() === callsign.trim();
    });

    tempData = { ...aircraftDetails[0], ...routeDetails[0] };
    setOffCanvasData(tempData);
    console.log(tempData);

    setShow(true);
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
  const airplaneIcon = (color: any, isSelected: boolean) =>
    divIcon({
      className: `airplane-icon ${isSelected ? "expanded" : ""}`,
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

  const handleMarkerClick = (flight: any) => {
    handleShow(flight);
    setSelectedMarker((prev) => (prev === flight ? null : flight));
  };

  const renderAirplanes = () => {
    return flightDetails.map((flight: any, index: number) => {
      const isSelected = selectedMarker === flight.hex;
      const marker = (
        <Marker
          key={flight.hex}
          icon={airplaneIcon(flight.color, isSelected)}
          position={{ lat: flight.lat, lng: flight.lon }}
          rotationAngle={flight.track}
          ref={(ref: any) => (markersRef.current[index] = ref)}
          eventHandlers={{
            click: (e) => {
              const popupContent = popup(flight);
              e.target
                .bindPopup(popupContent, {
                  closeButton: false,
                  offset: [5, -10],
                })
                .openPopup();
              handleMarkerClick(flight.flight);
            },
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
              if (selectedMarker !== flight.flight) {
                e.target.closePopup();
                handleClose();
              }
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
          <FList
            flightRouteData={flightRouteData}
            handleMarkerClick={handleMarkerClick}
            handleShow={handleShow}
          />
        </Col>
      </Row>

      <OffCanvasDetails
        handleClose={handleClose}
        show={show}
        offCanvasData={offCanvasData}
      />
    </Container>
  );
};
