"use client";

import React from "react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

export default function InfiniteMovingCardsDemo() {
  return (
    <div className="h-[40rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
      <InfiniteMovingCards
        items={testimonials}
        direction="right"
        speed="slow"
      />
    </div>
  );
}

const testimonials = [
  {
    quote:
      "PayFi-Cred revolutionized how I access credit. As a freelance developer, traditional banks never understood my income streams. Now I get instant credit based on my actual on-chain earnings.",
    name: "Alex Chen",
    title: "Web3 Developer",
  },
  {
    quote:
      "The AI agent feature is incredible. It manages my spending caps and automatically handles repayments. I've never missed a payment since I started using PayFi-Cred.",
    name: "Sarah Mitchell",
    title: "DAO Contributor",
  },
  {
    quote:
      "Zero interest for 30 days is a game-changer. I can bridge cash flow gaps without worrying about accumulating debt. This is what DeFi should be.",
    name: "Marcus Johnson",
    title: "NFT Artist",
  },
  {
    quote:
      "My Credit NFT is my most valuable asset. It carries my entire credit history on-chain, and I can use it across multiple Shardeum apps. True financial portability.",
    name: "Elena Rodriguez",
    title: "DeFi Researcher",
  },
  {
    quote:
      "The income verification through vlayer proofs gave me a $25K credit line in under 3 seconds. No paperwork, no waiting, no traditional credit checks. The future is here.",
    name: "David Kim",
    title: "Smart Contract Auditor",
  },
];
