import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import redeemCodes from "../../redeemCodes";
import "../styles/globals.css";
import { NFT_COLLECTION_ADDRESS } from "../../const/yourDetails";
import GuildRole from "../../types/GuildRole";

export default async function server(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // De-structure the arguments we passed in out of the request body
    const { authorAddress, redeemCode } = JSON.parse(req.body);

    // You'll need to add your private key in a .env.local file in the root of your project
    // !!!!! NOTE !!!!! NEVER LEAK YOUR PRIVATE KEY to anyone!
    if (!process.env.PRIVATE_KEY) {
      throw new Error("You're missing PRIVATE_KEY in your .env.local file.");
    }

    // Initialize the Thirdweb SDK on the serverside
    const sdk = ThirdwebSDK.fromPrivateKey(
      // Your wallet private key (read it in from .env.local file)
      process.env.PRIVATE_KEY as string,
      "mumbai"
    );

    // Load the NFT Collection via it's contract address using the SDK
    const nftCollection = await sdk.getContract(
      // Use your NFT_COLLECTION_ADDRESS constant
      NFT_COLLECTION_ADDRESS,
      "nft-collection"
    );

    // Here we can make all kinds of cool checks to see if the user is eligible to mint the NFT.
    // Here are a few examples:

    // 1) Check that the user has finished the hunter challenge by following yourfather.lens and mirroring the post
    const phalaGuildRole: GuildRole = await fetch("https://api.guild.xyz/v1/role/56518").then((res) => res.json());
    const guildRoleMembers = phalaGuildRole.members;

    if (!guildRoleMembers.includes(authorAddress) && !redeemCodes.includes(redeemCode?.toLowerCase())) {
      res.status(400).json({ error: "You have not qualified for the Hunter's Challenge or presented a valid redemption code..." });
      return;
    }

    // 2) Check that this wallet hasn't already minted a page - 1 NFT per wallet
    const hasMinted = (await nftCollection.balanceOf(authorAddress)).gt(0);
    if (hasMinted) {
      res.status(400).json({ error: "Already minted" });
      return;
    }

    // If all the checks pass, begin generating the signature...
    // Generate the signature for the page NFT
    const signedPayload = await nftCollection.signature.generate({
      quantity: 1,
      to: authorAddress,
      metadata: {
        name: "Hunter Challenge",
        image: "ipfs://QmXZQaTHFuNnjznEes6cfU48qYfSomRwQgvP59FydrdxFa/lenster-campaign.jpeg",
        description: "Hunter Challenge Reward for following yourfather.lens and mirroring lenster post https://lenster.xyz/posts/0x8221-0x0f",
        // properties: {
        //   // Add any properties you want to store on the NFT
        // },
      },
    });

    // Return back the signedPayload to the client.
    res.status(200).json({
      signedPayload: JSON.parse(JSON.stringify(signedPayload)),
    });
  } catch (e) {
    res.status(500).json({ error: `Server error ${e}` });
  }
}
