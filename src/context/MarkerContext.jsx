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
    const [permanentCircles, setPermanentCircles] = useState(new Set());
    const [replay, setReplay] = useState(false);
    const [pauseReplay, setPauseReplay] = useState(false);
    const [bookmarks, setBookmarks] = useState([]);
    const [bookmarkPosition, setBookmarkPosition] = useState(null);
    const [processedCallerIds, setProcessedCallerIds] = useState(new Set()); // Track processed callers

    function addBookmark(marker) {
        setBookmarks((prevBookmarks) => [...prevBookmarks, marker]);
    }

    let decayRateGlobal = 0;

    const addLines = debounce((newLines, callerData = null) => {
        setLines((prevLines) => [
            ...prevLines,
            ...newLines.filter(line => !prevLines.some(prevLine => prevLine.id === line.id))
                .map(line => ({ ...line, callerData })) // Include `callerData` in each line
        ]);
        handleLineIntersection();
    }, 300);
    function addCircle(center, radius, callerData = null) {
        setCircles(prevCircles => [
            ...prevCircles,
            { center, radius, id: `circle-${callerData?.id || Date.now()}`, timestamp: Date.now(), callerData }
        ]);
    }



    const toggleLinePermanence = (lineId) => {
        setPermanentLines((prev) => {
            const updated = new Set(prev);
            if (updated.has(lineId)) updated.delete(lineId);
            else updated.add(lineId);
            return updated;
        });
    };
    const toggleCirclePermanence = (circleId) => {
        setPermanentCircles(prev => {
            const updated = new Set(prev);
            if (updated.has(circleId)) updated.delete(circleId);
            else updated.add(circleId);
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
    // Modify data fetching useEffect for adding circles with callerData
    useEffect(() => {
        const fetchInterval = setInterval(async () => {
            try {
                const response = await fetch('http://localhost:8000/caller/');
                const result = await response.json();

                if (result.data?.length && Array.isArray(result.data[0])) {
                    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000; // Time 5 minutes ago

                    const recentData = result.data[0].filter(caller => {
                        const startTime = new Date(caller['start-time']).getTime();
                        return startTime >= fiveMinutesAgo && !processedCallerIds.has(caller.id);
                    });

                    if (recentData.length > 0) {
                        setProcessedCallerIds(prevIds => new Set([...prevIds, ...recentData.map(caller => caller.id)]));

                        recentData.forEach(caller => {
                            // Attach `callerData` when creating lines
                            const linesFromCaller = createLinesFromCaller(caller);
                            addLines(linesFromCaller, caller); // Pass `callerData` to lines

                            // Attach `callerData` when creating circles
                            if (caller.fix) {
                                const fixCoords = [caller.fix.lat, caller.fix.long];
                                const exists = circles.some(circle =>
                                    circle.center[0] === fixCoords[0] && circle.center[1] === fixCoords[1]
                                );

                                if (!exists) {
                                    addCircle(fixCoords, 200, caller); // Pass `callerData` to circles
                                }
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching signals:', error);
            }
        }, 3000);

        return () => clearInterval(fetchInterval);
    }, [markers, replay, decayRateGlobal, circles, processedCallerIds]);



    useEffect(() => {
        if (decayRateGlobal > 0) {
            const intervalId = setInterval(() => {
                const currentTime = Date.now();

                setLines(prevLines => {
                    const newLines = prevLines.filter(line =>
                        permanentLines.has(line.id) || (currentTime - line.timestamp <= decayRateGlobal)
                    );
                    return newLines;
                });

                setCircles(prevCircles => {
                    const newCircles = prevCircles.filter(circle =>
                        permanentCircles.has(circle.id) || (currentTime - circle.timestamp <= decayRateGlobal)
                    );
                    return newCircles;
                });
            }, 3000); // Adjust interval as needed

            return () => clearInterval(intervalId);
        }
    }, [decayRateGlobal, setLines, setCircles, permanentLines, permanentCircles]);

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

    const parseBearing = (bearingString) => {
        // Convert "163° 40' 08" to a numeric bearing
        const parts = bearingString.split(/[°' ]+/).filter(Boolean).map(Number);
        return parts[0] + (parts[1] / 60) + (parts[2] / 3600);
    };

    const createLinesFromCaller = (caller) => {
        console.log('Processing caller:', caller); // Debug log
        return caller.receivers.map(receiver => {
            const start = markers.find(marker => marker.description === receiver.RFF)?.latlng;
            if (start) {
                const numericBearing = parseBearing(receiver.bearing);
                const line = {
                    start,
                    end: calculateEndPoint(start, numericBearing, 160934.4), // 100 miles in meters
                    id: `${caller.id}-${receiver.RFF}`, // Unique ID for each line
                    timestamp: Date.now(),
                    callerData: caller // Embed `callerData` for association
                };
                console.log('Created line:', line); // Debug log
                return line;
            }
            return null;
        }).filter(line => line !== null); // Remove nulls
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

    const handleClickEvent = (e, target) => {
        if (target) {
            // Check if the target (line or circle) has `callerData`
            setClickedMarker({
                ...target,
                callerData: target.callerData || null // Ensure `callerData` is passed if available
            });
            console.log('Caller Data on Click:', target.callerData); // Debug log for verification
        } else {
            updateClickedMarker(e.latlng);
            setClick({ winX: e.originalEvent.x, winY: e.originalEvent.y, mapLat: e.latlng.lat, mapLng: e.latlng.lng });
            setPopup(null);
        }
    };



    // Memoize the value provided to the context
    const contextValue = useMemo(() => ({
        markers, setMarkers, lines, setLines, circles, setCircles, areas, click, popup, clickedMarker,setClick,
        areaFirstClick, areaTmpLines, replay, setReplay, pauseReplay, setPauseReplay,
        toggleLinePermanence, toggleCirclePermanence, addMarker, addLines, resetArea, handleReplayClick, addAreaLine, handleClickEvent,
        setPopup, setClickedMarker, deleteSignalInDatabase, updateSignalInDatabase, addBookmark, bookmarks, setBookmarks,
        getIcon, setBookmarkPosition, bookmarkPosition, permanentLines, permanentCircles
    }), [
        markers, lines, circles, areas, click, popup, clickedMarker,
        areaFirstClick, areaTmpLines, replay, pauseReplay, permanentLines,permanentCircles
    ]);

    return (
        <MarkerContext.Provider value={contextValue}>
            {children}
        </MarkerContext.Provider>
    );
}
