
const API = import.meta.env.vite_api_url;

export const getProducts = async () => {
  const response = await fetch(`${API}/api/products`);
  if (!response.ok) {
    throw new Error("Lỗi khi lấy sản phẩm");
  }
  return response.json();
};