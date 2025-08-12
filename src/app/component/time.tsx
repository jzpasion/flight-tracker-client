import { useEffect, useState } from "react";
import ReactCountryFlag from "react-country-flag";

type intlFormat = {
  timeZone: string;
  color: string;
  title: string;
  contryCode: string;
};
export const TimeDisplay: React.FC<intlFormat> = ({
  timeZone,
  color,
  title,
  contryCode,
}) => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = new Date();

      const formatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: timeZone,
      });

      setTime(formatter.format(currentTime));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);
  return (
    <div className="d-flex flex-column align-items-center justify-content-center ">
      <div
        style={{
          fontSize: "1.2rem",
          fontWeight: "bold",
          padding: "2px",
          borderBottom: `5px solid ${color}`,
          borderBottomLeftRadius: "10px",
        }}
      >
        {title}
        <ReactCountryFlag
          countryCode={contryCode}
          style={{ marginLeft: "10px" }}
          svg
        />
      </div>
      <div style={{ fontSize: "1.3em" }}>{time}</div>
    </div>
  );
};
