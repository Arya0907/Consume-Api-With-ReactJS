import { createBrowserRouter } from "react-router-dom"; 
import Template from "../layouts/template";
import Login from "../pages/Login";
import App from "../App";
import Dashboard from "../pages/Dashboard";
import Member from "../pages/member";
import BukuIndex from "../pages/Buku";
import PeminjamanIndex from "../pages/peminjaman";
import Denda from "../pages/Denda";
import DendaByMember from "../pages/Denda/DendaByMember";
import PrivatePage from "../pages/middleware/PrivatePage";
import Registrasi from "../pages/Registrasi";


export const router = createBrowserRouter([
    {path: "/",
     element: <Template/>,
     children : [
        // {path: "/", element: <App/>},
        {path: "/", element: <Login/>},
        {path: "/registrasi",element : <Registrasi/>},
        {path: "/dashboard",
         element: <PrivatePage/>,
         children : [
             { path: "", element: <Dashboard /> },
             { path: "member", element: <Member /> },
             { path: "buku", element: <BukuIndex /> },
             { path: "peminjaman", element: <PeminjamanIndex /> },
             { path: "denda", element: <Denda/> },
             { path: "dendaByMember", element: <DendaByMember/>}
         ]
        },
     ]
    }
])