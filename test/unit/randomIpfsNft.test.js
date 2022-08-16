const { assert, expect } = require("chai")
const { ethers, deployments, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

const AMOUNT = ethers.utils.parseEther("0.1")

describe("Testing Randomness Ipfs NFT", () => {
    let RandomIpfsNft, deployer, vrfCoordinatorV2Mock
    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["mocks", "randomipfs"])
        RandomIpfsNft = await ethers.getContract("RandomIpfsNft")
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    })

    describe("RequestNft", () => {
        it("Revert With Need More Eth", async function () {
            const response = await RandomIpfsNft.requestNft({
                value: AMOUNT,
            })
            await expect(response).to.be.revertedWith(
                "RandomIpfsNft_NeedMoreEthSent"
            )
        })
        it("Emit Event on Request", async function () {
            const fee = await RandomIpfsNft.getMintFee()
            await expect(
                RandomIpfsNft.requestNft({ value: fee.toString() })
            ).to.emit(RandomIpfsNft, "NftRequested")
        })
    })

    describe("fulfillRandomWords", () => {
        it("mints NFT after random number is returned", async function () {
            await new Promise(async (resolve, reject) => {
                RandomIpfsNft.once("NftMinted", async () => {
                    try {
                        const tokenUri = await RandomIpfsNft.tokenURI("0")
                        const tokenCounter =
                            await RandomIpfsNft.getTokenCounter()
                        assert.equal(
                            tokenUri.toString().includes("ipfs://"),
                            true
                        )
                        assert.equal(tokenCounter.toString(), "1")
                        resolve()
                    } catch (e) {
                        console.log(e)
                        reject(e)
                    }
                })
                try {
                    const fee = await RandomIpfsNft.getMintFee()
                    const requestNftResponse = await RandomIpfsNft.requestNft({
                        value: fee.toString(),
                    })
                    const requestNftReceipt = await requestNftResponse.wait(1)
                    await vrfCoordinatorV2Mock.fulfillRandomWords(
                        requestNftReceipt.events[1].args.requestId,
                        RandomIpfsNft.address
                    )
                } catch (e) {
                    console.log(e)
                    reject(e)
                }
            })
        })
    })
})
