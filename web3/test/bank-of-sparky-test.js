const { expect } = require("chai");
const { ethers } = require("hardhat");

let bankOfSparky;
let owner, addr1;

beforeEach(async () => {
    const BankOfSparkyFactory = await ethers.getContractFactory("BankOfSparky");
    bankOfSparky = await BankOfSparkyFactory.deploy();
    await bankOfSparky.deployed();
    [owner, addr1] = await ethers.getSigners();
})

describe("BankOfSparky", () => {
    describe("Deposit", () => {
        const option = { value: 100 }
        it("Should record the account", async () => {
            expect(await bankOfSparky.allAccounts()).to.be.empty

            const tx = await bankOfSparky.deposit("Yeet", option)
            await tx.wait()

            const addresses = await bankOfSparky.allAccounts()
            expect(addresses.length).to.equal(1)
            expect(addresses[0]).to.equal(owner.address)
        })

        it("Should increment the account's and contract's balance", async () => {
            const tx = await bankOfSparky.deposit("Yeet", option)
            await tx.wait()

            expect(await bankOfSparky.balances(owner.address)).to.equal(100)
            const contractBalance = await ethers.provider.getBalance(bankOfSparky.address)
            expect(contractBalance).to.equal(100)
        })

        it("Should emit event", async () => {
            const tx = bankOfSparky.deposit("Yeet", option)
            expect(tx).to.emit(bankOfSparky, "Deposit").withArgs(owner.address, 100, "Yeet")
        })
    })

    describe("Withdraw", () => {
        beforeEach(async () => {
            const option = { value: 100 }
            const tx = await bankOfSparky.deposit("Yeet", option)
            await tx.wait()
        })

        it("Should require sufficient balance", async () => {
            expect(bankOfSparky.withdraw(1000, "")).to.be.reverted
        })

        it("Should transfer funds and decrement account's balance", async () => {
            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address)

            const tx = await bankOfSparky.withdraw(50, "for friskies")
            const receipt = await tx.wait()

            const ownerBalanceAfter = await ethers.provider.getBalance(owner.address)
            const gasUsed = BigInt(receipt.cumulativeGasUsed) * BigInt(receipt.effectiveGasPrice)
            expect(ownerBalanceAfter).to.equal(ownerBalanceBefore.add(ethers.BigNumber.from(50)).sub(gasUsed))
            expect(await bankOfSparky.balances(owner.address)).to.equal(50)
        })

        it("Should emit event", async () => {
            const tx = bankOfSparky.withdraw(50, "just cuz")
            expect(tx).to.emit(bankOfSparky, "Withdrawal").withArgs(owner.address, 50, "just cuz")
        })
    })
})