const API_URL = "https://clozet.up.railway.app/api/products";

export const getProducts = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Lỗi khi lấy sản phẩm");
  }
  return response.json();
};