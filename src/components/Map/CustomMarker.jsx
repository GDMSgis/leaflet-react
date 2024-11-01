import React, { useContext } from 'react';
import { Marker } from "react-leaflet";
import { MarkerContext } from '../../context/MarkerContext';
import { rffIcon, signalIcon, boatIcon } from './icons';

function CustomMarker({ marker }) {
    const { handleClickEvent, setClickedMarker, setPopup } = useContext(MarkerContext);
    const icon = marker.type === 'RFF' ? rffIcon : marker.type === 'Signal' ? signalIcon : boatIcon;

    return (
        <Marker
            position={marker.latlng}
            icon={icon}
            eventHandlers={{
                click: (e) => {
                    console.log("click");
                    handleClickEvent(e);
                    setClickedMarker(marker);
                    setPopup("inspect");
                },
                contextmenu: (e) => {
                    console.log("right click");
                    handleClickEvent(e);
                    setClickedMarker(marker);
                    setPopup("contextmenu");
                },
            }}
        />
    );
}

export default CustomMarker;
