import styles from "./styles/Home.module.css";
import {
  ConnectWallet,
  useAddress,
  useContract,
  useNFTs,
  Web3Button,
} from "@thirdweb-dev/react";
import type { NextPage } from "next";
import { useState } from "react";
import { NFT_COLLECTION_ADDRESS } from '../const/yourDetails';

const Home: NextPage = () => {
  const address = useAddress();
  console.log(`${address} connected`);

  // Fetch the NFT collection from thirdweb via it's contract address.
  const { contract: nftCollection } = useContract(
    NFT_COLLECTION_ADDRESS,
    "nft-collection"
  );
  console.log(`nftCollection part`);


  // Load all the minted NFTs in the collection
  const { data: nfts, isLoading: loadingNfts } = useNFTs(nftCollection);

  console.log(`nftCollection part2`);
  // Here we store the user inputs for their NFT.
  const [nftName, setNftName] = useState<string>("");
  console.log(`nftCollection part3`);
  // This function calls a Next JS API route that mints an NFT with signature-based minting.
  // We send in the address of the current user, and the text they entered as part of the request.
  const mintWithSignature = async () => {
    try {
      // Make a request to /api/server
      const signedPayloadReq = await fetch(`/api/server`, {
        method: "POST",
        body: JSON.stringify({
          authorAddress: address, // Address of the current user
          redeemCode: nftName || "",
        }),
      });
      console.log("hello")

      // Grab the JSON from the response
      const json = await signedPayloadReq.json();

      if (!signedPayloadReq.ok) {
        alert(json.error);
      }

      // If the request succeeded, we'll get the signed payload from the response.
      // The API should come back with a JSON object containing a field called signedPayload.
      // This line of code will parse the response and store it in a variable called signedPayload.
      // TODO: WTF this is wrong
      const signedPayload = json.signedPayload;

      // Now we can call signature.mint and pass in the signed payload that we received from the server.
      // This means we provided a signature for the user to mint an NFT with.
      const nft = await nftCollection?.signature.mint(signedPayload);

      alert("Minted succesfully!");

      return nft;
    } catch (e) {
      console.error("An error occurred trying to mint the NFT:", e);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Phala Free Compute Campaign</h1>
      <p className={styles.explain}>
        Free compute campaign with{" "}
        <b>
          {" "}
          <a
            href="https://phala.network/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.purple}
          >
            Phala Network
          </a>
        </b>{" "}
      </p>

      <p>
        <i>Hint</i>: We only generate signatures if you have finished the Hunter Challenge or have a valid
        <b> redeem code</b>! 😉
      </p>

      <hr className={styles.divider} />

      <div className={styles.collectionContainer}>
        <h2 className={styles.ourCollection}>
          Claim your free compute NFT:
        </h2>

        <input
          type="text"
          placeholder="Redeem Code"
          className={styles.textInput}
          maxLength={26}
          onChange={(e) => setNftName(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <Web3Button
          contractAddress={NFT_COLLECTION_ADDRESS}
          action={() => mintWithSignature()}
        >
          Mint NFT
        </Web3Button>
      </div>

      <hr className={styles.smallDivider} />

      <div className={styles.collectionContainer}>
        <h2 className={styles.ourCollection}>Other NFTs in this collection:</h2>

        {loadingNfts ? (
          <p>Loading...</p>
        ) : (
          <div className={styles.nftGrid}>
            {nfts?.map((nft) => (
              <div className={styles.nftItem} key={nft.metadata.id.toString()}>
                <div style={{ textAlign: "center" }}>
                  <p>Name</p>
                  <p>
                    <b>{nft.metadata.name}</b>
                  </p>
                </div>

                <div style={{ textAlign: "center" }}>
                  <p>Owned by</p>
                  <p>
                    <b>
                      {nft.owner
                        .slice(0, 6)
                        .concat("...")
                        .concat(nft.owner.slice(-4))}
                    </b>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
