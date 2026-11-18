import { useContext } from 'react'
import { WalletContext } from './walletContext'
export const useWallet = () => useContext(WalletContext)