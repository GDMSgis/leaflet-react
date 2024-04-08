import { useState } from 'react'
import MyMap from './MyMap'

function App() {
  const [mode, setMode] = useState("dragging");

  const buttonStyle = "rounded-md bg-gray-200 border border-black hover:bg-blue-200";

  return (
    <div class="flex flex-row">
      <div class="flex flex-col w-96 h-full gap-2 py-4 px-4">
        <button class={buttonStyle + (mode === "dragging" ? " bg-yellow-200" : "")}
          onClick={() => setMode("dragging")}>
          Dragging
        </button>
        <button class={buttonStyle + (mode === "markers" ? " bg-yellow-200" : "")}
          onClick={() => setMode("markers")}>
          Markers
        </button>
        <button class={buttonStyle + (mode === "lines" ? " bg-yellow-200" : "")}
          onClick={() => setMode("lines")}>
          Lines
	</button>
        <button class={buttonStyle + (mode === "area" ? " bg-yellow-200" : "")}
          onClick={() => setMode("area")}>
          Area
	</button>
	<button class={buttonStyle + (mode === "circles" ? " bg-yellow-200" : "")}
	  onClick={() => setMode("circles")}>
          Circles
	</button>
      </div>
      <MyMap mode={mode}/>
    </div>
  )
}

export default App
