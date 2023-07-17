const { expect } = require('chai')
const { ethers } = require('hardhat')

describe("Rentracy", () => {
    let deployer, user, attacker
    let bank, attackerContract
    it("Deployment", async () => {
        let accounts = await ethers.getSigners()
        deployer = accounts[0]
        user = accounts[1]
        attacker = accounts[2]
        const Bank = await ethers.getContractFactory('Bank', deployer);
        bank = await Bank.deploy()
        const Attacker = await ethers.getContractFactory('Attacker',attacker);
        attackerContract = await Attacker.deploy(bank.address)
        await bank.connect(deployer).deposit({ value: ethers.utils.parseEther('100') })
    })

    describe('Test deposits and withdrawals', () => {
        it('accepts deposit', async () => {
            let balance = await bank.balanceOf(deployer.address)
            expect(balance).to.equal(ethers.utils.parseEther('100'))

            let balanceUser = await bank.balanceOf(deployer.address)
            expect(balanceUser).to.equal(ethers.utils.parseEther('100'))
        })

        it('accepts withdrawals', async () => {
            await bank.withdrawFunds()

            let balance = await bank.balanceOf(deployer.address)
            expect(balance).to.equal(ethers.utils.parseEther('0'))

            let balanceUser = await bank.balanceOf(user.address)
            expect(balanceUser).to.equal(0)
        })

        it('allows attacker to drain fund', async () => {
            console.log("*****Before*****")
            console.log(`The bank fund is : ${ethers.utils.formatEther(await ethers.provider.getBalance(bank.address))}`)
            console.log(`The bank fund is : ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address))}`)
            //Perform attack
            await attackerContract.attack({value:ethers.utils.parseEther('10')});
            console.log("***After")
            console.log(`The bank fund is : ${ethers.utils.formatEther(await ethers.provider.getBalance(bank.address))}`)
            console.log(`The attacker fund is : ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address))}`)
            let balanceBank=await ethers.provider.getBalance(bank.address)
            expect(balanceBank).to.equal(0)
        })
    })
})