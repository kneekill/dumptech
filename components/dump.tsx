"use client";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { writeContract } from "@wagmi/core";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";

import {
  ABI,
  ADDRESS,
  checkFetchResponse,
  formatKeyPrice,
  truncateString,
} from "@/lib/utils";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { BaseError } from "viem";

interface Holding {
  username: string;
  pfpUrl: string;
  price: string;
  balance: string;
  subject: string;
}

interface HoldingsReponse {
  holdings: Holding[];
}

function ProfileSkeleton() {
  return (
    <div className="p-4">
      <div className="flex items-center">
        <Skeleton className="flex h-9 w-9 rounded-full" />
        <div className="ml-4 space-y-1">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
    </div>
  );
}

export default function Dump({ jwt }: { jwt: string }) {
  const { address } = useAccount();
  const [transactionError, setTransactionError] = useState<
    BaseError | undefined
  >();
  const { data, refetch, isFetching, isError, error, isSuccess } = useQuery(
    ["holdings", address, jwt],
    async (): Promise<HoldingsReponse> => {
      const result = await fetch(
        `https://prod-api.kosetto.com/portfolio/${address}`,
        {
          headers: {
            Authorization: jwt,
          },
        }
      );
      checkFetchResponse(result, "Failed to get holdings from FriendTech");
      return result.json();
    },
    {
      refetchOnWindowFocus: false,
    }
  );
  const showError = isError || transactionError !== undefined;
  const dump = useCallback(async () => {
    try {
      if (data?.holdings) {
        await Promise.all(
          data.holdings.map((holding) => {
            return writeContract({
              address: ADDRESS,
              abi: ABI,
              functionName: "sellShares",
              args: [holding.subject, holding.balance],
            });
          })
        );
        refetch();
      }
    } catch (error) {
      setTransactionError(error as BaseError);
    }
  }, [data?.holdings, refetch]);

  return (
    <>
      {showError ? (
        <Alert variant="destructive" className="w-max mb-3">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error === null
              ? transactionError?.shortMessage
              : (error as Error).message}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="min-w-max overflow-y-auto max-h-[25rem]">
        {isFetching ? (
          <>
            <ProfileSkeleton />
            <ProfileSkeleton />
          </>
        ) : null}

        {data?.holdings !== undefined && !isFetching
          ? data.holdings.map((holding, index) => {
              return (
                <CardContent
                  key={`${holding.username}-${index}`}
                  className="p-4"
                >
                  <div className="flex items-center">
                    <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
                      <AvatarImage src={holding.pfpUrl} />
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {truncateString(holding.username, 20)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {holding.balance}{" "}
                        {Number(holding.balance) === 1 ? "key" : "keys"}
                      </p>
                    </div>
                    <div className="ml-auto font-medium pl-2">
                      {formatKeyPrice(holding.price)}
                    </div>
                  </div>
                </CardContent>
              );
            })
          : null}
      </Card>
      <div className="mt-5">
        {isSuccess ? (
          <Button variant="destructive" className="mr-3" onClick={dump}>
            Dump
          </Button>
        ) : null}
        <Button
          onClick={() => {
            setTransactionError(undefined);
            refetch();
          }}
        >
          Refresh Holdings
        </Button>
      </div>
    </>
  );
}
