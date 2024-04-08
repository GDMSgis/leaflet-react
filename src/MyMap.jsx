import React, { useState } from "react";
import { MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Polyline,
  Polygon,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MarkerContextMenu from "./MarkerContextMenu";

const MyMap = ({mode}) => {
  const position = [33.418480, -111.932528];

  const [markers, setMarkers] = useState([position]);
  const [lines, setLines] = useState([]);
  const [areas, setAreas] = useState([]);
  const [circles, setCircles] = useState([]);

  // null indicates no click
  // { winX: number, winY: number, mapLat: number, mapLng: number}
  // indicates click with win and map location
  const [click, setClick] = useState(null);

  // For the area
  // TODO needs a better name
  const [firstClick, setFirstClick] = useState(null);
  const [lastClick, setLastClick] = useState(null);
  const [tmpLines, setTmpLines] = useState([]);

  const [clickedMarker, setClickedMarker] = useState(null);

  const clickEvent = (e) => {
    setClick({
      winX: e.originalEvent.x,
      winY: e.originalEvent.y,
      mapLat: e.latlng.lat,
      mapLng: e.latlng.lng
    });
    setPopup(null);
  };

  const onMapClick = (e) => {
    clickEvent(e);
    if (mode == "dragging") {

    }
    else if (mode === "markers") {
      setMarkers([...markers, [e.latlng.lat, e.latlng.lng]]);
    }
    else if (mode === "lines") {
      if (lastClick === null) {
        setLastClick({winX: e.originalEvent.x, winY: e.originalEvent.y, mapLat: e.latlng.lat, mapLng: e.latlng.lng});
      }
      else {
        setLines([...lines, [[click.mapLat, click.mapLng], [e.latlng.lat, e.latlng.lng]]]);
        setLastClick(null);
      }
    }
    else if (mode === "area") {
      if (firstClick === null) {
        setFirstClick({winX: e.originalEvent.x, winY: e.originalEvent.y, mapLat: e.latlng.lat, mapLng: e.latlng.lng})
        setLastClick({winX: e.originalEvent.x, winY: e.originalEvent.y, mapLat: e.latlng.lat, mapLng: e.latlng.lng})
      }
      else if (Math.sqrt(Math.pow(firstClick.winX - e.originalEvent.x, 2) + (firstClick.winY - e.originalEvent.y, 2)) <= 10) {
        setAreas([...areas, [...tmpLines, [[lastClick.mapLat, lastClick.mapLng], [firstClick.mapLat, firstClick.mapLng]]]])
        setFirstClick(null)
        setLastClick(null)
        setTmpLines([])
      }
      else {
        setTmpLines([...tmpLines, [[lastClick.mapLat, lastClick.mapLng], [e.latlng.lat, e.latlng.lng]]])
        setLastClick({winX: e.originalEvent.x, winY: e.originalEvent.y, mapLat: e.latlng.lat, mapLng: e.latlng.lng})
      }
    }
    else if (mode === "circles") {
      setCircles([...circles, [e.latlng.lat, e.latlng.lng]]);
    }
  };

  const onMapRightClick = (e) => {
    clickEvent(e);
  };

  const onMarkerClick = (e) => {
    clickEvent(e);
    setClickedMarker(e.latlng)
  };

  const onMarkerRightClick = (e) => {
    clickEvent(e);
    setClickedMarker(e.latlng)
    setPopup("contextmenu");
  };

  const MarkerAdder = () => {
    const map = useMapEvents({
      click(e) {
        onMapClick(e);
      },
      contextmenu(e) {
        onMapRightClick(e);
      },
    });
    return null;
  };

  const Inspect = () => {
    const buttonStyle = "bg-gray-200 border border-gray-400 rounded-md w-fit h-fit px-1 py-px";
    // For absolutely zero reason, leaflet assumes a z-index of 399.
    // And the zoom buttons have a z-index of 999.
    // We set to 1000 to get above all of that.
    return (
      <div
        class="absolute flex justify-center items-center w-full h-full bg-black bg-opacity-30"
        style={{ zIndex: 1000 }}
      >
        <div
          class="flex flex-col justify-between bg-white p-10 w-1/3 h-1/2 rounded-md border shadow shadow-gray-600"
        >
          <div class="flex flex-col gap-2">
             <div>
             <label>Title:</label>
             <input class="border"/>
           </div>
           <div>
             <label>Type:</label>
             <select class={buttonStyle}>
               <option>Sail Boat</option>
               <option>Cruise Ship</option>
               <option>Cargo Ship</option>
               <option>Oil Freighter</option>
             </select>
           </div>
           <div>
             <label>Lat:</label>
             <p>{click.mapLat}</p>
           </div>
           <div>
             <label>Lng:</label>
             <p>{click.mapLng}</p>
           </div>
           <label>Audio:</label>
           <button class={buttonStyle}>Playback Audio</button>
           <button class={buttonStyle}>Upload Audio</button>
          </div>
           <div class="flex w-full justify-center items-center">
             <button
               class={buttonStyle}
               onClick={e => setPopup(null)}>
               Close
             </button>
           </div>
        </div>
      </div>
    )
  }

  const [popup, setPopup] = useState(null);

  const contextMenuData = [
    {
      name: "Inspect",
      action: () => setPopup("inspect"),
    },
    {
      name: "Delete",
      action: () => {
        setMarkers(markers.filter(x => x[0] !== clickedMarker.lat || x[1] !== clickedMarker.lng))
        setClickedMarker(null);
        setPopup(null);
      },
    },
  ];

  return (
    <>
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
            <Marker
              position={pos}
              draggable={true}
              eventHandlers={{
                click: (e) => {
                  onMarkerClick(e);
                },
                contextmenu: (e) => {
                  onMarkerRightClick(e);
                }
              }}
            />
          ))
        }
        {
          lines.map(line => (
            <Polyline
              pathOptions={{ color: 'red' }}
              positions={line}
            />
          ))
        }


        {
          firstClick !== null &&
            <CircleMarker
              center={[firstClick.mapLat, firstClick.mapLng]}
              pathOptions={{ color: 'purple' }}
              radius={10}
            />
        }
        {
          tmpLines.map(line => (
            <Polyline
              pathOptions={{ color: 'purple' }}
              positions={line}
            />
          ))
        }
        {
          areas.map(area =>
            <Polygon pathOptions={{ color: 'purple' }} positions={area}/>
          )
        }


        {
          circles.map(circle => (
            <CircleMarker
              center={circle}
              pathOptions={{ color: 'black' }}
              radius={20}
              eventHandlers={{
                click: (e) => {
                  onMarkerClick(e);
                },
                contextmenu: (e) => {
                  onMarkerRightClick(e);
                }
              }}
            />
          ))
        }
        <MarkerAdder/>
      </MapContainer>
      {
        popup === "inspect" ?
          <Inspect/>
          : popup === "contextmenu" && click !== null &&
            <MarkerContextMenu
              x={click.winX}
              y={click.winY}
              data={contextMenuData}
            />
      }
    </>
  )
};

export default MyMap;
