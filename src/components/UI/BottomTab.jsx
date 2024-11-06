import React, { useEffect, useState } from 'react';

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

function BottomTab({ lat, lng }) {

    return (
        <div
            className={"absolute bottom-0 right-0 bg-gray-300 bg-opacity-100 text-white font-bold  w-3/12 h-[3.5vh]"
                + " shadow shadow-gray-600 text-xl text-center"}
            style={{ zIndex: 1000 }}
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
                    <p className="text-black">{decimalToDegrees(lat, lng)}</p>
                </div>
            </div>
        </div>
    );
}

export default BottomTab;