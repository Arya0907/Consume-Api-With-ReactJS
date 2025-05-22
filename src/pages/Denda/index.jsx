import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../constant";
import Modal from "../../components/Modal";

export default function Denda() {
    const [dataDenda, setDataDenda] = useState([]);
    const [returnData, setReturnData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formModal, setFormModal] = useState({
        id_member: "",
        id_buku: "",
        jumlah_denda: "",
        jenis_denda: "",
        deskripsi: "",
    });
    const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchData();
        fetchReturnData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        axios.get(`${API_URL}/denda`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then((res) => {
            setDataDenda(res.data.data || []);
        }).catch((err) => {
            if (err.response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/";
            };
        })
            .finally(() => setLoading(false));
    };

    const fetchReturnData = () => {
        const token = localStorage.getItem("token");
        axios.get(`${API_URL}/peminjaman`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then((res) => {
            const belumKembali = res.data.data.filter(item => item.status_pengembalian === 0);
            setReturnData(belumKembali);
        }).catch(console.error);
    };

    const isTerlambat = (tgl_pengembalian) => {
        return new Date() > new Date(tgl_pengembalian);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            // 1. Tambahkan denda
            await axios.post(`${API_URL}/denda`, formModal, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 2. Update status_pengembalian
            const peminjaman = returnData.find(item =>
                item.id_member === formModal.id_member &&
                item.id_buku === formModal.id_buku
            );

            if (peminjaman) {
                await axios.put(`${API_URL}/peminjaman/pengembalian/${peminjaman.id}`, {
                    status_pengembalian: 1
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            // Reset & refresh
            setFormModal({ id_member: "", id_buku: "", jumlah_denda: "", jenis_denda: "", deskripsi: "" });
            setSelectedPeminjaman(null);
            setIsModalOpen(false);
            fetchData();
            fetchReturnData();
        } catch (error) {
            console.error("Gagal menyimpan:", error);
            alert("Terjadi kesalahan saat menyimpan data.");
        }
    };

    const handleSelectPeminjaman = (item) => {
        setSelectedPeminjaman(item);
        setFormModal(prev => ({
            ...prev,
            id_member: item.id_member,
            id_buku: item.id_buku,
        }));
    };

    const getJenisDendaOptions = () => {
        const options = [];
        if (selectedPeminjaman) {
            if (isTerlambat(selectedPeminjaman.tgl_pengembalian)) {
                options.push("terlambat");
            }
            options.push("kerusakan", "lainnya");
        }
        return options;
    };

    const filteredData = dataDenda.filter((d) =>
        Object.values(d).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getPaginationRange = () => {
        const range = [];
        const delta = 2; // Number of pages to show before and after current page

        for (let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            range.unshift("...");
        }
        if (currentPage + delta < totalPages - 1) {
            range.push("...");
        }

        range.unshift(1);
        if (totalPages !== 1) {
            range.push(totalPages);
        }

        return range;
    };

    const getBadgeColor = (jenis) => {
        switch (jenis?.toLowerCase()) {
            case "terlambat": return "bg-warning text-dark";
            case "kerusakan": return "bg-danger";
            case "lainnya": return "bg-info";
            default: return "bg-secondary";
        }
    };

    const getJenisIcon = (jenis) => {
        switch (jenis?.toLowerCase()) {
            case "terlambat": return "🕒";
            case "kerusakan": return "💥";
            case "lainnya": return "📋";
            default: return "❓";
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);

    return (
        <>
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }

                @keyframes slideInLeft {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }

                @keyframes shimmer {
                    0% { background-position: -200px 0; }
                    100% { background-position: calc(200px + 100%) 0; }
                }

                .fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }

                .hover-lift {
                    transition: all 0.3s ease;
                }

                .hover-lift:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                }

                .btn-modern {
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .btn-modern:before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: left 0.5s;
                }

                .btn-modern:hover:before {
                    left: 100%;
                }

                .table-modern tbody tr {
                    transition: all 0.3s ease;
                    animation: slideInLeft 0.5s ease-out forwards;
                }

                .table-modern tbody tr:hover {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    transform: scale(1.01);
                }

                .search-container {
                    position: relative;
                }

                .search-icon {
                    position: absolute;
                    left: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #6c757d;
                    font-size: 1.1rem;
                }

                .search-input {
                    padding-left: 45px;
                    border-radius: 50px;
                    border: 2px solid #e9ecef;
                    transition: all 0.3s ease;
                }

                .search-input:focus {
                    border-color: #0d6efd;
                    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
                }

                .card-gradient {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .loading-shimmer {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200px 100%;
                    animation: shimmer 1.5s infinite;
                }

                .badge-animated {
                    transition: all 0.3s ease;
                }

                .badge-animated:hover {
                    animation: pulse 0.6s ease-in-out;
                }

                .form-floating-modern .form-control {
                    border-radius: 15px;
                    border: 2px solid #e9ecef;
                    transition: all 0.3s ease;
                }

                .form-floating-modern .form-control:focus {
                    border-color: #0d6efd;
                    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
                }

                .pagination .page-link {
                    transition: all 0.3s ease;
                }

                .pagination .page-link:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }

                .pagination .page-item.active .page-link {
                    background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
                    border: none;
                }

                .modal-content-modern {
                    border: none;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
            `}</style>

            <div className="container-fluid p-4 fade-in-up">
                {/* Header Section */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm hover-lift card-gradient">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h2 className="mb-1 fw-bold">
                                            <span className="me-2">💰</span>
                                            Data Denda
                                        </h2>
                                        <p className="mb-0 opacity-75">Kelola denda perpustakaan</p>
                                    </div>
                                    <button
                                        className="btn btn-light btn-modern shadow-sm px-4"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        <span className="me-2">➕</span>
                                        Tambah Denda
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filter Section */}
                <div className="row mb-4">
                    <div className="col-md-6">
                        <div className="search-container">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                className="form-control search-input shadow-sm"
                                placeholder="Cari berdasarkan member, buku, atau jenis denda..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-6 d-flex justify-content-end align-items-center">
                        <div className="d-flex align-items-center">
                            <label className="me-2 fw-semibold text-muted">📊 Show:</label>
                            <select
                                className="form-select"
                                style={{ width: 'auto', borderRadius: '10px' }}
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="ms-2 text-muted">entries</span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm hover-lift">
                            <div className="card-body p-0">
                                {loading ? (
                                    <div className="p-5 text-center">
                                        <div className="spinner-border text-primary mb-3" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="text-muted">Memuat data denda...</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover table-modern mb-0">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th className="fw-bold">
                                                        <span className="me-2">🆔</span>ID
                                                    </th>
                                                    <th className="fw-bold">
                                                        <span className="me-2">👤</span>Member
                                                    </th>
                                                    <th className="fw-bold">
                                                        <span className="me-2">📚</span>Buku
                                                    </th>
                                                    <th className="fw-bold">
                                                        <span className="me-2">💵</span>Jumlah
                                                    </th>
                                                    <th className="fw-bold">
                                                        <span className="me-2">🏷️</span>Jenis
                                                    </th>
                                                    <th className="fw-bold">
                                                        <span className="me-2">📝</span>Deskripsi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentData.length > 0 ? (
                                                    currentData.map((denda, index) => (
                                                        <tr key={denda.id} style={{ animationDelay: `${index * 0.1}s` }}>
                                                            <td className="fw-semibold text-primary">#{denda.id}</td>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                                                        <small className="text-primary fw-bold">M</small>
                                                                    </div>
                                                                    {denda.id_member}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-2">
                                                                        <small className="text-success fw-bold">B</small>
                                                                    </div>
                                                                    {denda.id_buku}
                                                                </div>
                                                            </td>
                                                            <td className="fw-bold text-success">
                                                                {formatCurrency(denda.jumlah_denda)}
                                                            </td>
                                                            <td>
                                                                <span className={`badge rounded-pill ${getBadgeColor(denda.jenis_denda)} badge-animated px-3 py-2`}>
                                                                    <span className="me-1">{getJenisIcon(denda.jenis_denda)}</span>
                                                                    {denda.jenis_denda}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="text-truncate" style={{ maxWidth: '200px' }} title={denda.deskripsi}>
                                                                    {denda.deskripsi || '-'}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="text-center py-5">
                                                            <div className="text-muted">
                                                                <div className="fs-1 mb-3">
                                                                    {searchTerm ? '🔍' : '📋'}
                                                                </div>
                                                                <h5>
                                                                    {searchTerm ? 'Tidak ditemukan' : 'Tidak ada data denda'}
                                                                </h5>
                                                                <p>
                                                                    {searchTerm
                                                                        ? `Tidak ada hasil untuk "${searchTerm}"`
                                                                        : 'Belum ada denda yang tercatat dalam sistem'
                                                                    }
                                                                </p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Pagination & Info */}
                            {!loading && filteredData.length > 0 && (
                                <div className="card-footer bg-light border-0 p-4">
                                    <div className="row align-items-center">
                                        <div className="col-md-6">
                                            <div className="text-muted">
                                                <span className="me-2">📊</span>
                                                Menampilkan {startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems} data
                                                {searchTerm && (
                                                    <span className="ms-2 text-primary">
                                                        (difilter dari {dataDenda.length} total)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            {totalPages > 1 && (
                                                <nav aria-label="Pagination Navigation">
                                                    <ul className="pagination justify-content-end mb-0">
                                                        {/* Previous Button */}
                                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link border-0 shadow-sm me-1"
                                                                onClick={() => handlePageChange(currentPage - 1)}
                                                                disabled={currentPage === 1}
                                                                style={{ borderRadius: '8px' }}
                                                            >
                                                                ⬅️ Prev
                                                            </button>
                                                        </li>

                                                        {/* Page Numbers */}
                                                        {getPaginationRange().map((page, index) => (
                                                            <li key={index} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                                                                {page === "..." ? (
                                                                    <span className="page-link border-0 bg-transparent text-muted">...</span>
                                                                ) : (
                                                                    <button
                                                                        className={`page-link border-0 shadow-sm mx-1 ${page === currentPage
                                                                                ? 'bg-primary text-white'
                                                                                : 'bg-white text-primary hover-lift'
                                                                            }`}
                                                                        onClick={() => handlePageChange(page)}
                                                                        style={{
                                                                            borderRadius: '8px',
                                                                            minWidth: '40px',
                                                                            transition: 'all 0.3s ease'
                                                                        }}
                                                                    >
                                                                        {page}
                                                                    </button>
                                                                )}
                                                            </li>
                                                        ))}

                                                        {/* Next Button */}
                                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link border-0 shadow-sm ms-1"
                                                                onClick={() => handlePageChange(currentPage + 1)}
                                                                disabled={currentPage === totalPages}
                                                                style={{ borderRadius: '8px' }}
                                                            >
                                                                Next ➡️
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="modal-content-modern">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header border-0 pb-0">
                            <h4 className="modal-title fw-bold text-primary">
                                <span className="me-2">➕</span>
                                Tambah Denda Baru
                            </h4>
                        </div>

                        <div className="modal-body">
                            <div className="form-floating-modern mb-4">
                                <label className="form-label fw-semibold">
                                    <span className="me-2">📋</span>Pilih Peminjaman
                                </label>
                                <select
                                    className="form-select shadow-sm"
                                    style={{ borderRadius: '15px' }}
                                    onChange={(e) => {
                                        const selected = returnData.find(item => item.id === parseInt(e.target.value));
                                        handleSelectPeminjaman(selected);
                                    }}
                                    required
                                >
                                    <option value="">-- Pilih Peminjaman --</option>
                                    {returnData.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            👤 {item.id_member} - 📚 {item.id_buku} | 📅 {item.tgl_pengembalian}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedPeminjaman && (
                                <div className="fade-in-up">
                                    <div className="alert alert-info border-0 rounded-3 mb-4">
                                        <div className="d-flex align-items-center">
                                            <span className="fs-4 me-3">ℹ️</span>
                                            <div>
                                                <strong>Peminjaman Dipilih:</strong><br />
                                                Member: {selectedPeminjaman.id_member} | Buku: {selectedPeminjaman.id_buku}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-floating-modern mb-4">
                                        <label className="form-label fw-semibold">
                                            <span className="me-2">🏷️</span>Jenis Denda
                                        </label>
                                        <select
                                            className="form-select shadow-sm"
                                            style={{ borderRadius: '15px' }}
                                            value={formModal.jenis_denda}
                                            onChange={(e) => setFormModal({ ...formModal, jenis_denda: e.target.value })}
                                            required
                                        >
                                            <option value="">-- Pilih Jenis --</option>
                                            {getJenisDendaOptions().map((jenis) => (
                                                <option key={jenis} value={jenis}>
                                                    {getJenisIcon(jenis)} {jenis}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-floating-modern mb-4">
                                        <label className="form-label fw-semibold">
                                            <span className="me-2">💵</span>Jumlah Denda (IDR)
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control shadow-sm"
                                            style={{ borderRadius: '15px' }}
                                            value={formModal.jumlah_denda}
                                            onChange={(e) => setFormModal({ ...formModal, jumlah_denda: e.target.value })}
                                            placeholder="Masukkan jumlah denda"
                                            required
                                        />
                                    </div>

                                    <div className="form-floating-modern mb-4">
                                        <label className="form-label fw-semibold">
                                            <span className="me-2">📝</span>Deskripsi
                                        </label>
                                        <textarea
                                            className="form-control shadow-sm"
                                            style={{ borderRadius: '15px', minHeight: '100px' }}
                                            value={formModal.deskripsi}
                                            onChange={(e) => setFormModal({ ...formModal, deskripsi: e.target.value })}
                                            placeholder="Tambahkan keterangan denda (opsional)"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer border-0 pt-0">
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-modern me-2"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <span className="me-2">❌</span>Batal
                            </button>
                            {selectedPeminjaman && (
                                <button type="submit" className="btn btn-success btn-modern shadow-sm">
                                    <span className="me-2">💾</span>Simpan Denda
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}