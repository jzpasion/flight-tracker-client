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
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: timeZone,
    });

    const tick = () => setTime(formatter.format(new Date()));

    tick(); // show immediately instead of waiting 1s
    const intervalId = setInterval(tick, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [timeZone]);

  return (
    <div className="clock-chip" style={{ borderTopColor: color }}>
      <div className="chip-title">
        {title}
        <ReactCountryFlag
          countryCode={contryCode}
          svg
          style={{ width: "1.1em", height: "1.1em", borderRadius: "2px" }}
        />
      </div>
      <div className="chip-time">{time}</div>
    </div>
  );
};
