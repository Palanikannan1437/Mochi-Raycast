import { useMemo, useState } from "react";

import { authorize } from "./oauth";

let token: string;

export function getDiscordClient() {
  const [x, forceRerender] = useState(0);

  // we use a `useMemo` instead of `useEffect` to avoid a render
  useMemo(() => {
    (async function() {
      token = await authorize();
      token = `Bearer ${token}`;
      forceRerender(x + 1);
    })();
  }, []);
  return token;
}
