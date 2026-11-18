import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/600.css'
import './styles/tokens.css'
import './styles/global.css'
import App from './App.jsx'
import WalletProvider from './blockchain/WalletProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <BrowserRouter>
  <WalletProvider>
    <App />
  </WalletProvider>
</BrowserRouter>
  </StrictMode>,
)