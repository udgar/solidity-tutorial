const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n, 'ether')
}
const ether = tokens

describe('RealEstate', () => {
    let realEstate, escrow
    let deployer, seller
    let nftId = 1
    let purchasePrice = ether('100')
    let escrowAmount = ether('20')

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        seller = deployer
        buyer = accounts[1]
        inspector = accounts[2]
        lender = accounts[3]
        const RealEstate = await ethers.getContractFactory('RealEstate')
        const Escrow = await ethers.getContractFactory('Escrow')

        realEstate = await RealEstate.deploy()
        escrow = await Escrow.deploy(realEstate.address,
            nftId,
            purchasePrice,
            escrowAmount,
            buyer.address,
            seller.address,
            inspector.address,
            lender.address)

        transaction = await realEstate.connect(seller).approve(escrow.address, nftId)
        await transaction.wait()
    })

    describe('Deployment', async () => {
        it('send an NFT to the seller / deployer', async () => {
            expect(await realEstate.ownerOf(nftId)).to.equal(seller.address)
        })
    })

    describe('Selling Reastate', async () => {
        it('execute sucessfull transaction', async () => {
            let balance, transaction
            expect(await realEstate.ownerOf(nftId)).to.equal(seller.address)

            //Buyer deposits earnest
            transaction = await escrow.connect(buyer).depositEarnest({ value: ether('20') })
            //Get balance
            balance = await escrow.getBalance()
            console.log("Balance is:" + ethers.utils.formatEther(balance))
            // Inspect the sale
            transaction = await escrow.connect(inspector).updateInspectionStatus(true)
            await transaction.wait()
            console.log("Inspector Insepcts")
            //Buyer approve sales
            transaction = await escrow.connect(buyer).approveSale()
            await transaction.wait()
            //Seller approve sales
            transaction = await escrow.connect(seller).approveSale()
            await transaction.wait()
            //Lender funds the sale
            transaction = await lender.sendTransaction({ to: escrow.address, value: ether('80') })
            await transaction.wait()
            //Lender approve sales
            transaction = await escrow.connect(lender).approveSale()
            await transaction.wait()
            //Finalize the sale 
            transaction = await escrow.connect(buyer).finalizeSale()
            await transaction.wait()
            console.log("Buyer Finalizes Sale")
            expect(await realEstate.ownerOf(nftId)).to.equal(buyer.address)
            //Console log the balance of seller
            balance=await ethers.provider.getBalance(seller.address)
            console.log("Seller balance:", ethers.utils.formatEther(balance))
            expect(balance).to.be.above(ether("10099"))

        })
    })
})