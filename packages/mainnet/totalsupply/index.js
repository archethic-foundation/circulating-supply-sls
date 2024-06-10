import Archethic from "@archethicjs/sdk";
const archethic = new Archethic("https://mainnet.archethic.net");

const MAX_SUPPLY = 100000000000000000n;
const BURN_ADDRESS =
  "00000000000000000000000000000000000000000000000000000000000000000000";
const REWARD_GENESIS_ADDRESS =
  "000088CCDFB1DAC2B12C0BBD41A7AC0308693AF9DA0DE045FD2A11E3CE0BA9A49CA2";
const MUCO_TOKEN_ADDRESS =
  "00009DDC727B57C1AE04482B4228ED5F00B8806C2639469CC7120ACDF5CAD2FBCF26";

export async function main(args) {
  console.log("connecting");
  await archethic.connect();
  console.log("connected");

  const totalAmount = await totalSupply();
  const integerPart = totalAmount / 100_000_000n;
  const decimalPart = totalAmount % 100_000_000n;

  return {
    body: `${integerPart.toString()}.${decimalPart.toString()}`,
  };
}

async function totalSupply() {
  const [miningWallet, burnt] = await Promise.all([
    getTokenBalance(REWARD_GENESIS_ADDRESS, MUCO_TOKEN_ADDRESS),
    getUCOBalance(BURN_ADDRESS),
  ]);
  return MAX_SUPPLY - miningWallet - burnt;
}

async function getUCOBalance(address) {
  const balance = await archethic.network.getBalance(address);
  return BigInt(balance.uco);
}

async function getTokenBalance(chainAddress, tokenAddress) {
  const balance = await archethic.network.getBalance(chainAddress);
  const result = balance.token.find(({ address }) => address == tokenAddress);
  if (result) {
    return BigInt(result.amount);
  } else {
    return 0n;
  }
}
