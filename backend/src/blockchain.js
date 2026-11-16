require('dotenv').config();
const { ethers } = require('ethers');

// ABI = celle du contrat contracts/contracts/SuiviDonSang.sol (version de Mell046).
// Le paramètre "donId" du contrat reçoit ici l'identifiant hashé de la POCHE.
const ABI = [
  'function enregistrerDon(bytes32 donId, bytes32 donneurId, uint8 groupe)',
  'function demarrerAnalyse(bytes32 donId)',
  'function validerDon(bytes32 donId, bytes32 hashAnalyse)',
  'function rejeterDon(bytes32 donId, bytes32 hashAnalyse)',
  'function stockerDon(bytes32 donId)',
  'function distribuerDon(bytes32 donId, bytes32 destinataireId, uint8 groupePatient)',
  'function getDon(bytes32 donId) view returns (tuple(bytes32 donneurId, uint8 groupe, uint8 statut, uint256 dateEnregistrement, bool existe))',
  'event DonEnregistre(bytes32 indexed donId, bytes32 indexed donneurId, uint8 groupe, address par, uint256 date)',
  'event AnalyseDemarree(bytes32 indexed donId, address par, uint256 date)',
  'event GroupeCorrige(bytes32 indexed donId, uint8 ancien, uint8 nouveau, string motif, address par, uint256 date)',
  'event DonValide(bytes32 indexed donId, bytes32 hashAnalyse, address par, uint256 date)',
  'event DonRejete(bytes32 indexed donId, bytes32 hashAnalyse, address par, uint256 date)',
  'event DonStocke(bytes32 indexed donId, address par, uint256 date)',
  'event DonDistribue(bytes32 indexed donId, bytes32 destinataireId, uint8 groupePatient, address par, uint256 date)',
];

// Même ordre que l'enum GroupeSanguin du contrat
const GROUPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUTS = ['Enregistré', 'En analyse', 'Validé', 'Rejeté', 'Stocké', 'Distribué'];
const groupeIndex = (g) => GROUPES.indexOf(g);

// Copie JS de estCompatible() du contrat (pour refuser proprement avant d'envoyer la transaction)
const antigenes = (g) => ({
  a: g.startsWith('A'), b: g.includes('B'), rh: g.endsWith('+'),
});
function estCompatible(donneur, receveur) {
  const d = antigenes(donneur), r = antigenes(receveur);
  return !((d.a && !r.a) || (d.b && !r.b) || (d.rh && !r.rh));
}

const enabled = () => Boolean(process.env.CONTRACT_ADDRESS && process.env.BLOCKCHAIN_PRIVATE_KEY);

let contract;
function getContract() {
  if (!contract) {
    const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    const signer = new ethers.NonceManager(new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider));
    contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, signer);
  }
  return contract;
}

// Identifiants pseudonymisés : aucune donnée personnelle sur la chaîne
const pocheId = (id) => ethers.id(`poche-${id}`);
const donneurId = (id) => ethers.id(`donneur-${id}`);
const hopitalId = (id) => ethers.id(`hopital-${id}`);
const hashAnalyse = (obj) => ethers.id(JSON.stringify(obj));

// Envoie une transaction ; renvoie le hash, ou null si la blockchain n'est pas configurée
async function send(fn, ...args) {
  if (!enabled()) return null;
  const tx = await getContract()[fn](...args);
  const receipt = await tx.wait();
  return receipt.hash;
}

// État + historique d'une poche, lus sur la blockchain (écran « Traçabilité »)
async function historique(id) {
  if (!enabled()) return { actif: false };
  const c = getContract();
  const pid = pocheId(id);
  let etat;
  try {
    const d = await c.getDon(pid);
    etat = { statut: STATUTS[Number(d.statut)], groupe: GROUPES[Number(d.groupe)] };
  } catch {
    return { actif: true, etat: null, evenements: [] };
  }
  const defs = [
    ['DonEnregistre', 'Collecte'], ['AnalyseDemarree', 'Analyse démarrée'],
    ['GroupeCorrige', 'Groupe corrigé'], ['DonValide', "Résultat d'analyse : conforme"],
    ['DonRejete', "Résultat d'analyse : non conforme"], ['DonStocke', 'Entrée en stock'],
    ['DonDistribue', 'Distribution'],
  ];
  const evenements = [];
  for (const [nom, label] of defs) {
    const logs = await c.queryFilter(c.filters[nom](pid));
    for (const l of logs)
      evenements.push({
        type: label, hash: l.transactionHash, bloc: l.blockNumber,
        date: Number(l.args.date), acteur: l.args.par,
      });
  }
  evenements.sort((a, b) => a.bloc - b.bloc);
  return { actif: true, etat, evenements };
}

module.exports = {
  enabled, send, historique, estCompatible, groupeIndex,
  pocheId, donneurId, hopitalId, hashAnalyse,
};
