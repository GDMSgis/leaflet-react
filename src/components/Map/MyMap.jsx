import React, { useContext, useEffect, useMemo, useRef } from 'react';
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
    const mapnum = 2
    const {
        markers,
        lines,
        circles,
        setLines,
        permanentLines,
        areas,
        areaFirstClick,
        areaTmpLines,
        popup,
        setPopup,
        click,
        clickedMarker,
        addBookmark,
        bookmarkPosition,
        setBookmarkPosition
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
    const renderedLines = useMemo(() => (
        visibility.lines && lines.map((line, index) => (
            <Polyline
                key={`line-${line.id || index}`}
                positions={[line.start, line.end]}
                color="red"
                eventHandlers={{
                    contextmenu: (e) => {
                        e.originalEvent.preventDefault();
                        if (line.id) {
                            // Handle line context menu
                        }
                    }
                }}
            />
        ))
    ), [lines, visibility.lines]);

    // 4. Add visibility checks for all elements
    const renderedCircles = useMemo(() => (
        visibility.circles && circles.map((circle, index) => (
            <Circle
                key={`circle-${index}`}
                center={circle.center}
                radius={circle.radius}
                fillColor="blue"
                fillOpacity={0.3}
            />
        ))
    ), [circles, visibility.circles]);

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
                setLines(prevLines =>
                    prevLines.filter(line =>
                        permanentLines.has(line.id) ||
                        (currentTime - line.timestamp <= decayRate)
                    )
                );
            }, Math.min(1000, decayRate / 10)); // Adjust interval based on decay rate

            return () => clearInterval(intervalId);
        }
    }, [decayRate, setLines, permanentLines]);


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
        {
            name: "Edit",
            action: () => setPopup("edit"), // Can be expanded to show an edit form
        },
        {
            name: "Add to Bookmarks",
            action: () => { addBookmark(clickedMarker); setPopup(null) }, // Can be expanded to show an edit form
        }


        //,
        // {
        //     name: "Delete",
        //     action: () => {
        //         console.info(clickedMarker)
        //         if (clickedMarker && clickedMarker.id) {  // <-- Ensure that `clickedMarker.id` exists
        //             deleteSignalInDatabase(clickedMarker.id);
        //             setClickedMarker(null);
        //             setPopup(null);
        //         }
        //     },
        // },
    ];

    return (
        <>
            {popup === "inspect" && click && (
                <Inspect />
            )}
            {popup === "edit" && click && (
                <EditForm marker={clickedMarker} setPopup={setPopup} updateSignalInDatabase={() => { console.log("Hi") }} />
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