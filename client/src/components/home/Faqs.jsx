import React, { useState } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import AnimatedHeading from "../../components/animation/AnimateHeading";

const Faqs = () => {
  const [open, setOpen] = useState(0);
  const CUSTOM_ANIMATION = {
    mount: { scale: 1 },
    unmount: { scale: 0.9 },
  };

  const faqs = [
    {
      id: 1,
      question: "What products does BitEx provide?",
      answer: (
        <>
          <p>
            Our platform is an innovative cryptocurrency exchange with advanced
            financial offerings. We offer cutting-edge crypto trading services
            to millions of users globally in more than 180 regions.{" "}
          </p>
          <p>
            Military-Grade Encryption: BitEx use AES-256 encryption for all
            transactions and data storage, ensuring your assets and information
            are protected by the same standards as global financial
            institutions.
          </p>
          <p>
            Cold Storage Safeguards: BitEx 95% of funds are stored in offline,
            hardware-secured wallets, making them immune to online threats like
            hacking or phishing{" "}
          </p>
          <p>
            24/7 Threat Monitoring: BitEx AI-driven security system detects and
            blocks suspicious activity in real time, with zero false positives
            in the past year.{" "}
          </p>
          <p>
            Third-Party Audits: BitEx undergo quarterly security audits by
            leading firms like [Example Firm] to maintain transparency and
            compliance with ISO 27001 standards.{" "}
          </p>
          <p>
            User Education: BitEx provide free tools and guides to help users
            enable hardware 2FA, set up biometric authentication, and avoid
            common scams.
          </p>
          <p>
            With BitEx, you can: Trade a wide variety of tokens and trading
            pairs. Connect to the world-famous TradingView Platform and trade
            crypto directly with their supercharged charts
          </p>
        </>
      ),
    },
    {
      id: 2,
      question: "What is crypto?",
      answer:
        "Cryptocurrency is a decentralized digital currency that operates on blockchain technology. Its key features include transparency, borderless transactions and immutability. Some of the most popular cryptocurrencies, by market capitalization , include Bitcoin, Ethereum, Tether, which can be traded on this platform.",
    },
    {
      id: 3,
      question: "  What is a cryptocurrency exchange?",
      answer:
        "Cryptocurrency exchanges are digital marketplaces that enable users to buy and sell cryptocurrencies like Bitcoin, Ethereum, and Tether. The BitEx exchange is the largest crypto exchange by trade volume.",
    },
    {
      id: 4,
      question:
        " How do I buy Bitcoin and other crypto currencies on this platform?",
      answer:
        "Easily buy Bitcoin or other crypto currencies within minutes with  USDT. BitEx supports payments through USDT Deposite . Want to buy, sell, or hold other coins that are gaining traction in the crypto ecosystem? Kickstart your journey with BitEx and explore prices and other information for cryptos such as Bitcoin (BTC), Ethereum (ETH) and more!",
    },
    {
      id: 5,
      question: "How to track cryptocurrency prices?",
      answer:
        "The easiest way to track the latest cryptocurrency prices, trading volumes, trending altcoins, and market cap is the BitEx Cryptocurrency Directory. Click on the coins to know historical coin prices, 24-hour trading volume, and the price of cryptocurrencies like Bitcoin, Ethereum, BNB and others in real-time.",
    },
    {
      id: 6,
      question: " How to trade cryptocurrencies on BitEx",
      answer:
        "You can trade hundreds of cryptocurrencies on BitEx via the Spot, Futures, and Options markets. To begin trading, users need to register an account, complete identity verification, buy/deposit crypto, and start trading.",
    },
  ];

  const handleOpen = (value) => setOpen(open === value ? 0 : value);
  return (
    <section className="faqs min-h-screen px-8 bg-gradient-reverse w-full text-white flex flex-col justify-center text-start">
      <AnimatedHeading>
        <h2 className="text-4xl font-bold mb-24 text-white text-center">
          Frequently Asked Questions
        </h2>
      </AnimatedHeading>
      <div className="container mx-auto px-4">
        {faqs.map((faq) => (
          <Accordion
            open={open === faq.id}
            key={faq.id}
            animate={CUSTOM_ANIMATION}
          >
            <AccordionHeader
              onClick={() => handleOpen(faq.id)}
              className={` bg-tertiary2 ${
                faqs.length === faq.id
                  ? "rounded-b-lg"
                  : faq.id === 1
                  ? "rounded-t-lg"
                  : ""
              }  px-4`}
            >
              {faq.question}
            </AccordionHeader>
            <AccordionBody className="bg-tertiary2 text-tertiary3 px-4 text-2xl">
              {faq.answer}
            </AccordionBody>
          </Accordion>
        ))}
      </div>
    </section>
  );
};

export default Faqs;
