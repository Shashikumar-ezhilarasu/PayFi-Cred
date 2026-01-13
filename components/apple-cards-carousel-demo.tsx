"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

export default function AppleCardsCarouselDemo() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full py-20">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Explore PayFi-Cred Features
      </h2>
      <Carousel items={cards} />
    </div>
  );
}

const CreditNFTContent = () => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
      <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
        <span className="font-bold text-neutral-700 dark:text-neutral-200">
          Your Credit NFT is your portable on-chain identity.
        </span>{" "}
        Mint a soulbound NFT that stores your credit history, score, and limits. 
        Use it across partner apps in the Shardeum ecosystem. Your credit identity, 
        owned by you, secured by the blockchain.
      </p>
      <img
        src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop"
        alt="Credit NFT visualization"
        className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain mt-8 rounded-2xl"
      />
    </div>
  );
};

const AIAgentContent = () => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
      <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
        <span className="font-bold text-neutral-700 dark:text-neutral-200">
          Let AI manage your credit intelligently.
        </span>{" "}
        Our MCP AI Agent evaluates your on-chain income and approves credit requests 
        in under 3 seconds. Set spending caps, automate repayments, and let the agent 
        handle your finances while you focus on building.
      </p>
      <img
        src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2832&auto=format&fit=crop"
        alt="AI Agent visualization"
        className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain mt-8 rounded-2xl"
      />
    </div>
  );
};

const ZeroInterestContent = () => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
      <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
        <span className="font-bold text-neutral-700 dark:text-neutral-200">
          0% interest when you pay on time.
        </span>{" "}
        Pay back within 30 days and owe nothing extra. Build your on-chain credit 
        score with every successful repayment. No hidden fees, no compound interest—
        just transparent, trustless lending.
      </p>
      <img
        src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2811&auto=format&fit=crop"
        alt="Zero interest finance"
        className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain mt-8 rounded-2xl"
      />
    </div>
  );
};

const IncomeVerificationContent = () => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
      <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
        <span className="font-bold text-neutral-700 dark:text-neutral-200">
          Prove your income with vlayer ZK proofs.
        </span>{" "}
        No paperwork, no waiting, no traditional credit checks. Verify your on-chain 
        earnings through zero-knowledge proofs and get a credit line that matches 
        your actual cashflow in seconds.
      </p>
      <img
        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop"
        alt="Income verification dashboard"
        className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain mt-8 rounded-2xl"
      />
    </div>
  );
};

const ShardeumContent = () => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
      <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
        <span className="font-bold text-neutral-700 dark:text-neutral-200">
          Built on Shardeum for infinite scalability.
        </span>{" "}
        Experience low gas fees and lightning-fast transactions on Shardeum's 
        EVM-compatible blockchain. Your credit transactions are secured by a 
        linearly scalable network designed for mass adoption.
      </p>
      <img
        src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop"
        alt="Shardeum blockchain network"
        className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain mt-8 rounded-2xl"
      />
    </div>
  );
};

const PartnerAppsContent = () => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
      <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
        <span className="font-bold text-neutral-700 dark:text-neutral-200">
          Use your credit across the ecosystem.
        </span>{" "}
        Spend your PayFi-Cred credit at partner merchants and dApps. From NFT 
        marketplaces to DeFi protocols, your credit identity travels with you 
        across the Shardeum ecosystem.
      </p>
      <img
        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2815&auto=format&fit=crop"
        alt="Partner apps ecosystem"
        className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain mt-8 rounded-2xl"
      />
    </div>
  );
};

const data = [
  {
    category: "On-Chain Identity",
    title: "Mint Your Credit NFT",
    src: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    content: <CreditNFTContent />,
  },
  {
    category: "AI Automation",
    title: "Smart Credit Agent",
    src: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2832&auto=format&fit=crop",
    content: <AIAgentContent />,
  },
  {
    category: "DeFi Lending",
    title: "0% Interest for 30 Days",
    src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2811&auto=format&fit=crop",
    content: <ZeroInterestContent />,
  },
  {
    category: "Privacy",
    title: "vlayer ZK Income Proofs",
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop",
    content: <IncomeVerificationContent />,
  },
  {
    category: "Infrastructure",
    title: "Powered by Shardeum",
    src: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop",
    content: <ShardeumContent />,
  },
  {
    category: "Ecosystem",
    title: "Partner Apps Integration",
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2815&auto=format&fit=crop",
    content: <PartnerAppsContent />,
  },
];
