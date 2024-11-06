import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { MarkerProvider } from './context/MarkerContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  //   <MarkerProvider>
  //     <App />
  //   </MarkerProvider>
  // </React.StrictMode>,
  <MarkerProvider>
    <App />
  </MarkerProvider>,
)
