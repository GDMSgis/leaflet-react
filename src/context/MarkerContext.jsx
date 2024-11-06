import React, { createContext, useState, useEffect, useMemo } from 'react';
import L from 'leaflet';
import { calculateEndPoint, getBearing } from '../utils/mapCalculations';
import { addSignalToDatabase, updateSignalInDatabase, deleteSignalInDatabase } from '../utils/apiCalls';
import { debounce } from 'lodash';

import { FaBroadcastTower, FaMapMarkerAlt } from 'react-icons/fa';
import { BsBroadcast } from "react-icons/bs";
import { RiShip2Line } from "react-icons/ri";


export const MarkerContext = createContext();

export function MarkerProvider({ children }) {
    const [markers, setMarkers] = useState([]);

    // Initialize RFFs from database
    useEffect(() => {
        const fetchRFFs = async () => {
            try {
                const response = await fetch('http://localhost:8000/caller/RFFs');
                const result = await response.json();
                if (result.data?.length) {
                    console.log(result.data[0]);
                    result.data[0].map(RFF => {
                        setMarkers((prevMarkers) => [...prevMarkers, {
                            "id": RFF.id,
                            "latlng": {
                                "lat": RFF.lat,
                                "lng": RFF.lng
                            },
                            "type": "RFF",
                            "description": RFF.name
                        }
                        ])
                    })
                }
            } catch (error) {
                console.error('Error fetching RFFs:', error);
            }
        }
        fetchRFFs();
    }, []);

    const [lines, setLines] = useState([]);
    const [circles, setCircles] = useState([]);
    const [areas, setAreas] = useState([]);
    const [click, setClick] = useState(null);
    const [popup, setPopup] = useState(null);
    const [clickedMarker, setClickedMarker] = useState(null);
    const [areaFirstClick, setAreaFirstClick] = useState(null);
    const [areaPrevClick, setAreaPrevClick] = useState(null);
    const [areaTmpLines, setAreaTmpLines] = useState([]);
    const [permanentLines, setPermanentLines] = useState(new Set());
    const [replay, setReplay] = useState(false);
    const [pauseReplay, setPauseReplay] = useState(false);
    const [bookmarks, setBookmarks] = useState([]);
    const [bookmarkPosition, setBookmarkPosition] = useState(null);

    function addBookmark(marker) {
        setBookmarks((prevBookmarks) => [...prevBookmarks, marker]);
    }

    let decayRateGlobal = 0;

    // Debounced addLines to avoid excessive state updates
    const addLines = debounce((newLines) => {
        setLines((prevLines) => [
            ...prevLines,
            ...newLines.filter(line => !prevLines.some(prevLine => prevLine.id === line.id))
        ]);
        handleLineIntersection();
    }, 300);

    const toggleLinePermanence = (lineId) => {
        setPermanentLines((prev) => {
            const updated = new Set(prev);
            if (updated.has(lineId)) updated.delete(lineId);
            else updated.add(lineId);
            return updated;
        });
    };

    const findNearestRFF = (latlng) => {
        return markers.reduce((nearest, marker) => {
            if (marker.type !== 'RFF') return nearest;
            const distance = L.latLng(marker.latlng).distanceTo(latlng);
            return distance < (nearest.distance || Infinity) ? { marker, distance } : nearest;
        }, {}).marker;
    };

    const addMarker = (latlng, type, description) => {
        const newMarker = { latlng, type, description, id: `${type}-${Date.now()}`, pingTime: new Date().toISOString() };

        if (type === 'Signal') {
            const nearestRFF = findNearestRFF(latlng);
            if (nearestRFF) {
                const bearing = getBearing(nearestRFF.latlng.lat, nearestRFF.latlng.lng, latlng.lat, latlng.lng);
                newMarker.bearing1 = bearing;
                newMarker.rff1 = nearestRFF.name;
                const endLatLng = calculateEndPoint(nearestRFF.latlng, Number(bearing), 160934.4);
                addLines([{ start: nearestRFF.latlng, end: endLatLng, id: `${newMarker.id}-line`, timestamp: Date.now() }]);
            }
        }
        setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

        if (type === 'Signal') addSignalToDatabase(newMarker.rff1, newMarker.bearing1);
    };


    // Throttled data fetching to reduce network load
    useEffect(() => {
        const fetchInterval = setInterval(async () => {
            try {
                const response = await fetch('http://localhost:8000/caller/');
                const result = await response.json();
                if (result.data?.length) {
                    const recentData = result.data[0].filter(({ starttime }) =>
                        replay || new Date(starttime).getTime() >= Date.now() - decayRateGlobal
                    );
                    addLines(recentData.map(caller => createLineFromCaller(caller)));
                }
            } catch (error) {
                console.error('Error fetching signals:', error);
            }
        }, 3000);
        return () => clearInterval(fetchInterval);
    }, [markers, replay, decayRateGlobal]);

    const handleReplayClick = async () => {
        setReplay(true);
        setPauseReplay(false);
        try {
            const response = await fetch(`http://localhost:8000/caller/?starttime=${new Date(Date.now() - 300000).toISOString()}`);
            const result = await response.json();
            if (result.data?.length) replayData(result.data[0]);
        } catch (error) {
            console.error('Error fetching replay data:', error);
        }
    };

    const replayData = (replayData) => {
        let index = 0;
        const replayStep = () => {
            if (index >= replayData.length || !replay) return setReplay(false);
            if (!pauseReplay) {
                const line = createLineFromCaller(replayData[index]);
                addLines([line]);
                setTimeout(() => setLines(prev => prev.filter(l => l.id !== line.id || permanentLines.has(line.id))), decayRateGlobal);
                index++;
            }
            setTimeout(replayStep, 1000);
        };
        replayStep();
    };

    const createLineFromCaller = (caller) => {
        const start = markers.find(marker => marker.name === caller.rff1)?.latlng;
        return start && { start, end: calculateEndPoint(start, Number(caller.bearing1), 160934.4), id: caller.id, timestamp: Date.now() };
    };

    // Add boolean to see if an area is completed
    const addAreaLine = (x, y, lat, lng) => {
        const clickPoint = { winX: x, winY: y, mapLat: lat, mapLng: lng };

        if (!areaFirstClick) {
            setAreaFirstClick(clickPoint);
            setAreaPrevClick(clickPoint);
        } else if (getDistance(clickPoint, areaFirstClick) <= 2000) {
            setAreas(prevAreas => [...prevAreas, [...areaTmpLines, [[areaPrevClick.mapLat, areaPrevClick.mapLng], [areaFirstClick.mapLat, areaFirstClick.mapLng]]]]);
            resetArea();
            return true;
        } else {
            setAreaTmpLines(prev => [...prev, [[areaPrevClick.mapLat, areaPrevClick.mapLng], [lat, lng]]]);
            setAreaPrevClick(clickPoint);
        }
        return false;
    };

    // https://www.movable-type.co.uk/scripts/latlong.html Distance between 2 points
    const getDistance = (p1, p2) => {
        const lat1 = p1.mapLat;
        const lon1 = p1.mapLng;
        const lat2 = p2.mapLat;
        const lon2 = p2.mapLng;

        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const d = R * c; // in metres
        return d;
    };

    const resetArea = () => {
        setAreaFirstClick(null);
        setAreaPrevClick(null);
        setAreaTmpLines([]);
    };

    const handleLineIntersection = () => {
        lines.forEach((lineA, idxA) => {
            lines.slice(idxA + 1).forEach((lineB) => {
                const intersection = checkLineIntersection(lineA, lineB);
                if (intersection) setCircles((prev) => [...prev, { center: intersection, radius: 200 }]);
            });
        });
    };

    const checkLineIntersection = (line1, line2) => {
        // Placeholder for line intersection calculation logic
        return null;
    };

    // Function to get the icon based on the type
    function getIcon(type) {
        switch (type) {
            case 'RFF':
                return <FaBroadcastTower size={18} />;
            case 'Signal':
                return <BsBroadcast size={18} />;
            case 'Boat':
                return <RiShip2Line size={18} />;
            case 'Placemark':
                return <FaMapMarkerAlt size={18} />
            default:
                return null;
        }
    };

    function updateClickedMarker(latlng) {
        if (latlng === null) {
            setClickedMarker(null);
        }
        else {
            const m = markers.filter(x => x.latlng.lat === latlng.lat || x.latlng.lng === latlng.lng);
            setClickedMarker(m.length > 0 ? m[0] : null);
        }
    }

    const handleClickEvent = (e) => {
        updateClickedMarker(e.latlng);
        setClick({ winX: e.originalEvent.x, winY: e.originalEvent.y, mapLat: e.latlng.lat, mapLng: e.latlng.lng });
        setPopup(null);
    };

    // Memoize the value provided to the context to avoid unnecessary re-renders
    const contextValue = useMemo(() => ({
        markers, setMarkers, lines, setLines, circles, areas, click, popup, clickedMarker,
        areaFirstClick, areaTmpLines, replay, setReplay, pauseReplay, setPauseReplay,
        toggleLinePermanence, addMarker, addLines, resetArea, handleReplayClick, addAreaLine, handleClickEvent,
        setPopup, setClickedMarker, deleteSignalInDatabase, updateSignalInDatabase, addBookmark, bookmarks, setBookmarks,
        getIcon, setBookmarkPosition, bookmarkPosition
    }), [
        markers, lines, circles, areas, click, popup, clickedMarker,
        areaFirstClick, areaTmpLines, replay, pauseReplay
    ]);

    return (
        <MarkerContext.Provider value={contextValue}>
            {children}
        </MarkerContext.Provider>
    );
}
