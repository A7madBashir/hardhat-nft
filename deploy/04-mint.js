const { network, ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
    console.log("Minting Section!")
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // Basic NFT
    const basicNft = await ethers.getContract("BasicNft", deployer)
    const basicMintTx = await basicNft.mintNft()
    const lastTokenCounterForBasic = await basicNft.getTokenCounter()
    await basicMintTx.wait(1)
    console.log(
        `Basic NFT index ${lastTokenCounterForBasic} tokenURI: ${await basicNft.tokenURI(
            lastTokenCounterForBasic
        )}`
    )

    // Dynamic SVG  NFT
    const highValue = ethers.utils.parseEther("1000")
    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    const lastTokenCounterForRandom = await dynamicSvgNft.getTokenCounter()
    console.log(`Last Token Counter: ${lastTokenCounterForRandom}`)
    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue)
    await dynamicSvgNftMintTx.wait(1)
    console.log(
        `Dynamic SVG NFT index ${lastTokenCounterForRandom} tokenURI: ${await dynamicSvgNft.tokenURI(
            lastTokenCounterForRandom
        )}`
    )

    // Random IPFS NFT
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()
    const randomIpfsNftMintTx = await randomIpfsNft.requestNft({
        value: mintFee.toString(),
    })
    const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)
    const lastTokenCounterForDynamic = await randomIpfsNft.getTokenCounter()

    // Need to listen for response
    await new Promise(async (resolve, reject) => {
        setTimeout(
            () => reject("Timeout: 'NFTMinted' event did not fire"),
            300000
        ) // 5 minute timeout time
        // setup listener for our event
        randomIpfsNft.once("NftMinted", async () => {
            console.log("Nft Minted")
            resolve()
        })
        if (chainId == 31337) {
            const requestId =
                randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract(
                "VRFCoordinatorV2Mock",
                deployer
            )
            await vrfCoordinatorV2Mock.fulfillRandomWords(
                requestId,
                randomIpfsNft.address
            )
        }
    })
    console.log(
        `Random IPFS NFT index ${lastTokenCounterForDynamic} tokenURI: ${await randomIpfsNft.tokenURI(
            lastTokenCounterForDynamic
        )}`
    )
}
module.exports.tags = ["all", "mint"]
