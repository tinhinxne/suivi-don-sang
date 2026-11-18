import { readFileSync } from "node:fs";
import { JsonRpcProvider, Wallet, ContractFactory, id } from "ethers";

// Le contrat compilé (son code + la description de ses fonctions)
const artifact = JSON.parse(
  readFileSync("artifacts/contracts/SuiviDonSang.sol/SuiviDonSang.json", "utf8"),
);

// Connexion à la blockchain locale que tu as lancée
// const provider = new JsonRpcProvider("http://127.0.0.1:8545");

const provider = new JsonRpcProvider("http://127.0.0.1:8545", undefined, { cacheTimeout: -1 });

// Comptes de test (clés publiques de Hardhat, sans aucune valeur)
const admin = new Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
const karim = new Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider); // agent
const samir = new Wallet("0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", provider); // médecin
const leila = new Wallet("0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", provider); // agent
const nadia = new Wallet("0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a", provider); // agent

// Envoie une action et attend qu'elle soit bien écrite sur la blockchain
async function envoyer(action: Promise<any>) {
  const t = await action;
  await t.wait();
}

console.log("=== Deploiement ===");
const usine = new ContractFactory(artifact.abi, artifact.bytecode, admin);
const c: any = await usine.deploy();
await c.waitForDeployment();
console.log("Contrat deploye a l'adresse :", await c.getAddress());

console.log("\n=== Attribution des roles (par l'admin) ===");
await envoyer(c.grantRole(await c.AGENT_ROLE(), karim.address));
await envoyer(c.grantRole(await c.AGENT_ROLE(), leila.address));
await envoyer(c.grantRole(await c.AGENT_ROLE(), nadia.address));
await envoyer(c.grantRole(await c.MEDECIN_ROLE(), samir.address));
console.log("Karim, Leila, Nadia : agents | Samir : medecin");

console.log("\n=== Dons de test ===");

// Don n°1 (AB+) : parcours complet jusqu'a la distribution
await envoyer(c.connect(karim).enregistrerDon(id("DON-2026-0131"), 4));
await envoyer(c.connect(leila).demarrerAnalyse(1n));
await envoyer(c.connect(leila).validerDon(1n, id("analyse-don-1")));
await envoyer(c.connect(nadia).stockerDon(1n));
await envoyer(c.connect(samir).demanderPoche(1n, id("patient-1"), 4));
await envoyer(c.connect(karim).accepterDemande(1n));
console.log("POCHE n°1 (AB+) : distribuee");

// Don n°2 (O+) : en stock
await envoyer(c.connect(karim).enregistrerDon(id("DON-2026-0142"), 6));
await envoyer(c.connect(leila).demarrerAnalyse(2n));
await envoyer(c.connect(leila).validerDon(2n, id("analyse-don-2")));
await envoyer(c.connect(nadia).stockerDon(2n));
console.log("POCHE n°2 (O+)  : en stock");

// Don n°3 : saisi O+ par erreur, corrige en A-, analyse en cours
await envoyer(c.connect(karim).enregistrerDon(id("DON-2026-0139"), 6));
await envoyer(c.connect(karim).corrigerGroupe(3n, 1, "erreur de saisie"));
await envoyer(c.connect(leila).demarrerAnalyse(3n));
console.log("POCHE n°3 (A-)  : en analyse (groupe corrige)");

console.log("\nTermine. Dans le site, cherche POCHE-2026-0001, POCHE-2026-0002 ou POCHE-2026-0003.");