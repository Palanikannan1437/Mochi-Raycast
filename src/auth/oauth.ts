import { OAuth, environment } from "@raycast/api";
import fetch from "node-fetch";
import { NEXT_PUBLIC_API_URL } from "../utils/constants";

const clientId = "1099988770910122025";

export const oauthClient = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: "Discord",
  providerIcon: environment.theme === "light" ? "mochi.png" : "mochi.png",
  providerId: "discord",
  description: "Connect your Discord account",
});

export async function authorize() {
  const existingTokens = await oauthClient.getTokens();

  if (existingTokens?.accessToken) {
    return existingTokens.accessToken;
  }

  const authRequest = await oauthClient.authorizationRequest({
    endpoint: "https://discord.com/api/oauth2/authorize",
    clientId,
    scope: "identify guilds",
  });

  const { authorizationCode } = await oauthClient.authorize(authRequest);

  const tokens = await fetchTokens(authRequest, authorizationCode);
  await oauthClient.setTokens(tokens);

  return tokens.access_token;
}

export async function fetchTokens(
  authRequest: OAuth.AuthorizationRequest,
  authCode: string
): Promise<OAuth.TokenResponse> {
  const data = {
    'client_id': clientId,
    'code': authCode,
    'code_verifier': authRequest.codeVerifier,
  };

  const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });


  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const tokens = await response.json();

  return tokens as OAuth.TokenResponse;
}
