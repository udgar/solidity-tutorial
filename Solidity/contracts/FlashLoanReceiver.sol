// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./FlashLoan.sol";
import "./Token.sol";

contract FlashLoanReceiver {
    FlashLoan private pool;
    address private owner;

    event LoanReceived(address token,uint256 amount);

    constructor(address _poolAddress){
        pool=FlashLoan(_poolAddress);
        owner=msg.sender;
    }

    function receiveTokens(address _tokenAddress,uint256 _amount) external{
        require(msg.sender==address(pool),"Sender must be pool");
        //Do smthn with money
        require(Token(_tokenAddress).balanceOf(address(this))==_amount);
        //Emit event
        emit LoanReceived(_tokenAddress,_amount);
        //Send back the money
        require(Token(_tokenAddress).transfer(msg.sender, _amount));
    }

    function executeFlashLoan(uint _amount) external{
        require(msg.sender==owner);
        pool.flashLoan(_amount);
    }
}
