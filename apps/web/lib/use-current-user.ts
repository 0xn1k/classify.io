"use client";

import { useEffect, useState } from "react";
import { getMe, type CurrentUser } from "@/lib/api";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type CurrentUserState = {
  user: CurrentUser | null;
  isLoading: boolean;
  error: string | null;
};

// Syncs the signed-in app user from the Supabase session + GET /me on mount.
export function useCurrentUser(): CurrentUserState {
  const [state, setState] = useState<CurrentUserState>({ user: null, isLoading: true, error: null });

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (!token) {
          if (active) setState({ user: null, isLoading: false, error: null });
          return;
        }

        const user = await getMe(token);
        if (active) setState({ user, isLoading: false, error: null });
      } catch (caught) {
        if (active) {
          setState({
            user: null,
            isLoading: false,
            error: caught instanceof Error ? caught.message : "We couldn't load your profile."
          });
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
