import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    MapContainer,
    TileLayer,
    Polyline,
    Circle,
    CircleMarker,
    Polygon
} from "react-leaflet";
import { MarkerContext } from '../../context/MarkerContext';
import MapInteractions from './MapInteractions';
import CustomMarker from './CustomMarker';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Important - add this back if missing
import Inspect from '../UI/Inspect';
import EditForm from '../UI/EditForm';
import MarkerContextMenu from '../../MarkerContextMenu';

function MyMap({ currentInteractionMode, visibility, setCursorPosition, decayRate }) {
    const maptiles = ["World_Imagery", "World_Street_Map", "NatGeo_World_Map"];
    const mapnum = 1
    const {
        markers,
        lines,
        circles,
        setLines,
        setClick,
        setCircles,
        permanentLines,
        permanentCircles,
        areas,
        areaFirstClick,
        areaTmpLines,
        popup,
        setPopup,
        click,
        clickedMarker,
        setClickedMarker,
        addBookmark,
        bookmarkPosition,
        setBookmarkPosition,
    } = useContext(MarkerContext);

    const mapRef = useRef();
    const position = useMemo(() => [37.17952, -122.36], []); // Memoize initial position
    // 2. Proper memo comparison for markers
    const renderedMarkers = useMemo(() => (
        markers.filter(marker => visibility[marker.type]).map((marker) => (
            <CustomMarker
                key={`${marker.id || `${marker.type}-${marker.latlng.lat}-${marker.latlng.lng}`}`}
                marker={marker}
            />
        ))
    ), [markers, visibility]);

    // 3. Add proper event handlers to lines
    // Render lines with event handlers for contextmenu
    const renderedLines = useMemo(() => (
        visibility.lines &&
        lines.map((line, index) => (
            <Polyline
                key={`line-${line.id || index}`}
                positions={[line.start, line.end]}
                color="red"
                eventHandlers={{
                    contextmenu: (e) => {
                        e.originalEvent.preventDefault(); // Prevent the default browser context menu
                        setClick({ winX: e.originalEvent.x, winY: e.originalEvent.y, mapLat: e.latlng.lat, mapLng: e.latlng.lng });
                        setClickedMarker({
                            id: line.id,
                            type: 'line',
                            callerData: line.callerData || null // Ensure callerData is passed if available
                        });
                        setPopup('contextmenu');
                    }
                }}
            />
        ))
    ), [lines, visibility.lines, setClick, setClickedMarker, setPopup]);

    // Render circles with event handlers for contextmenu
    const renderedCircles = useMemo(() => (
        visibility.circles &&
        circles.map((circle, index) => (
            <Circle
                key={`circle-${circle.id || index}`}
                center={circle.center}
                radius={5556} // 3 nautical miles in meters
                fillColor="blue"
                fillOpacity={0.3}
                eventHandlers={{
                    contextmenu: (e) => {
                        e.originalEvent.preventDefault(); // Prevent the default browser context menu
                        setClick({ winX: e.originalEvent.x, winY: e.originalEvent.y, mapLat: e.latlng.lat, mapLng: e.latlng.lng });
                        setClickedMarker({
                            id: circle.id,
                            type: 'circle',
                            callerData: circle.callerData || null // Ensure callerData is passed if available
                        });
                        setPopup('contextmenu');
                    }
                }}
            />
        ))
    ), [circles, visibility.circles, setClick, setClickedMarker, setPopup]);



    // 5. Add back area rendering
    const renderedAreas = useMemo(() => (
        visibility.areas && areas.map((area, index) => (
            <Polygon
                key={`area-${index}`}
                pathOptions={{ color: 'yellow' }}
                positions={area}
            />
        ))
    ), [areas, visibility.areas]);

    // 6. Optimize decay effect
    useEffect(() => {
        if (decayRate > 0) {
            const intervalId = setInterval(() => {
                const currentTime = Date.now();
                console.log('Current time:', currentTime);

                setLines(prevLines => {
                    console.log('Line timestamps:', prevLines.map(line => line.timestamp));
                    const filteredLines = prevLines.filter(line =>
                        permanentLines.has(line.id) || (currentTime - line.timestamp <= decayRate)
                    );
                    console.log('Lines after decay:', filteredLines);
                    return filteredLines;
                });

                setCircles(prevCircles => {
                    const filteredCircles = prevCircles.filter(circle =>
                        permanentCircles.has(circle.id) || (currentTime - circle.timestamp <= decayRate)
                    );
                    return filteredCircles;
                });
            }, Math.max(1000, decayRate)); // Adjust interval for more stability

            return () => clearInterval(intervalId);
        }
    }, [decayRate, setLines, setCircles, permanentLines, permanentCircles]);



    // If bookmark position is set, fly to that position
    useEffect(() => {
        if (bookmarkPosition && mapRef.current) {
            const mapInstance = mapRef.current;
            mapInstance.flyTo(bookmarkPosition, 9);

            // Update the bookmark position state after flying to the location
            setBookmarkPosition(null); // Ensure this is called
        }
    }, [bookmarkPosition, setBookmarkPosition]);

    const contextMenuData = [
        {
            name: "Inspect",
            action: () => setPopup("inspect"),
        },
        ...(clickedMarker && clickedMarker.type !== 'line' && clickedMarker.type !== 'circle' ? [
            {
                name: "Add to Bookmarks",
                action: () => { addBookmark(clickedMarker); setPopup(null); },
            }
        ] : []), // Only show "Add to Bookmarks" if the clicked marker is not a line or circle
        ...(clickedMarker && (clickedMarker.type === 'line' || clickedMarker.type === 'circle') ? [
            {
                name: "Toggle Permanence",
                action: () => {
                    if (clickedMarker.type === 'line') {
                        permanentLines.has(clickedMarker.id)
                            ? permanentLines.delete(clickedMarker.id)
                            : permanentLines.add(clickedMarker.id);
                        setLines([...lines]); // Trigger re-render for lines
                        console.log(`Toggled permanence for line ID: ${clickedMarker.id}`);
                    } else if (clickedMarker.type === 'circle') {
                        permanentCircles.has(clickedMarker.id)
                            ? permanentCircles.delete(clickedMarker.id)
                            : permanentCircles.add(clickedMarker.id);
                        setCircles([...circles]); // Trigger re-render for circles
                        console.log(`Toggled permanence for circle ID: ${clickedMarker.id}`);
                    }
                }
            }
        ] : [])
    ];


    return (
        <>
            {popup === "inspect" && click && (
                <Inspect />
            )}

            {popup === "contextmenu" && click && (
                <MarkerContextMenu x={click.winX} y={click.winY} data={contextMenuData} />
            )}
            <MapContainer
                center={position}
                zoom={8}
                ref={mapRef}
                style={{ height: "100vh", width: "100vw" }}
                preferCanvas={true} // 7. Add performance optimization
            >
                <TileLayer
                    attribution="<a href='http://www.esri.com/'>Esri</a>"
                    url={`http://server.arcgisonline.com/ArcGIS/rest/services/${maptiles[mapnum]}/MapServer/tile/{z}/{y}/{x}`}
                    keepBuffer={8} // 8. Improve tile handling
                />
                <MapInteractions
                    currentInteractionMode={currentInteractionMode}
                    setCursorPosition={setCursorPosition}
                />
                {renderedMarkers}
                {renderedLines}
                {renderedCircles}
                {renderedAreas}
                {visibility.areas && areaFirstClick && (
                    <CircleMarker
                        center={[areaFirstClick.mapLat, areaFirstClick.mapLng]}
                        pathOptions={{ color: 'yellow' }}
                        radius={7}
                    />
                )}
                {visibility.areas && areaTmpLines.map((line, index) => (
                    <Polyline
                        key={`tmpLine-${index}`}
                        pathOptions={{ color: 'yellow' }}
                        positions={line}
                    />
                ))}
            </MapContainer>

        </>
    );
}

export default React.memo(MyMap, (prevProps, nextProps) => {
    // 9. Custom comparison for React.memo
    return (
        prevProps.currentInteractionMode === nextProps.currentInteractionMode &&
        prevProps.decayRate === nextProps.decayRate &&
        JSON.stringify(prevProps.visibility) === JSON.stringify(nextProps.visibility)
    );
});