import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, matchPath } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import { routes, adminRoutes } from "@/routes";
import { CartProvider } from "@/context/CartContext";
import { Providers } from "@/styles/providers";
import { RequireAuth, RequireAdmin } from "@/components/auth/RouteGuards";

const queryClient = new QueryClient();

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const allRoutes = [...routes, ...adminRoutes];
    const exactRoutes = allRoutes.filter((r) => r.path !== "*");
    const matched = exactRoutes.find((r) => matchPath({ path: r.path, end: true }, location.pathname));
    const notFound = allRoutes.find((r) => r.path === "*");
    document.title = matched?.title ?? notFound?.title ?? "Alma";
  }, [location.pathname]);

  return null;
};

const App = () => (
  <CartProvider>
    <Providers>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TitleManager />
        <Routes>
          <Route element={<MainLayout />}>
            {routes.map(({ path, element: Element }) => {
              const isProtected = path === "/profile";
              const wrapped = isProtected ? (
                <RequireAuth>
                  <Element />
                </RequireAuth>
              ) : (
                <Element />
              );
              return <Route key={path} path={path} element={wrapped} />;
            })}
          </Route>
          <Route element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            {adminRoutes.map(({ path, element: Element }) => (
              <Route key={path} path={path} element={<Element />} />
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
    </Providers>
  </CartProvider>
);

export default App;
