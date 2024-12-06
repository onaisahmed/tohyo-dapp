import React from "react";
import contractData from "../deployments/localhost-deployment.json";

const CONTRACT_ADDRESS = contractData.contractAddress;
const CONTRACT_ABI = contractData.abi;

const TohyoDapp = () => {
  return (
    <div>
      <h1>投票Dapp</h1>
    </div>
  );
};

export default TohyoDapp;
