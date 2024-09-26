import React from 'react';

const MarkerContextMenu = ({ data, x, y }) => {

  return (
      <div
          style={{ left: x, top: y, position: "absolute", zIndex: 1000 }}
      >
        <ul className="bg-white rounded-md border shadow shadow-gray-700 w-48 py-1">
          {
            data.map((datum, index) => (
                <li
                    key={datum.id || index}
                    className="px-5 mx-1 rounded-md border border-white hover:bg-blue-200 hover:border-blue-300 select-none cursor-pointer"
                    onClick={e => datum.action()}
                >
                  {datum.name}
                </li>
            ))
          }
        </ul>
      </div>
  );
};

export default MarkerContextMenu;
