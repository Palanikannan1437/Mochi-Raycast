import { NextResponse } from 'next/server';

const clientSecret: string = process.env.NEXT_PUBLIC_DISCORD_CLIENT_SECRET

const API_ENDPOINT = 'https://discord.com/api/v10';
const REDIRECT_URI = 'https://raycast.com/redirect?packageName=Extension';

export async function POST(request: Request) {
  const authRequest = await request.json();

  const body = new URLSearchParams({
    'client_id': authRequest.client_id,
    'client_secret': clientSecret,
    'grant_type': 'authorization_code',
    'code': authRequest.code,
    'redirect_uri': REDIRECT_URI,
    'code_verifier': authRequest.code_verifier,
  });

  const options = {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  const response = await fetch(`${API_ENDPOINT}/oauth2/token`, options);

  console.log(response)
  const tokens = await response.json();

  return NextResponse.json(tokens);
}

