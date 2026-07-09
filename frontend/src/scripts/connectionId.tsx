const key = "joinToken";

export const getConnectionId = () => {
  return localStorage.getItem(key) ?? "";
};

export const setConnectionId = (token: string) => {
  localStorage.setItem(key, token);
};
