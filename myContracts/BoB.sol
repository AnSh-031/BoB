// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract BoB {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant BANK_NODE_ROLE = keccak256("BANK_NODE_ROLE");

    struct Transactions {
        string senderName;
        string receiverName;
        address fromBank;
        address toBank;
        uint256 amount;
        uint256 timeStamp;
        string transactionHash;
    }

    mapping(bytes32 => mapping(address => bool)) private _roles;
    mapping(address => uint256) public balances;
    Transactions[] public allTransactions;

    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event Transfer(string sender, string receiver, address indexed fromBank, address indexed toBank, uint256 amount, uint256 timestamp, string txnHash);

    modifier onlyRole(bytes32 role) {
        require(_roles[role][msg.sender], "RBAC: Auth Failure - Account lacks required role");
        _;
    }

    constructor() {
        _roles[ADMIN_ROLE][msg.sender] = true;
        _roles[BANK_NODE_ROLE][msg.sender] = true; 
        balances[msg.sender] = 1000000 * 10**18;
    }

    function grantRole(bytes32 role, address account) public onlyRole(ADMIN_ROLE) {
        _roles[role][account] = true;
        emit RoleGranted(role, account, msg.sender);
    }

    function transferTo(
        string memory sender, 
        string memory receiver, 
        address to, 
        uint256 amount, 
        string memory txnHash
    ) public onlyRole(BANK_NODE_ROLE) {
        require(balances[msg.sender] >= amount, "Insufficient balance !!");

        allTransactions.push(Transactions({
            senderName : sender,
            receiverName : receiver,
            fromBank : msg.sender,
            toBank : to,
            amount : amount,
            timeStamp : block.timestamp,
            transactionHash : txnHash
        }));

        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(sender, receiver, msg.sender, to, amount, block.timestamp, txnHash);
    }

    function allTxns() public view onlyRole(BANK_NODE_ROLE) returns (Transactions[] memory) {
        return allTransactions;
    }
}