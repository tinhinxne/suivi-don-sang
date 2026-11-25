
import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

// Ordre des groupes : 0 A+, 1 A-, 2 B+, 3 B-, 4 AB+, 5 AB-, 6 O+, 7 O-.
const DONNEUR = ethers.id("donneur-pseudo-1");
const HASH = ethers.id("resultats-analyse");
const REF = ethers.id("DEM-2026-0032");
const MEDECIN = ethers.id("MEDECIN-7");
const MOTIF_HASH = ethers.id("stock insuffisant");
const ERREUR_STATUT = "Statut incorrect pour cette action";
const ERREUR_COMPAT = "Groupe incompatible avec le patient";

async function deploy() {
  const [admin, agent, medecin, medecin2, intrus] =
    await ethers.getSigners();

  const c = await ethers.deployContract("SuiviDonSang");

  await c.grantRole(await c.AGENT_ROLE(), agent.address);
  await c.grantRole(await c.MEDECIN_ROLE(), medecin.address);
  await c.grantRole(await c.MEDECIN_ROLE(), medecin2.address);

  return { c, admin, agent, medecin, medecin2, intrus };
}

// Enregistre un don et retourne l'identifiant attribué par le contrat.
async function enregistrer(c: any, agent: any, groupe: number): Promise<bigint> {
  await c.connect(agent).enregistrerDon(DONNEUR, groupe);
  return await c.compteurDons();
}

// Amène un don jusqu'à l'état Stocke.
async function jusquAuStockage(
  c: any,
  agent: any,
  groupe: number
): Promise<bigint> {
  const id = await enregistrer(c, agent, groupe);
  await c.connect(agent).demarrerAnalyse(id);
  await c.connect(agent).validerDon(id, HASH);
  await c.connect(agent).stockerDon(id);
  return id;
}

describe("SuiviDonSang - option A (demandes dans le backend)", function () {
  // --------------------------------------------------
  // ENREGISTREMENT
  // --------------------------------------------------

  it("enregistre un don avec son groupe et l'adresse de l'agent", async function () {
    const { c, agent } = await deploy();

    await expect(c.connect(agent).enregistrerDon(DONNEUR, 6))
      .to.emit(c, "DonEnregistre")
      .withArgs(1n, DONNEUR, 6n, agent.address, (v: bigint) => v > 0n);

    const don = await c.getDon(1n);
    expect(don.id).to.equal(1n);
    expect(don.statut).to.equal(0n);
    expect(don.groupe).to.equal(6n);

    const historique = await c.getHistorique(1n);
    expect(historique.length).to.equal(1);
    expect(historique[0].par).to.equal(agent.address);
  });

  it("attribue automatiquement des identifiants uniques et croissants", async function () {
    const { c, agent } = await deploy();

    for (let i = 1n; i <= 3n; i++) {
      expect(await enregistrer(c, agent, 0)).to.equal(i);
    }

    expect(await c.compteurDons()).to.equal(3n);
  });

  it("refuse un groupe invalide (hors des huit valeurs)", async function () {
    const { c, agent } = await deploy();
    await expect(
      c.connect(agent).enregistrerDon(DONNEUR, 9)
    ).to.revert(ethers);
  });

  it("refuse un don inexistant", async function () {
    const { c, agent } = await deploy();

    await expect(c.getDon(0n)).to.be.revertedWith("Don introuvable");
    await expect(c.getDon(99n)).to.be.revertedWith("Don introuvable");
    await expect(
      c.connect(agent).demarrerAnalyse(99n)
    ).to.be.revertedWith("Don introuvable");
  });

  // --------------------------------------------------
  // PARCOURS ET TRANSITIONS
  // --------------------------------------------------

  it("effectue le parcours complet jusqu'à la distribution", async function () {
    const { c, agent } = await deploy();

    const id = await jusquAuStockage(c, agent, 0); // A+
    await c.connect(agent).reserverPoche(id, REF, MEDECIN, 0);
    await c.connect(agent).distribuerPoche(id);

    expect((await c.getDon(id)).statut).to.equal(6n);
    expect(await c.demandeDe(id)).to.equal(REF);
    expect(await c.medecinDe(id)).to.equal(MEDECIN);

    const historique = await c.getHistorique(id);
    const statutsAttendus = [0n, 1n, 2n, 4n, 5n, 6n];

    expect(historique.length).to.equal(statutsAttendus.length);

    for (let i = 0; i < statutsAttendus.length; i++) {
      expect(historique[i].statut).to.equal(statutsAttendus[i]);
      // Dans l'option A, l'agent effectue toutes les opérations on-chain.
      expect(historique[i].par).to.equal(agent.address);
    }
  });

  it("enregistre le médecin concerné et l'agent qui réserve la poche", async function () {
    const { c, agent } = await deploy();
    const id = await jusquAuStockage(c, agent, 0);

    await expect(c.connect(agent).reserverPoche(id, REF, MEDECIN, 0))
      .to.emit(c, "PocheReservee")
      .withArgs(id, REF, MEDECIN, 0n, agent.address, (v: bigint) => v > 0n);

    expect(await c.demandeDe(id)).to.equal(REF);
    expect(await c.medecinDe(id)).to.equal(MEDECIN);

    const historique = await c.getHistorique(id);
    const etapeReservation = historique[historique.length - 1];

    expect(etapeReservation.statut).to.equal(5n);
    expect(etapeReservation.par).to.equal(agent.address);
  });

  it("refuse de sauter des étapes", async function () {
    const { c, agent } = await deploy();
    const id = await enregistrer(c, agent, 0);

    await expect(
      c.connect(agent).validerDon(id, HASH)
    ).to.be.revertedWith(ERREUR_STATUT);

    await expect(
      c.connect(agent).stockerDon(id)
    ).to.be.revertedWith(ERREUR_STATUT);

    await expect(
      c.connect(agent).reserverPoche(id, REF, MEDECIN, 0)
    ).to.be.revertedWith(ERREUR_STATUT);

    await expect(
      c.connect(agent).distribuerPoche(id)
    ).to.be.revertedWith(ERREUR_STATUT);
  });

  it("un don rejeté ne peut ni être stocké ni être réservé", async function () {
    const { c, agent } = await deploy();
    const id = await enregistrer(c, agent, 0);

    await c.connect(agent).demarrerAnalyse(id);
    await c.connect(agent).rejeterDon(id, HASH);

    await expect(
      c.connect(agent).stockerDon(id)
    ).to.be.revertedWith(ERREUR_STATUT);

    await expect(
      c.connect(agent).reserverPoche(id, REF, MEDECIN, 0)
    ).to.be.revertedWith(ERREUR_STATUT);
  });

  it("une poche distribuée ne peut plus revenir à l'analyse ou au stockage", async function () {
    const { c, agent } = await deploy();
    const id = await jusquAuStockage(c, agent, 0);

    await c.connect(agent).reserverPoche(id, REF, MEDECIN, 0);
    await c.connect(agent).distribuerPoche(id);

    await expect(
      c.connect(agent).demarrerAnalyse(id)
    ).to.be.revertedWith(ERREUR_STATUT);

    await expect(
      c.connect(agent).stockerDon(id)
    ).to.be.revertedWith(ERREUR_STATUT);

    await expect(
      c.connect(agent).reserverPoche(id, REF, MEDECIN, 0)
    ).to.be.revertedWith(ERREUR_STATUT);
  });

  it("annule une réservation et remet la poche en stock", async function () {
    const { c, agent } = await deploy();
    const id = await jusquAuStockage(c, agent, 0);

    await c.connect(agent).reserverPoche(id, REF, MEDECIN, 0);

    await expect(
      c.connect(agent).annulerReservation(id, "demande annulee")
    )
      .to.emit(c, "ReservationAnnulee")
      .withArgs(
        id,
        REF,
        "demande annulee",
        agent.address,
        (v: bigint) => v > 0n
      );

    expect((await c.getDon(id)).statut).to.equal(4n);
    expect(await c.demandeDe(id)).to.equal(ethers.ZeroHash);
    expect(await c.medecinDe(id)).to.equal(ethers.ZeroHash);

    const historique = await c.getHistorique(id);
    expect(historique[historique.length - 1].statut).to.equal(4n);
    expect(historique[historique.length - 1].par).to.equal(agent.address);
  });

  it("refuse l'annulation sans motif ou sans réservation", async function () {
    const { c, agent } = await deploy();
    const id = await jusquAuStockage(c, agent, 0);

    await expect(
      c.connect(agent).annulerReservation(id, "")
    ).to.be.revertedWith(ERREUR_STATUT);

    await c.connect(agent).reserverPoche(id, REF, MEDECIN, 0);

    await expect(
      c.connect(agent).annulerReservation(id, "")
    ).to.be.revertedWith("Motif obligatoire");
  });

  // --------------------------------------------------
  // RÔLES
  // --------------------------------------------------

  it("refuse les opérations d'un utilisateur sans rôle", async function () {
    const { c, agent, intrus } = await deploy();

    await expect(
      c.connect(intrus).enregistrerDon(DONNEUR, 0)
   ).to.revert(ethers);

    const id = await enregistrer(c, agent, 0);

    await expect(
      c.connect(intrus).corrigerGroupe(id, 1, "test")
   ).to.revert(ethers);

    await expect(
      c.connect(intrus).reserverPoche(id, REF, MEDECIN, 0)
   ).to.revert(ethers);
  });

  it("le médecin ne peut pas effectuer les opérations réservées à l'agent", async function () {
    const { c, agent, medecin } = await deploy();

    expect(await c.hasRole(await c.MEDECIN_ROLE(), medecin.address)).to.equal(true);

    await expect(
      c.connect(medecin).enregistrerDon(DONNEUR, 0)
    ).to.revert(ethers);

    const id = await jusquAuStockage(c, agent, 0);

    await expect(
      c.connect(medecin).reserverPoche(id, REF, MEDECIN, 0)
    ).to.revert(ethers);
  });

  it("seul l'admin accorde et retire les rôles", async function () {
    const { c, admin, agent, intrus } = await deploy();
    const AGENT = await c.AGENT_ROLE();

    await expect(
      c.connect(intrus).grantRole(AGENT, intrus.address)
    ).to.revert(ethers);

    await c.connect(admin).grantRole(AGENT, intrus.address);
    expect(await c.hasRole(AGENT, intrus.address)).to.equal(true);

    await c.connect(intrus).enregistrerDon(DONNEUR, 0);

    await c.connect(admin).revokeRole(AGENT, agent.address);

    await expect(
      c.connect(agent).enregistrerDon(DONNEUR, 0)
   ).to.revert(ethers);
  });

  // --------------------------------------------------
  // CORRECTION DU GROUPE
  // --------------------------------------------------

  it("corrige le groupe en collecte et trace l'auteur de la correction", async function () {
    const { c, agent } = await deploy();
    const id = await enregistrer(c, agent, 6); // O+ saisi par erreur.

    await expect(
      c.connect(agent).corrigerGroupe(id, 0, "erreur de saisie")
    )
      .to.emit(c, "GroupeCorrige")
      .withArgs(
        id,
        6n,
        0n,
        "erreur de saisie",
        agent.address,
        (v: bigint) => v > 0n
      );

    expect((await c.getDon(id)).groupe).to.equal(0n);
  });

  it("permet la correction du groupe pendant l'analyse", async function () {
    const { c, agent } = await deploy();
    const id = await enregistrer(c, agent, 6);

    await c.connect(agent).demarrerAnalyse(id);
    await c.connect(agent).corrigerGroupe(id, 0, "groupe verifie");

    expect((await c.getDon(id)).groupe).to.equal(0n);
  });

  it("refuse la correction après validation", async function () {
    const { c, agent } = await deploy();
    const id = await enregistrer(c, agent, 6);

    await c.connect(agent).demarrerAnalyse(id);
    await c.connect(agent).validerDon(id, HASH);

    await expect(
      c.connect(agent).corrigerGroupe(id, 0, "trop tard")
    ).to.be.revertedWith("Correction impossible apres l'analyse");
  });

  it("refuse une correction sans motif ou avec le même groupe", async function () {
    const { c, agent } = await deploy();
    const id = await enregistrer(c, agent, 6);

    await expect(
      c.connect(agent).corrigerGroupe(id, 0, "")
    ).to.be.revertedWith("Motif obligatoire");

    await expect(
      c.connect(agent).corrigerGroupe(id, 6, "motif")
    ).to.be.revertedWith("Meme groupe");
  });

  // --------------------------------------------------
  // HISTORIQUE ET LISTE
  // --------------------------------------------------

  it("retrouve les corrections et changements de statut dans les événements", async function () {
    const { c, agent } = await deploy();
    const id = await enregistrer(c, agent, 6);

    await c.connect(agent).corrigerGroupe(id, 0, "erreur");
    await c.connect(agent).demarrerAnalyse(id);

    const corrections = await c.queryFilter(c.filters.GroupeCorrige(id));
    const statuts = await c.queryFilter(c.filters.StatutChange(id));

    expect(corrections.length).to.equal(1);
    expect(corrections[0].args.par).to.equal(agent.address);
    expect(statuts.length).to.equal(1);
    expect(statuts[0].args.par).to.equal(agent.address);
  });

  it("enregistre l'auteur de l'analyse dans l'événement", async function () {
    const { c, agent } = await deploy();
    const id = await enregistrer(c, agent, 0);

    await c.connect(agent).demarrerAnalyse(id);

    await expect(c.connect(agent).validerDon(id, HASH))
      .to.emit(c, "AnalyseEnregistree")
      .withArgs(
        id,
        HASH,
        true,
        agent.address,
        (v: bigint) => v > 0n
      );
  });

  it("liste les dons par pages", async function () {
    const { c, agent } = await deploy();

    for (let i = 0; i < 3; i++) {
      await enregistrer(c, agent, i);
    }

    expect((await c.listerDons(1n, 10n)).length).to.equal(3);
    expect((await c.listerDons(1n, 2n)).length).to.equal(2);

    const page = await c.listerDons(2n, 1n);
    expect(page.length).to.equal(1);
    expect(page[0].id).to.equal(2n);

    expect((await c.listerDons(10n, 5n)).length).to.equal(0);

    await expect(
      c.listerDons(1n, 0n)
    ).to.be.revertedWith("Limite invalide");
  });



    // --------------------------------------------------
  // DÉCISIONS SUR LES DEMANDES
  // --------------------------------------------------

  it("l'agent refuse une demande : événement émis, statut de la poche inchangé", async function () {
    const { c, agent } = await deploy();
    const id = await jusquAuStockage(c, agent, 0);

    await expect(
      c.connect(agent).refuserDemande(id, REF, MOTIF_HASH)
    )
      .to.emit(c, "DemandeTraitee")
      .withArgs(
        id,
        REF,
        1n, // Refusee
        MOTIF_HASH,
        agent.address,
        (v: bigint) => v > 0n
      );

    expect((await c.getDon(id)).statut).to.equal(4n); // toujours Stocke
    expect(await c.demandeDe(id)).to.equal(ethers.ZeroHash);
  });

  it("permet un refus sans poche (donId = 0, rupture de stock)", async function () {
    const { c, agent } = await deploy();

    await expect(
      c.connect(agent).refuserDemande(0n, REF, MOTIF_HASH)
    )
      .to.emit(c, "DemandeTraitee")
      .withArgs(
        0n,
        REF,
        1n,
        MOTIF_HASH,
        agent.address,
        (v: bigint) => v > 0n
      );
  });

  it("refuse un refus invalide (sans rôle, don inexistant, référence ou motif vide)", async function () {
    const { c, agent, medecin, intrus } = await deploy();
    const id = await jusquAuStockage(c, agent, 0);

       await expect(
      c.connect(intrus).refuserDemande(id, REF, MOTIF_HASH)
    ).to.be.revert(ethers);

    await expect(
      c.connect(medecin).refuserDemande(id, REF, MOTIF_HASH)
    ).to.be.revert(ethers);

    await expect(
      c.connect(agent).refuserDemande(99n, REF, MOTIF_HASH)
    ).to.be.revertedWith("Don introuvable");

    await expect(
      c.connect(agent).refuserDemande(id, ethers.ZeroHash, MOTIF_HASH)
    ).to.be.revertedWith("Reference obligatoire");

    await expect(
      c.connect(agent).refuserDemande(id, REF, ethers.ZeroHash)
    ).to.be.revertedWith("Motif obligatoire");
  });

  it("la réservation émet aussi DemandeTraitee (Acceptee, motif vide)", async function () {
    const { c, agent } = await deploy();
    const id = await jusquAuStockage(c, agent, 0);

    await expect(c.connect(agent).reserverPoche(id, REF, MEDECIN, 0))
      .to.emit(c, "DemandeTraitee")
      .withArgs(
        id,
        REF,
        0n, // Acceptee
        ethers.ZeroHash,
        agent.address,
        (v: bigint) => v > 0n
      );
  });



  // --------------------------------------------------
  // COMPATIBILITÉ DES GROUPES SANGUINS
  // --------------------------------------------------

  it("A+ peut être donné à AB+ mais pas à B-", async function () {
    const { c, agent } = await deploy();
    const id = await jusquAuStockage(c, agent, 0); // Poche A+.

    await expect(
      c.connect(agent).reserverPoche(id, REF, MEDECIN, 3) // B-
    ).to.be.revertedWith(ERREUR_COMPAT);

    await c.connect(agent).reserverPoche(id, REF, MEDECIN, 4); // AB+.
    expect((await c.getDon(id)).statut).to.equal(5n);
  });

  it("pour un receveur B-, seules les poches B- et O- sont compatibles", async function () {
    const { c, agent } = await deploy();

    for (let groupeDonneur = 0; groupeDonneur < 8; groupeDonneur++) {
      const id = await jusquAuStockage(c, agent, groupeDonneur);

      if (groupeDonneur === 3 || groupeDonneur === 7) {
        await c.connect(agent).reserverPoche(id, REF, MEDECIN, 3);
        expect((await c.getDon(id)).statut).to.equal(5n);
      } else {
        await expect(
          c.connect(agent).reserverPoche(id, REF, MEDECIN, 3)
        ).to.be.revertedWith(ERREUR_COMPAT);
      }
    }
  });

  it("une incompatibilité ne réserve pas la poche, qui reste stockée", async function () {
    const { c, agent } = await deploy();
    const id = await jusquAuStockage(c, agent, 0); // A+.

    await expect(
      c.connect(agent).reserverPoche(id, REF, MEDECIN, 6) // O+.
    ).to.be.revertedWith(ERREUR_COMPAT);

    expect((await c.getDon(id)).statut).to.equal(4n);

    await c.connect(agent).reserverPoche(id, REF, MEDECIN, 0); // A+.
    expect((await c.getDon(id)).statut).to.equal(5n);
  });

  it("vérifie les 64 combinaisons donneur/receveur", async function () {
    const { c } = await deploy();

    const groupes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    const compatibilites: Record<string, string[]> = {
      "O-": groupes,
      "O+": ["O+", "A+", "B+", "AB+"],
      "A-": ["A-", "A+", "AB-", "AB+"],
      "A+": ["A+", "AB+"],
      "B-": ["B-", "B+", "AB-", "AB+"],
      "B+": ["B+", "AB+"],
      "AB-": ["AB-", "AB+"],
      "AB+": ["AB+"],
    };

    for (let donneur = 0; donneur < 8; donneur++) {
      for (let receveur = 0; receveur < 8; receveur++) {
        const attendu = compatibilites[groupes[donneur]].includes(
          groupes[receveur]
        );

        expect(
          await c.estCompatible(donneur, receveur),
          `${groupes[donneur]} -> ${groupes[receveur]}`
        ).to.equal(attendu);
      }
    }
  });














  // À coller dans le describe(...) existant, avant l'accolade finale.
// Utilise les helpers (deploy, enregistrer, jusquAuStockage) et les constantes déjà définis en haut du fichier.

// --------------------------------------------------
// CAS MANQUANTS
// --------------------------------------------------

it("refuse une double réservation de la même poche", async function () {
  const { c, agent } = await deploy();
  const id = await jusquAuStockage(c, agent, 0);

  await c.connect(agent).reserverPoche(id, REF, MEDECIN, 0);

  await expect(
    c.connect(agent).reserverPoche(id, ethers.id("DEM-2026-0099"), MEDECIN, 0)
  ).to.be.revertedWith(ERREUR_STATUT);

  // La première réservation n'est pas écrasée.
  expect(await c.demandeDe(id)).to.equal(REF);
});

it("rejeterDon émet AnalyseEnregistree avec valide = false", async function () {
  const { c, agent } = await deploy();
  const id = await enregistrer(c, agent, 0);

  await c.connect(agent).demarrerAnalyse(id);

  await expect(c.connect(agent).rejeterDon(id, HASH))
    .to.emit(c, "AnalyseEnregistree")
    .withArgs(id, HASH, false, agent.address, (v: bigint) => v > 0n);

  expect((await c.getDon(id)).statut).to.equal(3n); // Rejete
});

it("distribuerPoche émet PocheDistribuee avec la référence de la demande", async function () {
  const { c, agent } = await deploy();
  const id = await jusquAuStockage(c, agent, 0);

  await c.connect(agent).reserverPoche(id, REF, MEDECIN, 0);

  await expect(c.connect(agent).distribuerPoche(id))
    .to.emit(c, "PocheDistribuee")
    .withArgs(id, REF, agent.address, (v: bigint) => v > 0n);
});

it("refuse de démarrer deux fois l'analyse", async function () {
  const { c, agent } = await deploy();
  const id = await enregistrer(c, agent, 0);

  await c.connect(agent).demarrerAnalyse(id);

  await expect(
    c.connect(agent).demarrerAnalyse(id)
  ).to.be.revertedWith(ERREUR_STATUT);
});

it("les dates de l'historique sont croissantes", async function () {
  const { c, agent } = await deploy();
  const id = await jusquAuStockage(c, agent, 0);

  const historique = await c.getHistorique(id);

  for (let i = 1; i < historique.length; i++) {
    expect(historique[i].date >= historique[i - 1].date).to.equal(true);
  }
});

it("getHistorique refuse un don inexistant", async function () {
  const { c } = await deploy();

  await expect(c.getHistorique(99n)).to.be.revertedWith("Don introuvable");
});

// --------------------------------------------------
// RÔLES : vérification précise de l'erreur
// (.to.revert(ethers) accepte n'importe quel échec ; ici on prouve
//  que le rejet vient bien du contrôle d'accès)
// --------------------------------------------------

it("annuler une réservation ou distribuer exige le rôle agent", async function () {
  const { c, agent, intrus } = await deploy();
  const id = await jusquAuStockage(c, agent, 0);

  await c.connect(agent).reserverPoche(id, REF, MEDECIN, 0);

  const AGENT = await c.AGENT_ROLE();

  await expect(c.connect(intrus).annulerReservation(id, "test"))
    .to.be.revertedWithCustomError(c, "AccessControlUnauthorizedAccount")
    .withArgs(intrus.address, AGENT);

  await expect(c.connect(intrus).distribuerPoche(id))
    .to.be.revertedWithCustomError(c, "AccessControlUnauthorizedAccount")
    .withArgs(intrus.address, AGENT);
});


  
});



