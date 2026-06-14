import React, { useEffect, useState, useCallback } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { io } from "socket.io-client";
import api, { SOCKET_URL } from "../utils/api";
import { Navigation, RefreshCw } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100%",
};

// Default center (can be changed to your store's location)
const defaultCenter = { lat: 19.076, lng: 72.8777 }; // Mumbai

const riderIcon = {
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z",
  fillColor: "#4f46e5",
  fillOpacity: 1,
  strokeWeight: 1,
  strokeColor: "#ffffff",
  scale: 1.5,
  anchor: { x: 12, y: 22 },
};

const LiveTracking = () => {
  const [riders, setRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [, setLoading] = useState(true);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
  });

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
      setRiders((prev) =>
        prev.map((r) =>
          r._id === data.riderId
            ? { ...r, currentLocation: { lat: data.lat, lng: data.lng, updatedAt: new Date() } }
            : r
        )
      );
    });

    const interval = setInterval(fetchLocations, 20000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [fetchLocations]);

  const ridersWithLocation = riders.filter((r) => r.currentLocation?.lat && r.currentLocation?.lng);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Live Rider Tracking</h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time locations of your delivery fleet ({ridersWithLocation.length} online)
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
          {ridersWithLocation.length === 0 ? (
            <p className="text-sm text-slate-400">No riders currently sharing location.</p>
          ) : (
            <div className="space-y-2">
              {ridersWithLocation.map((rider) => (
                <button
                  key={rider._id}
                  onClick={() => setSelectedRider(rider)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    selectedRider?._id === rider._id ? "bg-primary-50" : "hover:bg-slate-50"
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

        {/* Map */}
        <div className="card lg:col-span-3 p-0 overflow-hidden" style={{ height: "600px" }}>
          {!process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50">
              <Navigation className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">Google Maps API Key Required</p>
              <p className="text-sm text-slate-400 mt-1 max-w-md">
                Add your Google Maps API key to <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">REACT_APP_GOOGLE_MAPS_API_KEY</code> in
                the client .env file to enable live map tracking.
              </p>
            </div>
          ) : !isLoaded ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={
                selectedRider?.currentLocation || ridersWithLocation[0]?.currentLocation || defaultCenter
              }
              zoom={13}
            >
              {ridersWithLocation.map((rider) => (
                <Marker
                  key={rider._id}
                  position={{ lat: rider.currentLocation.lat, lng: rider.currentLocation.lng }}
                  icon={riderIcon}
                  onClick={() => setSelectedRider(rider)}
                />
              ))}

              {selectedRider?.currentLocation && (
                <InfoWindow
                  position={{
                    lat: selectedRider.currentLocation.lat,
                    lng: selectedRider.currentLocation.lng,
                  }}
                  onCloseClick={() => setSelectedRider(null)}
                >
                  <div className="text-sm">
                    <p className="font-bold">{selectedRider.name}</p>
                    <p className="text-xs text-slate-500">{selectedRider.vehicleNumber}</p>
                    <p className="text-xs text-slate-500">{selectedRider.phone}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
