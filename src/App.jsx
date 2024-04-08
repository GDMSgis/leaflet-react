import React, { useState } from 'react';
import {MyMap, MarkerProvider} from './MyMap';
import Button from '@mui/material/Button';
import { BsBroadcast } from "react-icons/bs";
import { RiShip2Line, RiDraggable, RiFilterFill, RiFilterOffLine } from "react-icons/ri";
import { FaBroadcastTower } from "react-icons/fa";
import { TbChartCircles } from "react-icons/tb";
import { TfiLayoutLineSolid } from "react-icons/tfi";

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
    });


    const BookmarkList = ({ bookmarks }) => {
        return (
            <div>
                <h1 style={{ fontWeight: 'bold', fontSize: '2em', padding: '2px' }}>Bookmarks</h1>
                {bookmarks.map((bookmark, index) => (
                    <Button className="bookmark-list" key={index} variant="contained" color="primary" onClick={() => setBookmarkPosition(bookmark.latlng)} style={{ marginBottom: '4px' }} >
                        <div>
                            <h3 style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>{bookmark.type}</h3>
                            <p style={{ margin: '0' }}>{bookmark.description}</p>
                        </div>
                        <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0' }}>
                            <span>Lat:</span>
                            <span style={{ fontFamily: 'monospace' }}>{bookmark.latlng.lat.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0' }}>
                            <span>Lng:</span>
                            <span style={{ fontFamily: 'monospace' }}>{bookmark.latlng.lng.toFixed(2)}</span>
                        </div>
                        </div>
                    </Button>
                ))}
            </div>
        );
    };

    // Function to add a bookmark to the TOC
    const addBookmark = (marker) => {
        console.log('Adding bookmark:', marker);
        setBookmarks((prevBookmarks) => {
            const newBookmarks = [...prevBookmarks, marker];
            return newBookmarks;
        });
    };

    const handleInteractionModeChange = (mode) => {
        setCurrentInteractionMode(mode);
    };

    const toggleVisibility = (type) => {
        setVisibility(prevVisibility => ({
            ...prevVisibility,
            [type]: !prevVisibility[type]
        }));
    };

    return (
        <div className="flex flex-row" style={{ backgroundColor: 'lightgrey' }}>
            <div className="flex flex-col w-96 h-full gap-2 py-4 px-4" style={{ backgroundColor: 'lightgrey' }}> {/* soft grey background */}                <Button variant="contained" color={currentInteractionMode === 'dragging' ? "primary" : "secondary"} onClick={() => handleInteractionModeChange('dragging')}>
                    <RiDraggable /> Dragging
                </Button>
                <Button variant="contained" color={currentInteractionMode === 'RFF' ? "primary" : "secondary"} onClick={() => handleInteractionModeChange('RFF')}>
                    <FaBroadcastTower /> Add RFF Marker
                </Button>
                <Button variant="contained" color={currentInteractionMode === 'Signal' ? "primary" : "secondary"} onClick={() => handleInteractionModeChange('Signal')}>
                    <BsBroadcast /> Add Signal Marker
                </Button>
                <Button variant="contained" color={currentInteractionMode === 'Boat' ? "primary" : "secondary"} onClick={() => handleInteractionModeChange('Boat')}>
                    <RiShip2Line /> Add Boat Marker
                </Button>
                <Button variant="contained" color={currentInteractionMode === 'lines' ? "primary" : "secondary"} onClick={() => handleInteractionModeChange('lines')}>
                    <TfiLayoutLineSolid /> Lines
                </Button>
                <Button variant="contained" color={currentInteractionMode === 'circles' ? "primary" : "secondary"} onClick={() => handleInteractionModeChange('circles')}>
                    <TbChartCircles /> Circles
                </Button>

                {/* Visibility Toggle Buttons */}
                <Button variant="outlined" color={!visibility.RFF ? "error" : "success"} onClick={() => toggleVisibility('RFF')}>
                    {!visibility.RFF ? <RiFilterOffLine /> : <RiFilterFill />} RFF Visibility
                </Button>
                <Button variant="outlined" color={!visibility.Signal ? "error" : "success"} onClick={() => toggleVisibility('Signal')}>
                    {!visibility.Signal ? <RiFilterOffLine /> : <RiFilterFill />} Signal Visibility
                </Button>
                <Button variant="outlined" color={!visibility.Boat ? "error" : "success"} onClick={() => toggleVisibility('Boat')}>
                    {!visibility.Boat ? <RiFilterOffLine /> : <RiFilterFill />} Boat Visibility
                </Button>
                <Button variant="outlined" color={!visibility.lines ? "error" : "success"} onClick={() => toggleVisibility('lines')}>
                    {!visibility.lines ? <RiFilterOffLine /> : <RiFilterFill />} Lines Visibility
                </Button>
                <Button variant="outlined" color={!visibility.circles ? "error" : "success"} onClick={() => toggleVisibility('circles')}>
                    {!visibility.circles ? <RiFilterOffLine /> : <RiFilterFill />} Circles Visibility
                </Button>
                <BookmarkList bookmarks={bookmarks} />
            </div>
                <MarkerProvider>
                    <MyMap
                        currentInteractionMode={currentInteractionMode}
                        visibility={visibility}
                        setCursorPosition={setCursorPosition} // Pass this prop down to MyMap
                        addBookmark={addBookmark}  // Pass props to myMap
                        setBookmarks={setBookmarks} 
                        bookmarkPosition={bookmarkPosition}
                    />
                </MarkerProvider>
            <div
                style={{
                    position: 'absolute',
                    top: '20px', // Moved to top
                    left: '50%',
                    transform: 'translateX(-50%)', // Center horizontally
                    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Dark background
                    color: 'white', // Blue text
                    padding: '8px 16px',
                    borderRadius: '8px',
                    zIndex: 1000, // Above map elements
                    fontSize: '1.3rem', // Larger text
                    fontWeight: 'bold',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', // Optional shadow for better visibility
                }}
            >
                {/* Coordinate Table */}
                <table style={{ width: '100%' }}>
                    <tbody>
                    <tr>
                        <td style={{ textAlign: 'left',paddingRight:'1em' }}>Lat:</td>
                        <td style={{ textAlign: 'right' }}>{cursorPosition.lat.toFixed(5)}</td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'left', paddingRight:'1em'}}>Lon:</td>
                        <td style={{ textAlign: 'right' }}>{cursorPosition.lng.toFixed(5)}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            </div>
    );
}

export default App;
