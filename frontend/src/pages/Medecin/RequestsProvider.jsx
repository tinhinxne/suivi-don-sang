import { useEffect, useState } from 'react'
import { RequestsContext } from './requestsContext'
import { api } from '../../services/api'

const STATUS_MAP = {
  en_attente: 'pending',
  acceptee: 'approved',
  partielle: 'partial',
  distribuee: 'distributed',
  refusee: 'rejected',
}

const toRequest = (d) => ({
  id: d.id,
  date: new Date(d.date_demande.replace(' ', 'T')).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
  hospital: d.hopital,
  group: d.groupe_sanguin,
  quantity: d.quantite,
  urgency: d.urgence.charAt(0).toUpperCase() + d.urgence.slice(1),
  status: STATUS_MAP[d.statut],
})

export default function RequestsProvider({ children }) {
  const [requests, setRequests] = useState([])
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    api('/demandes')
      .then((rows) => setRequests(rows.map(toRequest)))
      .catch(() => {})
  }, [refresh])

  async function addRequest({ hopitalId, group, quantity, urgency }) {
    await api('/demandes', {
      method: 'POST',
      body: {
        hopital_id: hopitalId,
        groupe_sanguin: group,
        quantite: quantity,
        urgence: urgency,
      },
    })
    setRefresh((n) => n + 1)
  }

  return (
    <RequestsContext.Provider value={{ requests, addRequest }}>
      {children}
    </RequestsContext.Provider>
  )
}