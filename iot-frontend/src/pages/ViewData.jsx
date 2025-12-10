import { useEffect, useState } from "react";
import api from "../api";

export default function ViewData() {
  const [deviceData, setDeviceData] = useState({});
  const [timeInterval, setTimeInterval] = useState(1); // in hours
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.post("/data/read/", {
        measurement_name: "weather",
        tag: {},          // empty object fetches all devices
        field: ["temperature", "pressure", "wind_speed"],
        time_interval: timeInterval
      });
      setDeviceData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Failed to fetch data. Check console.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Optional: auto-refresh every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [timeInterval]);

  return (
    <div style={styles.container}>
      <h1>Device Data</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Show last{" "}
          <input
            type="number"
            value={timeInterval}
            onChange={(e) => setTimeInterval(e.target.value)}
            style={{ width: "4rem", padding: "0.2rem" }}
          />{" "}
          hours
        </label>
        <button onClick={fetchData} style={styles.button}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        Object.keys(deviceData).map((deviceId) => (
          <div key={deviceId} style={styles.deviceSection}>
            <h2>{deviceId}</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Field</th>
                  <th>Value</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {deviceData[deviceId].map((point, idx) => (
                  <tr key={idx}>
                    <td>{new Date(point.time).toLocaleString()}</td>
                    <td>{point.field}</td>
                    <td>{point.value}</td>
                    <td>
                      {Object.entries(point.tags)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    fontFamily: "Arial, sans-serif"
  },
  deviceSection: {
    marginBottom: "2rem",
    padding: "1rem",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "0.5rem"
  },
  button: {
    marginLeft: "1rem",
    padding: "0.3rem 0.8rem",
    borderRadius: "5px",
    border: "none",
    background: "linear-gradient(90deg, #1e90ff, #00bfff)",
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
  }
};
