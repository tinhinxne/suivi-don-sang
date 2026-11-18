// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract SuiviDonSang is AccessControl {
    // Admin = DEFAULT_ADMIN_ROLE (accorde/retire les rôles avec grantRole / revokeRole)
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant MEDECIN_ROLE = keccak256("MEDECIN_ROLE");

    enum Statut { Enregistre, EnAnalyse, Valide, Rejete, Stocke, Reserve, Distribue }
    enum GroupeSanguin { APos, ANeg, BPos, BNeg, ABPos, ABNeg, OPos, ONeg }
    enum StatutDemande { EnAttente, Acceptee, Refusee, Annulee }

    struct Don {
        uint256 id;
        bytes32 donneurId; // identifiant pseudonymisé, jamais de nom
        GroupeSanguin groupe;
        Statut statut;
        uint256 dateEnregistrement;
    }

    struct Etape {
        Statut statut;
        address par;
        uint256 date;
    }

    struct Demande {
        uint256 id;
        uint256 donId;
        address medecin;
        bytes32 patientId; // pseudonymisé aussi
        GroupeSanguin groupePatient;
        StatutDemande statut;
        uint256 date;
    }

    uint256 public compteurDons;
    uint256 public compteurDemandes;

    mapping(uint256 => Don) private dons;
    mapping(uint256 => Etape[]) private historiques;
    mapping(uint256 => Demande) private demandes;
    mapping(uint256 => uint256) public demandeEnCours; // donId => demandeId (0 = aucune)

    event DonEnregistre(uint256 indexed donId, bytes32 indexed donneurId, GroupeSanguin groupe, address par, uint256 date);
    event StatutChange(uint256 indexed donId, Statut ancien, Statut nouveau, address par, uint256 date);
    event AnalyseEnregistree(uint256 indexed donId, bytes32 hashAnalyse, bool valide, address par, uint256 date);
    event GroupeCorrige(uint256 indexed donId, GroupeSanguin ancien, GroupeSanguin nouveau, string motif, address par, uint256 date);
    event DemandeCreee(uint256 indexed demandeId, uint256 indexed donId, address indexed medecin, bytes32 patientId, GroupeSanguin groupePatient, uint256 date);
    event DemandeTraitee(uint256 indexed demandeId, uint256 indexed donId, StatutDemande statut, string motif, address par, uint256 date);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier donExiste(uint256 donId) {
        require(donId > 0 && donId <= compteurDons, "Don introuvable");
        _;
    }

    // ---------- AGENT : de la collecte au stockage ----------

    function enregistrerDon(bytes32 donneurId, GroupeSanguin groupe)
        external onlyRole(AGENT_ROLE) returns (uint256 donId)
    {
        compteurDons++;
        donId = compteurDons; // identifiant unique automatique
        dons[donId] = Don(donId, donneurId, groupe, Statut.Enregistre, block.timestamp);
        historiques[donId].push(Etape(Statut.Enregistre, msg.sender, block.timestamp));
        emit DonEnregistre(donId, donneurId, groupe, msg.sender, block.timestamp);
    }

    function demarrerAnalyse(uint256 donId) external onlyRole(AGENT_ROLE) donExiste(donId) {
        _exiger(donId, Statut.Enregistre);
        _changerStatut(donId, Statut.EnAnalyse);
    }

    // Correction possible seulement avant la validation, motif obligatoire.
    // L'ancienne valeur reste visible dans l'event (rien n'est effacé).
    function corrigerGroupe(uint256 donId, GroupeSanguin nouveau, string calldata motif)
        external onlyRole(AGENT_ROLE) donExiste(donId)
    {
        Statut s = dons[donId].statut;
        require(s == Statut.Enregistre || s == Statut.EnAnalyse, "Correction impossible apres l'analyse");
        require(bytes(motif).length > 0, "Motif obligatoire");
        GroupeSanguin ancien = dons[donId].groupe;
        require(ancien != nouveau, "Meme groupe");
        dons[donId].groupe = nouveau;
        emit GroupeCorrige(donId, ancien, nouveau, motif, msg.sender, block.timestamp);
    }

    function validerDon(uint256 donId, bytes32 hashAnalyse) external onlyRole(AGENT_ROLE) donExiste(donId) {
        _exiger(donId, Statut.EnAnalyse);
        _changerStatut(donId, Statut.Valide);
        emit AnalyseEnregistree(donId, hashAnalyse, true, msg.sender, block.timestamp);
    }

    function rejeterDon(uint256 donId, bytes32 hashAnalyse) external onlyRole(AGENT_ROLE) donExiste(donId) {
        _exiger(donId, Statut.EnAnalyse);
        _changerStatut(donId, Statut.Rejete);
        emit AnalyseEnregistree(donId, hashAnalyse, false, msg.sender, block.timestamp);
    }

    function stockerDon(uint256 donId) external onlyRole(AGENT_ROLE) donExiste(donId) {
        _exiger(donId, Statut.Valide);
        _changerStatut(donId, Statut.Stocke);
    }

    // ---------- MEDECIN : demande d'une poche ----------

    // Le médecin demande le don X pour un patient. La poche doit être Stockée
    // et compatible. Elle passe à Reserve : personne d'autre ne peut la demander.
    function demanderPoche(uint256 donId, bytes32 patientId, GroupeSanguin groupePatient)
        external onlyRole(MEDECIN_ROLE) donExiste(donId) returns (uint256 demandeId)
    {
        _exiger(donId, Statut.Stocke);
        require(estCompatible(dons[donId].groupe, groupePatient), "Groupe incompatible avec le patient");

        compteurDemandes++;
        demandeId = compteurDemandes;
        demandes[demandeId] = Demande(demandeId, donId, msg.sender, patientId, groupePatient, StatutDemande.EnAttente, block.timestamp);
        demandeEnCours[donId] = demandeId;

        _changerStatut(donId, Statut.Reserve);
        emit DemandeCreee(demandeId, donId, msg.sender, patientId, groupePatient, block.timestamp);
    }

    // Seul le médecin qui a fait la demande peut l'annuler : la poche redevient Stockée.
    function annulerDemande(uint256 demandeId) external onlyRole(MEDECIN_ROLE) {
        Demande storage d = _demandeEnAttente(demandeId);
        require(d.medecin == msg.sender, "Seul le medecin demandeur peut annuler");
        d.statut = StatutDemande.Annulee;
        _liberer(d.donId);
        emit DemandeTraitee(demandeId, d.donId, StatutDemande.Annulee, "", msg.sender, block.timestamp);
    }

    // ---------- AGENT : traitement de la demande ----------

    function accepterDemande(uint256 demandeId) external onlyRole(AGENT_ROLE) {
        Demande storage d = _demandeEnAttente(demandeId);
        d.statut = StatutDemande.Acceptee;
        demandeEnCours[d.donId] = 0;
        _changerStatut(d.donId, Statut.Distribue);
        emit DemandeTraitee(demandeId, d.donId, StatutDemande.Acceptee, "", msg.sender, block.timestamp);
    }

    function refuserDemande(uint256 demandeId, string calldata motif) external onlyRole(AGENT_ROLE) {
        require(bytes(motif).length > 0, "Motif obligatoire");
        Demande storage d = _demandeEnAttente(demandeId);
        d.statut = StatutDemande.Refusee;
        _liberer(d.donId);
        emit DemandeTraitee(demandeId, d.donId, StatutDemande.Refusee, motif, msg.sender, block.timestamp);
    }

    // ---------- Consultation (ouverte à tous) ----------

    function getDon(uint256 donId) external view donExiste(donId) returns (Don memory) {
        return dons[donId];
    }

    // État actuel + historique complet, lisible directement sans parser les events
    function getHistorique(uint256 donId) external view donExiste(donId) returns (Etape[] memory) {
        return historiques[donId];
    }

    function getDemande(uint256 demandeId) external view returns (Demande memory) {
        require(demandeId > 0 && demandeId <= compteurDemandes, "Demande introuvable");
        return demandes[demandeId];
    }

    // Liste paginée : listerDons(1, 20) = les 20 premiers dons
    function listerDons(uint256 debut, uint256 limite) external view returns (Don[] memory liste) {
        require(limite > 0, "Limite invalide");
        if (debut == 0) debut = 1;
        if (debut > compteurDons) return new Don[](0);
        uint256 fin = debut + limite - 1;
        if (fin > compteurDons) fin = compteurDons;
        liste = new Don[](fin - debut + 1);
        for (uint256 i = debut; i <= fin; i++) liste[i - debut] = dons[i];
    }

    function listerDemandes(uint256 debut, uint256 limite) external view returns (Demande[] memory liste) {
        require(limite > 0, "Limite invalide");
        if (debut == 0) debut = 1;
        if (debut > compteurDemandes) return new Demande[](0);
        uint256 fin = debut + limite - 1;
        if (fin > compteurDemandes) fin = compteurDemandes;
        liste = new Demande[](fin - debut + 1);
        for (uint256 i = debut; i <= fin; i++) liste[i - debut] = demandes[i];
    }

    // Compatibilité des globules rouges : le receveur ne doit pas avoir
    // d'antigène (A, B ou Rhésus +) que le donneur possède et que lui n'a pas.
    function estCompatible(GroupeSanguin donneur, GroupeSanguin receveur) public pure returns (bool) {
        if (_aA(donneur) && !_aA(receveur)) return false;
        if (_aB(donneur) && !_aB(receveur)) return false;
        if (_rhPositif(donneur) && !_rhPositif(receveur)) return false;
        return true;
    }

    // ---------- Interne ----------

    function _aA(GroupeSanguin g) internal pure returns (bool) {
        return g == GroupeSanguin.APos || g == GroupeSanguin.ANeg || g == GroupeSanguin.ABPos || g == GroupeSanguin.ABNeg;
    }

    function _aB(GroupeSanguin g) internal pure returns (bool) {
        return g == GroupeSanguin.BPos || g == GroupeSanguin.BNeg || g == GroupeSanguin.ABPos || g == GroupeSanguin.ABNeg;
    }

    function _rhPositif(GroupeSanguin g) internal pure returns (bool) {
        return g == GroupeSanguin.APos || g == GroupeSanguin.BPos || g == GroupeSanguin.ABPos || g == GroupeSanguin.OPos;
    }

    function _exiger(uint256 donId, Statut attendu) internal view {
        require(dons[donId].statut == attendu, "Statut incorrect pour cette action");
    }

    function _changerStatut(uint256 donId, Statut nouveau) internal {
        Statut ancien = dons[donId].statut;
        dons[donId].statut = nouveau;
        historiques[donId].push(Etape(nouveau, msg.sender, block.timestamp));
        emit StatutChange(donId, ancien, nouveau, msg.sender, block.timestamp);
    }

    function _liberer(uint256 donId) internal {
        demandeEnCours[donId] = 0;
        _changerStatut(donId, Statut.Stocke);
    }

    function _demandeEnAttente(uint256 demandeId) internal view returns (Demande storage d) {
        require(demandeId > 0 && demandeId <= compteurDemandes, "Demande introuvable");
        d = demandes[demandeId];
        require(d.statut == StatutDemande.EnAttente, "Demande deja traitee");
    }
}