import React, { useState } from 'react';
import { MyMap, MarkerProvider } from './MyMap';
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

  // Bookmark List component
  function BookmarkList({ bookmarks }) {
    return (
      <div>
        <div className="flex items-center gap-5 font-bold text-2xl p-1 mb-0 ml-5 underline">
          <div>Bookmarks</div>
          <FaBookBookmark size={34} />
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
    switch (type) {
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

  function ModeButton({ mode, children }) {
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

  function VisibilityButton({ layer, children }) {
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

  async function testClick() {
    const res = await fetch("http://localhost:8000/");
    if (res.ok) {
      let data = await res.json();
      alert(JSON.stringify(data));
    }
    else {
      alert("Error");
    }
  }

  return (
    <>
      <div classname="relative">
        {/* Map Interface */}
        <MarkerProvider>
          <MyMap
            currentInteractionMode={currentInteractionMode}
            visibility={visibility}
            setCursorPosition={setCursorPosition} // Pass this prop down to MyMap
            addBookmark={addBookmark}  // Pass props to myMap
            bookmarkPosition={bookmarkPosition}
            setBookmarkPosition={setBookmarkPosition}
          />
        </MarkerProvider>

        {/*UI Overlay*/}
        <div
          className={"absolute top-0 left-0 bg-black bg-opacity-80 text-white font-bold w-screen h-[5vh]"
            + " shadow shadow-gray-600 text-xl px-4 py-2 text-center"}
          style={{ zIndex: 1000, /*Above map elements*/ }}
        >
          <img src="http://via.placeholder.com/32x20/000000/ffffff?text=?" height="20" width="32" />
        </div>

        <div
          className={"absolute bottom-0 left-0 bg-black bg-opacity-100 text-white font-bold w-screen h-[3vh]"
            + " shadow shadow-gray-600 text-xl px-4 py-2 text-center"}
          style={{ zIndex: 1000, /*Above map elements*/ }}
        >
        </div>


      </div>


    </>
    // <div className="flex flex-row bg-gray-300">
    //   <div className="flex flex-col w-5vw h-full max-h-screen gap-2 py-4 px-4 bg-gray-300">


    //   </div>


    // </div >
  );
}

export default App;
