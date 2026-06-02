// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract BoB {
    struct Transactions {
        string senderName;
        string receiverName;
        address fromBank;
        address toBank;
        uint256 amount;
        uint256 timeStamp;
    }

    mapping(address => uint256) public balances;
    Transactions[] public allTransactions;
    
    constructor(){
        balances[msg.sender] = 1000001;
    }
    
    event Transfer(string sender, string receiver, address indexed fromBank, address indexed toBank, uint256 amount, uint256 timestamp);

    function transferTo(string memory sender, string memory receiver, address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance !!");

        allTransactions.push(Transactions({
            senderName : sender,
            receiverName : receiver,
            fromBank : msg.sender,
            toBank : to,
            amount : amount,
            timeStamp : block.timestamp
        }));

        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(sender, receiver, msg.sender, to, amount, block.timestamp);
    }

    function allTxns() public view returns (Transactions[] memory) {
        return allTransactions;
    }

}