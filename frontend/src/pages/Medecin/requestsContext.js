import { createContext } from 'react'

export const RequestsContext = createContext({
  requests: [],
  addRequest: () => {},
})