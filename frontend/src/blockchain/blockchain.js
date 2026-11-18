import { BrowserProvider, JsonRpcProvider, Contract, id } from 'ethers'
import contrat from './contract.json'

export const ADRESSE = contrat.address
const ABI = contrat.abi
export const RPC_URL = 'http://127.0.0.1:8545'
export const CHAIN_ID = 31337

export const GROUPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

// Statut du contrat (0..6) -> statut utilisé par l'interface
const STATUT_UI = [
  'pending',     // 0 Enregistré
  'pending',     // 1 En analyse
  'accepted',    // 2 Validé
  'rejected',    // 3 Rejeté
  'available',   // 4 Stocké
  'reserved',    // 5 Réservé
  'distributed', // 6 Distribué
]

// Identifiant pseudonymisé : on ne met jamais de nom sur la chaîne
export const pseudo = (texte) => id(texte)

export const versRef = (donId, date) =>
  `POCHE-${date.getFullYear()}-${String(donId).padStart(4, '0')}`
export const depuisRef = (ref) => Number(String(ref).split('-').pop())

// ---------- Lecture (sans MetaMask) ----------
const lecture = new Contract(
  ADRESSE,
  ABI,
  new JsonRpcProvider(RPC_URL, undefined, { staticNetwork: true }),
)

function formaterDon(d) {
  const date = new Date(Number(d.dateEnregistrement) * 1000)
  return {
    donId: Number(d.id),
    ref: versRef(Number(d.id), date),
    donneurHash: d.donneurId,
    group: GROUPES[Number(d.groupe)],
    statutCode: Number(d.statut),
    status: STATUT_UI[Number(d.statut)],
    timestamp: date,
  }
}

export async function listerDons() {
  const n = await lecture.compteurDons()
  if (n === 0n) return []
  return (await lecture.listerDons(1n, n)).map(formaterDon)
}

// ---------- Écriture (MetaMask) ----------
export async function connecter() {
  const eth = window.ethereum
  if (!eth) throw new Error("MetaMask n'est pas installé dans ce navigateur")

  const provider = new BrowserProvider(eth)
  await provider.send('eth_requestAccounts', [])

  const reseau = await provider.getNetwork()
  if (Number(reseau.chainId) !== CHAIN_ID) {
    const chainId = '0x' + CHAIN_ID.toString(16)
    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId }])
    } catch (e) {
      if (e?.code !== 4902 && e?.error?.code !== 4902) throw e
      await provider.send('wallet_addEthereumChain', [{
        chainId,
        chainName: 'Hardhat local',
        rpcUrls: [RPC_URL],
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      }])
    }
  }

  // Nouveau provider : le réseau a pu changer
  const signer = await new BrowserProvider(eth).getSigner()
  const adresse = await signer.getAddress()
  const estAgent = await lecture.hasRole(await lecture.AGENT_ROLE(), adresse)
  const estAdmin = await lecture.hasRole(await lecture.DEFAULT_ADMIN_ROLE(), adresse)

  return {
    contrat: new Contract(ADRESSE, ABI, signer),
    adresse,
    estAgent,
    estAdmin,
  }
}

export function messageErreur(e) {
  if (e?.code === 'ACTION_REJECTED') return 'Transaction refusée dans MetaMask'
  const raison = e?.revert?.args?.[0] ?? e?.reason
  if (raison) return raison
  if (e?.revert?.name === 'AccessControlUnauthorizedAccount')
    return "Ce compte MetaMask n'a pas le rôle agent"
  return e?.shortMessage ?? e?.message ?? 'Erreur inconnue'
}

export async function enregistrerDon(contrat, codeDonneur, groupe) {
  const t = await contrat.enregistrerDon(pseudo(codeDonneur), GROUPES.indexOf(groupe))
  const recu = await t.wait()
  for (const log of recu.logs) {
    try {
      const p = contrat.interface.parseLog(log)
      if (p?.name === 'DonEnregistre') {
        return { donId: Number(p.args.donId), hash: recu.hash }
      }
    } catch { /* log d'un autre événement */ }
  }
  throw new Error("Don enregistré, mais son identifiant n'a pas été retrouvé")
}