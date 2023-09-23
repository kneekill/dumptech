"use client";
import { useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { checkFetchResponse } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const statement =
  "By signing this message, you are proving you own this wallet and allowing Dump Tech to authenticate you with FriendTech.";

export default function Auth({ setJwt }: { setJwt: (jwt: string) => void }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const authQuery = async () => {
    const initRes = await fetch(`/api/init/${address}`);
    checkFetchResponse(initRes, "Failed to get nonce from privy");
    const data = await initRes.json();
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement,
      uri: window.location.origin,
      version: "1",
      chainId: 8453,
      nonce: data.nonce,
    });
    const preparedMessage = message.prepareMessage();
    const signature = await signMessageAsync({
      message: preparedMessage,
    }).catch((reason) => {
      throw new Error(reason.shortMessage);
    });

    const authRes = await fetch("/api/authenticate", {
      method: "POST",
      body: JSON.stringify({
        message: preparedMessage,
        signature,
      }),
    });
    checkFetchResponse(authRes, "Failed to authenticate with privy");
    const { token: privyToken } = await authRes.json();
    if (privyToken !== undefined) {
      const ftRes = await fetch("https://prod-api.kosetto.com/signature", {
        method: "POST",
        headers: {
          Authorization: privyToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
        }),
      });
      checkFetchResponse(ftRes, "Failed to get FriendTech JWT");
      return ftRes.json();
    } else {
      throw new Error("privy wallet not found");
    }
  };
  const { data, error, isError, isFetching, refetch } = useQuery(
    ["authenticate", address],
    authQuery,
    {
      refetchOnWindowFocus: false,
      enabled: false,
      retry: false,
      cacheTime: 0,
      staleTime: 0,
    }
  );

  const dataDep = JSON.stringify(data);
  useEffect(() => {
    if (data) {
      setJwt(data.token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataDep, setJwt]);
  return (
    <div className="flex flex-col items-center">
      {isError ? (
        <Alert variant="destructive" className="mb-3">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      ) : null}
      {isConnected ? (
        <div className="max-w-xs flex flex-col items-center">
          <Button disabled={isFetching} onClick={() => refetch()}>
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Sign in
          </Button>
          <p className="text-center">
            By signing in, you allow Dump Tech to authenticate to the FriendTech
            API for you. Dump Tech never saves your FriendTech key anywhere
            other than your local browser. The key is only used to get your
            FriendTech holdings.
          </p>
        </div>
      ) : null}
    </div>
  );
}
Auth.whyDidYouRender = true;
