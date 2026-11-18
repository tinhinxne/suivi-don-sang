// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract SuiviDonSang is AccessControl {
    // L'admin est le DEFAULT_ADMIN_ROLE.
    // Il attribue et retire les rôles avec grantRole / revokeRole.
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant MEDECIN_ROLE = keccak256("MEDECIN_ROLE");

    enum Statut {
        Enregistre,
        EnAnalyse,
        Valide,
        Rejete,
        Stocke,
        Reserve,
        Distribue
    }

    enum GroupeSanguin {
        APos,
        ANeg,
        BPos,
        BNeg,
        ABPos,
        ABNeg,
        OPos,
        ONeg
    }

    // Conservé pour la cohérence du modèle, même si les demandes
    // sont gérées par le backend dans l'architecture retenue.
    enum StatutDemande {
        EnAttente,
        Acceptee,
        Refusee,
        Annulee
    }

    struct Don {
        uint256 id;
        bytes32 donneurId; // Identifiant pseudonymisé, jamais de nom.
        GroupeSanguin groupe;
        Statut statut;
        uint256 dateEnregistrement;
    }

    // Chaque changement de statut conserve l'adresse de l'acteur
    // qui a effectué l'action (agent dans le parcours actuel).
    struct Etape {
        Statut statut;
        address par;
        uint256 date;
    }

    // Conservé pour ne pas supprimer la structure initiale.
    // Les demandes réelles sont stockées dans la base de données.
    struct Demande {
        uint256 id;
        uint256 donId;
        address medecin;
        bytes32 patientId;
        GroupeSanguin groupePatient;
        StatutDemande statut;
        uint256 date;
    }

    uint256 public compteurDons;
    uint256 public compteurDemandes;

    mapping(uint256 => Don) private dons;
    mapping(uint256 => Etape[]) private historiques;
    mapping(uint256 => Demande) private demandes;

    // Ces mappings restent disponibles pour le suivi des demandes,
    // mais le parcours actuel utilise demandeDe et medecinDe.
    mapping(uint256 => uint256) public demandeEnCours;
    mapping(uint256 => bytes32) public demandeDe; // Poche => référence de demande en base.
    mapping(uint256 => bytes32) public medecinDe; // Poche => identifiant pseudonymisé du médecin.

    event DonEnregistre(
        uint256 indexed donId,
        bytes32 indexed donneurId,
        GroupeSanguin groupe,
        address par,
        uint256 date
    );

    event StatutChange(
        uint256 indexed donId,
        Statut ancien,
        Statut nouveau,
        address par,
        uint256 date
    );

    event AnalyseEnregistree(
        uint256 indexed donId,
        bytes32 hashAnalyse,
        bool valide,
        address par,
        uint256 date
    );

    event GroupeCorrige(
        uint256 indexed donId,
        GroupeSanguin ancien,
        GroupeSanguin nouveau,
        string motif,
        address par,
        uint256 date
    );

    // Événements conservés pour compatibilité avec la structure initiale.
    event DemandeCreee(
        uint256 indexed demandeId,
        uint256 indexed donId,
        address indexed medecin,
        bytes32 patientId,
        GroupeSanguin groupePatient,
        uint256 date
    );

    event DemandeTraitee(
        uint256 indexed demandeId,
        uint256 indexed donId,
        StatutDemande statut,
        string motif,
        address par,
        uint256 date
    );

    event PocheReservee(
        uint256 indexed donId,
        bytes32 indexed demandeRef,
        bytes32 medecinId,
        GroupeSanguin groupePatient,
        address par,
        uint256 date
    );

    event ReservationAnnulee(
        uint256 indexed donId,
        bytes32 indexed demandeRef,
        string motif,
        address par,
        uint256 date
    );

    event PocheDistribuee(
        uint256 indexed donId,
        bytes32 indexed demandeRef,
        address par,
        uint256 date
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier donExiste(uint256 donId) {
        require(donId > 0 && donId <= compteurDons, "Don introuvable");
        _;
    }

    // --------------------------------------------------
    // AGENT : collecte, analyse et stockage
    // --------------------------------------------------

    function enregistrerDon(bytes32 donneurId, GroupeSanguin groupe)
        external
        onlyRole(AGENT_ROLE)
        returns (uint256 donId)
    {
        compteurDons++;
        donId = compteurDons;

        dons[donId] = Don({
            id: donId,
            donneurId: donneurId,
            groupe: groupe,
            statut: Statut.Enregistre,
            dateEnregistrement: block.timestamp
        });

        historiques[donId].push(
            Etape(Statut.Enregistre, msg.sender, block.timestamp)
        );

        emit DonEnregistre(
            donId,
            donneurId,
            groupe,
            msg.sender,
            block.timestamp
        );
    }

    function demarrerAnalyse(uint256 donId)
        external
        onlyRole(AGENT_ROLE)
        donExiste(donId)
    {
        _exiger(donId, Statut.Enregistre);
        _changerStatut(donId, Statut.EnAnalyse);
    }

    // Correction possible seulement avant la validation.
    // L'événement conserve l'ancien groupe, le nouveau groupe,
    // le motif et l'adresse de l'agent ayant effectué la correction.
    function corrigerGroupe(
        uint256 donId,
        GroupeSanguin nouveau,
        string calldata motif
    ) external onlyRole(AGENT_ROLE) donExiste(donId) {
        Statut s = dons[donId].statut;

        require(
            s == Statut.Enregistre || s == Statut.EnAnalyse,
            "Correction impossible apres l'analyse"
        );
        require(bytes(motif).length > 0, "Motif obligatoire");

        GroupeSanguin ancien = dons[donId].groupe;
        require(ancien != nouveau, "Meme groupe");

        dons[donId].groupe = nouveau;

        emit GroupeCorrige(
            donId,
            ancien,
            nouveau,
            motif,
            msg.sender,
            block.timestamp
        );
    }

    function validerDon(uint256 donId, bytes32 hashAnalyse)
        external
        onlyRole(AGENT_ROLE)
        donExiste(donId)
    {
        _exiger(donId, Statut.EnAnalyse);
        _changerStatut(donId, Statut.Valide);

        emit AnalyseEnregistree(
            donId,
            hashAnalyse,
            true,
            msg.sender,
            block.timestamp
        );
    }

    function rejeterDon(uint256 donId, bytes32 hashAnalyse)
        external
        onlyRole(AGENT_ROLE)
        donExiste(donId)
    {
        _exiger(donId, Statut.EnAnalyse);
        _changerStatut(donId, Statut.Rejete);

        emit AnalyseEnregistree(
            donId,
            hashAnalyse,
            false,
            msg.sender,
            block.timestamp
        );
    }

    function stockerDon(uint256 donId)
        external
        onlyRole(AGENT_ROLE)
        donExiste(donId)
    {
        _exiger(donId, Statut.Valide);
        _changerStatut(donId, Statut.Stocke);
    }

    // --------------------------------------------------
    // AGENT : réservation et distribution
    // Les demandes sont gérées dans le backend (option A).
    // --------------------------------------------------

    // L'agent réserve une poche pour une demande créée par un médecin.
    // demandeRef : référence de la demande dans la base de données.
    // medecinId : identifiant pseudonymisé du médecin demandeur.
    // L'adresse de l'agent est enregistrée dans l'historique et l'événement.
    function reserverPoche(
        uint256 donId,
        bytes32 demandeRef,
        bytes32 medecinId,
        GroupeSanguin groupePatient
    ) external onlyRole(AGENT_ROLE) donExiste(donId) {
        _exiger(donId, Statut.Stocke);

        require(
            estCompatible(dons[donId].groupe, groupePatient),
            "Groupe incompatible avec le patient"
        );

        demandeDe[donId] = demandeRef;
        medecinDe[donId] = medecinId;

        // _changerStatut conserve msg.sender (= l'agent) dans l'historique.
        _changerStatut(donId, Statut.Reserve);

        emit PocheReservee(
            donId,
            demandeRef,
            medecinId,
            groupePatient,
            msg.sender,
            block.timestamp
        );
    }

    // La réservation est annulée : la poche redevient disponible.
    // L'événement conserve la référence, le motif et l'adresse de l'agent.
    function annulerReservation(uint256 donId, string calldata motif)
        external
        onlyRole(AGENT_ROLE)
        donExiste(donId)
    {
        _exiger(donId, Statut.Reserve);
        require(bytes(motif).length > 0, "Motif obligatoire");

        bytes32 ref = demandeDe[donId];

        demandeDe[donId] = bytes32(0);
        medecinDe[donId] = bytes32(0);

        // L'agent qui annule est aussi conservé dans l'historique.
        _changerStatut(donId, Statut.Stocke);

        emit ReservationAnnulee(
            donId,
            ref,
            motif,
            msg.sender,
            block.timestamp
        );
    }

    function distribuerPoche(uint256 donId)
        external
        onlyRole(AGENT_ROLE)
        donExiste(donId)
    {
        _exiger(donId, Statut.Reserve);

        // L'agent qui effectue la distribution est conservé dans l'historique.
        _changerStatut(donId, Statut.Distribue);

        emit PocheDistribuee(
            donId,
            demandeDe[donId],
            msg.sender,
            block.timestamp
        );
    }

    // --------------------------------------------------
    // CONSULTATION : fonctions ouvertes à tous
    // --------------------------------------------------

    function getDon(uint256 donId)
        external
        view
        donExiste(donId)
        returns (Don memory)
    {
        return dons[donId];
    }

    // Historique des changements de statut avec l'adresse de leur auteur.
    function getHistorique(uint256 donId)
        external
        view
        donExiste(donId)
        returns (Etape[] memory)
    {
        return historiques[donId];
    }

    // Liste paginée : listerDons(1, 20) retourne les 20 premiers dons.
    function listerDons(uint256 debut, uint256 limite)
        external
        view
        returns (Don[] memory liste)
    {
        require(limite > 0, "Limite invalide");

        if (debut == 0) debut = 1;
        if (debut > compteurDons) return new Don[](0);

        uint256 fin = debut + limite - 1;
        if (fin > compteurDons) fin = compteurDons;

        liste = new Don[](fin - debut + 1);

        for (uint256 i = debut; i <= fin; i++) {
            liste[i - debut] = dons[i];
        }
    }

    // Compatibilité des globules rouges (ABO + Rhésus).
    function estCompatible(
        GroupeSanguin donneur,
        GroupeSanguin receveur
    ) public pure returns (bool) {
        if (_aA(donneur) && !_aA(receveur)) return false;
        if (_aB(donneur) && !_aB(receveur)) return false;
        if (_rhPositif(donneur) && !_rhPositif(receveur)) return false;

        return true;
    }

    // --------------------------------------------------
    // FONCTIONS INTERNES
    // --------------------------------------------------

    function _aA(GroupeSanguin g) internal pure returns (bool) {
        return
            g == GroupeSanguin.APos ||
            g == GroupeSanguin.ANeg ||
            g == GroupeSanguin.ABPos ||
            g == GroupeSanguin.ABNeg;
    }

    function _aB(GroupeSanguin g) internal pure returns (bool) {
        return
            g == GroupeSanguin.BPos ||
            g == GroupeSanguin.BNeg ||
            g == GroupeSanguin.ABPos ||
            g == GroupeSanguin.ABNeg;
    }

    function _rhPositif(GroupeSanguin g) internal pure returns (bool) {
        return
            g == GroupeSanguin.APos ||
            g == GroupeSanguin.BPos ||
            g == GroupeSanguin.ABPos ||
            g == GroupeSanguin.OPos;
    }

    function _exiger(uint256 donId, Statut attendu) internal view {
        require(
            dons[donId].statut == attendu,
            "Statut incorrect pour cette action"
        );
    }

    function _changerStatut(uint256 donId, Statut nouveau) internal {
        Statut ancien = dons[donId].statut;
        dons[donId].statut = nouveau;

        historiques[donId].push(
            Etape(nouveau, msg.sender, block.timestamp)
        );

        emit StatutChange(
            donId,
            ancien,
            nouveau,
            msg.sender,
            block.timestamp
        );
    }
}
