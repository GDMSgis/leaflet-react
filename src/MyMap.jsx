// MyMap.js
import React, { useState } from 'react';
import {
	MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMapEvents
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const CursorPosition = ({ setCursorPosition }) => {
	useMapEvents({
		mousemove: (e) => {
			setCursorPosition(e.latlng);
		}
	});
	return null;
};

const MyMap = ({ mode, showMarkers, showLines, showCircles }) => {
	const position = [33.418480, -111.932528]; // Initial position for the map
	const [markers, setMarkers] = useState([position]);
	const [lines, setLines] = useState([]);
	const [circles, setCircles] = useState([]);
	const [cursorPosition, setCursorPosition] = useState(null);
	const [prevClick, setPrevClick] = useState(null); // State to store the start point for lines

	const MarkerAdder = () => {
		useMapEvents({
			click(e) {
				if (mode === "markers") {
					setMarkers((prevMarkers) => [...prevMarkers, [e.latlng.lat, e.latlng.lng]]);
				} else if (mode === "lines") {
					if (!prevClick) {
						setPrevClick([e.latlng.lat, e.latlng.lng]);
					} else {
						setLines((prevLines) => [...prevLines, [prevClick, [e.latlng.lat, e.latlng.lng]]]);
						setPrevClick(null); // Reset prevClick to allow for a new line to be started
					}
				} else if (mode === "circles") {
					setCircles((prevCircles) => [...prevCircles, [e.latlng.lat, e.latlng.lng]]);
				}
			},
		});
		return null;
	};

	return (
		<MapContainer
			center={position}
			zoom={16}
			scrollWheelZoom={false}
			dragging={mode === "dragging"}
			style={{ height: "100vh", width: "100vw" }}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			{showMarkers &&
				markers.map((pos, idx) => (
					<Marker key={`marker-${idx}`} position={pos} draggable={true}>
						<Popup>Marker</Popup>
					</Marker>
				))
			}
			{showLines &&
				lines.map((line, idx) => (
					<Polyline key={`line-${idx}`} pathOptions={{ color: 'red' }} positions={line} />
				))
			}
			{showCircles &&
				circles.map((circle, idx) => (
					<CircleMarker
						key={`circle-${idx}`}
						center={circle}
						pathOptions={{ color: 'blue' }}
						radius={20}
					>
						<Popup>Circle Marker</Popup>
					</CircleMarker>
				))
			}
			<MarkerAdder />
			<CursorPosition setCursorPosition={setCursorPosition} />
			<div
				style={{
					position: 'absolute',
					top: '10px',
					left: '50%',
					transform: 'translateX(-50%)',
					backgroundColor: 'rgba(0, 0, 0, 0.75)',
					color: 'white',
					padding: '12px 20px',
					fontSize: '1.2em',
					borderRadius: '4px',
					zIndex: 1000,
				}}
			>
				{cursorPosition ? `Lat: ${cursorPosition.lat.toFixed(5)}, Lng: ${cursorPosition.lng.toFixed(5)}` : ''}
			</div>
		</MapContainer>
	);
};

export default MyMap;
