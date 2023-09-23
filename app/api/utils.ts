const privyAppId = process.env.PRIVY_APP_ID;
export const headers = {
  Origin: "https://www.friend.tech",
  Accept: "application/json",
  "Content-Type": "application/json",
  "Privy-App-Id": privyAppId!,
};

export const PRIVY_SIWE_BASE_URL = "https://auth.privy.io/api/v1/siwe";
