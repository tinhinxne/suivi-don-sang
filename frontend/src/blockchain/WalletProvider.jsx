import { useCallback, useEffect, useMemo, useState } from 'react'
import { connecter as connecterChaine } from './blockchain'
import { WalletContext } from './walletContext'

export default function WalletProvider({ children }) {
  const [session, setSession] = useState(null)

  const connecter = useCallback(async () => {
    const s = await connecterChaine()
    setSession(s)
    return s
  }, [])

  useEffect(() => {
    const eth = window.ethereum
    if (!eth) return
    const quandChange = () => {
      setSession(null)
      connecter().catch(() => {})
    }
    eth.on('accountsChanged', quandChange)
    eth.on('chainChanged', quandChange)
    return () => {
      eth.removeListener('accountsChanged', quandChange)
      eth.removeListener('chainChanged', quandChange)
    }
  }, [connecter])

  const value = useMemo(() => ({ session, connecter }), [session, connecter])
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}