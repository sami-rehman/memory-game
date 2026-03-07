const SESSION_KEY = "memory_game_admin_session";

const getCredentials = () => ({
  user: process.env.REACT_APP_ADMIN_USER || "admin",
  password: process.env.REACT_APP_ADMIN_PASSWORD || "admin",
});

export function validateAdmin(username: string, password: string): boolean {
  const { user, password: expectedPassword } = getCredentials();
  return username === user && password === expectedPassword;
}

export function setAdminSession(): void {
  sessionStorage.setItem(SESSION_KEY, "1");
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}
