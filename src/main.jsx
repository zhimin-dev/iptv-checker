import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {MainContextProvider} from './context/main'
import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";
import Watch from './components/watch/index'
import ErrorPage from "./error-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/dist/watch",
    element: <Watch />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainContextProvider>
      <App />
      {/* <RouterProvider router={router} /> */}
    </MainContextProvider>
  </React.StrictMode>
)
