import React, { useState } from 'react';
import {MyMap, MarkerProvider} from './MyMap';
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
    });


    // Bookmark List component
    const BookmarkList = ({ bookmarks }) => {
        return (
            <div>
                <div className="flex items-center gap-5 font-bold text-4xl p-1 mb-0 ml-5 underline ">
                    <div>Bookmarks</div>
                    <FaBookBookmark size={34}/>
                </div>
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
        );
    };

    // Function to get the icon based on the type
    const getIcon = (type) => {
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
                {/* Bookmark List */}
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
                        setBookmarkPosition = {setBookmarkPosition}
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
