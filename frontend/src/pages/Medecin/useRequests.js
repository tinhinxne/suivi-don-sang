import { useContext } from 'react'
import { RequestsContext } from './requestsContext'

export function useRequests() {
  return useContext(RequestsContext)
}