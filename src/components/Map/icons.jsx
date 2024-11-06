import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaBroadcastTower, FaMapMarkerAlt } from "react-icons/fa";
import { BsBroadcast } from "react-icons/bs";
import { RiShip2Line } from "react-icons/ri";

// Utility function to create a custom Leaflet icon
function createCustomIcon(iconComponent) {
    const customMarkerHtml = renderToStaticMarkup(iconComponent);
    return L.divIcon({
        html: customMarkerHtml,
        iconAnchor: [12, 12],
        popupAnchor: [0, 0],
        className: 'custom-icon'
    });
}

export const rffIcon = createCustomIcon(<FaBroadcastTower size={25} />);
export const signalIcon = createCustomIcon(<BsBroadcast size={25} />);
export const boatIcon = createCustomIcon(<RiShip2Line size={25} />);
export const placemarkIcon = createCustomIcon(<FaMapMarkerAlt size={25} />)
