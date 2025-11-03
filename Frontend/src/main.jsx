import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import LandingPage from "./Pages/LandingPage.jsx";
import ErrorPage from "./Pages/ErrorPage.jsx";
import Login from "./Pages/Login.jsx";
import TokenAuth from "./components/TokenAuth.jsx";
import coconut from '../Public/coconut.jpg'
import Register from "./Pages/Register.jsx";
import ProjectPage from "./Pages/ProjectPage.jsx";
import Recover from "./Pages/Recover.jsx";
import CreateProjectPage from './Pages/CreateProjectPage.jsx'
import './global.css'
import { TaskProvider } from "./context/ProjectContext.jsx";
const router = createBrowserRouter([
  { path: "/", element:<TokenAuth> <LandingPage /> </TokenAuth> },
  { path: "*", element: <ErrorPage /> },
  { path: "/login", element: <Login /> },
  { path: "/Register", element: <Register /> },
  { path: '/project/:id', element: <ProjectPage/>},
  { path: '/project', element: <ProjectPage/>},
  { path: '/recover', element: <Recover /> },
  { path: '/create', element: <CreateProjectPage/>}
  
]);
createRoot(document.getElementById("root")).render(
 
  <StrictMode>
    <TaskProvider>
    <RouterProvider router={router} />
    </TaskProvider>
  </StrictMode> 
);
