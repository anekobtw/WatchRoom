const key = "joinToken";

export const getUserId = () => {
  return localStorage.getItem(key) ?? "";
};

export const setUserId = (token: string) => {
  localStorage.setItem(key, token);
};
