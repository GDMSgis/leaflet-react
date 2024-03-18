import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { leafletLayer } from 'protomaps-leaflet';

const MyMap = () => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        if (mapRef.current && !mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([0, 0], 2);
            const layer = leafletLayer({
                url: '/map/cali_coast.pmtiles',
                theme: 'light',
            });
            layer.addTo(mapInstance.current);

            mapInstance.current.on("click", (ev) => {
                // Add new marker to state array on left click
                setMarkers((currentMarkers) => [
                    ...currentMarkers,
                    { lat: ev.latlng.lat, lng: ev.latlng.lng },
                ]);
            });
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.off();
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Render markers from state
    useEffect(() => {
        markers.forEach((marker) => {
            L.marker([marker.lat, marker.lng]).addTo(mapInstance.current);
        });
    }, [markers]);

    return <div ref={mapRef} style={{ height: "100vh", width: "100%" }} />;
};

export default MyMap;
