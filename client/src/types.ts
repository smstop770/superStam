export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parent_id: string | null;
  sort_order: number;
  children?: Category[];
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  images: string[];
  stock: number;
  variants: ProductVariant[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants: Record<string, string>;
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  variant: Record<string, string>;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  customer_city: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  notes: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  webhook_sent: number;
  created_at: string;
}

export interface SiteSettings {
  site_name: string;
  site_subtitle: string;
  phone: string;
  email: string;
  whatsapp: string;
  free_shipping_above: string;
  shipping_cost: string;
  order_webhook_url?: string;
}
