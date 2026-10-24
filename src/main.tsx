import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/caveat/400.css'
import '@fontsource/caveat/500.css'
import '@fontsource/caveat/600.css'
import '@fontsource/lora/400.css'
import '@fontsource/lora/500.css'
import '@fontsource/lora/600.css'
import '@fontsource/nunito/400.css'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import './index.css'
import App from './App'
import { AudioPreviewProvider } from './hooks/useAudioPreview'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AudioPreviewProvider>
      <App />
    </AudioPreviewProvider>
  </React.StrictMode>,
)
