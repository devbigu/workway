const SESSION_COOKIE_NAMES = new Set([
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
]);

export function hasBetterAuthSessionCookie(cookieNames: string[]) {
  return cookieNames.some((name) => SESSION_COOKIE_NAMES.has(name));
}

export function getCheckoutLoginPath(pathname: string) {
  const search = new URLSearchParams({
    callbackURL: pathname,
    checkout: "required",
  });
  return `/login?${search.toString()}`;
}
