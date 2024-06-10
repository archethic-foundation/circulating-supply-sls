import Archethic from "@archethicjs/sdk";
const archethic = new Archethic("https://mainnet.archethic.net");

const MAX_SUPPLY = 100000000000000000n;
const BURN_ADDRESS =
  "00000000000000000000000000000000000000000000000000000000000000000000";
const REWARD_GENESIS_ADDRESS =
  "000088CCDFB1DAC2B12C0BBD41A7AC0308693AF9DA0DE045FD2A11E3CE0BA9A49CA2";
const MUCO_TOKEN_ADDRESS =
  "00009DDC727B57C1AE04482B4228ED5F00B8806C2639469CC7120ACDF5CAD2FBCF26";
const GENESIS_POOLS = [
  "0000E0EF0C5A8242D7F743E452E3089B7ACAC43763A3F18C8F5DD38D22299B61CE0E",
  "000047C827E93C4F1106906D3F43546EB09176F03DFF15275759D47BF33D9B0D168A",
  "000012023D76D65F4A20E563682522576963E36789897312CB6623FDF7914B60ECEF",
  "00004769C94199BCA872FFAFA7CE912F6DE4DD8B2B1F4A41985CD25F3C4A190C72BB",
  "0000DBE5D04070411325BA8254BC0CE005DF30EBFDFEEFADBC6659FA3D5FA3263DFD",
  "0000BB90E7EC3051BF7BE8D2BF766DA8BED88AFA696D282ACF5FF8479CE787397E16",
  "000050CEEE9CEEB411FA027F1FB9247FE04297FF00358D87DE4B7B8F2A7051DF47F7",
];

export async function main(args) {
  console.log("connecting");
  await archethic.connect();
  console.log("connected");

  const [totalAmount, premintAmount] = await Promise.all([
    totalSupply(),
    premint(),
  ]);
  console.log("totalAmount", totalAmount);
  console.log("premint", premintAmount);

  const circulatingSupply = totalAmount - premintAmount;
  const integerPart = circulatingSupply / 100_000_000n;
  const decimalPart = circulatingSupply % 100_000_000n;

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

async function premint() {
  let promises = [];

  for (const address of GENESIS_POOLS) {
    promises.push(getUCOBalance(address));
  }

  const balances = await Promise.all(promises);
  return balances.reduce((a, b) => a + b, 0n);
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
