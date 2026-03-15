import { useCallback, useState } from "react";

export type Route = "login" | "lock" | "list" | "detail" | "add";

export function useRouter() {
  const [route, setRoute] = useState<Route>("login");

  const navigate = useCallback((newRoute: Route) => {
    setRoute(newRoute);
  }, []);

  const goBack = useCallback(() => {
    setRoute("list");
  }, []);

  return { route, navigate, goBack };
}
