import type { ComponentType } from "react";
import { HomeView } from "@/components/features/home";
import { ProductsView, ProductDetailView } from "@/components/features/products";
import { NotFoundView, ContactView } from "@/components/features/common";
import {CartView} from "@/components/features/cart";
import { AboutView } from "@/components/features/about";
import { ProfileView } from "@/components/features/profile";
import { PaymentResponse } from "@/components/features/checkout";
import { Dashboard, Products as AdminProducts, Orders, Users, Categories } from "@/components/features/admin";
  
export interface AppRoute {
  path: string;
  element: ComponentType;
  title: string;
}

export const routes: AppRoute[] = [
  { path: "/", element: HomeView, title: "Inicio | Alma" },
  { path: "/profile", element: ProfileView, title: "Perfil | Alma" },
  { path: "/payment-response", element: PaymentResponse, title: "Respuesta de Pago | Alma" },
  { path: "/about", element: AboutView, title: "Sobre nosotros | Alma" },
  { path: "/products", element: ProductsView, title: "Colección | Alma" },
  { path: "/products/:id", element: ProductDetailView, title: "Detalle de Producto | Alma" },
  { path: "*", element: NotFoundView, title: "No encontrado | Alma" },
  { path: "/cart", element: CartView, title: "Carrito | Alma" },
  { path: "/contact", element: ContactView, title: "Contacto | Alma" },
];

export const adminRoutes: AppRoute[] = [
  { path: "/admin", element: Dashboard, title: "Admin: Dashboard | Alma" },
  { path: "/admin/categories", element: Categories, title: "Admin: Categorías | Alma" },
  { path: "/admin/products", element: AdminProducts, title: "Admin: Productos | Alma" },
  { path: "/admin/orders", element: Orders, title: "Admin: Pedidos | Alma" },
  { path: "/admin/users", element: Users, title: "Admin: Usuarios | Alma" },
];