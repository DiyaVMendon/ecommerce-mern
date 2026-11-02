import { createBrowserRouter, RouterProvider, Outlet } from "react-router";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import ProductManagement from "./pages/ProductManagement.jsx";
import Sidebar from "./components/sidebar/Sidebar.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout with the sidebar on the left and the page on the right
const AdminLayout = () => (
  <div style={{ display: "flex", minHeight: "100vh" }}>
    <Sidebar />
    <main style={{ flex: 1, minWidth: 0 }}>
      <Outlet />
    </main>
  </div>
);

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/product/:id", element: <ProductDetails /> },

  // pages that show the sidebar
  {
    element: <AdminLayout />,
    children: [{ path: "/admin", element: <ProductManagement /> }],
  },
]);

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </>
  );
}
