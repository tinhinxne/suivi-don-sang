import { useState } from 'react'
import { RequestsContext } from './requestsContext'
import { initialRequests } from './data'

export default function RequestsProvider({ children }) {
  const [requests, setRequests] = useState(initialRequests)

  function addRequest({ hospital, group, quantity, urgency }) {
    // TODO : appeler services/api.js
    const time = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    setRequests((list) => [
      {
        id: Date.now(),
        date: `Aujourd'hui, ${time}`,
        hospital,
        group,
        quantity,
        urgency,
        status: 'pending',
      },
      ...list,
    ])
  }

  return (
    <RequestsContext.Provider value={{ requests, addRequest }}>
      {children}
    </RequestsContext.Provider>
  )
}