import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { MainContextProvider } from './context/main'
import {
  RouterProvider,
  createHashRouter,
} from "react-router-dom";
import Detail from './components/detail'

const router = createHashRouter([
  {
    path: "/index.html",
    element: <App />,
  },
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/detail",
    element: <Detail />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <MainContextProvider>
    <RouterProvider router={router} />
  </MainContextProvider>
  // </React.StrictMode>
)
