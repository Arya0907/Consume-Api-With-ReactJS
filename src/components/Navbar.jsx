import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Navbar() {
    const navigate = useNavigate();
    // Cek token login
    const isLogin = localStorage.getItem("token") !== null; 

    function logout() {
        localStorage.removeItem("token");
        Swal.fire({
            icon: 'success',
            title: 'Logout Berhasil',
            text: 'Anda telah keluar dari sistem.',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            navigate("/");
        });
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
            <div className="container">
                <h1 className="navbar-brand pt-2">PERPUSTAKAAN APP</h1>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        { isLogin ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/dashboard">Dashboard</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/dashboard/member">Daftar Member</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/dashboard/buku">Daftar Buku</Link>
                                </li>
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Lainnya
                                    </a>
                                    <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                        <li><Link className="dropdown-item" to="/dashboard/peminjaman">Peminjaman</Link></li>
                                        <li><Link className="dropdown-item" to="/dashboard/denda">Denda</Link></li>
                                        <li><Link className="dropdown-item" to="/dashboard/dendaByMember">DendaByMember</Link></li>
                                    </ul>
                                </li>
                                <div className="d-flex">
                                    <button className="btn btn-outline-secondary" onClick={logout}>
                                        Logout
                                    </button>
                                </div>
                            </>
                        ): (
                           null
                        )}
                    </ul>
                    
                </div>
            </div>
        </nav>
    );
}