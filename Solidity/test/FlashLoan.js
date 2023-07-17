const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n, 'ether')
}
const ether = tokens

describe("Flash Loan", () => {
    let token,flashLoan,flashLoanReceiver
    beforeEach(async () => {
        //Setup the accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        const FlashLoan = await ethers.getContractFactory('FlashLoan')
        const FlashLoanReceiver = await ethers.getContractFactory('FlashLoanReceiver')
        const Token = await ethers.getContractFactory('Token')

        token=await Token.deploy('Udgar University','UKToken','1000000')
        // Deploy Flash Loan
        flashLoan=await FlashLoan.deploy(token.address)
        //Call approve first
        let transaction=await token.connect(deployer).approve(flashLoan.address,tokens('1000000'))
        await transaction.wait()
        //Deposit tokens in the pool
        transaction=await flashLoan.connect(deployer).depositTokens(tokens('1000000'))
        await transaction.wait()

        //Deploy flash loan receiver
        flashLoanReceiver=await FlashLoanReceiver.deploy(flashLoan.address)

    })

    describe("Deployment", () => {

        it('works', async () => {
            expect(await token.balanceOf(flashLoan.address)).to.equal(tokens('1000000'))
        })
    })

    describe('Borrowing Funds',()=>{
        it('Burrows funds from the pool', async()=>{
            let transaction=await flashLoanReceiver.connect(deployer).executeFlashLoan(tokens('1000000'))
            await transaction.wait()

            await expect(transaction).to.emit(flashLoanReceiver,'LoanReceived').withArgs(token.address,tokens('1000000'))
        })
    })
})