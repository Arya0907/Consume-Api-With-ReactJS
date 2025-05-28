import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../../constant";
import Modal from "../../components/Modal";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function PeminjamanIndex() {
    const [dataPeminjaman, setDataPeminjaman] = useState([]);
    const [dataMember, setDataMember] = useState([]);
    const [dataBuku, setDataBuku] = useState([]);
    const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id_member: "",
        id_buku: "",
        tgl_pinjam: "",
        tgl_pengembalian: "",
    });
    const [ModalDenda, setModalDenda] = useState(false);
    const [daysLate, setDaysLate] = useState(0);
    const [DendaTelat, setDendaTelat] = useState([]);
    const [FormDenda, setFormDenda] = useState({
        jumlah_denda: "",
        jenis_denda: "terlambat",
        deskripsi: "Member Telat Mengembalikan Buku",
    });

    useEffect(() => {
        memberId();
        fetchData();
        bukuId();
    }, []);

    const fetchData = () => {
        const token = localStorage.getItem("token");
        axios.get(API_URL + `/peminjaman`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then((res) => {
            setDataPeminjaman(res.data.data);
        }).catch((err) => {
            if (err.response && err.response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/";
            }
            console.error("Gagal memuat data:", err);
        });
    };

    function memberId() {
        const token = localStorage.getItem("token");
        axios.get(API_URL + "/member", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then((res) => {
            setDataMember(res.data);
        }).catch((err) => {
            console.error("Gagal memuat data member:", err);
        });
    }

    function bukuId() {
        const token = localStorage.getItem("token");
        axios.get(API_URL + "/buku", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then((res) => {
            setDataBuku(res.data);
        }).catch((err) => {
            console.error("Gagal memuat data buku:", err);
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        const token = localStorage.getItem("token");

        axios.post(API_URL + "/peminjaman", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(() => {
            setIsModalOpen(false);
            fetchData();
            setFormData({
                id_member: "",
                id_buku: "",
                tgl_pinjam: "",
                tgl_pengembalian: "",
            });
        }).catch((err) => {
            console.error("Gagal Menambahkan Peminjaman:", err);
        });
    }

    function handleReturnBtn(peminjaman) {
        setSelectedPeminjaman(peminjaman);
        setIsReturnModalOpen(true);
    }

    function handleReturnSubmit(e) {
        e.preventDefault();

        const tanggalKembali = new Date(selectedPeminjaman.tgl_pengembalian);
        const today = new Date();

        if (today > tanggalKembali) {
            const diffInMs = today - tanggalKembali;
            const lateDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            const denda = lateDays * 1000;
            setDendaTelat(denda);
            setDaysLate(lateDays);
            setIsReturnModalOpen(false);  // tutup modal pengembalian
            setModalDenda(true);          // buka modal denda untuk input manual
            return;                      // hentikan proses pengembalian dulu
        }

        // kalau gak terlambat langsung update status pengembalian
        const token = localStorage.getItem("token");
        axios.put(
            API_URL + `/peminjaman/pengembalian/${selectedPeminjaman.id}`,
            { status_pengembalian: 1 },
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(() => {
                setIsReturnModalOpen(false);
                fetchData();
            })
            .catch((err) => {
                console.error("Gagal Mengembalikan Peminjaman:", err);
            });
    }

    function handleDendaSubmit(e) {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const dendaPayload = {
            id_member: selectedPeminjaman.id_member,
            id_buku: selectedPeminjaman.id_buku,
            jumlah_denda: FormDenda.jumlah_denda,
            jenis_denda: FormDenda.jenis_denda,
            deskripsi: FormDenda.deskripsi,
        };

        axios.post("http://45.64.100.26:88/perpus-api/public/api/denda", dendaPayload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(() => {
                // setelah denda berhasil, update status pengembalian
                return axios.put(
                    API_URL + `/peminjaman/pengembalian/${selectedPeminjaman.id}`,
                    { status_pengembalian: 1 },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            })
            .then(() => {
                setModalDenda(false);
                fetchData();
            })
            .catch((err) => {
                console.error("Gagal Menambahkan Denda atau Mengubah Status:", err);
            });
    }

    // Grafik bar peminjaman per bulan
    const getPeminjamanPerBulan = () => {
        const bulanMap = {};
        dataPeminjaman.forEach((item) => {
            if (!item.tgl_pinjam) return;
            const date = new Date(item.tgl_pinjam);
            const bulan = date.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
            bulanMap[bulan] = (bulanMap[bulan] || 0) + 1;
        });
        return Object.entries(bulanMap)
            .sort((a, b) => new Date('1 ' + a[0]) - new Date('1 ' + b[0]))
            .map(([bulan, jumlah]) => ({ bulan, jumlah }));
    };

    return (
        <>
            <button className="btn btn-primary mt-5" onClick={() => setIsModalOpen(true)}>
                Tambahkan Peminjaman
            </button>

            <div className="container mt-5">
                {/* Grafik Bar Peminjaman per Bulan */}
                <div className="card shadow border-0 mb-4">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <i className="bi bi-bar-chart-fill me-2"></i>Grafik Peminjaman per Bulan
                        </h5>
                    </div>
                    <div className="card-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getPeminjamanPerBulan()} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="bulan" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="jumlah" fill="#6366f1" name="Jumlah Peminjaman" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/* ...existing code for table ... */}
                <div className="card shadow border-0">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <i className="bi bi-journal-bookmark-fill me-2"></i>Daftar Peminjaman
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover align-middle text-center">
                                <thead className="table-light">
                                    <tr>
                                        <th>No</th>
                                        <th>ID BUKU</th>
                                        <th>Peminjam</th>
                                        <th>Tanggal Pinjam</th>
                                        <th>Tanggal Kembali</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataPeminjaman.length > 0 ? (
                                        dataPeminjaman.map((peminjaman, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{peminjaman.id_buku}</td>
                                                <td>{peminjaman.id_member}</td>
                                                <td>{peminjaman.tgl_pinjam}</td>
                                                <td>{peminjaman.tgl_pengembalian}</td>
                                                <td>
                                                    {peminjaman.status_pengembalian === 0 ? (
                                                        <button
                                                            className="btn btn-warning btn-sm d-flex align-items-center gap-1"
                                                            onClick={() => handleReturnBtn(peminjaman)}
                                                            title="Klik untuk mengembalikan"
                                                            style={{ transition: '0.3s', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0a800'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffc107'}
                                                        >
                                                            <i className="bi bi-arrow-counterclockwise"></i> Kembalikan
                                                        </button>
                                                    ) : (
                                                        <span className="badge bg-success d-flex align-items-center gap-1">
                                                            <i className="bi bi-check-circle-fill"></i> Returned
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-muted">
                                                <i className="bi bi-info-circle me-1"></i>Data belum tersedia.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL TAMBAH */}
            <Modal isOpen={isModalOpen} title="Tambah Peminjaman" OnClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">ID Member</label>
                        <select className="form-select" value={formData.id_member} onChange={(e) => setFormData({ ...formData, id_member: e.target.value })}>
                            <option value="">----Pilih Member----</option>
                            {dataMember.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.id} - {member.nama}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">ID Buku</label>
                        <select className="form-select" value={formData.id_buku} onChange={(e) => setFormData({ ...formData, id_buku: e.target.value })}>
                            <option value="">----Pilih Buku----</option>
                            {dataBuku.map((buku) => (
                                <option key={buku.id} value={buku.id}>
                                    {buku.id} - {buku.judul}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Tanggal Pinjam</label>
                        <input type="date" className="form-control" value={formData.tgl_pinjam} onChange={(e) => setFormData({ ...formData, tgl_pinjam: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Tanggal Pengembalian</label>
                        <input type="date" className="form-control" value={formData.tgl_pengembalian} onChange={(e) => setFormData({ ...formData, tgl_pengembalian: e.target.value })} min={formData.tgl_pinjam} />
                    </div>
                    <button type="submit" className="btn btn-primary">Simpan</button>
                </form>
            </Modal>

            {/* MODAL KEMBALIKAN */}
            <Modal isOpen={isReturnModalOpen} title="Kembalikan Buku" OnClose={() => setIsReturnModalOpen(false)}>
                <form onSubmit={handleReturnSubmit}>
                    <p>Apakah anda yakin ingin mengembalikan buku ini?</p>
                    <button type="submit" className="btn btn-primary">Kembalikan</button>
                </form>
            </Modal>

            {/* MODAL DENDA */}
            <Modal isOpen={ModalDenda} title="Denda Keterlambatan" OnClose={() => setModalDenda(false)}>
                <div className="text-center">
                    <p className="text-danger">
                        <i className="bi bi-exclamation-circle-fill"></i> Pengembalian melebihi batas waktu!
                        <br /> Terlambat <strong>{daysLate}</strong> hari. Denda mungkin berlaku.
                    </p>
                    <button className="btn btn-danger" onClick={() => setModalDenda(false)}>Tutup</button>
                </div>
            </Modal>
            <Modal isOpen={ModalDenda} title="Denda Keterlambatan" OnClose={() => setModalDenda(false)}>
                <form onSubmit={handleDendaSubmit}>
                    <p className="text-danger text-center">
                        <i className="bi bi-exclamation-circle-fill"></i> Pengembalian melebihi batas waktu!<br />
                        Terlambat <strong>{daysLate}</strong> hari. Anda harus membayar denda sebesar {DendaTelat}.
                    </p>

                    <div className="mb-3">
                        <label>Jumlah Denda</label>
                        <input
                            type="number"
                            className="form-control"
                            value={FormDenda.jumlah_denda}
                            onChange={(e) => setFormDenda({ ...FormDenda, jumlah_denda: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-danger">Submit Denda</button>
                </form>
            </Modal>
        </>
    );
}