// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;
    uint256 public nftId;
    uint256 public purchasePrice;
    uint256 public escrowAmount;
    address payable public seller;
    address payable public buyer;
    address public inspector;
    address public lender;

    modifier onlyBuyIf() {
        require(
            msg.value >= escrowAmount,
            "Balace should be greater than limit"
        );
        require(msg.sender == buyer, "Only Buyer can call this function");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only Buyer can call this function");
        _;
    }

    bool public inspectionPassed = false;

    mapping(address => bool) public approval;

    constructor(
        address _nftAddress,
        uint256 _nftId,
        uint256 _purchasePrice,
        uint256 _escrowAmount,
        address payable _buyer,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        nftId = _nftId;
        purchasePrice = _purchasePrice;
        escrowAmount = _escrowAmount;
        buyer = _buyer;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    function updateInspectionStatus(bool _passed) public onlyInspector {
        inspectionPassed = _passed;
    }

    function approveSale() public {
        approval[msg.sender] = true;
    }

    function depositEarnest() public payable onlyBuyIf {}

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    receive() external payable {}

    function finalizeSale() public {
        // Transfer the ownership of property
        require(inspectionPassed, "Only if inspection is passed");
        require(approval[buyer], "Not approved by buyer");
        require(approval[seller], "Not approved bt seller");
        require(approval[lender], "Not approved by lender");
        require(address(this).balance >= purchasePrice, "Not enough money");
        (bool sucess,)=payable(seller).call{value:address(this).balance}("");
        require(sucess);
        IERC721(nftAddress).transferFrom(seller, buyer, nftId);
    }
}
