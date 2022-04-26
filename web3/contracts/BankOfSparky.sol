pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract BankOfSparky {

    mapping(address => uint) public balances;
    address[] public accounts;

    event Deposit(address indexed account, uint amt, string desc, uint timestamp);
    event Withdrawal(address indexed account, uint amt, string desc, uint timestamp);

    constructor() {
    }

    function deposit(string calldata desc) public payable {
        require(msg.value > 0, "Must send ETH to deposit");
        recordAccount(msg.sender);
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, desc, block.timestamp);
    }

    function withdraw(uint amt, string calldata desc) public {
        require(balances[msg.sender] >= amt, "Insufficient funds");
        require(amt > 0, "Withdrawal amount must be positive");
        balances[msg.sender] -= amt;
        payable(msg.sender).transfer(amt);
        emit Withdrawal(msg.sender, amt, desc, block.timestamp);
    }

    function recordAccount(address account) private {
        for (uint i = 0; i < accounts.length; i++) {
            if (accounts[i] == account) {
                return;
            }
        }
        accounts.push(account);
    }

    function allAccounts() external view returns (address[] memory) {
        return accounts;
    }
}
