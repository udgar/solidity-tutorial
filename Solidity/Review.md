The overview of what we did here:

#Contracts 

#Simple 
    First of all there is a simple contract. It just uses the functionality of OOP in ordeer to explain basics of Solidity programming language.

#NFTs
    There are two contracts involved in this one the first is  `RealState.sol` which is copied and contains all the NFTs function IPF addresses and functionalities to transfer NFTS. And another is `Ecsrow.sol` where transfer of NFTs take place.

    In `Escrow.sol` many checks and functionalities are implemented. Various modifiers are used as well. Modifiers are the function that is appended alongside functions so that the function can execute only when the condition in the modifiers are met.
    Examples:
    ```
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
    ```
    Here are two modifiers that checks if the deposited amount is greater than escrow amount. And another modifier checks whether the inspection for the sender is the inspector of the transfer or not.

    In `Escrow.sol` the constructor is defined like this. 

    ```
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
    ```
    Here, nftAddress is the address of the NFT in the `RealEstate.sol` and nftId is the id for NFTS. Other field are preety self explanatory and can be traced in the code. 

    There are three main functions that we need to be aware of.

    ```
        function updateInspectionStatus(bool _passed) public onlyInspector {
        inspectionPassed = _passed;
    }

    function approveSale() public {
        approval[msg.sender] = true;
    }

    function depositEarnest() public payable onlyBuyIf {}

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

    ```

    Here, updateInspectionStatus means inspection should be done by inspector only and no one else. And approveSale is the method that approves the sale for all the involved parties. And finally, finalizeSale() which maintains various require function and finally transfer the money to seller and NFTs to buyer.
    ```
        (bool sucess,)=payable(seller).call{value:address(this).balance}("");
        require(sucess);
        IERC721(nftAddress).transferFrom(seller, buyer, nftId);
    ```
    Here is how whole NFT transfer process takes place.

# Flash Loan 
    Another topic that was covered here was the Flash Loan which was covered in three contracts `Token.sol` which is the custom Token that can be used to conduct transaction. It consist the functionality to convert ether to token and back and has the functionality to transfer the token from one address to another. And there is the contracts called `FlashLoan.sol` and `FlashLoanReceiver.sol`. Here `FlashLoan.sol` is the pool where the tokens can be deposited and `FlashLoanReceiver.sol` is the one that calls in order to get some tokens as loans and pays back in the single contract.

    In the Flash loan pool first the token is transfered by the owner from which others can take out the loan.

    ```
        function depositTokens(uint256 _amount) external nonReentrant{
        require(_amount>0);
        token.transferFrom(msg.sender,address(this), _amount);
        poolBalance=poolBalance.add(_amount );}
    ```
    Now from the poolBalance receiver can take out the loan. It also applies the function for flash loan.
    ```
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
    ```
    As for the `FlashLoanReceiver.sol` it takes out the loan and deposits the token again to the same address(pool).

    ```
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
    ```




