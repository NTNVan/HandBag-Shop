export type ProductType = "tote" | "crossbody" | "backpack";

export type Product = {
  id: string;
  name: string;
  type: string;
  material: string | null;
  price: number;
  quantity: number;
  image_url: string | null;
  description: string | null;
  size: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderStatus =
  | "Chờ xác nhận"
  | "Đã xác nhận"
  | "Đang giao"
  | "Đã giao"
  | "Đã hủy";

export type Order = {
  id: string;
  user_id: string;
  customer_name: string;
  phone: string;
  address: string;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
};

export type Profile = {
  id: string;
  full_name: string | null;
  role: string;
};
