"use client";
import Auth from "@/components/auth";
import Dump from "@/components/dump";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function Main() {
  const [jwt, setJwt] = useState<string | undefined>();
  const { isConnected } = useAccount();
  useEffect(() => {
    if (!isConnected && jwt !== undefined) {
      setJwt(undefined);
    }
  }, [isConnected, jwt]);
  return (
    <main className="flex flex-col items-center justify-between lg:p-24">
      <h1 className="font-bold text-5xl p-2">Dump Tech</h1>
      <h2 className="text-lg">Dump (on) your friends</h2>
      <div className="flex p-4 justify-between">
        <ConnectButton />
        {jwt !== undefined && isConnected ? (
          <div>
            <Button
              variant="outline"
              className="ml-2"
              onClick={() => {
                setJwt(undefined);
              }}
            >
              Sign out
            </Button>
          </div>
        ) : null}
      </div>
      {jwt === undefined ? <Auth setJwt={setJwt} /> : <Dump jwt={jwt} />}
    </main>
  );
}
