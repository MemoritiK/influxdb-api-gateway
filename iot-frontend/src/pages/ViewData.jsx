import { useEffect, useState } from "react";
import api from "../api";

export default function ViewData() {
  const [deviceData, setDeviceData] = useState({});
  const [timeInterval, setTimeInterval] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.post("/data/read/", {
        measurement_name: "weather",
        tag: {}, // fetch all devices
        field: ["temperature", "pressure", "wind_speed"],
        time_interval: timeInterval
      });

      setDeviceData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Error fetching data. Check console.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [timeInterval]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Device Data Dashboard</h1>

      {/* Filtering UI */}
      <div style={styles.filterRow}>
        <label style={styles.label}>
          Show last{" "}
          <input
            type="number"
            value={timeInterval}
            onChange={(e) => setTimeInterval(e.target.value)}
            style={styles.input}
          />{" "}
          hours
        </label>

        <button onClick={fetchData} style={styles.button}>
          Refresh
        </button>
      </div>

      {/* Data Table Section */}
      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : (
        Object.keys(deviceData).map((deviceId) => (
          <div key={deviceId} style={styles.deviceCard}>
            <h2 style={styles.deviceTitle}>{deviceId}</h2>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>

              <tbody>
                {deviceData[deviceId].map((point, idx) => (
                  <tr key={idx}>
                    <td>{new Date(point.time).toLocaleString()}</td>
                    <td>{point.field}</td>
                    <td>{point.value}</td>
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
    background: "#ffffff",
    minHeight: "100vh",
    fontFamily: "Inter, Arial, sans-serif"
  },

  title: {
    textAlign: "center",
    fontSize: "2.2rem",
    fontWeight: 700,
    marginBottom: "2rem",
    color: "#222"
  },

  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem"
  },

  label: { fontSize: "1rem" },

  input: {
    width: "4rem",
    padding: "0.4rem",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },

  button: {
    padding: "0.5rem 1rem",
    background: "linear-gradient(135deg, #007bff, #00bfff)",
    border: "none",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    boxShadow: "0 3px 6px rgba(0,0,0,0.2)"
  },

  deviceCard: {
    padding: "1.5rem",
    marginBottom: "2rem",
    background: "#f9f9f9",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },

  deviceTitle: {
    marginBottom: "1rem",
    fontSize: "1.4rem",
    fontWeight: 600,
    color: "#333"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: "10px",
    overflow: "hidden"
  },

  loading: {
    marginTop: "1rem",
    textAlign: "center"
  }
};
