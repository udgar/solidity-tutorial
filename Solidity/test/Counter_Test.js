const {expect}=require('chai');
const {ethers} =require('hardhat');

describe('counter',()=>{
    let counter;

    beforeEach(async ()=>{
        const Counter=await ethers.getContractFactory('Counter');
        counter=await Counter.deploy();
    })

    describe('Deployment',()=>{
        it('sets the initial count',async()=>{
            const count=await counter.count();
            expect(count).to.equal(1);
        });
    
        it('sets the initial name',async()=>{
            const name=await counter.name();
            expect(name).to.equal("My Counter");
        });
    })

    describe('Counting',()=>{
        let transaction;
        it('increment the count',async()=>{
            transaction=await counter.increaseCounter();
            await transaction.wait();
            expect(await counter.count()).to.equal(2);

            transaction=await counter.increaseCounter();
            await transaction.wait();
            expect(await counter.count()).to.equal(3);
        })

        it('decrement the count',async()=>{
            transaction=await counter.decrementCount();
            await transaction.wait();
            expect(await counter.count()).to.equal(0);
            
            await expect(counter.decrementCount()).to.be.reverted;
        })

    })


})