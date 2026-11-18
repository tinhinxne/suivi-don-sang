// =====================================================================
//  TEST COMPLET (option A : les demandes sont gérées dans la base)
//  Lancer avec :  npx hardhat run scripts/demo.ts
// =====================================================================
import { network } from "hardhat";

const { ethers } = await network.create();

const GROUPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const STATUTS = ["Enregistre", "EnAnalyse", "Valide", "Rejete", "Stocke", "Reserve", "Distribue"];

const DONNEUR = ethers.id("donneur-pseudo");
const HASH = ethers.id("resultats-analyse");
const REF = ethers.id("DEM-2026-0032");
const REF2 = ethers.id("DEM-2026-0033");
const MEDECIN = ethers.id("MEDECIN-7");
const MEDECIN2 = ethers.id("MEDECIN-9");
const NON_AUTORISE = "AccessControlUnauthorizedAccount";

// 6 comptes de test
const [admin, agent, agent2, medecin, intrus, nouveau] = await ethers.getSigners();

const c = await ethers.deployContract("SuiviDonSang");
const AGENT = await c.AGENT_ROLE();
await c.grantRole(AGENT, agent.address);
await c.grantRole(AGENT, agent2.address);
await c.grantRole(await c.MEDECIN_ROLE(), medecin.address);

// ---------- petits outils d'affichage ----------
let reussis = 0;
let echoues = 0;

function resultat(ok: boolean, titre: string, detail = "") {
  if (ok) {
    reussis++;
    console.log("   [OK]    " + titre);
  } else {
    echoues++;
    console.log("   [ECHEC] " + titre + (detail ? "  -> " + detail : ""));
  }
}

function section(titre: string) {
  console.log("\n=== " + titre + " ===");
}

// Attend la fin de la transaction (si elle échoue sur la blockchain, ça lève une erreur)
async function executer(action: Promise<any>) {
  const r = await action;
  if (r && typeof r.wait === "function") await r.wait();
  return r;
}

// Cette action DOIT marcher
async function doitMarcher(titre: string, action: Promise<any>) {
  try {
    await executer(action);
    resultat(true, titre);
  } catch (e: any) {
    resultat(false, titre, e.shortMessage ?? e.message);
  }
}

// Cette action DOIT être refusée par le contrat (avec la raison attendue)
async function doitEtreRefuse(titre: string, action: Promise<any>, raison = "") {
  try {
    await executer(action);
    resultat(false, titre, "acceptee alors qu'elle devait etre refusee");
  } catch (e: any) {
    const message: string = e.shortMessage ?? e.message ?? "";
    resultat(raison === "" || message.includes(raison), titre, "refus pour une autre raison : " + message);
  }
}

async function statutDe(id: bigint) {
  return STATUTS[Number((await c.getDon(id)).statut)];
}
async function groupeDe(id: bigint) {
  return GROUPES[Number((await c.getDon(id)).groupe)];
}

// Crée un don et le fait avancer jusqu'à une étape donnée. Renvoie son identifiant.
type Etape = "Enregistre" | "EnAnalyse" | "Valide" | "Rejete" | "Stocke" | "Reserve" | "Distribue";

async function amenerA(groupe: number, etape: Etape): Promise<bigint> {
  await executer(c.connect(agent).enregistrerDon(DONNEUR, groupe));
  const id: bigint = await c.compteurDons();
  if (etape === "Enregistre") return id;
  await executer(c.connect(agent).demarrerAnalyse(id));
  if (etape === "EnAnalyse") return id;
  if (etape === "Rejete") {
    await executer(c.connect(agent).rejeterDon(id, HASH));
    return id;
  }
  await executer(c.connect(agent).validerDon(id, HASH));
  if (etape === "Valide") return id;
  await executer(c.connect(agent).stockerDon(id));
  if (etape === "Stocke") return id;
  await executer(c.connect(agent).reserverPoche(id, REF, MEDECIN, groupe));
  if (etape === "Reserve") return id;
  await executer(c.connect(agent).distribuerPoche(id));
  return id;
}

// ---------------------------------------------------------------------
section("A. Droits (qui a le droit de faire quoi)");

await doitEtreRefuse("Un inconnu ne peut pas enregistrer un don", c.connect(intrus).enregistrerDon(DONNEUR, 0), NON_AUTORISE);
await doitEtreRefuse("L'admin seul ne peut pas enregistrer un don (il gere les acces)", c.connect(admin).enregistrerDon(DONNEUR, 0), NON_AUTORISE);
await doitEtreRefuse("Le medecin ne peut pas enregistrer un don", c.connect(medecin).enregistrerDon(DONNEUR, 0), NON_AUTORISE);
await doitMarcher("L'agent peut enregistrer un don", c.connect(agent).enregistrerDon(DONNEUR, 0));
const A = await c.compteurDons();
await doitMarcher("Un second agent peut demarrer l'analyse de ce don", c.connect(agent2).demarrerAnalyse(A));
await doitEtreRefuse("Un inconnu ne peut pas demarrer l'analyse", c.connect(intrus).demarrerAnalyse(A), NON_AUTORISE);
await doitEtreRefuse("Un inconnu ne peut pas corriger le groupe", c.connect(intrus).corrigerGroupe(A, 1, "test"), NON_AUTORISE);
await doitEtreRefuse("Le medecin ne peut pas corriger le groupe", c.connect(medecin).corrigerGroupe(A, 1, "test"), NON_AUTORISE);
await doitEtreRefuse("Un inconnu ne peut pas valider", c.connect(intrus).validerDon(A, HASH), NON_AUTORISE);
await doitEtreRefuse("Un inconnu ne peut pas rejeter", c.connect(intrus).rejeterDon(A, HASH), NON_AUTORISE);
await doitEtreRefuse("Un inconnu ne peut pas stocker", c.connect(intrus).stockerDon(A), NON_AUTORISE);
await doitEtreRefuse("Le medecin ne peut pas reserver une poche", c.connect(medecin).reserverPoche(A, REF, MEDECIN, 0), NON_AUTORISE);
await doitEtreRefuse("Le medecin ne peut pas annuler une reservation", c.connect(medecin).annulerReservation(A, "x"), NON_AUTORISE);
await doitEtreRefuse("Le medecin ne peut pas distribuer", c.connect(medecin).distribuerPoche(A), NON_AUTORISE);
await doitEtreRefuse("Un inconnu ne peut pas donner de role", c.connect(intrus).grantRole(AGENT, intrus.address), NON_AUTORISE);
await doitMarcher("L'admin peut donner le role agent", c.grantRole(AGENT, nouveau.address));
await doitMarcher("Le nouvel agent peut enregistrer un don", c.connect(nouveau).enregistrerDon(DONNEUR, 2));
await doitMarcher("L'admin peut retirer le role agent", c.revokeRole(AGENT, nouveau.address));
await doitEtreRefuse("Un agent a qui on a retire le role ne peut plus enregistrer", c.connect(nouveau).enregistrerDon(DONNEUR, 2), NON_AUTORISE);


section("B. Parcours normal d'un don (poche A+ vers un patient AB+)");

await executer(c.connect(agent).enregistrerDon(DONNEUR, 0));
const B = await c.compteurDons();
resultat(B > A, "L'identifiant du nouveau don est unique et plus grand que le precedent");
resultat((await statutDe(B)) === "Enregistre", "Apres enregistrement : statut Enregistre");
resultat((await groupeDe(B)) === "A+", "Le groupe enregistre est bien A+");

await executer(c.connect(agent).demarrerAnalyse(B));
resultat((await statutDe(B)) === "EnAnalyse", "Apres demarrage de l'analyse : statut EnAnalyse");

await executer(c.connect(agent).validerDon(B, HASH));
resultat((await statutDe(B)) === "Valide", "Apres validation : statut Valide");

await executer(c.connect(agent).stockerDon(B));
resultat((await statutDe(B)) === "Stocke", "Apres stockage : statut Stocke");

await executer(c.connect(agent).reserverPoche(B, REF, MEDECIN, 4)); // patient AB+
resultat((await statutDe(B)) === "Reserve", "Apres reservation : statut Reserve");
resultat((await c.demandeDe(B)) === REF, "La reference de la demande est memorisee");
resultat((await c.medecinDe(B)) === MEDECIN, "Le medecin demandeur est memorise");

await executer(c.connect(agent).distribuerPoche(B));
resultat((await statutDe(B)) === "Distribue", "Apres distribution : statut Distribue");

// ---------------------------------------------------------------------
section("C. Transitions interdites (chaque action interdite dans chaque etat)");

const STATUT_INCORRECT = "Statut incorrect";
const ETATS: Etape[] = ["Enregistre", "EnAnalyse", "Valide", "Rejete", "Stocke", "Reserve", "Distribue"];

// Toutes les actions qui changent l'etat d'une poche
const ACTIONS: Record<string, (id: bigint) => Promise<any>> = {
  demarrerAnalyse: (id) => c.connect(agent).demarrerAnalyse(id),
  validerDon: (id) => c.connect(agent).validerDon(id, HASH),
  rejeterDon: (id) => c.connect(agent).rejeterDon(id, HASH),
  stockerDon: (id) => c.connect(agent).stockerDon(id),
  reserverPoche: (id) => c.connect(agent).reserverPoche(id, REF, MEDECIN, 0),
  annulerReservation: (id) => c.connect(agent).annulerReservation(id, "motif"),
  distribuerPoche: (id) => c.connect(agent).distribuerPoche(id),
};

// La SEULE chose permise dans chaque etat (tout le reste doit etre refuse)
const AUTORISEE: Record<Etape, string[]> = {
  Enregistre: ["demarrerAnalyse"],
  EnAnalyse: ["validerDon", "rejeterDon"],
  Valide: ["stockerDon"],
  Rejete: [],
  Stocke: ["reserverPoche"],
  Reserve: ["annulerReservation", "distribuerPoche"],
  Distribue: [],
};

for (const etat of ETATS) {
  const id = await amenerA(0, etat); // poche A+ amenee dans cet etat
  const interdites = Object.keys(ACTIONS).filter((nom) => !AUTORISEE[etat].includes(nom));
  let tousRefuses = true;
  let detail = "";

  for (const nom of interdites) {
    try {
      await executer(ACTIONS[nom](id));
      tousRefuses = false;
      detail += nom + " acceptee a tort ; ";
    } catch (e: any) {
      const message: string = e.shortMessage ?? e.message ?? "";
      if (!message.includes(STATUT_INCORRECT)) {
        tousRefuses = false;
        detail += nom + " refusee pour une autre raison (" + message + ") ; ";
      }
    }
  }

  resultat(tousRefuses, "Etat " + etat + " : les " + interdites.length + " actions interdites sont bien refusees", detail);
}



// ---------------------------------------------------------------------
section("D. Gestion d'un don rejete");

// Creation d'un don puis rejet apres analyse
const D = await amenerA(0, "Rejete");

resultat(
  (await statutDe(D)) === "Rejete",
  "Le don est bien passe au statut Rejete"
);

// Le don rejete ne peut pas etre valide
await doitEtreRefuse(
  "Un don rejete ne peut pas etre valide",
  c.connect(agent).validerDon(D, HASH),
  "Statut incorrect"
);

// Le don rejete ne peut pas etre rejete une deuxieme fois
await doitEtreRefuse(
  "Un don rejete ne peut pas etre rejete une deuxieme fois",
  c.connect(agent).rejeterDon(D, HASH),
  "Statut incorrect"
);

// Le don rejete ne peut pas etre stocke
await doitEtreRefuse(
  "Un don rejete ne peut pas etre stocke",
  c.connect(agent).stockerDon(D),
  "Statut incorrect"
);

// Le don rejete ne peut pas etre reserve
await doitEtreRefuse(
  "Un don rejete ne peut pas etre reserve",
  c.connect(agent).reserverPoche(D, REF, MEDECIN, 0),
  "Statut incorrect"
);

// Le don rejete ne peut pas etre distribue
await doitEtreRefuse(
  "Un don rejete ne peut pas etre distribue",
  c.connect(agent).distribuerPoche(D),
  "Statut incorrect"
);

// Le don rejete ne peut pas avoir sa reservation annulee
await doitEtreRefuse(
  "Un don rejete ne peut pas annuler une reservation",
  c.connect(agent).annulerReservation(D, "motif"),
  "Statut incorrect"
);

// Le statut reste Rejete apres toutes les tentatives
resultat(
  (await statutDe(D)) === "Rejete",
  "Le statut du don reste Rejete apres les tentatives interdites"
);








// ---------------------------------------------------------------------
// (les prochaines sections viendront se placer ICI, au-dessus du résumé)


console.log("\n=====================================================");
console.log("   RESULTAT : " + reussis + " verifications reussies, " + echoues + " echouees");
console.log(echoues === 0 ? "   TOUT FONCTIONNE" : "   ATTENTION : certaines verifications ont echoue");
console.log("=====================================================");
if (echoues > 0) process.exitCode = 1;
// ---------------------------------------------------------------------





