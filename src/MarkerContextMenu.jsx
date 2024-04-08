import React, { useState } from 'react';

const MarkerContextMenu = ({data, x, y}) => {

  /* Cannot use tailwind for top-level div due to unpredictable left and top */
  return (
    <div
      style={{left: x, top: y, position: "absolute", zIndex: 1000,}}
    >
      <ul
        class="bg-white rounded-md border shadow shadow-gray-700 w-48 py-1"
      >
        {
          data.map(datum =>
            <li
              class="px-5 mx-1 rounded-md border border-white hover:bg-blue-200 hover:border-blue-300 select-none cursor-pointer"
              onClick={e => datum.action()}
            >
              {datum.name}
            </li>
          )
        }
      </ul>
    </div>
  )
};

export default MarkerContextMenu;
