import React, { useState, useContext } from 'react';
import { MyMap, MarkerContext, calculateEndPoint } from './MyMap';
import Button from '@mui/material/Button';
import { BsBroadcast } from "react-icons/bs";
import { RiShip2Line, RiDraggable, RiFilterFill, RiFilterOffLine } from "react-icons/ri";
import { FaBroadcastTower } from "react-icons/fa";
import { TbChartCircles } from "react-icons/tb";
import { TfiLayoutLineSolid } from "react-icons/tfi";
import { FaBookBookmark } from "react-icons/fa6";

function App() {
  // Declare array to store bookmarks
  const [bookmarks, setBookmarks] = useState([]);
  // Declare state to store bookmark position
  const [bookmarkPosition, setBookmarkPosition] = useState(null);

  const [cursorPosition, setCursorPosition] = useState({ lat: 0, lng: 0 });
  const [currentInteractionMode, setCurrentInteractionMode] = useState('dragging');
  const [visibility, setVisibility] = useState({
    RFF: true,
    Signal: true,
    Boat: true,
    lines: true,
    circles: true,
    areas: true,
  });

  const {
    addLines,
    markers,
  } = useContext(MarkerContext);


  // Bookmark List component
  function BookmarkList({ bookmarks }) {
    return (
      <div>
        <div className="flex items-center gap-5 font-bold text-2xl p-1 mb-0 ml-5 underline">
          <div>Bookmarks</div>
          <FaBookBookmark size={34}/>
        </div>
        <div className="overflow-scroll h-80">
          {bookmarks.map((bookmark, index) => (
            <div className="mb-2 relative">
              <Button className="w-full top-3 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white p-2 rounded-2xl z-10 text-4xl font-bold text-center shadow-md flex flex-col items-start" key={index} variant="contained" color="primary" onClick={() => setBookmarkPosition(bookmark.latlng)}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-6 font-bold text-xl p-1 ml-6">
                    {getIcon(bookmark.type)}
                    <h3 className="text-xl font-bold">{bookmark.type}</h3>
                  </div>
                  <p className="text-sm m-0">{bookmark.description}</p>
                  <div className="text-xs text-white">
                    <span>Lat: {bookmark.latlng.lat.toFixed(2)}</span>
                    <span className='font-bold mx-1'> | </span>
                    <span>Lng: {bookmark.latlng.lng.toFixed(2)}</span>
                  </div>
                </div>
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Function to get the icon based on the type
  function getIcon(type) {
    switch(type) {
    case 'RFF':
      return <FaBroadcastTower size={18} />;
    case 'Signal':
      return <BsBroadcast size={18} />;
    case 'Boat':
      return <RiShip2Line size={18} />;
    default:
      return null;
    }
  };

  // Function to add a bookmark to the TOC
  function addBookmark(marker) {
    setBookmarks((prevBookmarks) => {
      const newBookmarks = [...prevBookmarks, marker];
      return newBookmarks;
    });
  };

  function handleInteractionModeChange(mode) {
    setCurrentInteractionMode(mode);
  };

  function toggleVisibility(type) {
    setVisibility(prevVisibility => ({
      ...prevVisibility,
      [type]: !prevVisibility[type]
    }));
  };

  function ModeButton({mode, children}) {
    return (
      <Button
        variant="contained"
        color={currentInteractionMode === mode ? "primary" : "secondary"}
        onClick={() => handleInteractionModeChange(mode)}
      >
        {children}
      </Button>
    )
  };

  function VisibilityButton({layer, children}) {
    return (
      <Button
        variant="outlined"
        color={!visibility[layer] ? "error" : "success"}
        onClick={() => toggleVisibility(layer)}
      >
        {!visibility[layer] ? <RiFilterOffLine /> : <RiFilterFill />}
        {children}
      </Button>
    )
  };

  // async function getAllCallers() {
  //   const res = fetch("http://localhost:8000/caller/");
  //   if (res.ok) {
  //     let data = await res.json();
  //     return data.data;
  //   }
  //   else {
  //     return [];
  //   }
  // }

  function getAllCallers() {
    return fetch('http://localhost:8000/caller/')
      .then((response) => {
        return response.json().then((data) => {
          return data;
        }).catch((err) => {
          console.log(err);
        })
      });
  }

  async function displayAllCallers() {
    const latlngOfRffs = markers.filter(x => x.type === "RFF")
      .reduce((acc, cur) => ({...acc, [cur.name]: cur.latlng}), {});
    console.log(calculateEndPoint(latlngOfRffs['San Francisco'], 250, 100000));
    // fetch('http://localhost:8000/caller/')
    //   .then((response) => {
    //     return response.json().then((data) => {
    //       data.data[0].forEach(caller => addLines([{
    //         start: latlngOfRffs[caller.rff1],
    //         end: calculateEndPoint(latlngOfRffs[caller.rff1], Number(caller.bearing), 102186.9),
    //       }]))
    //     }).catch((err) => {
    //       console.log(err);
    //     })
    //   });
  }

  return (
    <div className="flex flex-row bg-gray-300">
      <div className="flex flex-col w-96 h-full max-h-screen gap-2 py-4 px-4 bg-gray-300">

        {/* Mode Buttons*/}
        <ModeButton mode="dragging">
          <RiDraggable /> Dragging
        </ModeButton>

        <ModeButton mode="RFF">
          <FaBroadcastTower /> Add RFF Marker
        </ModeButton>

        <ModeButton mode="Signal">
          <BsBroadcast /> Add Signal Marker
        </ModeButton>

        <ModeButton mode="Boat">
          <RiShip2Line /> Add Boat Marker
        </ModeButton>

        <ModeButton mode="lines">
          <TfiLayoutLineSolid /> Lines
        </ModeButton>

        <ModeButton mode="area">
          <TfiLayoutLineSolid /> Area
        </ModeButton>

        <ModeButton mode="circles">
          <TbChartCircles /> Circles
        </ModeButton>

        {/* Visibility Toggle Buttons */}
        <VisibilityButton layer="RFF">
          RFF Visibility
        </VisibilityButton>

        <VisibilityButton layer="Signal">
          Signal Visibility
        </VisibilityButton>

        <VisibilityButton layer="Boat">
          Boat Visibility
        </VisibilityButton>

        <VisibilityButton layer="lines">
          Lines Visibility
        </VisibilityButton>

        <VisibilityButton layer="areas">
          Areas Visibility
        </VisibilityButton>

        <VisibilityButton layer="circles">
          Circles Visibility
        </VisibilityButton>

        {/* Bookmark List */}
        <BookmarkList bookmarks={bookmarks} />

        <button className='bg-orange-500 p-3 rounded-lg'
          onClick={displayAllCallers}>
          Display All Callers
        </button>
      </div>
      <MyMap
        currentInteractionMode={currentInteractionMode}
        visibility={visibility}
        setCursorPosition={setCursorPosition} // Pass this prop down to MyMap
        addBookmark={addBookmark}  // Pass props to myMap
        bookmarkPosition={bookmarkPosition}
        setBookmarkPosition={setBookmarkPosition}
      />

      <div
        className={"absolute top-5 left-1/2 bg-black bg-opacity-75 text-white font-bold"
          + " shadow shadow-gray-600 text-xl px-4 py-2 rounded-lg text-center"}
        style={{
          zIndex: 1000, // Above map elements
        }}
      >
        <div className="flex justify-between">
          <p>Lat:</p>
          <p>{cursorPosition.lat.toFixed(5)}</p>
        </div>
        <div className="flex justify-between">
          <p>Lon:</p>
          <p>{cursorPosition.lng.toFixed(5)}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
