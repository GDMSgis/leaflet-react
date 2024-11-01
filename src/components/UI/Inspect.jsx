import React, { useContext } from 'react';
import { MarkerContext } from '../../context/MarkerContext.jsx';

// function Inspect() {
//     const { click, setPopup } = useContext(MarkerContext);

//     return (
//         <div className="modal">
//             <h3>Inspect Marker</h3>
//             <p>Latitude: {click.mapLat}</p>
//             <p>Longitude: {click.mapLng}</p>
//             <button onClick={() => setPopup(null)}>Close</button>
//         </div>
//     );
// }
function Inspect() {
    const { click, setPopup } = useContext(MarkerContext);
    const buttonStyle = "bg-gray-200 border border-gray-400 rounded-md w-fit h-fit px-1 py-px";

    return (
        <div
            className="absolute flex justify-center items-center w-full h-full bg-black bg-opacity-30"
            style={{ zIndex: 1000 }}
        >
            <div className="flex flex-col justify-between bg-white p-10 w-1/3 h-1/2 rounded-md border shadow shadow-gray-600">
                <div className="flex flex-col gap-2">
                    <div>
                        <label>Title:</label>
                        <input className="border rounded-md" />
                    </div>
                    <div>
                        <label>Type:</label>
                        <select className={buttonStyle}>
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
                    <button className={buttonStyle}>Playback Audio</button>
                    <button className={buttonStyle}>Upload Audio</button>
                </div>
                <div className="flex w-full justify-center items-center">
                    <button
                        className={buttonStyle}
                        onClick={() => setPopup(null)}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
export default Inspect;
