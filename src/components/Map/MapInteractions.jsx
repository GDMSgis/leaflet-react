import React, { useContext } from 'react';
import { useMapEvents } from "react-leaflet";
import { debounce } from 'lodash';
import { MarkerContext } from '../../context/MarkerContext'; // Make sure this path is correct
import { calculateEndPoint, getBearing } from '../../utils/mapCalculations';
import { AppContext } from '../../App';

function MapInteractions({ currentInteractionMode, setCursorPosition }) {
    console.log(currentInteractionMode);
    const { handleInteractionModeChange } = useContext(AppContext);
    const { markers, addMarker, addLines, addCircle, addAreaLine, resetArea, handleClickEvent } = useContext(MarkerContext);

    const handleMouseMove = debounce((e) => setCursorPosition(e.latlng), 100); // Adjust debounce time as needed

    useMapEvents({
        mousemove: handleMouseMove,
        click: (e) => {
            handleClickEvent(e);
            if (currentInteractionMode !== 'area') {
                resetArea();
            }

            if (currentInteractionMode === 'lines') {
                const nearbyRFFs = markers.filter(marker => marker.type === 'RFF');
                const newLines = nearbyRFFs.map(rff => ({
                    start: rff.latlng,
                    end: calculateEndPoint(rff.latlng, getBearing(rff.latlng.lat, rff.latlng.lng, e.latlng.lat, e.latlng.lng), 20000),
                    timestamp: Date.now(),
                }));
                addLines(newLines);
            } else if (currentInteractionMode === 'circles') {
                addCircle(e.latlng, 200);
            } else if (['RFF', 'Signal', 'Boat'].includes(currentInteractionMode)) {
                addMarker(e.latlng, currentInteractionMode, `${currentInteractionMode} Marker Description`);
            } else if (currentInteractionMode === "area") {
                if (addAreaLine(e.originalEvent.x, e.originalEvent.y, e.latlng.lat, e.latlng.lng)) {
                    handleInteractionModeChange('dragging');
                }
            }
        },
    });

    return null;
}

export default MapInteractions;
