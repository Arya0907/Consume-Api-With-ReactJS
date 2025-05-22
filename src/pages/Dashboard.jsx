import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../constant";

export default function Dashboard() {
    const [totalMember, setTotalMember] = useState(0);
    const [totalJenisBuku, setTotalJenisBuku] = useState(0);
    const [totalDenda, setTotalDenda] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("token");
        // Fetch total member
        axios.get(API_URL + "/member", {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setTotalMember(res.data.length || 0);
        }).catch(err => {
            if (err.response && err.response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/";
            }
        });
        // Fetch total jenis buku
        axios.get(API_URL + "/buku", {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setTotalJenisBuku(res.data.length || 0);
        }).catch(err => {
            if (err.response && err.response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/";
            }
        });
        // Fetch total denda
        axios.get(API_URL + "/denda", {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            const total = (res.data.data || []).reduce((sum, d) => sum + (parseInt(d.jumlah_denda) || 0), 0);
            setTotalDenda(total);
        }).catch(err => {
            if (err.response && err.response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/";
            }
        });
    }, []);

    return (
        <div style={{ minHeight: '100vh', padding: '40px 0', width: '100%' }}>
            <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
                <h2 className="fw-bold mb-4 text-center" style={{ color: '#6366f1' }}>Dashboard Perpustakaan</h2>
                <div className="d-flex flex-column align-items-center gap-4">
                    <div className="card shadow border-0 text-center w-100" style={{ borderRadius: 18 }}>
                        <div className="card-body py-5">
                            <div className="mb-2" style={{ fontSize: 40, color: '#0ea5e9' }}><i className="bi bi-people-fill"></i></div>
                            <h5 className="card-title mb-2">Total Member</h5>
                            <h2 className="fw-bold mb-0">{totalMember}</h2>
                        </div>
                    </div>
                    <div className="card shadow border-0 text-center w-100" style={{ borderRadius: 18 }}>
                        <div className="card-body py-5">
                            <div className="mb-2" style={{ fontSize: 40, color: '#6366f1' }}><i className="bi bi-journal-bookmark-fill"></i></div>
                            <h5 className="card-title mb-2">Jenis Buku</h5>
                            <h2 className="fw-bold mb-0">{totalJenisBuku}</h2>
                        </div>
                    </div>
                    <div className="card shadow border-0 text-center w-100" style={{ borderRadius: 18 }}>
                        <div className="card-body py-5">
                            <div className="mb-2" style={{ fontSize: 40, color: '#f59e42' }}><i className="bi bi-cash-coin"></i></div>
                            <h5 className="card-title mb-2">Total Denda</h5>
                            <h2 className="fw-bold mb-0">Rp {totalDenda.toLocaleString('id-ID')}</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}