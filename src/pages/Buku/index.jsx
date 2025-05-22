import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../constant";
import Modal from "../../components/Modal";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

export default function BukuIndex() {
    const [books, setBooks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("list"); // list, bar-chart, pie-chart
    const [searchTerm, setSearchTerm] = useState("");

    const [formModal, setFormModal] = useState({
        no_rak: "",
        judul: "",
        pengarang: "",
        tahun_terbit: "",
        penerbit: "",
        stok: "",
        detail: "",
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateFormModal, setUpdateFormModal] = useState({
        no_rak: "",
        judul: "",
        pengarang: "",
        tahun_terbit: "",
        penerbit: "",
        stok: "",
        detail: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    function fetchData() {
        axios
            .get(API_URL + "/buku", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                setBooks(res.data);
            })
            .catch((err) => {
                console.error(err);
                if(err.response.status === 401){
                    localStorage.removeItem("token");
                    window.location.href = "/";
                } ;
            });
    }

    function handleSubmit(e) {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return setError("Token tidak ditemukan");
        axios
            .post(API_URL + "/buku", formModal, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })
            .then(() => {
                fetchData();
                setIsModalOpen(false);
                setFormModal({
                    no_rak: "",
                    judul: "",
                    pengarang: "",
                    tahun_terbit: "",
                    penerbit: "",
                    stok: "",
                    detail: "",
                });
            })
            .catch((err) => {
                setError(err.response?.data?.message || "Gagal menambahkan buku");
            });
    }

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormModal((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleDetail(bookId) {
        setSelectedBook(bookId);
        setIsDetailModalOpen(true);
    }

    function handleDeleteConfirm() {
        const token = localStorage.getItem("token");
        if (!token) return setError("Token tidak ditemukan");
        axios.delete(API_URL + `/buku/${selectedBook}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(() => {
            setIsDeleteModalOpen(false);
            fetchData();
        }).catch((err) => {
            console.error("Gagal Menghapus Buku:", err);
            setError("Gagal menghapus buku");
        });
    }

    function handleDelete(bookId) {
        setSelectedBook(bookId);
        setIsDeleteModalOpen(true);
    }

    function handleEdit(bookId) {
        const book = books.find((b) => b.id === bookId);
        if (!book) return;

        setSelectedBook(bookId);
        setUpdateFormModal({
            no_rak: book.no_rak,
            judul: book.judul,
            pengarang: book.pengarang,
            tahun_terbit: book.tahun_terbit,
            penerbit: book.penerbit,
            stok: book.stok,
            detail: book.detail,
        });
        setIsUpdateModalOpen(true);
    }

    function handleEditConfirm(e) {
        e.preventDefault();
        const token = localStorage.getItem("token");
        axios
            .put(API_URL + `/buku/${selectedBook}`, updateFormModal, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                if (res.status === 200) {
                    setIsUpdateModalOpen(false);
                    fetchData();
                    setSelectedBook(null);
                }
            })
            .catch((err) => {
                console.error("Gagal Mengedit Buku:", err);
                setError(err.response?.data?.message || "Gagal mengedit buku");
            });
    }

    // Ambil detail buku yang dipilih
    const bookDetail = books.find((book) => book.id === selectedBook);

    // Persiapkan data untuk grafik
    const prepareBarChartData = () => {
        // Mengelompokkan buku berdasarkan penerbit dan menghitung jumlahnya
        const publishers = {};
        books.forEach(book => {
            if (publishers[book.penerbit]) {
                publishers[book.penerbit]++;
            } else {
                publishers[book.penerbit] = 1;
            }
        });

        return Object.keys(publishers).map(publisher => ({
            name: publisher,
            jumlah: publishers[publisher]
        }));
    };

    const preparePieChartData = () => {
        // Data untuk diagram pie berdasarkan stok buku
        return books.map(book => ({
            name: book.judul,
            value: parseInt(book.stok)
        }));
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7300'];

    // Filter buku berdasarkan pencarian
    const filteredBooks = books.filter(book => 
        book.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.pengarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.penerbit.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">Sistem Manajemen Perpustakaan</h4>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                    {error}
                                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                                </div>
                            )}

                            <div className="d-flex justify-content-between mb-4">
                                <div>
                                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                                        <i className="fas fa-plus me-2"></i>Tambah Buku
                                    </button>
                                </div>
                                <div className="d-flex">
                                    <div className="input-group me-3" style={{ width: "300px" }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Cari judul, pengarang, penerbit..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <button className="btn btn-outline-secondary" type="button">
                                            <i className="fas fa-search"></i>
                                        </button>
                                    </div>
                                    <div className="btn-group">
                                        <button 
                                            className={`btn ${activeTab === "list" ? "btn-primary" : "btn-outline-primary"}`}
                                            onClick={() => setActiveTab("list")}
                                        >
                                            <i className="fas fa-list me-1"></i> Daftar
                                        </button>
                                        <button 
                                            className={`btn ${activeTab === "bar-chart" ? "btn-primary" : "btn-outline-primary"}`}
                                            onClick={() => setActiveTab("bar-chart")}
                                        >
                                            <i className="fas fa-chart-bar me-1"></i> Grafik Batang
                                        </button>
                                        <button 
                                            className={`btn ${activeTab === "pie-chart" ? "btn-primary" : "btn-outline-primary"}`}
                                            onClick={() => setActiveTab("pie-chart")}
                                        >
                                            <i className="fas fa-chart-pie me-1"></i> Grafik Lingkaran
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Ringkasan Statistik */}
                            <div className="row mb-4">
                                <div className="col-md-3">
                                    <div className="card bg-info text-white">
                                        <div className="card-body">
                                            <h5 className="card-title">Total Buku</h5>
                                            <h2>{books.length}</h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card bg-success text-white">
                                        <div className="card-body">
                                            <h5 className="card-title">Total Stok</h5>
                                            <h2>{books.reduce((sum, book) => sum + parseInt(book.stok || 0), 0)}</h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card bg-warning text-white">
                                        <div className="card-body">
                                            <h5 className="card-title">Penerbit</h5>
                                            <h2>{new Set(books.map(book => book.penerbit)).size}</h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card bg-danger text-white">
                                        <div className="card-body">
                                            <h5 className="card-title">Pengarang</h5>
                                            <h2>{new Set(books.map(book => book.pengarang)).size}</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {activeTab === "list" && (
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped table-bordered">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>No</th>
                                                <th>No Rak</th>
                                                <th>Judul Buku</th>
                                                <th>Pengarang</th>
                                                <th>Tahun Terbit</th>
                                                <th>Penerbit</th>
                                                <th>Stok</th>
                                                <th>Detail</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBooks.length > 0 ? (
                                                filteredBooks.map((book, index) => (
                                                    <tr key={book.id}>
                                                        <td>{index + 1}</td>
                                                        <td>{book.no_rak}</td>
                                                        <td>{book.judul}</td>
                                                        <td>{book.pengarang}</td>
                                                        <td>{book.tahun_terbit}</td>
                                                        <td>{book.penerbit}</td>
                                                        <td>
                                                            <span className={`badge ${parseInt(book.stok) > 5 ? 'bg-success' : 'bg-danger'}`}>
                                                                {book.stok}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-info btn-sm" 
                                                                onClick={() => handleDetail(book.id)}
                                                            >
                                                                <i className="fas fa-info-circle me-1"></i> Detail
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <div className="btn-group">
                                                                <button 
                                                                    className="btn btn-warning btn-sm" 
                                                                    onClick={() => handleEdit(book.id)}
                                                                >
                                                                    <i className="fas fa-edit me-1"></i> Edit
                                                                </button>
                                                                <button 
                                                                    className="btn btn-danger btn-sm" 
                                                                    onClick={() => handleDelete(book.id)}
                                                                >
                                                                    <i className="fas fa-trash me-1"></i> Hapus
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="9" className="text-center py-3">
                                                        Tidak ada data buku yang ditemukan
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === "bar-chart" && (
                                <div className="chart-container text-center">
                                    <h4 className="mb-4">Grafik Jumlah Buku per Penerbit</h4>
                                    <div className="d-flex justify-content-center">
                                        <BarChart
                                            width={800}
                                            height={400}
                                            data={prepareBarChartData()}
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="jumlah" fill="#8884d8" name="Jumlah Buku" />
                                        </BarChart>
                                    </div>
                                </div>
                            )}

                            {activeTab === "pie-chart" && (
                                <div className="chart-container text-center">
                                    <h4 className="mb-4">Distribusi Stok Buku</h4>
                                    <div className="d-flex justify-content-center">
                                        <PieChart width={800} height={400}>
                                            <Pie
                                                data={preparePieChartData()}
                                                cx={400}
                                                cy={200}
                                                labelLine={false}
                                                outerRadius={150}
                                                fill="#8884d8"
                                                dataKey="value"
                                                nameKey="name"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {preparePieChartData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value} buku`, 'Stok']} />
                                            <Legend />
                                        </PieChart>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Tambah Buku */}
            <Modal isOpen={isModalOpen} title="Tambah Buku" OnClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">No Rak</label>
                        <input
                            type="text"
                            className="form-control"
                            name="no_rak"
                            value={formModal.no_rak}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Judul Buku</label>
                        <input
                            type="text"
                            className="form-control"
                            name="judul"
                            value={formModal.judul}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Pengarang</label>
                        <input
                            type="text"
                            className="form-control"
                            name="pengarang"
                            value={formModal.pengarang}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Tahun Terbit</label>
                        <input
                            type="date"
                            className="form-control"
                            name="tahun_terbit"
                            value={formModal.tahun_terbit}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Penerbit</label>
                        <input
                            type="text"
                            className="form-control"
                            name="penerbit"
                            value={formModal.penerbit}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Stok</label>
                        <input
                            type="number"
                            className="form-control"
                            name="stok"
                            value={formModal.stok}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Detail</label>
                        <textarea
                            className="form-control"
                            name="detail"
                            value={formModal.detail}
                            onChange={handleInputChange}
                            rows="3"
                        />
                    </div>
                    <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-primary">
                            <i className="fas fa-save me-2"></i>Simpan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Detail Buku */}
            <Modal isOpen={isDetailModalOpen} title="Detail Buku" OnClose={() => setIsDetailModalOpen(false)}>
                {bookDetail ? (
                    <div className="card border-0">
                        <div className="card-body">
                            <div className="d-flex justify-content-center mb-3">
                                <div className="book-icon" style={{ fontSize: "64px", color: "#0d6efd" }}>
                                    <i className="fas fa-book"></i>
                                </div>
                            </div>
                            <h4 className="text-center mb-4">{bookDetail.judul}</h4>
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>No Rak:</strong> {bookDetail.no_rak}</p>
                                    <p><strong>Pengarang:</strong> {bookDetail.pengarang}</p>
                                    <p><strong>Tahun Terbit:</strong> {bookDetail.tahun_terbit}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Penerbit:</strong> {bookDetail.penerbit}</p>
                                    <p><strong>Stok:</strong> <span className={`badge ${parseInt(bookDetail.stok) > 5 ? 'bg-success' : 'bg-danger'}`}>{bookDetail.stok}</span></p>
                                </div>
                            </div>
                            <div className="mt-3">
                                <p><strong>Detail:</strong></p>
                                <p className="border p-3 rounded bg-light">{bookDetail.detail || "Tidak ada detail yang tersedia"}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Data buku tidak ditemukan.</p>
                )}
            </Modal>

            {/* Modal Konfirmasi Hapus */}
            <Modal isOpen={isDeleteModalOpen} title="Hapus Buku" OnClose={() => setIsDeleteModalOpen(false)}>
                <div className="text-center mb-4">
                    <div className="display-1 text-danger">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <h4>Konfirmasi Hapus</h4>
                    <p>Apakah Anda yakin ingin menghapus buku <strong>{bookDetail ? bookDetail.judul : ""}</strong>?</p>
                    <p className="text-muted small">Tindakan ini tidak dapat dibatalkan</p>
                </div>
                <div className="d-flex justify-content-center gap-2">
                    <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Batal</button>
                    <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                        <i className="fas fa-trash me-2"></i>Hapus
                    </button>
                </div>
            </Modal>

            {/* Modal Edit Buku */}
            <Modal isOpen={isUpdateModalOpen} title="Edit Buku" OnClose={() => setIsUpdateModalOpen(false)}>
                <form onSubmit={handleEditConfirm}>
                    <div className="mb-3">
                        <label className="form-label">No Rak</label>
                        <input
                            type="text"
                            className="form-control"
                            name="no_rak"
                            value={updateFormModal.no_rak}
                            onChange={(e) => setUpdateFormModal({ ...updateFormModal, no_rak: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Judul Buku</label>
                        <input
                            type="text"
                            className="form-control"
                            name="judul"
                            value={updateFormModal.judul}
                            onChange={(e) => setUpdateFormModal({ ...updateFormModal, judul: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Pengarang</label>
                        <input
                            type="text"
                            className="form-control"
                            name="pengarang"
                            value={updateFormModal.pengarang}
                            onChange={(e) => setUpdateFormModal({ ...updateFormModal, pengarang: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Tahun Terbit</label>
                        <input
                            type="date"
                            className="form-control"
                            name="tahun_terbit"
                            value={updateFormModal.tahun_terbit}
                            onChange={(e) => setUpdateFormModal({ ...updateFormModal, tahun_terbit: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Penerbit</label>
                        <input
                            type="text"
                            className="form-control"
                            name="penerbit"
                            value={updateFormModal.penerbit}
                            onChange={(e) => setUpdateFormModal({ ...updateFormModal, penerbit: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Stok</label>
                        <input
                            type="number"
                            className="form-control"
                            name="stok"
                            value={updateFormModal.stok}
                            onChange={(e) => setUpdateFormModal({ ...updateFormModal, stok: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Detail</label>
                        <textarea
                            className="form-control"
                            name="detail"
                            value={updateFormModal.detail}
                            onChange={(e) => setUpdateFormModal({ ...updateFormModal, detail: e.target.value })}
                            rows="3"
                        />
                    </div>
                    <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-primary">
                            <i className="fas fa-save me-2"></i>Simpan Perubahan
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}