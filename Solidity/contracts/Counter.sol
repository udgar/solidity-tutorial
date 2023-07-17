// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Counter{

    string public name;

    uint public count;

    constructor() {
        name="My Counter";
        count=1;
    }

    function increaseCounter() public {
        count++;
    }

    modifier checkCount {
        require(count>=0);
        _;
    }

    function decrementCount() checkCount public{
        count--;
    }

    function setName(string memory _name) public returns(string memory){
        name=_name;
        return name;
    }
}