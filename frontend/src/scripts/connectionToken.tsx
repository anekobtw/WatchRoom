const key = "joinToken";

export const getConnectionToken = () => {
  return localStorage.getItem(key);
};

export const setConnectionToken = (token: string) => {
  localStorage.setItem(key, token);
};
