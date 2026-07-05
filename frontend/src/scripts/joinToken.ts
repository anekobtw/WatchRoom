const key = "joinToken";

export const getJoinToken = () => {
  return localStorage.getItem(key);
};

export const setJoinToken = (token: string) => {
  localStorage.setItem(key, token);
};
