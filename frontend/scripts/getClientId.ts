import { v4 as uuidv4 } from "uuid";

export const getClientId = () => {
  const key = "clientId";

  return (
    localStorage.getItem(key) ??
    (() => {
      const id = uuidv4();
      localStorage.setItem(key, id);
      return id;
    })()
  );
};
