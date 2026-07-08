const key = "roomUserName";

export const getUserName = () => {
  return localStorage.getItem(key);
};

export const setUserName = (name: string) => {
  localStorage.setItem(key, name);
};
