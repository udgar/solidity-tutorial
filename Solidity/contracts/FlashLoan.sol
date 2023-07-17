// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IReceiver {
    function receiveTokens(address _tokenAddress,uint256 _amount) external;
}

contract FlashLoan is ReentrancyGuard{
    using SafeMath for uint256;

    Token public token;
    uint256 public poolBalance;

    constructor(address _tokenAddress){
        token=Token(_tokenAddress);
    }

    function depositTokens(uint256 _amount) external nonReentrant{
        require(_amount>0);
        token.transferFrom(msg.sender,address(this), _amount);
        poolBalance=poolBalance.add(_amount );
    }

    function flashLoan(uint256 _borrowAmount) external nonReentrant{
        require(_borrowAmount>0,"Must burrow atleast one token");
        uint256 balanceBefore=token.balanceOf(address(this));
        require(balanceBefore>=_borrowAmount,"Not enough tokens in the pool");
        require(poolBalance==balanceBefore);
        //Send tokens to receiver
        token.transfer(msg.sender, _borrowAmount); 

        //use loan,Get paid back
        IReceiver(msg.sender).receiveTokens(address(token), _borrowAmount);

        //Ensure loan paid back
        uint256 balanceAfter=token.balanceOf(address(this));
        require(balanceAfter>=balanceBefore,"Flash loan hasn't been paid back");
    }

}