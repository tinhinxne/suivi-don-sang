// // import { expect } from "chai";
// // import { network } from "hardhat";

// // const { ethers } = await network.create();

// // // Statut : 0 Enregistre, 1 EnAnalyse, 2 Valide, 3 Rejete, 4 Stocke, 5 Distribue
// // // Groupe : 0 A+, 1 A-, 2 B+, 3 B-, 4 AB+, 5 AB-, 6 O+, 7 O-
// // const ID = ethers.id("don-44");
// // const DONNEUR = ethers.id("donneur-pseudo-1");
// // const HASH = ethers.id("resultats-analyse");
// // const DEST = ethers.id("hopital-1");

// // async function deploy() {
// //   const [admin, centre, labo, intrus] = await ethers.getSigners();
// //   const c = await ethers.deployContract("SuiviDonSang");
// //   await c.grantRole(await c.CENTRE_ROLE(), centre.address);
// //   await c.grantRole(await c.LABORATOIRE_ROLE(), labo.address);
// //   return { c, admin, centre, labo, intrus };
// // }

// // describe("SuiviDonSang", function () {
// //   it("enregistre un don avec son groupe", async function () {
// //     const { c, centre } = await deploy();
// //     await expect(c.connect(centre).enregistrerDon(ID, DONNEUR, 6)).to.emit(c, "DonEnregistre");
// //     const don = await c.getDon(ID);
// //     expect(don.statut).to.equal(0n);
// //     expect(don.groupe).to.equal(6n);
// //   });

// //   it("refuse un don en double", async function () {
// //     const { c, centre } = await deploy();
// //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
// //     await expect(c.connect(centre).enregistrerDon(ID, DONNEUR, 6)).to.be.revertedWith("Don deja enregistre");
// //   });

// //   it("refuse un groupe invalide (hors des 8 valeurs)", async function () {
// //     const { c, centre } = await deploy();
// //   await expect(c.connect(centre).enregistrerDon(ID, DONNEUR, 9)).to.revert(ethers);
// //   });

// //   it("parcours complet : collecte -> analyse -> validation -> stockage -> distribution", async function () {
// //     const { c, centre, labo } = await deploy();
// //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
// //     await c.connect(labo).demarrerAnalyse(ID);
// //     await c.connect(labo).validerDon(ID, HASH);
// //     await c.connect(centre).stockerDon(ID);
// //     await c.connect(centre).distribuerDon(ID, DEST);
// //     expect((await c.getDon(ID)).statut).to.equal(5n);
// //   });

// //   it("refuse collecte -> distribution et collecte -> validation", async function () {
// //     const { c, centre, labo } = await deploy();
// //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
// //     await expect(c.connect(centre).distribuerDon(ID, DEST)).to.be.revertedWith("Statut incorrect pour cette action");
// //     await expect(c.connect(labo).validerDon(ID, HASH)).to.be.revertedWith("Statut incorrect pour cette action");
// //   });

// //   it("un don rejete ne peut ni etre stocke ni distribue", async function () {
// //     const { c, centre, labo } = await deploy();
// //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
// //     await c.connect(labo).demarrerAnalyse(ID);
// //     await c.connect(labo).rejeterDon(ID, HASH);
// //     await expect(c.connect(centre).stockerDon(ID)).to.be.revertedWith("Statut incorrect pour cette action");
// //     await expect(c.connect(centre).distribuerDon(ID, DEST)).to.be.revertedWith("Statut incorrect pour cette action");
// //   });

// //   it("refuse le retour en arriere (distribue -> collecte)", async function () {
// //     const { c, centre, labo } = await deploy();
// //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
// //     await c.connect(labo).demarrerAnalyse(ID);
// //     await c.connect(labo).validerDon(ID, HASH);
// //     await c.connect(centre).stockerDon(ID);
// //     await c.connect(centre).distribuerDon(ID, DEST);
// //     await expect(c.connect(labo).demarrerAnalyse(ID)).to.be.revertedWith("Statut incorrect pour cette action");
// //   });

// //   it("refuse un utilisateur sans role", async function () {
// //     const { c, intrus, centre } = await deploy();
// //     await expect(c.connect(intrus).enregistrerDon(ID, DONNEUR, 0)).to.revert(ethers);
// //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
// //     await expect(c.connect(intrus).corrigerGroupe(ID, 1, "test")).to.be.revertedWith("Role non autorise");
// //   });

// //   it("le centre ne peut pas valider (role laboratoire)", async function () {
// //     const { c, centre } = await deploy();
// //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
// //     await expect(c.connect(centre).validerDon(ID, HASH)).to.revert(ethers);
// //   });

// //   it("correction du groupe en Collecte, tracee avec ancien groupe, nouveau et motif", async function () {
// //     const { c, centre } = await deploy();
// //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6); // O+ par erreur
// //     await expect(c.connect(centre).corrigerGroupe(ID, 0, "erreur de saisie"))
// //       .to.emit(c, "GroupeCorrige")
// //       .withArgs(ID, 6n, 0n, "erreur de saisie", centre.address, (v: bigint) => v > 0n);
// //     expect((await c.getDon(ID)).groupe).to.equal(0n);
// //   });

// //   it("correction possible en Analyse (le labo decouvre l'erreur)", async function () {
// //     const { c, centre, labo } = await deploy();
// //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
// //     await c.connect(labo).demarrerAnalyse(ID);
// //     await c.connect(labo).corrigerGroupe(ID, 0, "groupe verifie au labo");
// //     expect((await c.getDon(ID)).groupe).to.equal(0n);
// //   });

// //   it("correction refusee apres validation", async function () {
// //     const { c, centre, labo } = await deploy();
// //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
// //     await c.connect(labo).demarrerAnalyse(ID);
// //     await c.connect(labo).validerDon(ID, HASH);
// //     await expect(c.connect(labo).corrigerGroupe(ID, 0, "trop tard")).to.be.revertedWith("Correction impossible apres l'analyse");
// //   });

// //   it("correction refusee sans motif ou avec le meme groupe", async function () {
// //     const { c, centre } = await deploy();
// //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
// //     await expect(c.connect(centre).corrigerGroupe(ID, 0, "")).to.be.revertedWith("Motif obligatoire");
// //     await expect(c.connect(centre).corrigerGroupe(ID, 6, "x")).to.be.revertedWith("Meme groupe");
// //   });

// //   it("l'historique complet est retrouvable via les evenements", async function () {
// //     const { c, centre, labo } = await deploy();
// //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
// //     await c.connect(centre).corrigerGroupe(ID, 0, "erreur");
// //     await c.connect(labo).demarrerAnalyse(ID);
// //     const corr = await c.queryFilter(c.filters.GroupeCorrige(ID));
// //     const ana = await c.queryFilter(c.filters.AnalyseDemarree(ID));
// //     expect(corr.length).to.equal(1);
// //     expect(ana.length).to.equal(1);
// //   });
// // });








// import { expect } from "chai";
// import { network } from "hardhat";

// const { ethers } = await network.create();

// // Statut : 0 Enregistre, 1 EnAnalyse, 2 Valide, 3 Rejete, 4 Stocke, 5 Distribue
// // Groupe : 0 A+, 1 A-, 2 B+, 3 B-, 4 AB+, 5 AB-, 6 O+, 7 O-
// const ID = ethers.id("don-44");
// const DONNEUR = ethers.id("donneur-pseudo-1");
// const HASH = ethers.id("resultats-analyse");
// const DEST = ethers.id("hopital-1");

// async function deploy() {
//   const [admin, centre, labo, intrus] = await ethers.getSigners();
//   const c = await ethers.deployContract("SuiviDonSang");
//   await c.grantRole(await c.CENTRE_ROLE(), centre.address);
//   await c.grantRole(await c.LABORATOIRE_ROLE(), labo.address);
//   return { c, admin, centre, labo, intrus };
// }

// describe("SuiviDonSang", function () {
//   it("enregistre un don avec son groupe", async function () {
//     const { c, centre } = await deploy();
//     await expect(c.connect(centre).enregistrerDon(ID, DONNEUR, 6)).to.emit(c, "DonEnregistre");
//     const don = await c.getDon(ID);
//     expect(don.statut).to.equal(0n);
//     expect(don.groupe).to.equal(6n);
//   });

//   it("refuse un don en double", async function () {
//     const { c, centre } = await deploy();
//     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
//     await expect(c.connect(centre).enregistrerDon(ID, DONNEUR, 6)).to.be.revertedWith("Don deja enregistre");
//   });

//   it("refuse un groupe invalide (hors des 8 valeurs)", async function () {
//     const { c, centre } = await deploy();
//     await expect(c.connect(centre).enregistrerDon(ID, DONNEUR, 9)).to.revert(ethers);
//   });

//   it("parcours complet : collecte -> analyse -> validation -> stockage -> distribution", async function () {
//     const { c, centre, labo } = await deploy();
//     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
//     await c.connect(labo).demarrerAnalyse(ID);
//     await c.connect(labo).validerDon(ID, HASH);
//     await c.connect(centre).stockerDon(ID);
//     await c.connect(centre).distribuerDon(ID, DEST);
//     expect((await c.getDon(ID)).statut).to.equal(5n);
//   });

//   it("refuse collecte -> distribution et collecte -> validation", async function () {
//     const { c, centre, labo } = await deploy();
//     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
//     await expect(c.connect(centre).distribuerDon(ID, DEST)).to.be.revertedWith("Statut incorrect pour cette action");
//     await expect(c.connect(labo).validerDon(ID, HASH)).to.be.revertedWith("Statut incorrect pour cette action");
//   });

//   it("un don rejete ne peut ni etre stocke ni distribue", async function () {
//     const { c, centre, labo } = await deploy();
//     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
//     await c.connect(labo).demarrerAnalyse(ID);
//     await c.connect(labo).rejeterDon(ID, HASH);
//     await expect(c.connect(centre).stockerDon(ID)).to.be.revertedWith("Statut incorrect pour cette action");
//     await expect(c.connect(centre).distribuerDon(ID, DEST)).to.be.revertedWith("Statut incorrect pour cette action");
//   });

//   it("refuse le retour en arriere (distribue -> collecte)", async function () {
//     const { c, centre, labo } = await deploy();
//     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
//     await c.connect(labo).demarrerAnalyse(ID);
//     await c.connect(labo).validerDon(ID, HASH);
//     await c.connect(centre).stockerDon(ID);
//     await c.connect(centre).distribuerDon(ID, DEST);
//     await expect(c.connect(labo).demarrerAnalyse(ID)).to.be.revertedWith("Statut incorrect pour cette action");
//   });

//   it("refuse un utilisateur sans role", async function () {
//     const { c, intrus, centre } = await deploy();
//     await expect(c.connect(intrus).enregistrerDon(ID, DONNEUR, 0)).to.revert(ethers);
//     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
//     await expect(c.connect(intrus).corrigerGroupe(ID, 1, "test")).to.be.revertedWith("Role non autorise");
//   });

//   it("le centre ne peut pas valider (role laboratoire)", async function () {
//     const { c, centre } = await deploy();
//     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
//     await expect(c.connect(centre).validerDon(ID, HASH)).to.revert(ethers);
//   });

//   it("correction du groupe en Collecte, tracee avec ancien groupe, nouveau et motif", async function () {
//     const { c, centre } = await deploy();
//     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6); // O+ par erreur
//     await expect(c.connect(centre).corrigerGroupe(ID, 0, "erreur de saisie"))
//       .to.emit(c, "GroupeCorrige")
//       .withArgs(ID, 6n, 0n, "erreur de saisie", centre.address, (v: bigint) => v > 0n);
//     expect((await c.getDon(ID)).groupe).to.equal(0n);
//   });

//   it("correction possible en Analyse (le labo decouvre l'erreur)", async function () {
//     const { c, centre, labo } = await deploy();
//     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
//     await c.connect(labo).demarrerAnalyse(ID);
//     await c.connect(labo).corrigerGroupe(ID, 0, "groupe verifie au labo");
//     expect((await c.getDon(ID)).groupe).to.equal(0n);
//   });

//   it("correction refusee apres validation", async function () {
//     const { c, centre, labo } = await deploy();
//     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
//     await c.connect(labo).demarrerAnalyse(ID);
//     await c.connect(labo).validerDon(ID, HASH);
//     await expect(c.connect(labo).corrigerGroupe(ID, 0, "trop tard")).to.be.revertedWith("Correction impossible apres l'analyse");
//   });

//   it("correction refusee sans motif ou avec le meme groupe", async function () {
//     const { c, centre } = await deploy();
//     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
//     await expect(c.connect(centre).corrigerGroupe(ID, 0, "")).to.be.revertedWith("Motif obligatoire");
//     await expect(c.connect(centre).corrigerGroupe(ID, 6, "x")).to.be.revertedWith("Meme groupe");
//   });

//   it("l'historique complet est retrouvable via les evenements", async function () {
//     const { c, centre, labo } = await deploy();
//     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
//     await c.connect(centre).corrigerGroupe(ID, 0, "erreur");
//     await c.connect(labo).demarrerAnalyse(ID);
//     const corr = await c.queryFilter(c.filters.GroupeCorrige(ID));
//     const ana = await c.queryFilter(c.filters.AnalyseDemarree(ID));
//     expect(corr.length).to.equal(1);
//     expect(ana.length).to.equal(1);
//   });
// });


import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

// Statut : 0 Enregistre, 1 EnAnalyse, 2 Valide, 3 Rejete, 4 Stocke, 5 Distribue
// Groupe : 0 A+, 1 A-, 2 B+, 3 B-, 4 AB+, 5 AB-, 6 O+, 7 O-
const ID = ethers.id("don-44");
const DONNEUR = ethers.id("donneur-pseudo-1");
const HASH = ethers.id("resultats-analyse");
const DEST = ethers.id("hopital-1");

async function deploy() {
  const [admin, centre, labo, intrus] = await ethers.getSigners();
  const c = await ethers.deployContract("SuiviDonSang");
  await c.grantRole(await c.CENTRE_ROLE(), centre.address);
  await c.grantRole(await c.LABORATOIRE_ROLE(), labo.address);
  return { c, admin, centre, labo, intrus };
}

describe("SuiviDonSang", function () {
  it("enregistre un don avec son groupe", async function () {
    const { c, centre } = await deploy();
    await expect(c.connect(centre).enregistrerDon(ID, DONNEUR, 6)).to.emit(c, "DonEnregistre");
    const don = await c.getDon(ID);
    expect(don.statut).to.equal(0n);
    expect(don.groupe).to.equal(6n);
  });

  it("refuse un don en double", async function () {
    const { c, centre } = await deploy();
    await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
    await expect(c.connect(centre).enregistrerDon(ID, DONNEUR, 6)).to.be.revertedWith("Don deja enregistre");
  });

  it("refuse un groupe invalide (hors des 8 valeurs)", async function () {
    const { c, centre } = await deploy();
    await expect(c.connect(centre).enregistrerDon(ID, DONNEUR, 9)).to.revert(ethers);
  });

  it("parcours complet : collecte -> analyse -> validation -> stockage -> distribution", async function () {
    const { c, centre, labo } = await deploy();
    await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
    await c.connect(labo).demarrerAnalyse(ID);
    await c.connect(labo).validerDon(ID, HASH);
    await c.connect(centre).stockerDon(ID);
    await c.connect(centre).distribuerDon(ID, DEST, 0);
    expect((await c.getDon(ID)).statut).to.equal(5n);
  });

  it("refuse collecte -> distribution et collecte -> validation", async function () {
    const { c, centre, labo } = await deploy();
    await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
    await expect(c.connect(centre).distribuerDon(ID, DEST, 0)).to.be.revertedWith("Statut incorrect pour cette action");
    await expect(c.connect(labo).validerDon(ID, HASH)).to.be.revertedWith("Statut incorrect pour cette action");
  });

  it("un don rejete ne peut ni etre stocke ni distribue", async function () {
    const { c, centre, labo } = await deploy();
    await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
    await c.connect(labo).demarrerAnalyse(ID);
    await c.connect(labo).rejeterDon(ID, HASH);
    await expect(c.connect(centre).stockerDon(ID)).to.be.revertedWith("Statut incorrect pour cette action");
    await expect(c.connect(centre).distribuerDon(ID, DEST, 0)).to.be.revertedWith("Statut incorrect pour cette action");
  });

  it("refuse le retour en arriere (distribue -> collecte)", async function () {
    const { c, centre, labo } = await deploy();
    await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
    await c.connect(labo).demarrerAnalyse(ID);
    await c.connect(labo).validerDon(ID, HASH);
    await c.connect(centre).stockerDon(ID);
    await c.connect(centre).distribuerDon(ID, DEST, 0);
    await expect(c.connect(labo).demarrerAnalyse(ID)).to.be.revertedWith("Statut incorrect pour cette action");
  });

  it("refuse un utilisateur sans role", async function () {
    const { c, intrus, centre } = await deploy();
    await expect(c.connect(intrus).enregistrerDon(ID, DONNEUR, 0)).to.revert(ethers);
    await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
    await expect(c.connect(intrus).corrigerGroupe(ID, 1, "test")).to.be.revertedWith("Role non autorise");
  });

  it("le centre ne peut pas valider (role laboratoire)", async function () {
    const { c, centre } = await deploy();
    await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
    await expect(c.connect(centre).validerDon(ID, HASH)).to.revert(ethers);
  });

  it("correction du groupe en Collecte, tracee avec ancien groupe, nouveau et motif", async function () {
    const { c, centre } = await deploy();
    await c.connect(centre).enregistrerDon(ID, DONNEUR, 6); // O+ par erreur
    await expect(c.connect(centre).corrigerGroupe(ID, 0, "erreur de saisie"))
      .to.emit(c, "GroupeCorrige")
      .withArgs(ID, 6n, 0n, "erreur de saisie", centre.address, (v: bigint) => v > 0n);
    expect((await c.getDon(ID)).groupe).to.equal(0n);
  });

  it("correction possible en Analyse (le labo decouvre l'erreur)", async function () {
    const { c, centre, labo } = await deploy();
    await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
    await c.connect(labo).demarrerAnalyse(ID);
    await c.connect(labo).corrigerGroupe(ID, 0, "groupe verifie au labo");
    expect((await c.getDon(ID)).groupe).to.equal(0n);
  });

  it("correction refusee apres validation", async function () {
    const { c, centre, labo } = await deploy();
    await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
    await c.connect(labo).demarrerAnalyse(ID);
    await c.connect(labo).validerDon(ID, HASH);
    await expect(c.connect(labo).corrigerGroupe(ID, 0, "trop tard")).to.be.revertedWith("Correction impossible apres l'analyse");
  });

  it("correction refusee sans motif ou avec le meme groupe", async function () {
    const { c, centre } = await deploy();
    await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
    await expect(c.connect(centre).corrigerGroupe(ID, 0, "")).to.be.revertedWith("Motif obligatoire");
    await expect(c.connect(centre).corrigerGroupe(ID, 6, "x")).to.be.revertedWith("Meme groupe");
  });

  it("l'historique complet est retrouvable via les evenements", async function () {
    const { c, centre, labo } = await deploy();
    await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
    await c.connect(centre).corrigerGroupe(ID, 0, "erreur");
    await c.connect(labo).demarrerAnalyse(ID);
    const corr = await c.queryFilter(c.filters.GroupeCorrige(ID));
    const ana = await c.queryFilter(c.filters.AnalyseDemarree(ID));
    expect(corr.length).to.equal(1);
    expect(ana.length).to.equal(1);
  });

  // ---------- COMPATIBILITE ----------

  // amene un don jusqu'a l'etat Stocke
  async function jusquAuStockage(c: any, centre: any, labo: any, id: string, groupe: number) {
    await c.connect(centre).enregistrerDon(id, DONNEUR, groupe);
    await c.connect(labo).demarrerAnalyse(id);
    await c.connect(labo).validerDon(id, HASH);
    await c.connect(centre).stockerDon(id);
  }

  it("A+ peut etre donne a un patient AB+ mais pas a un patient B-", async function () {
    const { c, centre, labo } = await deploy();
    await jusquAuStockage(c, centre, labo, ID, 0); // poche A+
    await expect(c.connect(centre).distribuerDon(ID, DEST, 3)) // patient B-
      .to.be.revertedWith("Groupe incompatible avec le patient");
    await c.connect(centre).distribuerDon(ID, DEST, 4); // patient AB+
    expect((await c.getDon(ID)).statut).to.equal(5n);
  });

  it("patient B- : seules les poches B- et O- sont acceptees", async function () {
    const { c, centre, labo } = await deploy();
    for (let g = 0; g < 8; g++) {
      const id = ethers.id("don-b-" + g);
      await jusquAuStockage(c, centre, labo, id, g);
      if (g === 3 || g === 7) {
        await c.connect(centre).distribuerDon(id, DEST, 3);
        expect((await c.getDon(id)).statut).to.equal(5n);
      } else {
        await expect(c.connect(centre).distribuerDon(id, DEST, 3))
          .to.be.revertedWith("Groupe incompatible avec le patient");
      }
    }
  });

  it("un don refuse pour incompatibilite reste Stocke et peut aller a un patient compatible", async function () {
    const { c, centre, labo } = await deploy();
    await jusquAuStockage(c, centre, labo, ID, 0); // A+
    await expect(c.connect(centre).distribuerDon(ID, DEST, 6)) // patient O+
      .to.be.revertedWith("Groupe incompatible avec le patient");
    expect((await c.getDon(ID)).statut).to.equal(4n); // toujours Stocke
    await c.connect(centre).distribuerDon(ID, DEST, 0); // patient A+
    expect((await c.getDon(ID)).statut).to.equal(5n);
  });

  it("matrice complete : les 64 combinaisons donneur/patient", async function () {
    const { c } = await deploy();
    const N = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const peutDonnerA: Record<string, string[]> = {
      "O-": N,
      "O+": ["O+", "A+", "B+", "AB+"],
      "A-": ["A-", "A+", "AB-", "AB+"],
      "A+": ["A+", "AB+"],
      "B-": ["B-", "B+", "AB-", "AB+"],
      "B+": ["B+", "AB+"],
      "AB-": ["AB-", "AB+"],
      "AB+": ["AB+"],
    };
    for (let d = 0; d < 8; d++) {
      for (let r = 0; r < 8; r++) {
        const attendu = peutDonnerA[N[d]].includes(N[r]);
        expect(await c.estCompatible(d, r), `${N[d]} -> ${N[r]}`).to.equal(attendu);
      }
    }
  });
});