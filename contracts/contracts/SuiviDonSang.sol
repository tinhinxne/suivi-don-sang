// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract SuiviDonSang is AccessControl {
    bytes32 public constant CENTRE_ROLE = keccak256("CENTRE_ROLE");
    bytes32 public constant LABORATOIRE_ROLE = keccak256("LABORATOIRE_ROLE");

    enum Statut { Enregistre, EnAnalyse, Valide, Rejete, Stocke, Distribue }

    // Groupe sanguin + rhésus : 8 valeurs possibles, impossible d'en inventer une autre
    enum GroupeSanguin { APos, ANeg, BPos, BNeg, ABPos, ABNeg, OPos, ONeg }

    struct Don {
        bytes32 donneurId; // identifiant pseudonymisé, jamais de nom
        GroupeSanguin groupe;
        Statut statut;
        uint256 dateEnregistrement;
        bool existe;
    }

    mapping(bytes32 => Don) private dons;

    event DonEnregistre(bytes32 indexed donId, bytes32 indexed donneurId, GroupeSanguin groupe, address par, uint256 date);
    event AnalyseDemarree(bytes32 indexed donId, address par, uint256 date);
    event GroupeCorrige(bytes32 indexed donId, GroupeSanguin ancien, GroupeSanguin nouveau, string motif, address par, uint256 date);
    event DonValide(bytes32 indexed donId, bytes32 hashAnalyse, address par, uint256 date);
    event DonRejete(bytes32 indexed donId, bytes32 hashAnalyse, address par, uint256 date);
    event DonStocke(bytes32 indexed donId, address par, uint256 date);
    event DonDistribue(bytes32 indexed donId, bytes32 destinataireId, GroupeSanguin groupePatient, address par, uint256 date);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function enregistrerDon(bytes32 donId, bytes32 donneurId, GroupeSanguin groupe) external onlyRole(CENTRE_ROLE) {
        require(!dons[donId].existe, "Don deja enregistre");
        dons[donId] = Don(donneurId, groupe, Statut.Enregistre, block.timestamp, true);
        emit DonEnregistre(donId, donneurId, groupe, msg.sender, block.timestamp);
    }

    // Collecte -> Analyse
    function demarrerAnalyse(bytes32 donId) external onlyRole(LABORATOIRE_ROLE) {
        _exiger(donId, Statut.Enregistre);
        dons[donId].statut = Statut.EnAnalyse;
        emit AnalyseDemarree(donId, msg.sender, block.timestamp);
    }

    // Correction du groupe : possible seulement avant la validation, motif obligatoire.
    // L'ancienne valeur reste visible dans l'événement GroupeCorrige (rien n'est effacé).
    function corrigerGroupe(bytes32 donId, GroupeSanguin nouveau, string calldata motif) external {
        require(hasRole(CENTRE_ROLE, msg.sender) || hasRole(LABORATOIRE_ROLE, msg.sender), "Role non autorise");
        require(dons[donId].existe, "Don introuvable");
        Statut s = dons[donId].statut;
        require(s == Statut.Enregistre || s == Statut.EnAnalyse, "Correction impossible apres l'analyse");
        require(bytes(motif).length > 0, "Motif obligatoire");
        GroupeSanguin ancien = dons[donId].groupe;
        require(ancien != nouveau, "Meme groupe");
        dons[donId].groupe = nouveau;
        emit GroupeCorrige(donId, ancien, nouveau, motif, msg.sender, block.timestamp);
    }

    function validerDon(bytes32 donId, bytes32 hashAnalyse) external onlyRole(LABORATOIRE_ROLE) {
        _exiger(donId, Statut.EnAnalyse);
        dons[donId].statut = Statut.Valide;
        emit DonValide(donId, hashAnalyse, msg.sender, block.timestamp);
    }

    function rejeterDon(bytes32 donId, bytes32 hashAnalyse) external onlyRole(LABORATOIRE_ROLE) {
        _exiger(donId, Statut.EnAnalyse);
        dons[donId].statut = Statut.Rejete;
        emit DonRejete(donId, hashAnalyse, msg.sender, block.timestamp);
    }

    function stockerDon(bytes32 donId) external onlyRole(CENTRE_ROLE) {
        _exiger(donId, Statut.Valide);
        dons[donId].statut = Statut.Stocke;
        emit DonStocke(donId, msg.sender, block.timestamp);
    }

    // Distribution : la poche doit etre Stockee ET compatible avec le groupe du patient
    function distribuerDon(bytes32 donId, bytes32 destinataireId, GroupeSanguin groupePatient) external onlyRole(CENTRE_ROLE) {
        _exiger(donId, Statut.Stocke);
        require(estCompatible(dons[donId].groupe, groupePatient), "Groupe incompatible avec le patient");
        dons[donId].statut = Statut.Distribue;
        emit DonDistribue(donId, destinataireId, groupePatient, msg.sender, block.timestamp);
    }

    // Compatibilite des globules rouges : le receveur ne doit pas avoir
    // un antigene (A, B ou Rhesus +) que le donneur possede et que lui n'a pas.
    function estCompatible(GroupeSanguin donneur, GroupeSanguin receveur) public pure returns (bool) {
        if (_aA(donneur) && !_aA(receveur)) return false;
        if (_aB(donneur) && !_aB(receveur)) return false;
        if (_rhPositif(donneur) && !_rhPositif(receveur)) return false;
        return true;
    }

    function _aA(GroupeSanguin g) internal pure returns (bool) {
        return g == GroupeSanguin.APos || g == GroupeSanguin.ANeg || g == GroupeSanguin.ABPos || g == GroupeSanguin.ABNeg;
    }

    function _aB(GroupeSanguin g) internal pure returns (bool) {
        return g == GroupeSanguin.BPos || g == GroupeSanguin.BNeg || g == GroupeSanguin.ABPos || g == GroupeSanguin.ABNeg;
    }

    function _rhPositif(GroupeSanguin g) internal pure returns (bool) {
        return g == GroupeSanguin.APos || g == GroupeSanguin.BPos || g == GroupeSanguin.ABPos || g == GroupeSanguin.OPos;
    }

    function getDon(bytes32 donId) external view returns (Don memory) {
        require(dons[donId].existe, "Don introuvable");
        return dons[donId];
    }

    function _exiger(bytes32 donId, Statut attendu) internal view {
        require(dons[donId].existe, "Don introuvable");
        require(dons[donId].statut == attendu, "Statut incorrect pour cette action");
    }
}