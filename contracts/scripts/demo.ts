//NE SUPPRIME PAS STV FAIRE UN TEST COMPLET D CE QUE JAI FAIT POUR LE MOMENT 

// import { network } from "hardhat";

// const { ethers } = await network.create();

// // =====================================================================
// //  TEST COMPLET : verifie toutes les fonctionnalites du contrat
// //  et affiche [OK] ou [ECHEC] pour chacune.
// //  Lancer avec :  npx hardhat run scripts/test-complet.ts
// // =====================================================================

// const GROUPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
// const STATUTS = ["Enregistre", "EnAnalyse", "Valide", "Rejete", "Stocke", "Distribue"];
// const DONNEUR = ethers.id("donneur-pseudo");
// const HASH = ethers.id("resultats-analyse");
// const HOPITAL = ethers.id("hopital-1");
// const idDe = (n: number) => ethers.id("don-" + n);

// const [admin, centre, labo, intrus] = await ethers.getSigners();
// const c = await ethers.deployContract("SuiviDonSang");
// await c.grantRole(await c.CENTRE_ROLE(), centre.address);
// await c.grantRole(await c.LABORATOIRE_ROLE(), labo.address);

// // ---------- petits outils d'affichage ----------
// let reussis = 0;
// let echoues = 0;

// function resultat(ok: boolean, titre: string, detail = "") {
//   if (ok) {
//     reussis++;
//     console.log("   [OK]    " + titre);
//   } else {
//     echoues++;
//     console.log("   [ECHEC] " + titre + (detail ? "  -> " + detail : ""));
//   }
// }

// function section(titre: string) {
//   console.log("\n=== " + titre + " ===");
// }

// // Attend vraiment la fin de la transaction (si elle echoue sur la blockchain, ca leve une erreur)
// async function executer(action: Promise<any>) {
//   const r = await action;
//   if (r && typeof r.wait === "function") await r.wait();
//   return r;
// }

// // Cette action DOIT marcher
// async function doitMarcher(titre: string, action: Promise<any>) {
//   try {
//     await executer(action);
//     resultat(true, titre);
//   } catch (e: any) {
//     resultat(false, titre, e.shortMessage ?? e.message);
//   }
// }

// // Cette action DOIT etre refusee par le contrat (raison facultative)
// async function doitEtreRefuse(titre: string, action: Promise<any>, raison = "") {
//   try {
//     await executer(action);
//     resultat(false, titre, "acceptee alors qu'elle devait etre refusee");
//   } catch (e: any) {
//     const message: string = e.shortMessage ?? e.message ?? "";
//     resultat(raison === "" || message.includes(raison), titre, "refus pour une autre raison : " + message);
//   }
// }

// async function statutDe(id: string) {
//   return STATUTS[Number((await c.getDon(id)).statut)];
// }
// async function groupeDe(id: string) {
//   return GROUPES[Number((await c.getDon(id)).groupe)];
// }

// // Amene un don jusqu'a une etape donnee
// async function amenerA(id: string, groupe: number, etape: "Enregistre" | "EnAnalyse" | "Valide" | "Rejete" | "Stocke") {
//   await c.connect(centre).enregistrerDon(id, DONNEUR, groupe);
//   if (etape === "Enregistre") return;
//   await c.connect(labo).demarrerAnalyse(id);
//   if (etape === "EnAnalyse") return;
//   if (etape === "Rejete") { await c.connect(labo).rejeterDon(id, HASH); return; }
//   await c.connect(labo).validerDon(id, HASH);
//   if (etape === "Valide") return;
//   await c.connect(centre).stockerDon(id);
// }

// // ---------------------------------------------------------------------
// section("A. Droits (qui a le droit de faire quoi)");
// const A = idDe(1);
// await doitEtreRefuse("Un inconnu ne peut pas enregistrer un don", c.connect(intrus).enregistrerDon(A, DONNEUR, 0));
// await doitEtreRefuse("L'admin seul ne peut pas enregistrer un don (il gere les acces)", c.connect(admin).enregistrerDon(A, DONNEUR, 0));
// await doitEtreRefuse("Le labo ne peut pas enregistrer un don", c.connect(labo).enregistrerDon(A, DONNEUR, 0));
// await doitMarcher("Le centre peut enregistrer un don", c.connect(centre).enregistrerDon(A, DONNEUR, 0));
// await doitEtreRefuse("Le centre ne peut pas demarrer l'analyse (role labo)", c.connect(centre).demarrerAnalyse(A));
// await doitEtreRefuse("Un inconnu ne peut pas demarrer l'analyse", c.connect(intrus).demarrerAnalyse(A));
// await doitEtreRefuse("Un inconnu ne peut pas corriger le groupe", c.connect(intrus).corrigerGroupe(A, 1, "test"));
// await c.connect(labo).demarrerAnalyse(A);
// await doitEtreRefuse("Le centre ne peut pas valider (role labo)", c.connect(centre).validerDon(A, HASH));
// await doitEtreRefuse("Le centre ne peut pas rejeter (role labo)", c.connect(centre).rejeterDon(A, HASH));
// await doitEtreRefuse("Un inconnu ne peut pas donner de badge", c.connect(intrus).grantRole(await c.CENTRE_ROLE(), intrus.address));

// // ---------------------------------------------------------------------
// section("B. Parcours normal d'un don (A+ vers patient AB+)");
// const B = idDe(2);
// await c.connect(centre).enregistrerDon(B, DONNEUR, 0);
// resultat((await statutDe(B)) === "Enregistre", "Apres enregistrement : statut Enregistre");
// resultat((await groupeDe(B)) === "A+", "Le groupe enregistre est bien A+");
// await c.connect(labo).demarrerAnalyse(B);
// resultat((await statutDe(B)) === "EnAnalyse", "Apres demarrage de l'analyse : statut EnAnalyse");
// await c.connect(labo).validerDon(B, HASH);
// resultat((await statutDe(B)) === "Valide", "Apres validation : statut Valide");
// await c.connect(centre).stockerDon(B);
// resultat((await statutDe(B)) === "Stocke", "Apres stockage : statut Stocke");
// await c.connect(centre).distribuerDon(B, HOPITAL, 4);
// resultat((await statutDe(B)) === "Distribue", "Apres distribution : statut Distribue");

// // ---------------------------------------------------------------------
// section("C. Transitions interdites (la table du projet)");
// const C1 = idDe(10);
// await amenerA(C1, 0, "Enregistre");
// await doitEtreRefuse("Collecte -> Distribution interdit", c.connect(centre).distribuerDon(C1, HOPITAL, 0), "Statut incorrect");
// await doitEtreRefuse("Collecte -> Stockage interdit", c.connect(centre).stockerDon(C1), "Statut incorrect");
// await doitEtreRefuse("Collecte -> Validation interdit (il faut l'analyse)", c.connect(labo).validerDon(C1, HASH), "Statut incorrect");
// await doitEtreRefuse("Collecte -> Rejet interdit (il faut l'analyse)", c.connect(labo).rejeterDon(C1, HASH), "Statut incorrect");
// const C2 = idDe(11);
// await amenerA(C2, 0, "EnAnalyse");
// await doitEtreRefuse("Analyse -> Stockage interdit", c.connect(centre).stockerDon(C2), "Statut incorrect");
// await doitEtreRefuse("Analyse -> Distribution interdit", c.connect(centre).distribuerDon(C2, HOPITAL, 0), "Statut incorrect");
// await doitEtreRefuse("Analyse -> Analyse (repeter) interdit", c.connect(labo).demarrerAnalyse(C2), "Statut incorrect");
// const C3 = idDe(12);
// await amenerA(C3, 0, "Valide");
// await doitEtreRefuse("Valide -> Distribution interdit (il faut le stockage)", c.connect(centre).distribuerDon(C3, HOPITAL, 0), "Statut incorrect");
// await doitEtreRefuse("Valide -> Rejet interdit", c.connect(labo).rejeterDon(C3, HASH), "Statut incorrect");
// const C4 = idDe(13);
// await amenerA(C4, 0, "Stocke");
// await doitEtreRefuse("Stocke -> Validation interdit (retour en arriere)", c.connect(labo).validerDon(C4, HASH), "Statut incorrect");
// await doitEtreRefuse("Stocke -> Analyse interdit (retour en arriere)", c.connect(labo).demarrerAnalyse(C4), "Statut incorrect");
// await c.connect(centre).distribuerDon(C4, HOPITAL, 0);
// await doitEtreRefuse("Distribue -> Stockage interdit", c.connect(centre).stockerDon(C4), "Statut incorrect");
// await doitEtreRefuse("Distribue -> Distribution interdit (double envoi)", c.connect(centre).distribuerDon(C4, HOPITAL, 0), "Statut incorrect");
// await doitEtreRefuse("Distribue -> Analyse interdit", c.connect(labo).demarrerAnalyse(C4), "Statut incorrect");

// // ---------------------------------------------------------------------
// section("D. Don rejete (etat final)");
// const D = idDe(20);
// await amenerA(D, 0, "Rejete");
// resultat((await statutDe(D)) === "Rejete", "Le don est bien Rejete apres l'analyse");
// await doitEtreRefuse("Rejete -> Stockage interdit", c.connect(centre).stockerDon(D), "Statut incorrect");
// await doitEtreRefuse("Rejete -> Distribution interdit", c.connect(centre).distribuerDon(D, HOPITAL, 0), "Statut incorrect");
// await doitEtreRefuse("Rejete -> Validation interdit", c.connect(labo).validerDon(D, HASH), "Statut incorrect");
// await doitEtreRefuse("Rejete : correction du groupe interdite", c.connect(centre).corrigerGroupe(D, 1, "test"), "Correction impossible");

// // ---------------------------------------------------------------------
// section("E. Correction du groupe sanguin");
// const E1 = idDe(30);
// await amenerA(E1, 6, "Enregistre"); // O+ par erreur
// await doitEtreRefuse("Correction sans motif refusee", c.connect(centre).corrigerGroupe(E1, 0, ""), "Motif obligatoire");
// await doitEtreRefuse("Correction vers le meme groupe refusee", c.connect(centre).corrigerGroupe(E1, 6, "x"), "Meme groupe");
// await doitMarcher("Correction O+ -> A+ en etat Enregistre (centre)", c.connect(centre).corrigerGroupe(E1, 0, "erreur de saisie"));
// resultat((await groupeDe(E1)) === "A+", "Le groupe vaut maintenant A+");
// await doitMarcher("Seconde correction A+ -> B+ possible (toujours avant validation)", c.connect(centre).corrigerGroupe(E1, 2, "re-verification"));
// const E2 = idDe(31);
// await amenerA(E2, 6, "EnAnalyse");
// await doitMarcher("Correction pendant l'analyse (labo)", c.connect(labo).corrigerGroupe(E2, 1, "groupe verifie au labo"));
// resultat((await groupeDe(E2)) === "A-", "Le groupe vaut maintenant A-");
// const E3 = idDe(32);
// await amenerA(E3, 6, "Valide");
// await doitEtreRefuse("Correction apres validation refusee", c.connect(labo).corrigerGroupe(E3, 0, "trop tard"), "Correction impossible");
// const E4 = idDe(33);
// await amenerA(E4, 6, "Stocke");
// await doitEtreRefuse("Correction apres stockage refusee", c.connect(centre).corrigerGroupe(E4, 0, "trop tard"), "Correction impossible");
// await doitEtreRefuse("Correction d'un don inexistant refusee", c.connect(centre).corrigerGroupe(idDe(999), 0, "x"), "Don introuvable");
// await doitEtreRefuse("Groupe invalide (9) refuse a l'enregistrement", c.connect(centre).enregistrerDon(idDe(34), DONNEUR, 9));

// // ---------------------------------------------------------------------
// section("F. Compatibilite a la distribution (patient B-)");
// console.log("   Poche de chaque groupe, patient B- : seuls B- et O- doivent passer");
// for (let g = 0; g < 8; g++) {
//   const id = idDe(100 + g);
//   await amenerA(id, g, "Stocke");
//   const attendu = g === 3 || g === 7;
//   if (attendu) {
//     await doitMarcher("Poche " + GROUPES[g] + " -> patient B-  accepte", c.connect(centre).distribuerDon(id, HOPITAL, 3));
//   } else {
//     await doitEtreRefuse("Poche " + GROUPES[g] + " -> patient B-  refuse", c.connect(centre).distribuerDon(id, HOPITAL, 3), "incompatible");
//   }
// }
// const F = idDe(110);
// await amenerA(F, 0, "Stocke");
// await doitEtreRefuse("Poche A+ -> patient O+ refuse", c.connect(centre).distribuerDon(F, HOPITAL, 6), "incompatible");
// resultat((await statutDe(F)) === "Stocke", "Apres un refus pour incompatibilite, la poche reste Stocke");
// await doitMarcher("La meme poche A+ peut ensuite aller a un patient A+", c.connect(centre).distribuerDon(F, HOPITAL, 0));
// resultat((await c.estCompatible(7, 0)) === true, "estCompatible : O- peut donner a A+");
// resultat((await c.estCompatible(0, 7)) === false, "estCompatible : A+ ne peut pas donner a O-");

// // ---------------------------------------------------------------------
// section("G. Don inexistant ou en double");
// await doitEtreRefuse("Lire un don qui n'existe pas", c.getDon(idDe(404)), "Don introuvable");
// await doitEtreRefuse("Enregistrer deux fois le meme id", c.connect(centre).enregistrerDon(B, DONNEUR, 0), "deja enregistre");

// // ---------------------------------------------------------------------
// section("H. Historique complet d'un don (lu sur la blockchain)");
// const H = idDe(200);
// await c.connect(centre).enregistrerDon(H, DONNEUR, 6); // O+ par erreur
// await c.connect(centre).corrigerGroupe(H, 0, "erreur de saisie");
// await c.connect(labo).demarrerAnalyse(H);
// await c.connect(labo).validerDon(H, HASH);
// await c.connect(centre).stockerDon(H);
// await c.connect(centre).distribuerDon(H, HOPITAL, 4);

// const noms = ["DonEnregistre", "GroupeCorrige", "AnalyseDemarree", "DonValide", "DonRejete", "DonStocke", "DonDistribue"];
// let evenements: any[] = [];
// for (const nom of noms) {
//   evenements = evenements.concat(await c.queryFilter((c.filters as any)[nom](H)));
// }
// evenements.sort((a, b) => a.blockNumber - b.blockNumber || a.index - b.index);
// for (const ev of evenements) {
//   const qui = ev.args.par === centre.address ? "agent centre" : ev.args.par === labo.address ? "agent labo" : ev.args.par;
//   let detail = "";
//   if (ev.fragment.name === "GroupeCorrige") {
//     detail = " | " + GROUPES[Number(ev.args.ancien)] + " -> " + GROUPES[Number(ev.args.nouveau)] + " | motif : " + ev.args.motif;
//   }
//   if (ev.fragment.name === "DonDistribue") {
//     detail = " | patient " + GROUPES[Number(ev.args.groupePatient)];
//   }
//   console.log("   bloc " + ev.blockNumber + " | " + ev.fragment.name + " | par " + qui + detail);
// }
// const attenduHistorique = ["DonEnregistre", "GroupeCorrige", "AnalyseDemarree", "DonValide", "DonStocke", "DonDistribue"];
// resultat(
//   JSON.stringify(evenements.map((e) => e.fragment.name)) === JSON.stringify(attenduHistorique),
//   "L'historique contient toutes les etapes, dans le bon ordre",
// );
// const correction = evenements.find((e) => e.fragment.name === "GroupeCorrige");
// resultat(
//   correction !== undefined && GROUPES[Number(correction.args.ancien)] === "O+" && correction.args.motif === "erreur de saisie",
//   "L'ancien groupe (O+) et le motif sont conserves dans l'historique",
// );

// // ---------------------------------------------------------------------
// console.log("\n=====================================================");
// console.log("   RESULTAT : " + reussis + " verifications reussies, " + echoues + " echouees");
// console.log(echoues === 0 ? "   TOUT FONCTIONNE" : "   ATTENTION : certaines verifications ont echoue");
// console.log("=====================================================");
// if (echoues > 0) process.exitCode = 1;



// // DEMO MINIMAL
// import { network } from "hardhat";

// const { ethers } = await network.create();

// const GROUPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
// const STATUTS = ["Enregistre", "EnAnalyse", "Valide", "Rejete", "Stocke", "Distribue"];

// const ID = ethers.id("don-44");
// const DONNEUR = ethers.id("donneur-pseudo-1");
// const HASH = ethers.id("resultats-analyse");
// const DEST = ethers.id("hopital-1");

// const [admin, centre, labo] = await ethers.getSigners();

// console.log("=== 1. Deploiement ===");
// const c = await ethers.deployContract("SuiviDonSang");
// console.log("Contrat deploye a l'adresse :", await c.getAddress());
// console.log("Admin  :", admin.address);

// await c.grantRole(await c.CENTRE_ROLE(), centre.address);
// await c.grantRole(await c.LABORATOIRE_ROLE(), labo.address);
// console.log("Agent centre :", centre.address, "(badge CENTRE)");
// console.log("Agent labo   :", labo.address, "(badge LABORATOIRE)");

// async function etat(titre: string) {
//   const d = await c.getDon(ID);
//   console.log(`   -> Etat du don 44 : ${STATUTS[Number(d.statut)]} | groupe ${GROUPES[Number(d.groupe)]}`);
// }

// console.log("\n=== 2. Le centre enregistre un don (groupe O+ par erreur) ===");
// await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
// await etat("apres enregistrement");

// console.log("\n=== 3. Test d'une action INTERDITE : distribuer tout de suite ===");
// try {
// await c.connect(centre).distribuerDon(ID, DEST, 6);  console.log("   !! ACCEPTE (ce n'est pas normal)");
// } catch (e: any) {
//   console.log("   -> REFUSE par le contrat :", e.shortMessage ?? e.message);
// }

// console.log("\n=== 4. Correction du groupe : O+ devient A+ ===");
// await c.connect(centre).corrigerGroupe(ID, 0, "erreur de saisie");
// await etat("apres correction");

// console.log("\n=== 5. Le labo analyse, valide ===");
// await c.connect(labo).demarrerAnalyse(ID);
// await etat("apres demarrage analyse");
// await c.connect(labo).validerDon(ID, HASH);
// await etat("apres validation");

// console.log("\n=== 6. Le centre stocke, puis essaie de donner la poche A+ a un patient B- ===");
// await c.connect(centre).stockerDon(ID);
// await etat("apres stockage");
// try {
//   await c.connect(centre).distribuerDon(ID, DEST, 3);
//   console.log("   !! ACCEPTE (pas normal)");
// } catch (e: any) {
//   console.log("   -> poche A+ vers patient B- : REFUSE :", e.shortMessage ?? e.message);
// }
// await etat("apres le refus (toujours stocke)");
// console.log("\n   Puis distribution a un patient A+ (compatible)");
// await c.connect(centre).distribuerDon(ID, DEST, 0);
// await etat("apres distribution");



// console.log("\n=== 7. HISTORIQUE complet du don 44 (lu sur la blockchain) ===");
// const noms = ["DonEnregistre", "GroupeCorrige", "AnalyseDemarree", "DonValide", "DonStocke", "DonDistribue"];
// let evenements: any[] = [];
// for (const nom of noms) {
//   const liste = await c.queryFilter((c.filters as any)[nom](ID));
//   evenements = evenements.concat(liste);
// }
// evenements.sort((a, b) => a.blockNumber - b.blockNumber || a.index - b.index);
// for (const ev of evenements) {
//   const qui = ev.args.par === centre.address ? "agent centre" : ev.args.par === labo.address ? "agent labo" : ev.args.par;
//   let detail = "";
//   if (ev.fragment.name === "GroupeCorrige") {
//     detail = ` | ${GROUPES[Number(ev.args.ancien)]} -> ${GROUPES[Number(ev.args.nouveau)]} | motif : ${ev.args.motif}`;
//   }
//   console.log(`   bloc ${ev.blockNumber} | ${ev.fragment.name} | par ${qui}${detail}`);
// }



// DEMO MINIMAL
import { network } from "hardhat";

const { ethers } = await network.create();

const GROUPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const STATUTS = ["Enregistre", "EnAnalyse", "Valide", "Rejete", "Stocke", "Reserve", "Distribue"];
const STATUTS_DEMANDE = ["EnAttente", "Acceptee", "Refusee", "Annulee"];

const DONNEUR = ethers.id("donneur-pseudo-1");
const PATIENT = ethers.id("patient-1");
const HASH = ethers.id("resultats-analyse");

// 3 comptes de test : chacun jouera un rôle
const [admin, agent, medecin] = await ethers.getSigners();

// ---------- petits outils d'affichage ----------
function qui(adresse: string) {
  if (adresse === agent.address) return "agent du centre";
  if (adresse === medecin.address) return "medecin";
  if (adresse === admin.address) return "admin";
  return adresse;
}

// Essaie une action qui DOIT être refusée par le contrat
async function essayerInterdit(texte: string, action: Promise<any>) {
  try {
    await action;
    console.log(`   !! ACCEPTE (pas normal) : ${texte}`);
  } catch (e: any) {
    console.log(`   -> ${texte} : REFUSE : ${e.shortMessage ?? e.message}`);
  }
}

console.log("=== 1. Deploiement et attribution des roles ===");
const c = await ethers.deployContract("SuiviDonSang");
console.log("Contrat deploye a l'adresse :", await c.getAddress());
console.log("Admin   :", admin.address, "(celui qui deploie)");

// L'admin donne les "badges" avec grantRole
await c.grantRole(await c.AGENT_ROLE(), agent.address);
await c.grantRole(await c.MEDECIN_ROLE(), medecin.address);
console.log("Agent   :", agent.address, "(badge AGENT)");
console.log("Medecin :", medecin.address, "(badge MEDECIN)");

async function etat(id: bigint) {
  const d = await c.getDon(id);
  console.log(`   -> Don n°${id} : ${STATUTS[Number(d.statut)]} | groupe ${GROUPES[Number(d.groupe)]}`);
}

async function etatDemande(demandeId: bigint) {
  const d = await c.getDemande(demandeId);
  console.log(`   -> Demande n°${demandeId} : ${STATUTS_DEMANDE[Number(d.statut)]}`);
}

// Amene un nouveau don jusqu'a l'etat Stocke
async function preparerDonStocke(groupe: number): Promise<bigint> {
  await c.connect(agent).enregistrerDon(DONNEUR, groupe);
  const id = await c.compteurDons();
  await c.connect(agent).demarrerAnalyse(id);
  await c.connect(agent).validerDon(id, HASH);
  await c.connect(agent).stockerDon(id);
  return id;
}

console.log("\n=== 2. L'agent enregistre un don (groupe O+ par erreur) ===");
await c.connect(agent).enregistrerDon(DONNEUR, 6);
const id = await c.compteurDons(); // le contrat a donne l'identifiant tout seul
console.log("   Identifiant attribue automatiquement :", id.toString());
await etat(id);

console.log("\n=== 3. Actions INTERDITES ===");
await essayerInterdit(
  "le medecin demande la poche alors qu'elle n'est meme pas analysee",
  c.connect(medecin).demanderPoche(id, PATIENT, 6),
);
await essayerInterdit(
  "le medecin essaie d'enregistrer un don",
  c.connect(medecin).enregistrerDon(DONNEUR, 0),
);

console.log("\n=== 4. Correction du groupe : O+ devient A+ ===");
await c.connect(agent).corrigerGroupe(id, 0, "erreur de saisie");
await etat(id);

console.log("\n=== 5. Analyse et validation (faites par l'agent) ===");
await c.connect(agent).demarrerAnalyse(id);
await etat(id);
await c.connect(agent).validerDon(id, HASH);
await etat(id);

console.log("\n=== 6. Stockage ===");
await c.connect(agent).stockerDon(id);
await etat(id);

console.log("\n=== 7. Le medecin demande la poche A+ ===");
await essayerInterdit(
  "demande pour un patient B- (incompatible)",
  c.connect(medecin).demanderPoche(id, PATIENT, 3),
);
await etat(id); // toujours Stocke
console.log("\n   Puis demande pour un patient A+ (compatible)");
await c.connect(medecin).demanderPoche(id, PATIENT, 0);
const demande1 = await c.compteurDemandes();
await etat(id); // maintenant Reserve
await etatDemande(demande1);

console.log("\n=== 8. L'agent accepte la demande : la poche est distribuee ===");
await c.connect(agent).accepterDemande(demande1);
await etat(id);
await etatDemande(demande1);

console.log("\n=== 9. Autre scenario : l'agent REFUSE une demande ===");
const id2 = await preparerDonStocke(7); // poche O-, compatible avec tout le monde
await c.connect(medecin).demanderPoche(id2, PATIENT, 4);
const demande2 = await c.compteurDemandes();
await etat(id2); // Reserve
await c.connect(agent).refuserDemande(demande2, "stock reserve aux urgences");
await etat(id2); // retour a Stocke
await etatDemande(demande2);

console.log(`\n=== 10. HISTORIQUE complet du don n°${id} (lu sur la blockchain) ===`);
const historique = await c.getHistorique(id);
for (const e of historique) {
  const date = new Date(Number(e.date) * 1000).toLocaleString("fr-FR");
  console.log(`   ${date} | ${STATUTS[Number(e.statut)]} | par ${qui(e.par)}`);
}
// la correction du groupe n'est pas un changement de statut : elle est dans les evenements
const corrections = await c.queryFilter(c.filters.GroupeCorrige(id));
for (const ev of corrections) {
  console.log(
    `   correction du groupe | ${GROUPES[Number(ev.args.ancien)]} -> ${GROUPES[Number(ev.args.nouveau)]}` +
      ` | motif : ${ev.args.motif} | par ${qui(ev.args.par)}`,
  );
}

console.log("\n=== 11. LISTE de tous les dons ===");
const liste = await c.listerDons(1n, 10n);
for (const d of liste) {
  console.log(`   Don n°${d.id} | ${GROUPES[Number(d.groupe)]} | ${STATUTS[Number(d.statut)]}`);
}