import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css' // 반드시 tailwind보다 먼저 로드
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <App />
)
