import React, { useState, useContext, createContext } from 'react';
import MyMap from './components/Map/MyMap';
import { MarkerProvider, MarkerContext } from './context/MarkerContext.jsx';
import Button from '@mui/material/Button';
import { BsBroadcast } from "react-icons/bs";
import { RiShip2Line, RiDraggable, RiFilterFill, RiFilterOffLine } from "react-icons/ri";
import { FaBroadcastTower } from "react-icons/fa";
import { TbChartCircles } from "react-icons/tb";
import { TfiLayoutLineSolid } from "react-icons/tfi";
import { FaBookBookmark } from "react-icons/fa6";
import Drawer from './components/UI/Minivariantdrawer';
import { FaMapMarkedAlt } from "react-icons/fa";
import { List, ListItem, ListItemText, ListItemIcon, IconButton, Typography} from '@mui/material';

export const AppContext = createContext();

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

// Bookmark List component
function BookmarkList({ bookmarks, setBookmarkPosition }) {
  return (
    <div style={{ overflowY: 'auto', height: 'calc(100vh - 200px)' }}> {/* Adjust height as needed */}
      <div className="flex items-center gap-5 font-bold text-2xl p-1 mb-0 ml-5 underline">
        <div>Bookmarks</div>
        <FaBookBookmark size={34} />
      </div>
      <List>
        {bookmarks.map((bookmark, index) => (
          <ListItem
            key={bookmark.id || index} // Ensure a unique key prop
            button
            onClick={() => setBookmarkPosition(bookmark.latlng)}
          >
            <ListItemIcon
              sx={{ minWidth: 30 }} // Adjust the minWidth to decrease the gap
            >
              {getIcon(bookmark.type)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body1" component="span">
                  {bookmark.type}
                </Typography>
              }
              secondary={
                <Typography variant="body2" component="span" align="center" sx={{ width: '100%' }}>
                  <br />{bookmark.description} <br />
                  Lat: {bookmark.latlng.lat.toFixed(2)}, Lng: {bookmark.latlng.lng.toFixed(2)}
                </Typography>
              }
              sx={{ marginLeft: 0.5 }} // Adjust the margin to make the text closer to the icon
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export { BookmarkList };

function App() {

  
  const { handleReplayClick, setPauseReplay, replay, pauseReplay, setReplay } = useContext(MarkerContext);

  const [bookmarks, setBookmarks] = useState([]);
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
  const [decayRate, setDecayRate] = useState(30000);

  function addBookmark(marker) {
    setBookmarks((prevBookmarks) => [...prevBookmarks, marker]);
  }

  function handleInteractionModeChange(mode) {
    setCurrentInteractionMode(mode);
  }

  function toggleVisibility(type) {
    setVisibility(prevVisibility => ({
      ...prevVisibility,
      [type]: !prevVisibility[type],
    }));
  }

  function ModeButton({ mode, children }) {
    return (
        <Button
            variant="contained"
            color={currentInteractionMode === mode ? "primary" : "secondary"}
            onClick={() => handleInteractionModeChange(mode)}
        >
          {children}
        </Button>
    );
  }

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
    );
  }

  function decimalToDegrees(lat, long) {
    let latDirection = "N";
    let longDirection = "E";
    if (lat < 0) {
      latDirection = "S";
      lat *= -1;
    }
    if (long < 0) {
      longDirection = "W";
      long *= -1;
    }
    const latdeg = Math.trunc(lat);
    const latmin = Math.trunc((lat - latdeg) * 60);
    const latsec = Math.trunc(((lat - latdeg) * 60 - latmin) * 60);

    const longdeg = Math.trunc(long);
    const longmin = Math.trunc((long - longdeg) * 60);
    const longsec = Math.trunc(((long - longdeg) * 60 - longmin) * 60);

    const latString = `${latdeg}\u00B0 ${latmin < 10 ? `0${latmin}` : latmin}' ${latsec < 10 ? `0${latsec}` : latsec}"${latDirection}`;
    const longString = `${longdeg}\u00B0 ${longmin < 10 ? `0${longmin}` : longmin}' ${longsec < 10 ? `0${longsec}` : longsec}"${longDirection}`;

    return `${latString} ${longString}`;
  }

  return (
    <AppContext.Provider value={{ handleInteractionModeChange, toggleVisibility, visibility, bookmarks, setBookmarkPosition }}>
      <MarkerProvider>
        <div>
    

          <MyMap
              currentInteractionMode={currentInteractionMode}
              visibility={visibility}
              setCursorPosition={setCursorPosition}
              addBookmark={addBookmark}
              bookmarkPosition={bookmarkPosition}
              setBookmarkPosition={setBookmarkPosition}
              decayRate={decayRate}
          />

          <Drawer></Drawer>

          <div
            className={"absolute bottom-0 right-0 bg-gray-300 bg-opacity-100 text-white font-bold  w-3/12 h-[3.5vh]"
              + " shadow shadow-gray-600 text-xl text-center"}
            style={{ zIndex: 1000,  }}
          >
            {/*Attributions*/}
            <div className="flex flex-row justify-between px-3">
              <div className={"flex flex-row"}>
                <div className="flex flex-row">
                  <a className="hover:underline text-black" href="https://leafletjs.com/">Leaflet</a>
                  <p className="text-black">&nbsp;|&nbsp;</p>
                  <a className="hover:underline text-black" href="www.esri.com">Esri</a>
                </div>
              </div>
              {/*Lat-Long*/}
              <div className={"flex flex-row"} style={{ marginLeft: '20px' }}> {/* Add margin here */}
                <p className="text-black">{decimalToDegrees(cursorPosition.lat, cursorPosition.lng)}</p>
              </div>
            </div>
          </div>

        </div>
      </MarkerProvider>
    </AppContext.Provider>
  );
}

export default App;
