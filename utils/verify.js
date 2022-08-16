const { run } = require("hardhat")

async function verify(contractAddress, args) {
    try {
        console.log("Verifing Your Contract...")
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified")
        } else {
            console.log(error)
        }
    }
}

module.exports.verify = verify
