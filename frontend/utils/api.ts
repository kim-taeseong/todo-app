export const apiRequest = async (
  url: string,
  options: RequestInit = {},
  checkTokenExpiration: () => boolean,
) => {
  if (!checkTokenExpiration()) {
    throw new Error("Token expired");
  }

  const token = localStorage.getItem("token");

  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await fetch(url, options);

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  return response;
};
