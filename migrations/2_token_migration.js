const CrackleRivals = artifacts.require("CrackleRivals");

module.exports = async function (deployer) {
    await deployer.deploy(CrackleRivals);
    let nft = await CrackleRivals.deployed();
    console.log('NftContract: ', nft.address)
};
