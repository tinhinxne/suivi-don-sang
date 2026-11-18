import { network } from "hardhat";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const { ethers } = await network.connect();

  const factory = await ethers.getContractFactory("SuiviDonSang");
  const contract = await factory.deploy(); // ajoute les arguments ici si ton constructeur en a
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("SuiviDonSang déployé à l'adresse :", address);

  // Copie l'adresse + l'ABI dans le backend
  const artifactPath = path.join(
    process.cwd(),
    "artifacts",
    "contracts",
    "SuiviDonSang.sol",
    "SuiviDonSang.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const outDir = path.join(process.cwd(), "..", "backend", "src", "blockchain");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "contract.json"),
    JSON.stringify({ address, abi: artifact.abi }, null, 2)
  );
  console.log("ABI et adresse écrites dans backend/src/blockchain/contract.json");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});