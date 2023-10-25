import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="description"
          content="Anthropic Bedrock are SDKs for Anthropic's models on AWS Bedrock"
        />
        <meta name="image" content="/homepage.png" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
