import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { MarkerProvider } from './context/MarkerContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(

  // Use strictmode for development, commented out to avoid RFF's getting initialized twice

  // <React.StrictMode>
  //   <MarkerProvider>
  //     <App />
  //   </MarkerProvider>
  // </React.StrictMode>,
  <MarkerProvider>
    <App />
  </MarkerProvider>,
)
