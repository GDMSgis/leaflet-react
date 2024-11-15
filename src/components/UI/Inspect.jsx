import React, { useContext } from 'react';
import { MarkerContext } from '../../context/MarkerContext.jsx';

function Inspect() {
    const { clickedMarker, setPopup } = useContext(MarkerContext);
    const buttonStyle = "bg-gray-200 border border-gray-400 rounded-md w-fit h-fit px-1 py-px";

    return (
        <div
            className="absolute flex justify-center items-center w-full h-full bg-black bg-opacity-30"
            style={{ zIndex: 1000 }}
        >
            <div className="flex flex-col justify-between bg-white p-10 w-1/3 h-1/2 rounded-md border shadow shadow-gray-600">
                <div className="flex flex-col gap-2">
                    <h3>Inspect Data</h3>
                    {clickedMarker?.callerData ? (
                        <div>
                            <p><strong>Caller ID:</strong> {clickedMarker.callerData.id}</p>
                            <p><strong>Start Time:</strong> {clickedMarker.callerData['start-time']}</p>
                            <p><strong>Stop Time:</strong> {clickedMarker.callerData['stop-time']}</p>
                            {clickedMarker.callerData.receivers.map((receiver, index) => (
                                <div key={index}>
                                    <p><strong>Receiver {index + 1}:</strong></p>
                                    <p>RFF: {receiver.RFF}</p>
                                    <p>Bearing: {receiver.bearing}</p>
                                </div>
                            ))}
                            {clickedMarker.callerData.fix && (
                                <div>
                                    <p><strong>Fix Coordinates:</strong></p>
                                    <p>Lat: {clickedMarker.callerData.fix.lat}</p>
                                    <p>Lng: {clickedMarker.callerData.fix.long}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p>No additional caller data available.</p>
                    )}
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
