const JoyToken = artifacts.require("JoyToken");

module.exports = function(deployer) {
  deployer.deploy(JoyToken, 1000000)
};