import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import 'chartjs-adapter-date-fns';
import api from "../api";

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function ViewData() {
  const [deviceData, setDeviceData] = useState({});
  const [timeInterval, setTimeInterval] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedDevices, setExpandedDevices] = useState(new Set());
  const [deviceChartVisibility, setDeviceChartVisibility] = useState({}); // Track per device

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.post("/data/read/", {
        measurement_name: "patient_vitals",
        tag: {}, // fetch all devices
        field: ["All"],
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

  const toggleDevice = (deviceId) => {
    const newExpanded = new Set(expandedDevices);
    if (newExpanded.has(deviceId)) newExpanded.delete(deviceId);
    else newExpanded.add(deviceId);
    setExpandedDevices(newExpanded);
  };

  const toggleChartForDevice = (deviceId) => {
    setDeviceChartVisibility(prev => ({
      ...prev,
      [deviceId]: !prev[deviceId]
    }));
  };

  const formatFullDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const renderChart = (deviceId, dataPoints) => {
    // Filter and sort by time (oldest to newest for correct line plotting)
    const filtered = dataPoints
      .filter(p => p.field === "value")
      .sort((a, b) => new Date(b.time) - new Date(a.time)); // Sort descending
  
    if (!filtered || filtered.length === 0) return <p style={{ color: "#718096", padding: "1rem", textAlign: "center" }}>No numeric data to plot</p>;
  
    // Get the unit and vitals_type from the first data point
    const unitPoint = dataPoints.find(p => p.field === "unit");
    const unit = unitPoint ? unitPoint.value : "Value";
    
    // Find vitals_type from tags in the data
    const vitalsTypePoint = dataPoints.find(p => p.tags && p.tags.vitals_type);
    const vitalsType = vitalsTypePoint ? vitalsTypePoint.tags.vitals_type : deviceId;
  
    // Determine time range
    const timestamps = filtered.map(p => new Date(p.time));
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const timeRange = maxTime - minTime;
  
    // Determine appropriate time unit based on data range
    let timeUnit;
    if (timeRange < 3600000) { // Less than 1 hour
      timeUnit = 'minute';
    } else if (timeRange < 86400000) { // Less than 1 day
      timeUnit = 'hour';
    } else if (timeRange < 604800000) { // Less than 1 week
      timeUnit = 'day';
    } else {
      timeUnit = 'week';
    }
  
    const chartData = {
      labels: timestamps,
      datasets: [
        {
          label: vitalsType, // Show vitals_type in legend
          data: filtered.map(p => p.value),
          borderColor: "rgba(66, 153, 225, 1)",
          backgroundColor: "rgba(66, 153, 225, 0.1)",
          tension: 0.3,
          fill: true
        }
      ]
    };
  
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { 
          display: true, // Show legend with vitals_type
          position: 'top'
        }, 
        tooltip: { 
          mode: "index", 
          intersect: false,
          callbacks: {
            title: (context) => {
              const date = new Date(context[0].parsed.x);
              return date.toLocaleString();
            },
            label: (context) => {
              return `${vitalsType}: ${context.parsed.y} ${unit}`;
            }
          }
        } 
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: timeUnit,
            displayFormats: {
              minute: "HH:mm",
              hour: "MM/dd HH:00",
              day: "MMM dd",
              week: "MMM dd"
            },
            tooltipFormat: 'MMM dd, yyyy HH:mm:ss'
          },
          title: { 
            display: true, 
            text: "Date & Time" 
          },
          grid: {
            color: "rgba(226, 232, 240, 0.5)"
          },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 10
          }
        },
        y: { 
          title: { 
            display: true, 
            text: unit
          }, 
          beginAtZero: false,
          grid: {
            color: "rgba(226, 232, 240, 0.5)"
          }
        }
      }
    };
  
    return (
      <div style={{ height: "300px", marginTop: "1rem" }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Device Data Dashboard</h1>

      {/* Filtering UI */}
      <div style={styles.filterRow}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>Show last</label>
          <input
            type="number"
            value={timeInterval}
            onChange={(e) => setTimeInterval(e.target.value)}
            style={styles.input}
            min="1"
            max="24"
          />
          <span style={styles.label}>hours</span>
        </div>

        <button onClick={fetchData} style={styles.button}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Data Table Section */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading device data...</p>
        </div>
      ) : Object.keys(deviceData).length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📊</div>
          <p style={styles.emptyText}>No device data available</p>
          <p style={styles.emptySubtext}>Try adjusting the time range or check if devices are sending data</p>
        </div>
      ) : (
        <div style={styles.devicesGrid}>
          {Object.entries(deviceData).map(([deviceId, dataPoints]) => {
            const isExpanded = expandedDevices.has(deviceId);
            const showChart = deviceChartVisibility[deviceId] || false;

            const groupedByTime = dataPoints.reduce((acc, point) => {
              if (!acc[point.time]) acc[point.time] = [];
              acc[point.time].push(point);
              return acc;
            }, {});

            const uniqueFields = [...new Set(dataPoints.map(p => p.field))];

            return (
              <div key={deviceId} style={styles.deviceCard}>
                <div style={styles.deviceHeader} onClick={() => toggleDevice(deviceId)}>
                  <div style={styles.deviceInfo}>
                    <h3 style={styles.deviceTitle}>{deviceId}</h3>
                  </div>
                  <div style={styles.expandIcon}>{isExpanded ? "▼" : "▶"}</div>
                </div>

                {isExpanded && (
                  <div style={styles.deviceDetails}>
                    {/* Data Table */}
                    <div style={styles.dataSection}>
                      <h4 style={styles.sectionTitle}>Recent Data</h4>
                      <div style={styles.tableContainer}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.tableHeader}>Date & Time</th>
                              {uniqueFields.map(f => <th key={f} style={styles.tableHeader}>{f}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(groupedByTime).map(([time, points]) => (
                              <tr key={time} style={styles.tableRow}>
                                <td style={styles.tableCell}>
                                  <div>{formatFullDateTime(time)}</div>
                                </td>
                                {uniqueFields.map(f => {
                                  const point = points.find(p => p.field === f);
                                  return (
                                    <td key={f} style={styles.tableCell}>
                                      {point ? <span>{point.value}</span> : <span>—</span>}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Chart Toggle Button - Below Table */}
                    <div style={styles.chartToggleContainer}>
                      <button 
                        onClick={() => toggleChartForDevice(deviceId)}
                        style={{
                          ...styles.chartToggleButton,
                          background: showChart ? "#48bb78" : "#4299e1"
                        }}
                      >
                        {showChart ? "Hide Chart" : "Chart"}
                      </button>
                    </div>

                    {/* Chart Section - Conditionally rendered */}
                    {showChart && (
                      <div style={styles.chartSection}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h4 style={styles.sectionTitle}>Trend Chart</h4>
                          <button 
                            onClick={() => toggleChartForDevice(deviceId)}
                            style={styles.closeChartButton}
                          >
                            ✕
                          </button>
                        </div>
                        {renderChart(deviceId, dataPoints)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },

  title: {
    textAlign: "center",
    fontSize: "2rem",
    fontWeight: 700,
    marginBottom: "2rem",
    color: "#1e293b",
    background: "linear-gradient(135deg, #007bff, #00bfff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },

  filterRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    padding: "1rem",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
  },

  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  },

  label: {
    fontSize: "0.95rem",
    color: "#475569",
    fontWeight: 500
  },

  input: {
    width: "60px",
    padding: "0.5rem",
    borderRadius: "8px",
    border: "2px solid #e2e8f0",
    textAlign: "center",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#1e293b",
    outline: "none",
    transition: "border-color 0.2s",
    ":focus": {
      borderColor: "#007bff"
    }
  },

  button: {
    padding: "0.6rem 1.5rem",
    background: "linear-gradient(135deg, #007bff, #00bfff)",
    border: "none",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.95rem",
    boxShadow: "0 3px 6px rgba(0, 123, 255, 0.2)",
    transition: "transform 0.2s, box-shadow 0.2s",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 5px 12px rgba(0, 123, 255, 0.3)"
    },
    ":active": {
      transform: "translateY(0)"
    }
  },

  devicesGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  },

  deviceCard: {
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    transition: "box-shadow 0.2s"
  },

  deviceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.25rem",
    cursor: "pointer",
    background: "linear-gradient(90deg, #f8fafc, #ffffff)",
    borderBottom: "1px solid #e2e8f0",
    ":hover": {
      background: "linear-gradient(90deg, #f1f5f9, #ffffff)"
    }
  },

  deviceInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem"
  },

  deviceTitle: {
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#1e293b"
  },

  expandIcon: {
    fontSize: "1.2rem",
    color: "#64748b",
    transition: "transform 0.2s"
  },

  deviceDetails: {
    padding: "1.5rem"
  },

  dataSection: {
    marginBottom: "1.5rem"
  },

  sectionTitle: {
    margin: "0 0 1rem 0",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#475569"
  },

  tableContainer: {
    overflowX: "auto",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    marginBottom: "1.5rem"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "600px"
  },

  tableHeader: {
    padding: "1rem",
    textAlign: "left",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#475569",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0"
  },

  tableRow: {
    borderBottom: "1px solid #f1f5f9",
    ":hover": {
      background: "#f8fafc"
    }
  },

  tableCell: {
    padding: "0.875rem 1rem",
    fontSize: "0.9rem",
    color: "#1e293b"
  },

  chartToggleContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1.5rem"
  },

  chartToggleButton: {
    padding: "0.7rem 1.5rem",
    border: "none",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.95rem",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 5px 12px rgba(0, 0, 0, 0.15)"
    }
  },

  chartSection: {
    padding: "1rem",
    background: "white",
    borderRadius: "8px",
    border: "1px solid #e2e8f0"
  },

  closeChartButton: {
    padding: "5px 10px",
    background: "transparent",
    border: "none",
    color: "#718096",
    cursor: "pointer",
    fontSize: "1rem",
    borderRadius: "4px",
    ":hover": {
      background: "#f1f5f9"
    }
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem"
  },

  loadingText: {
    color: "#64748b",
    fontSize: "0.95rem"
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    textAlign: "center"
  },

  emptyIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
    opacity: 0.5
  },

  emptyText: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#475569",
    marginBottom: "0.5rem"
  },

  emptySubtext: {
    fontSize: "0.9rem",
    color: "#64748b",
    maxWidth: "300px"
  }
};

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
