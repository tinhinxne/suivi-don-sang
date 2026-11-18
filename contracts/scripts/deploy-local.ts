import { readFileSync } from "node:fs";
import {
  JsonRpcProvider,
  Wallet,
  ContractFactory,
  NonceManager,
  id,
} from "ethers";

const artifact = JSON.parse(
  readFileSync("artifacts/contracts/SuiviDonSang.sol/SuiviDonSang.json", "utf8"),
);

// 1. Le provider doit être défini AVANT les wallets
const provider = new JsonRpcProvider("http://127.0.0.1:8545", undefined, {
  staticNetwork: true,
  batchMaxCount: 1,
});

// 2. Comptes de test publics de Hardhat (sans valeur réelle)
const cle = (k: string) => new NonceManager(new Wallet(k, provider));

const admin = cle("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
const karim = cle("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"); // agent
const samir = cle("0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"); // médecin
const leila = cle("0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"); // agent
const nadia = cle("0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"); // agent

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
const AGENT_ROLE = await c.AGENT_ROLE();
const MEDECIN_ROLE = await c.MEDECIN_ROLE();
await envoyer(c.grantRole(AGENT_ROLE, await karim.getAddress()));
await envoyer(c.grantRole(AGENT_ROLE, await leila.getAddress()));
await envoyer(c.grantRole(AGENT_ROLE, await nadia.getAddress()));
await envoyer(c.grantRole(MEDECIN_ROLE, await samir.getAddress()));
console.log("Karim, Leila, Nadia : agents | Samir : medecin");

console.log("\n=== Dons de test ===");

// Don n°1 (AB+) : parcours complet jusqu'a la distribution
await envoyer(c.connect(karim).enregistrerDon(id("DON-2026-0131"), 4));
await envoyer(c.connect(leila).demarrerAnalyse(1n));
await envoyer(c.connect(leila).validerDon(1n, id("analyse-don-1")));
await envoyer(c.connect(nadia).stockerDon(1n));
await envoyer(c.connect(karim).reserverPoche(1n, id("DEM-2026-0001"), id("MEDECIN-samir"), 4));
await envoyer(c.connect(nadia).distribuerPoche(1n));
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

console.log("\nTermine.");