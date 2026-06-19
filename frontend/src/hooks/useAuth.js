// TODO: replace with a real auth context once the backend auth flow is wired up.
const MOCK_AUTH = {
  user: {
    name: "Alex Chan",
    points: 18450,
    role: "admin",
  },
  isLoggedIn: true,
};

export default function useAuth() {
  return MOCK_AUTH;
}
