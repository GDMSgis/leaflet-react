import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MyMap = ({mode}) => {
  const position = [33.418480, -111.932528]

  const [markers, setMarkers] = useState([position])
  const [lines, setLines] = useState([])
  const [circles, setCircles] = useState([])

  const MarkerAdder = () => {
    const [prevClick, setPrevClick] = useState(null)
    const map = useMapEvents({
      click(e) {
        console.log(e.latlng);
	if (mode === "markers") {
	  setMarkers([...markers, [e.latlng.lat, e.latlng.lng]])
	}
	else if (mode === "lines") {
	  if (prevClick === null) {
	    setPrevClick([e.latlng.lat, e.latlng.lng])
	  }
	  else {
	    setLines([...lines, [prevClick, [e.latlng.lat, e.latlng.lng]]])
	    setPrevClick(null)
	  }
	}
	else if (mode === "circles") {
	  setCircles([...circles, [e.latlng.lat, e.latlng.lng]])
	}
      },
    });
    return null;
  };

  return (
    <MapContainer center={position}
		  zoom={16}
		  scrollWheelZoom={false}
		  dragging={mode === "dragging"}
		  style={{height: "100vh", width: "100vw"}}>
      <TileLayer
	attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {
	markers.map(pos => (
	  <Marker position={pos}
		  draggable={true}>
	    <Popup>
              Marker
	    </Popup>
	  </Marker>
	))
      }
      {
	lines.map(line => (
	  <Polyline pathOptions={{ color: 'red' }} positions={line} />
	))
      }
      {
	circles.map(circle => (
	  <CircleMarker center={circle} pathOptions={{ color: 'black' }} radius={20}>
	    <Popup>Circle Marker</Popup>
	  </CircleMarker>
	))
      }
      <MarkerAdder/>
    </MapContainer>
  )
};

export default MyMap;
