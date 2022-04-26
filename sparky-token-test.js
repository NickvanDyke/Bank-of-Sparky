const { expect } = require("chai");
const { ethers } = require("hardhat");

let SparkyFactory;
let bankOfSparky;
let owner, addr1;

beforeEach(async () => {
	SparkyFactory = await ethers.getContractFactory("BankOfSparky");
	bankOfSparky = await SparkyFactory.deploy();
	await bankOfSparky.deployed();
	[owner, addr1] = await ethers.getSigners();
})

describe("BankOfSparky", () => {
	describe("Deployment", () => {
		it("Should set minter to deployer", async () => {
			expect(await bankOfSparky.minter()).to.equal(owner.address)
		})
	})

	describe("Minting", () => {
		it('Should allow owner to add to recipient balance', async () => {
			const mintTx = await bankOfSparky.connect(owner).mint(owner.address, 100)
			await mintTx.wait()
			expect(await bankOfSparky.balances(owner.address)).to.equal(100)
		})

		it('Should be disallowed by non-owners', async() => {
			await expect(
				bankOfSparky.connect(addr1).mint(addr1, 1_000_000)
			).to.be.reverted
		})

		it('Should record newly minted addresses', async () => {
			await expect(await bankOfSparky.allAddresses()).to.be.empty

			const mintTx = await bankOfSparky.mint(addr1.address, 100)
			await mintTx.wait()

			const addresses = await bankOfSparky.allAddresses()
			expect(addresses.length).to.equal(1)
			expect(addresses[0]).to.equal(addr1.address)
		})

		it("Should increment supply", async () => {
			const mintTx = await bankOfSparky.mint(owner.address, 100)
			await mintTx.wait()

			expect(await bankOfSparky.supply()).to.equal(100)
		})

		it("Should emit event", async () => {
			expect(bankOfSparky.mint(owner.address, 100)).to.emit(bankOfSparky, "Mint").withArgs(owner.address, 100)
		})
	});

	describe("Transactions", () => {
		it("Should fail with insufficient balance", async () => {
			expect(await bankOfSparky.balances(addr1.address)).to.equal(0)
			await expect(
				bankOfSparky.connect(addr1).send(owner.address, 100)
			).to.be.reverted
		})

		it("Should update sender and receiver balances", async () => {
			const mintTx = await bankOfSparky.mint(owner.address, 100)
			await mintTx.wait()

			const sendTx = await bankOfSparky.send(addr1.address, 50)
			await sendTx.wait()

			expect(await bankOfSparky.balances(owner.address)).to.equal(50)
			expect(await bankOfSparky.balances(addr1.address)).to.equal(50)
		})

		it("Should record new recipients", async () => {
			const mintTx = await bankOfSparky.mint(owner.address, 100)
			await mintTx.wait()

			const sendTx = await bankOfSparky.send(addr1.address, 50)
			await sendTx.wait()

			const addresses = await bankOfSparky.allAddresses()
			expect(addresses.length).to.equal(2)
			expect(addresses[1]).to.equal(addr1.address)
		})
	})
})
