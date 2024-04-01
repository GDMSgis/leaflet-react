import React, { useEffect, createContext, useContext, useState } from 'react';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaBroadcastTower} from "react-icons/fa";
import { RiShip2Line } from "react-icons/ri";
import 'leaflet/dist/leaflet.css';
import {BsBroadcast} from "react-icons/bs";

// Custom icon creation function
const createCustomIcon = (icon) => {
	const customMarkerHtml = renderToStaticMarkup(icon);
	return L.divIcon({
		html: customMarkerHtml,
		iconAnchor: [0,0],
		popupAnchor: [0,0],
		className: 'custom-icon'
	});
};

// Pre-defined icons using React Icons
const rffIcon = createCustomIcon(<FaBroadcastTower size={25} />);
const signalIcon = createCustomIcon(<BsBroadcast size={25} />);
const boatIcon = createCustomIcon(<RiShip2Line size={25} />);

const MarkerContext = createContext(null);
const MarkerProvider = ({ children }) => {
	const [markers, setMarkers] = useState([]);
	const [lines, setLines] = useState([]);
	const [lineStart, setLineStart] = useState(null);
	const [circles, setCircles] = useState([]);

	const addMarker = (latlng, type, description, audioFile = null) => {
		const pingTime = new Date().toISOString();
		setMarkers([...markers, { latlng, type, description, audioFile, pingTime }]);
	};

	const addLine = (start, end) => {
		setLines([...lines, { start, end }]);
	};

	const addCircle = (center, radius) => {
		setCircles([...circles, { center, radius }]);
	};

	return (
		<MarkerContext.Provider value={{ markers, addMarker, lines, addLine, circles, addCircle, lineStart, setLineStart }}>
			{children}
		</MarkerContext.Provider>
	);
};


const CustomMarker = ({ marker }) => {
	let icon;
	switch (marker.type) {
		case 'RFF':
			icon = rffIcon;
			break;
		case 'Signal':
			icon = signalIcon;
			break;
		case 'Boat':
			icon = boatIcon;
			break;
		default:
			icon = L.icon({ iconUrl: 'default-icon.png' }); // Default case
	}

	return (
		<LeafletMarker position={marker.latlng} icon={icon}>
			<Popup>{marker.description}<br />Ping Time: {marker.pingTime}</Popup>
		</LeafletMarker>
	);
};

const MapInteractions = ({ currentInteractionMode }) => {
	const map = useMap();
	const { markers, addMarker, addLine, addCircle } = useContext(MarkerContext);

	// Function to find the nearest RFF marker
	const findNearestRFFMarker = (latlng) => {
		let nearestMarker = null;
		let nearestDistance = Infinity;

		markers.forEach((marker) => {
			if (marker.type === 'RFF') {
				const distance = map.distance(latlng, marker.latlng);
				if (distance < nearestDistance) {
					nearestDistance = distance;
					nearestMarker = marker;
				}
			}
		});

		return nearestMarker ? nearestMarker.latlng : null;
	};


	useEffect(() => {
		// Enable or disable map dragging based on the current interaction mode
		if (currentInteractionMode === 'dragging') {
			map.dragging.enable();
		} else {
			map.dragging.disable();
		}
	}, [currentInteractionMode, map]);

	useMapEvents({
		click(e) {
			if (currentInteractionMode === 'lines') {
				// On click, find the nearest RFF marker and draw a line to it
				const nearestRFF = findNearestRFFMarker(e.latlng);
				if (nearestRFF) {
					addLine(e.latlng, nearestRFF);
				}
			} else if (currentInteractionMode === 'circles') {
				addCircle(e.latlng, 200); // Replace 200 with the desired radius
			} else if (currentInteractionMode === 'RFF' || currentInteractionMode === 'Signal' || currentInteractionMode === 'Boat') {
				addMarker(e.latlng, currentInteractionMode, `${currentInteractionMode} Marker Description`);
			}
		},
	});

	return null;
};


const MyMap = ({ currentInteractionMode, visibility }) => {
	const { markers, addMarker, lines, addLine, circles, addCircle } = useContext(MarkerContext);
	const [lineStart, setLineStart] = useState(null);

	const position = [33.418480, -111.932528]; // Initial map position

	return (
		<MapContainer center={position} zoom={16} style={{ height: "100vh", width: "100vw" }}>
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
			<MapInteractions
				currentInteractionMode={currentInteractionMode}
				addMarker={addMarker}
				addLine={addLine}
				addCircle={addCircle}
				lineStart={lineStart}
				setLineStart={setLineStart}
			/>
			{markers.filter(marker => visibility[marker.type]).map((marker, index) => (
				<CustomMarker key={index} marker={marker} />
			))}

			{visibility.lines && lines.map((line, index) => (
				<Polyline key={`line-${index}`} positions={[line.start, line.end]} color="red" />
			))}

			{visibility.circles && circles.map((circle, index) => (
				<Circle key={`circle-${index}`} center={circle.center} radius={circle.radius} fillColor="blue" />
			))}
		</MapContainer>
	);
};

export { MyMap, MarkerProvider };
