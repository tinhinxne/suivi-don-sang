// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract SuiviDonSang is AccessControl {
    bytes32 public constant CENTRE_ROLE = keccak256("CENTRE_ROLE");
    bytes32 public constant LABORATOIRE_ROLE = keccak256("LABORATOIRE_ROLE");

    enum Statut { Enregistre, Valide, Rejete, Stocke, Distribue }

    struct Don {
        bytes32 donneurId; // identifiant pseudonymisé, jamais de nom
        Statut statut;
        uint256 dateEnregistrement;
        bool existe;
    }

    mapping(bytes32 => Don) private dons;

    event DonEnregistre(bytes32 indexed donId, bytes32 indexed donneurId, address par, uint256 date);
    event DonValide(bytes32 indexed donId, bytes32 hashAnalyse, address par, uint256 date);
    event DonRejete(bytes32 indexed donId, bytes32 hashAnalyse, address par, uint256 date);
    event DonStocke(bytes32 indexed donId, address par, uint256 date);
    event DonDistribue(bytes32 indexed donId, bytes32 destinataireId, address par, uint256 date);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function enregistrerDon(bytes32 donId, bytes32 donneurId) external onlyRole(CENTRE_ROLE) {
        require(!dons[donId].existe, "Don deja enregistre");
        dons[donId] = Don(donneurId, Statut.Enregistre, block.timestamp, true);
        emit DonEnregistre(donId, donneurId, msg.sender, block.timestamp);
    }

    function validerDon(bytes32 donId, bytes32 hashAnalyse) external onlyRole(LABORATOIRE_ROLE) {
        _exiger(donId, Statut.Enregistre);
        dons[donId].statut = Statut.Valide;
        emit DonValide(donId, hashAnalyse, msg.sender, block.timestamp);
    }

    function rejeterDon(bytes32 donId, bytes32 hashAnalyse) external onlyRole(LABORATOIRE_ROLE) {
        _exiger(donId, Statut.Enregistre);
        dons[donId].statut = Statut.Rejete;
        emit DonRejete(donId, hashAnalyse, msg.sender, block.timestamp);
    }

    function stockerDon(bytes32 donId) external onlyRole(CENTRE_ROLE) {
        _exiger(donId, Statut.Valide);
        dons[donId].statut = Statut.Stocke;
        emit DonStocke(donId, msg.sender, block.timestamp);
    }

    function distribuerDon(bytes32 donId, bytes32 destinataireId) external onlyRole(CENTRE_ROLE) {
        _exiger(donId, Statut.Stocke);
        dons[donId].statut = Statut.Distribue;
        emit DonDistribue(donId, destinataireId, msg.sender, block.timestamp);
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