const API_URL = "http://localhost:5000/products";

export const getProducts = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Lỗi khi lấy sản phẩm");
  }
  return response.json();
};