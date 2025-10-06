import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import LandingPage from "./Pages/LandingPage.jsx";
import ErrorPage from "./Pages/ErrorPage.jsx";
import Login from "./Pages/Login.jsx";
import coconut from '../Public/coconut.jpg'
import Register from "./Pages/Register.jsx";
import ProjectPage from "./Pages/ProjectPage.jsx";
import Recover from "./Pages/Recover.jsx";
import './global.css'
const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "*", element: <ErrorPage /> },
  { path: "/login", element: <Login /> },
  { path: "/Register", element: <Register /> },
  { path: '/project/:id', element: <ProjectPage/>},
  { path: '/recover', element: <Recover /> },
  
]);
createRoot(document.getElementById("root")).render(
 
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode> 
);
