import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { LoginPage } from './auth/LoginPage';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { ConchaMark } from './components/Brand';
import { Layout } from './components/Layout';
import { Toaster } from './components/Toaster';
import { Spinner } from './components/ui';
import { PostEditorPage } from './features/posts/PostEditorPage';
import { PostsListPage } from './features/posts/PostsListPage';
import { ProductEditorPage } from './features/products/ProductEditorPage';
import { ProductsListPage } from './features/products/ProductsListPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { UsersPage } from './features/users/UsersPage';
import { useAuthStore } from './stores/auth';

export function App() {
  const ready = useAuthStore((s) => s.ready);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex flex-col items-center gap-3 text-concha">
          <ConchaMark className="size-10" />
          <Spinner className="size-5" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/avisos" replace />} />
            <Route path="avisos" element={<PostsListPage />} />
            <Route path="avisos/nuevo" element={<PostEditorPage />} />
            <Route path="avisos/:id" element={<PostEditorPage />} />
            <Route path="menu" element={<ProductsListPage />} />
            <Route path="menu/nuevo" element={<ProductEditorPage />} />
            <Route path="menu/:id" element={<ProductEditorPage />} />
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="usuarios" element={<UsersPage />} />
              <Route path="ajustes" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/avisos" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
