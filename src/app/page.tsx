"use client";
import dynamic from "next/dynamic";
import { socket } from "./component/server";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { TimeDisplay } from "./component/time";
import { IoMdAirplane } from "react-icons/io";
import { PiPathFill, PiMapPinFill, PiBuildingsFill } from "react-icons/pi";

const Map = dynamic(
  () => import("@/app/component/map").then((component) => component.Map),
  { ssr: false }
);
const HomePage = () => {
  const [flightData, setFlightData] = useState([]); // data of Aircraft (destination / origin)
  const [flightDetails, setFlightDetails] = useState([]); // data of airplane (track / position)
  const [radius, setRadius] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enableMap, setEnableMap] = useState(true);

  const handleFlightData = (data: any) => {
    if (flightData !== data) {
      setFlightData(data);
    }
  };

  const handleFlightDetails = (data: any) => {
    setFlightDetails(data);
  };

  const handleRadius = (data: any) => {
    if (radius !== data) {
      setRadius(data);
    }
  };

  const loadingState = (isLoading: boolean) => {
    setEnableMap(!isLoading);
    setLoading(isLoading);
  };

  useEffect(() => {
    socket.connect();

    socket.on("flightDetails", handleFlightDetails);
    socket.on("flightsOnLocation", (data) => {
      handleFlightData(data);
      loadingState(false);
    });
    socket.on("markRadius", handleRadius);
    return () => {
      socket.disconnect();
    };
  }, []);

  const airlines = new Set(
    flightData.map((f: any) => f?.airline?.name).filter(Boolean)
  ).size;

  const kpis = [
    {
      label: "Active Flights",
      value: flightDetails.length,
      icon: <IoMdAirplane size={18} />,
    },
    {
      label: "Routes Tracked",
      value: flightData.length,
      icon: <PiPathFill size={18} />,
    },
    {
      label: "Coverage Radius",
      value: radius.length ? "10 km" : "—",
      icon: <PiMapPinFill size={18} />,
    },
    {
      label: "Airlines",
      value: airlines,
      icon: <PiBuildingsFill size={18} />,
    },
  ];

  return (
    <>
      <div className="clock-strip">
        <TimeDisplay
          timeZone="Asia/Tokyo"
          color="#BC002D"
          title="Japan"
          contryCode="JP"
        />
        <TimeDisplay
          timeZone="Europe/London"
          color="#012169"
          title="London"
          contryCode="GB"
        />
        <TimeDisplay
          timeZone="Asia/Manila"
          color="#FED141"
          title="Philippines"
          contryCode="PH"
        />
        <TimeDisplay
          timeZone="Australia/Sydney"
          color="#012169"
          title="Australia"
          contryCode="AU"
        />
        <TimeDisplay
          timeZone="Canada/Pacific"
          color="#D80621"
          title="Canada"
          contryCode="CA"
        />
        <TimeDisplay
          timeZone="IST"
          color="#046A38"
          title="India"
          contryCode="IN"
        />
      </div>

      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div className="kpi-card" key={kpi.label}>
            <div className="kpi-head">
              <span className="kpi-label">{kpi.label}</span>
              <span className="kpi-icon">{kpi.icon}</span>
            </div>
            <div className="kpi-value">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* tokyo center */}
      <Map
        center={{ lat: 35.6895, lng: 139.692 }}
        radiusData={radius}
        flightRouteData={flightData}
        flightDetails={flightDetails}
        loading={loading}
        enableMap={enableMap}
        loadingState={loadingState}
      />
    </>
  );
};

export default HomePage;
