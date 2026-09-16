import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { io } from "socket.io-client";
import api, { SOCKET_URL } from "../utils/api";
import { Navigation, RefreshCw } from "lucide-react";

// Default center (Mumbai / Store center)
const defaultCenter = { lat: 19.076, lng: 72.8777 };

// Custom sleek marker for Leaflet
const createRiderIcon = (name) =>
  L.divIcon({
    className: "custom-rider-marker",
    html: `<div class="relative flex items-center justify-center w-9 h-9 bg-indigo-600 text-white rounded-full shadow-md border-2 border-white font-bold text-xs ring-4 ring-indigo-500/30">
      ${name ? name.charAt(0).toUpperCase() : "R"}
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });

// Component to dynamically animate map panning when selected rider changes
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center?.lat && center?.lng) {
      map.flyTo([center.lat, center.lng], 14, { duration: 1 });
    }
  }, [center, map]);
  return null;
};

const LiveTracking = () => {
  const [riders, setRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLocations = useCallback(async () => {
    try {
      const { data } = await api.get("/users/locations");
      setRiders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();

    const socket = io(SOCKET_URL);
    socket.on("riderLocationBroadcast", (data) => {
      setRiders((prev) => {
        const exists = prev.some((r) => r._id === data.riderId);
        if (exists) {
          return prev.map((r) =>
            r._id === data.riderId
              ? {
                  ...r,
                  name: data.name || r.name,
                  vehicleNumber: data.vehicleNumber || r.vehicleNumber,
                  currentLocation: { lat: data.lat, lng: data.lng, updatedAt: new Date() },
                }
              : r
          );
        } else {
          return [
            ...prev,
            {
              _id: data.riderId,
              name: data.name || "Rider",
              vehicleNumber: data.vehicleNumber || "",
              currentLocation: { lat: data.lat, lng: data.lng, updatedAt: new Date() },
            },
          ];
        }
      });
    });

    const interval = setInterval(fetchLocations, 20000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [fetchLocations]);

  const ridersWithLocation = riders.filter((r) => r.currentLocation?.lat && r.currentLocation?.lng);

  const mapCenter = selectedRider?.currentLocation || ridersWithLocation[0]?.currentLocation || defaultCenter;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Live Rider Tracking</h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time locations powered by OpenStreetMap ({ridersWithLocation.length} online)
          </p>
        </div>
        <button onClick={fetchLocations} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Riders list */}
        <div className="card lg:col-span-1 max-h-[600px] overflow-y-auto">
          <h2 className="font-bold text-slate-800 mb-4">Active Riders</h2>
          {loading ? (
            <div className="py-8 text-center text-slate-400">Loading riders...</div>
          ) : ridersWithLocation.length === 0 ? (
            <p className="text-sm text-slate-400">No riders currently sharing location.</p>
          ) : (
            <div className="space-y-2">
              {ridersWithLocation.map((rider) => (
                <button
                  key={rider._id}
                  onClick={() => setSelectedRider(rider)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    selectedRider?._id === rider._id ? "bg-primary-50 ring-1 ring-primary-500" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 flex-shrink-0">
                    {rider.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{rider.name}</p>
                    <p className="text-xs text-slate-400 truncate">{rider.vehicleNumber || "No vehicle"}</p>
                  </div>
                  <Navigation className="w-4 h-4 text-primary-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="card lg:col-span-3 p-0 overflow-hidden relative z-0" style={{ height: "600px" }}>
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={selectedRider?.currentLocation} />

            {ridersWithLocation.map((rider) => (
              <Marker
                key={rider._id}
                position={[rider.currentLocation.lat, rider.currentLocation.lng]}
                icon={createRiderIcon(rider.name)}
                eventHandlers={{
                  click: () => setSelectedRider(rider),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold text-slate-800">{rider.name}</p>
                    <p className="text-xs text-slate-500">Vehicle: {rider.vehicleNumber || "N/A"}</p>
                    <p className="text-xs text-slate-500">Phone: {rider.phone || "N/A"}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
