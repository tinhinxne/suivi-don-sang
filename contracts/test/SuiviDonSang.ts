// // // import { expect } from "chai";
// // // import { network } from "hardhat";

// // // const { ethers } = await network.create();

// // // // Statut : 0 Enregistre, 1 EnAnalyse, 2 Valide, 3 Rejete, 4 Stocke, 5 Distribue
// // // // Groupe : 0 A+, 1 A-, 2 B+, 3 B-, 4 AB+, 5 AB-, 6 O+, 7 O-
// // // const ID = ethers.id("don-44");
// // // const DONNEUR = ethers.id("donneur-pseudo-1");
// // // const HASH = ethers.id("resultats-analyse");
// // // const DEST = ethers.id("hopital-1");

// // // async function deploy() {
// // //   const [admin, centre, labo, intrus] = await ethers.getSigners();
// // //   const c = await ethers.deployContract("SuiviDonSang");
// // //   await c.grantRole(await c.CENTRE_ROLE(), centre.address);
// // //   await c.grantRole(await c.LABORATOIRE_ROLE(), labo.address);
// // //   return { c, admin, centre, labo, intrus };
// // // }

// // // describe("SuiviDonSang", function () {
// // //   it("enregistre un don avec son groupe", async function () {
// // //     const { c, centre } = await deploy();
// // //     await expect(c.connect(centre).enregistrerDon(ID, DONNEUR, 6)).to.emit(c, "DonEnregistre");
// // //     const don = await c.getDon(ID);
// // //     expect(don.statut).to.equal(0n);
// // //     expect(don.groupe).to.equal(6n);
// // //   });

// // //   it("refuse un don en double", async function () {
// // //     const { c, centre } = await deploy();
// // //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
// // //     await expect(c.connect(centre).enregistrerDon(ID, DONNEUR, 6)).to.be.revertedWith("Don deja enregistre");
// // //   });

// // //   it("refuse un groupe invalide (hors des 8 valeurs)", async function () {
// // //     const { c, centre } = await deploy();
// // //   await expect(c.connect(centre).enregistrerDon(ID, DONNEUR, 9)).to.revert(ethers);
// // //   });

// // //   it("parcours complet : collecte -> analyse -> validation -> stockage -> distribution", async function () {
// // //     const { c, centre, labo } = await deploy();
// // //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
// // //     await c.connect(labo).demarrerAnalyse(ID);
// // //     await c.connect(labo).validerDon(ID, HASH);
// // //     await c.connect(centre).stockerDon(ID);
// // //     await c.connect(centre).distribuerDon(ID, DEST);
// // //     expect((await c.getDon(ID)).statut).to.equal(5n);
// // //   });

// // //   it("refuse collecte -> distribution et collecte -> validation", async function () {
// // //     const { c, centre, labo } = await deploy();
// // //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
// // //     await expect(c.connect(centre).distribuerDon(ID, DEST)).to.be.revertedWith("Statut incorrect pour cette action");
// // //     await expect(c.connect(labo).validerDon(ID, HASH)).to.be.revertedWith("Statut incorrect pour cette action");
// // //   });

// // //   it("un don rejete ne peut ni etre stocke ni distribue", async function () {
// // //     const { c, centre, labo } = await deploy();
// // //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
// // //     await c.connect(labo).demarrerAnalyse(ID);
// // //     await c.connect(labo).rejeterDon(ID, HASH);
// // //     await expect(c.connect(centre).stockerDon(ID)).to.be.revertedWith("Statut incorrect pour cette action");
// // //     await expect(c.connect(centre).distribuerDon(ID, DEST)).to.be.revertedWith("Statut incorrect pour cette action");
// // //   });

// // //   it("refuse le retour en arriere (distribue -> collecte)", async function () {
// // //     const { c, centre, labo } = await deploy();
// // //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
// // //     await c.connect(labo).demarrerAnalyse(ID);
// // //     await c.connect(labo).validerDon(ID, HASH);
// // //     await c.connect(centre).stockerDon(ID);
// // //     await c.connect(centre).distribuerDon(ID, DEST);
// // //     await expect(c.connect(labo).demarrerAnalyse(ID)).to.be.revertedWith("Statut incorrect pour cette action");
// // //   });

// // //   it("refuse un utilisateur sans role", async function () {
// // //     const { c, intrus, centre } = await deploy();
// // //     await expect(c.connect(intrus).enregistrerDon(ID, DONNEUR, 0)).to.revert(ethers);
// // //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
// // //     await expect(c.connect(intrus).corrigerGroupe(ID, 1, "test")).to.be.revertedWith("Role non autorise");
// // //   });

// // //   it("le centre ne peut pas valider (role laboratoire)", async function () {
// // //     const { c, centre } = await deploy();
// // //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
// // //     await expect(c.connect(centre).validerDon(ID, HASH)).to.revert(ethers);
// // //   });

// // //   it("correction du groupe en Collecte, tracee avec ancien groupe, nouveau et motif", async function () {
// // //     const { c, centre } = await deploy();
// // //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6); // O+ par erreur
// // //     await expect(c.connect(centre).corrigerGroupe(ID, 0, "erreur de saisie"))
// // //       .to.emit(c, "GroupeCorrige")
// // //       .withArgs(ID, 6n, 0n, "erreur de saisie", centre.address, (v: bigint) => v > 0n);
// // //     expect((await c.getDon(ID)).groupe).to.equal(0n);
// // //   });

// // //   it("correction possible en Analyse (le labo decouvre l'erreur)", async function () {
// // //     const { c, centre, labo } = await deploy();
// // //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
// // //     await c.connect(labo).demarrerAnalyse(ID);
// // //     await c.connect(labo).corrigerGroupe(ID, 0, "groupe verifie au labo");
// // //     expect((await c.getDon(ID)).groupe).to.equal(0n);
// // //   });

// // //   it("correction refusee apres validation", async function () {
// // //     const { c, centre, labo } = await deploy();
// // //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
// // //     await c.connect(labo).demarrerAnalyse(ID);
// // //     await c.connect(labo).validerDon(ID, HASH);
// // //     await expect(c.connect(labo).corrigerGroupe(ID, 0, "trop tard")).to.be.revertedWith("Correction impossible apres l'analyse");
// // //   });

// // //   it("correction refusee sans motif ou avec le meme groupe", async function () {
// // //     const { c, centre } = await deploy();
// // //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
// // //     await expect(c.connect(centre).corrigerGroupe(ID, 0, "")).to.be.revertedWith("Motif obligatoire");
// // //     await expect(c.connect(centre).corrigerGroupe(ID, 6, "x")).to.be.revertedWith("Meme groupe");
// // //   });

// // //   it("l'historique complet est retrouvable via les evenements", async function () {
// // //     const { c, centre, labo } = await deploy();
// // //     await c.connect(centre).enregistrerDon(ID, DONNEUR, 6);
// // //     await c.connect(centre).corrigerGroupe(ID, 0, "erreur");
// // //     await c.connect(labo).demarrerAnalyse(ID);
// // //     const corr = await c.queryFilter(c.filters.GroupeCorrige(ID));
// // //     const ana = await c.queryFilter(c.filters.AnalyseDemarree(ID));
// // //     expect(corr.length).to.equal(1);
// // //     expect(ana.length).to.equal(1);
// // //   });
// // // });








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
// //     await expect(c.connect(centre).enregistrerDon(ID, DONNEUR, 9)).to.revert(ethers);
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
//     await c.connect(centre).distribuerDon(ID, DEST, 0);
//     expect((await c.getDon(ID)).statut).to.equal(5n);
//   });

//   it("refuse collecte -> distribution et collecte -> validation", async function () {
//     const { c, centre, labo } = await deploy();
//     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
//     await expect(c.connect(centre).distribuerDon(ID, DEST, 0)).to.be.revertedWith("Statut incorrect pour cette action");
//     await expect(c.connect(labo).validerDon(ID, HASH)).to.be.revertedWith("Statut incorrect pour cette action");
//   });

//   it("un don rejete ne peut ni etre stocke ni distribue", async function () {
//     const { c, centre, labo } = await deploy();
//     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
//     await c.connect(labo).demarrerAnalyse(ID);
//     await c.connect(labo).rejeterDon(ID, HASH);
//     await expect(c.connect(centre).stockerDon(ID)).to.be.revertedWith("Statut incorrect pour cette action");
//     await expect(c.connect(centre).distribuerDon(ID, DEST, 0)).to.be.revertedWith("Statut incorrect pour cette action");
//   });

//   it("refuse le retour en arriere (distribue -> collecte)", async function () {
//     const { c, centre, labo } = await deploy();
//     await c.connect(centre).enregistrerDon(ID, DONNEUR, 0);
//     await c.connect(labo).demarrerAnalyse(ID);
//     await c.connect(labo).validerDon(ID, HASH);
//     await c.connect(centre).stockerDon(ID);
//     await c.connect(centre).distribuerDon(ID, DEST, 0);
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

//   // ---------- COMPATIBILITE ----------

//   // amene un don jusqu'a l'etat Stocke
//   async function jusquAuStockage(c: any, centre: any, labo: any, id: string, groupe: number) {
//     await c.connect(centre).enregistrerDon(id, DONNEUR, groupe);
//     await c.connect(labo).demarrerAnalyse(id);
//     await c.connect(labo).validerDon(id, HASH);
//     await c.connect(centre).stockerDon(id);
//   }

//   it("A+ peut etre donne a un patient AB+ mais pas a un patient B-", async function () {
//     const { c, centre, labo } = await deploy();
//     await jusquAuStockage(c, centre, labo, ID, 0); // poche A+
//     await expect(c.connect(centre).distribuerDon(ID, DEST, 3)) // patient B-
//       .to.be.revertedWith("Groupe incompatible avec le patient");
//     await c.connect(centre).distribuerDon(ID, DEST, 4); // patient AB+
//     expect((await c.getDon(ID)).statut).to.equal(5n);
//   });

//   it("patient B- : seules les poches B- et O- sont acceptees", async function () {
//     const { c, centre, labo } = await deploy();
//     for (let g = 0; g < 8; g++) {
//       const id = ethers.id("don-b-" + g);
//       await jusquAuStockage(c, centre, labo, id, g);
//       if (g === 3 || g === 7) {
//         await c.connect(centre).distribuerDon(id, DEST, 3);
//         expect((await c.getDon(id)).statut).to.equal(5n);
//       } else {
//         await expect(c.connect(centre).distribuerDon(id, DEST, 3))
//           .to.be.revertedWith("Groupe incompatible avec le patient");
//       }
//     }
//   });

//   it("un don refuse pour incompatibilite reste Stocke et peut aller a un patient compatible", async function () {
//     const { c, centre, labo } = await deploy();
//     await jusquAuStockage(c, centre, labo, ID, 0); // A+
//     await expect(c.connect(centre).distribuerDon(ID, DEST, 6)) // patient O+
//       .to.be.revertedWith("Groupe incompatible avec le patient");
//     expect((await c.getDon(ID)).statut).to.equal(4n); // toujours Stocke
//     await c.connect(centre).distribuerDon(ID, DEST, 0); // patient A+
//     expect((await c.getDon(ID)).statut).to.equal(5n);
//   });

//   it("matrice complete : les 64 combinaisons donneur/patient", async function () {
//     const { c } = await deploy();
//     const N = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
//     const peutDonnerA: Record<string, string[]> = {
//       "O-": N,
//       "O+": ["O+", "A+", "B+", "AB+"],
//       "A-": ["A-", "A+", "AB-", "AB+"],
//       "A+": ["A+", "AB+"],
//       "B-": ["B-", "B+", "AB-", "AB+"],
//       "B+": ["B+", "AB+"],
//       "AB-": ["AB-", "AB+"],
//       "AB+": ["AB+"],
//     };
//     for (let d = 0; d < 8; d++) {
//       for (let r = 0; r < 8; r++) {
//         const attendu = peutDonnerA[N[d]].includes(N[r]);
//         expect(await c.estCompatible(d, r), `${N[d]} -> ${N[r]}`).to.equal(attendu);
//       }
//     }
//   });
// });



import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

// Statut : 0 Enregistre, 1 EnAnalyse, 2 Valide, 3 Rejete, 4 Stocke, 5 Reserve, 6 Distribue
// StatutDemande : 0 EnAttente, 1 Acceptee, 2 Refusee, 3 Annulee
// Groupe : 0 A+, 1 A-, 2 B+, 3 B-, 4 AB+, 5 AB-, 6 O+, 7 O-
const DONNEUR = ethers.id("donneur-pseudo-1");
const PATIENT = ethers.id("patient-1");
const HASH = ethers.id("resultats-analyse");
const ERREUR_STATUT = "Statut incorrect pour cette action";
const ERREUR_COMPAT = "Groupe incompatible avec le patient";

async function deploy() {
  const [admin, agent, medecin, medecin2, intrus] = await ethers.getSigners();
  const c = await ethers.deployContract("SuiviDonSang");
  await c.grantRole(await c.AGENT_ROLE(), agent.address);
  await c.grantRole(await c.MEDECIN_ROLE(), medecin.address);
  await c.grantRole(await c.MEDECIN_ROLE(), medecin2.address);
  return { c, admin, agent, medecin, medecin2, intrus };
}

// enregistre un don et renvoie son identifiant (attribué par le contrat)
async function enregistrer(c: any, agent: any, groupe: number): Promise<bigint> {
  await c.connect(agent).enregistrerDon(DONNEUR, groupe);
  return await c.compteurDons();
}

// amène un don jusqu'à l'état Stocké
async function jusquAuStockage(c: any, agent: any, groupe: number): Promise<bigint> {
  const id = await enregistrer(c, agent, groupe);
  await c.connect(agent).demarrerAnalyse(id);
  await c.connect(agent).validerDon(id, HASH);
  await c.connect(agent).stockerDon(id);
  return id;
}

describe("SuiviDonSang", function () {
  // ---------- ENREGISTREMENT ----------

  it("enregistre un don avec son groupe", async function () {
    const { c, agent } = await deploy();
    await expect(c.connect(agent).enregistrerDon(DONNEUR, 6)).to.emit(c, "DonEnregistre");
    const don = await c.getDon(1n);
    expect(don.id).to.equal(1n);
    expect(don.statut).to.equal(0n);
    expect(don.groupe).to.equal(6n);
  });

  it("attribue automatiquement des identifiants uniques et croissants", async function () {
    const { c, agent } = await deploy();
    for (let i = 1n; i <= 3n; i++) {
      expect(await enregistrer(c, agent, 0)).to.equal(i);
    }
    expect(await c.compteurDons()).to.equal(3n);
  });

  it("refuse un groupe invalide (hors des 8 valeurs)", async function () {
    const { c, agent } = await deploy();
    await expect(c.connect(agent).enregistrerDon(DONNEUR, 9)).to.revert(ethers);
  });

  it("refuse un don inexistant", async function () {
    const { c, agent } = await deploy();
    await expect(c.getDon(0n)).to.be.revertedWith("Don introuvable");
    await expect(c.getDon(99n)).to.be.revertedWith("Don introuvable");
    await expect(c.connect(agent).demarrerAnalyse(99n)).to.be.revertedWith("Don introuvable");
  });

  // ---------- PARCOURS ET TRANSITIONS ----------

  it("parcours complet : collecte -> analyse -> validation -> stockage -> demande -> distribution", async function () {
    const { c, agent, medecin } = await deploy();
    const id = await jusquAuStockage(c, agent, 0);
    await c.connect(medecin).demanderPoche(id, PATIENT, 0);
    await c.connect(agent).accepterDemande(1n);

    expect((await c.getDon(id)).statut).to.equal(6n);
    expect((await c.getDemande(1n)).statut).to.equal(1n);

    // historique complet, avec l'auteur de chaque étape
    const h = await c.getHistorique(id);
    const attendu = [0n, 1n, 2n, 4n, 5n, 6n];
    expect(h.length).to.equal(attendu.length);
    for (let i = 0; i < attendu.length; i++) {
      expect(h[i].statut).to.equal(attendu[i]);
    }
    expect(h[4].par).to.equal(medecin.address); // réservation faite par le médecin
    expect(h[5].par).to.equal(agent.address);   // distribution validée par l'agent
  });

  it("refuse de sauter des étapes", async function () {
    const { c, agent, medecin } = await deploy();
    const id = await enregistrer(c, agent, 0);
    await expect(c.connect(agent).validerDon(id, HASH)).to.be.revertedWith(ERREUR_STATUT);
    await expect(c.connect(agent).stockerDon(id)).to.be.revertedWith(ERREUR_STATUT);
    await expect(c.connect(medecin).demanderPoche(id, PATIENT, 0)).to.be.revertedWith(ERREUR_STATUT);
  });

  it("un don rejeté ne peut ni être stocké ni être demandé", async function () {
    const { c, agent, medecin } = await deploy();
    const id = await enregistrer(c, agent, 0);
    await c.connect(agent).demarrerAnalyse(id);
    await c.connect(agent).rejeterDon(id, HASH);
    await expect(c.connect(agent).stockerDon(id)).to.be.revertedWith(ERREUR_STATUT);
    await expect(c.connect(medecin).demanderPoche(id, PATIENT, 0)).to.be.revertedWith(ERREUR_STATUT);
  });

  it("refuse le retour en arrière (distribué -> collecte)", async function () {
    const { c, agent, medecin } = await deploy();
    const id = await jusquAuStockage(c, agent, 0);
    await c.connect(medecin).demanderPoche(id, PATIENT, 0);
    await c.connect(agent).accepterDemande(1n);
    await expect(c.connect(agent).demarrerAnalyse(id)).to.be.revertedWith(ERREUR_STATUT);
    await expect(c.connect(agent).stockerDon(id)).to.be.revertedWith(ERREUR_STATUT);
    await expect(c.connect(medecin).demanderPoche(id, PATIENT, 0)).to.be.revertedWith(ERREUR_STATUT);
  });

  // ---------- ROLES ----------

  it("refuse un utilisateur sans rôle", async function () {
    const { c, agent, intrus } = await deploy();
    await expect(c.connect(intrus).enregistrerDon(DONNEUR, 0)).to.revert(ethers);
    const id = await enregistrer(c, agent, 0);
    await expect(c.connect(intrus).corrigerGroupe(id, 1, "test")).to.revert(ethers);
    await expect(c.connect(intrus).demanderPoche(id, PATIENT, 0)).to.revert(ethers);
  });

  it("le médecin ne peut pas agir comme agent, et l'agent ne peut pas demander de poche", async function () {
    const { c, agent, medecin } = await deploy();
    await expect(c.connect(medecin).enregistrerDon(DONNEUR, 0)).to.revert(ethers);
    const id = await jusquAuStockage(c, agent, 0);
    await expect(c.connect(agent).demanderPoche(id, PATIENT, 0)).to.revert(ethers);
    await c.connect(medecin).demanderPoche(id, PATIENT, 0);
    await expect(c.connect(medecin).accepterDemande(1n)).to.revert(ethers);
    await expect(c.connect(medecin).refuserDemande(1n, "non")).to.revert(ethers);
  });

  it("seul l'admin accorde et retire les rôles", async function () {
    const { c, agent, intrus } = await deploy();
    const AGENT = await c.AGENT_ROLE();
    await expect(c.connect(intrus).grantRole(AGENT, intrus.address)).to.revert(ethers);
    await c.grantRole(AGENT, intrus.address); // l'admin (compte qui déploie) peut
    await c.connect(intrus).enregistrerDon(DONNEUR, 0);
    await c.revokeRole(AGENT, agent.address);
    await expect(c.connect(agent).enregistrerDon(DONNEUR, 0)).to.revert(ethers);
  });

  // ---------- CORRECTION DU GROUPE ----------

  it("correction du groupe en Collecte, tracée avec ancien groupe, nouveau et motif", async function () {
    const { c, agent } = await deploy();
    const id = await enregistrer(c, agent, 6); // O+ par erreur
    await expect(c.connect(agent).corrigerGroupe(id, 0, "erreur de saisie"))
      .to.emit(c, "GroupeCorrige")
      .withArgs(id, 6n, 0n, "erreur de saisie", agent.address, (v: bigint) => v > 0n);
    expect((await c.getDon(id)).groupe).to.equal(0n);
  });

  it("correction possible en Analyse", async function () {
    const { c, agent } = await deploy();
    const id = await enregistrer(c, agent, 6);
    await c.connect(agent).demarrerAnalyse(id);
    await c.connect(agent).corrigerGroupe(id, 0, "groupe verifie a l'analyse");
    expect((await c.getDon(id)).groupe).to.equal(0n);
  });

  it("correction refusée après validation", async function () {
    const { c, agent } = await deploy();
    const id = await enregistrer(c, agent, 6);
    await c.connect(agent).demarrerAnalyse(id);
    await c.connect(agent).validerDon(id, HASH);
    await expect(c.connect(agent).corrigerGroupe(id, 0, "trop tard"))
      .to.be.revertedWith("Correction impossible apres l'analyse");
  });

  it("correction refusée sans motif ou avec le même groupe", async function () {
    const { c, agent } = await deploy();
    const id = await enregistrer(c, agent, 6);
    await expect(c.connect(agent).corrigerGroupe(id, 0, "")).to.be.revertedWith("Motif obligatoire");
    await expect(c.connect(agent).corrigerGroupe(id, 6, "x")).to.be.revertedWith("Meme groupe");
  });

  // ---------- HISTORIQUE ET LISTE ----------

  it("l'historique est aussi retrouvable via les événements", async function () {
    const { c, agent } = await deploy();
    const id = await enregistrer(c, agent, 6);
    await c.connect(agent).corrigerGroupe(id, 0, "erreur");
    await c.connect(agent).demarrerAnalyse(id);
    const corr = await c.queryFilter(c.filters.GroupeCorrige(id));
    const statuts = await c.queryFilter(c.filters.StatutChange(id));
    expect(corr.length).to.equal(1);
    expect(statuts.length).to.equal(1); // seul le passage en analyse est un changement de statut
  });

  it("liste les dons par pages", async function () {
    const { c, agent } = await deploy();
    for (let i = 0; i < 3; i++) await enregistrer(c, agent, i);
    expect((await c.listerDons(1n, 10n)).length).to.equal(3);
    expect((await c.listerDons(1n, 2n)).length).to.equal(2);
    const page = await c.listerDons(2n, 1n);
    expect(page.length).to.equal(1);
    expect(page[0].id).to.equal(2n);
    expect((await c.listerDons(10n, 5n)).length).to.equal(0);
    await expect(c.listerDons(1n, 0n)).to.be.revertedWith("Limite invalide");
  });

  // ---------- DEMANDES DU MEDECIN ----------

  it("le médecin demande une poche : le don passe à Réservé", async function () {
    const { c, agent, medecin } = await deploy();
    const id = await jusquAuStockage(c, agent, 0);
    await expect(c.connect(medecin).demanderPoche(id, PATIENT, 0)).to.emit(c, "DemandeCreee");
    expect((await c.getDon(id)).statut).to.equal(5n);
    const d = await c.getDemande(1n);
    expect(d.donId).to.equal(id);
    expect(d.medecin).to.equal(medecin.address);
    expect(d.statut).to.equal(0n);
    expect(await c.demandeEnCours(id)).to.equal(1n);
    expect((await c.listerDemandes(1n, 10n)).length).to.equal(1);
  });

  it("une poche réservée ne peut pas être demandée deux fois", async function () {
    const { c, agent, medecin, medecin2 } = await deploy();
    const id = await jusquAuStockage(c, agent, 0);
    await c.connect(medecin).demanderPoche(id, PATIENT, 0);
    await expect(c.connect(medecin2).demanderPoche(id, PATIENT, 0)).to.be.revertedWith(ERREUR_STATUT);
  });

  it("l'agent refuse une demande avec motif : la poche redevient Stockée et redemandable", async function () {
    const { c, agent, medecin, medecin2 } = await deploy();
    const id = await jusquAuStockage(c, agent, 0);
    await c.connect(medecin).demanderPoche(id, PATIENT, 0);
    await expect(c.connect(agent).refuserDemande(1n, "")).to.be.revertedWith("Motif obligatoire");
    await c.connect(agent).refuserDemande(1n, "autre patient prioritaire");
    expect((await c.getDon(id)).statut).to.equal(4n);
    expect((await c.getDemande(1n)).statut).to.equal(2n);
    expect(await c.demandeEnCours(id)).to.equal(0n);
    await c.connect(medecin2).demanderPoche(id, PATIENT, 0); // nouvelle demande possible
    expect((await c.getDemande(2n)).statut).to.equal(0n);
  });

  it("le médecin peut annuler sa demande, mais pas celle d'un autre médecin", async function () {
    const { c, agent, medecin, medecin2 } = await deploy();
    const id = await jusquAuStockage(c, agent, 0);
    await c.connect(medecin).demanderPoche(id, PATIENT, 0);
    await expect(c.connect(medecin2).annulerDemande(1n))
      .to.be.revertedWith("Seul le medecin demandeur peut annuler");
    await c.connect(medecin).annulerDemande(1n);
    expect((await c.getDon(id)).statut).to.equal(4n);
    expect((await c.getDemande(1n)).statut).to.equal(3n);
  });

  it("une demande déjà traitée ne peut plus être modifiée", async function () {
    const { c, agent, medecin } = await deploy();
    const id = await jusquAuStockage(c, agent, 0);
    await c.connect(medecin).demanderPoche(id, PATIENT, 0);
    await c.connect(agent).accepterDemande(1n);
    await expect(c.connect(agent).accepterDemande(1n)).to.be.revertedWith("Demande deja traitee");
    await expect(c.connect(medecin).annulerDemande(1n)).to.be.revertedWith("Demande deja traitee");
    await expect(c.connect(agent).accepterDemande(99n)).to.be.revertedWith("Demande introuvable");
  });

  // ---------- COMPATIBILITE ----------

  it("A+ peut être donné à un patient AB+ mais pas à un patient B-", async function () {
    const { c, agent, medecin } = await deploy();
    const id = await jusquAuStockage(c, agent, 0); // poche A+
    await expect(c.connect(medecin).demanderPoche(id, PATIENT, 3)).to.be.revertedWith(ERREUR_COMPAT); // B-
    await c.connect(medecin).demanderPoche(id, PATIENT, 4); // AB+
    expect((await c.getDon(id)).statut).to.equal(5n);
  });

  it("patient B- : seules les poches B- et O- sont acceptées", async function () {
    const { c, agent, medecin } = await deploy();
    for (let g = 0; g < 8; g++) {
      const id = await jusquAuStockage(c, agent, g);
      if (g === 3 || g === 7) {
        await c.connect(medecin).demanderPoche(id, PATIENT, 3);
        expect((await c.getDon(id)).statut).to.equal(5n);
      } else {
        await expect(c.connect(medecin).demanderPoche(id, PATIENT, 3)).to.be.revertedWith(ERREUR_COMPAT);
      }
    }
  });

  it("une demande refusée pour incompatibilité laisse le don Stocké, qui peut aller à un patient compatible", async function () {
    const { c, agent, medecin } = await deploy();
    const id = await jusquAuStockage(c, agent, 0); // A+
    await expect(c.connect(medecin).demanderPoche(id, PATIENT, 6)).to.be.revertedWith(ERREUR_COMPAT); // O+
    expect((await c.getDon(id)).statut).to.equal(4n);
    await c.connect(medecin).demanderPoche(id, PATIENT, 0); // A+
    await c.connect(agent).accepterDemande(1n);
    expect((await c.getDon(id)).statut).to.equal(6n);
  });

  it("matrice complète : les 64 combinaisons donneur/patient", async function () {
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