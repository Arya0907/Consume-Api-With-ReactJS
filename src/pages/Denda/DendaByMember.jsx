import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../constant";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function DendaByMember() {
    const [idMember, setIdMember] = useState("");
    const [members, setMembers] = useState([]);
    const [dendaData, setDendaData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        // Ambil daftar member saat komponen pertama kali dimuat
        const fetchMembers = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_URL}/member`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setMembers(response.data || []);
            } catch (err) {
                console.error("Gagal memuat data member:", err);
            }
        };

        fetchMembers();
    }, []);

    const fetchDendaByMember = async () => {
        if (!idMember) {
            alert("Pilih member terlebih dahulu");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(`${API_URL}/denda/${idMember}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setDendaData(response.data.data || []);
            setCurrentPage(1); // Reset to first page when new data is loaded
        } catch (err) {
            if(err.response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/";
            };
            setError("Gagal mengambil data denda. Pastikan ID Member benar.");
            setDendaData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMemberChange = (e) => {
        const memberId = e.target.value;
        setIdMember(memberId);

        if (memberId) {
            const member = members.find(m => m.id === parseInt(memberId));
            setSelectedMember(member);
        } else {
            setSelectedMember(null);
        }
    };

    // Pagination logic
    const totalItems = dendaData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = dendaData.slice(startIndex, endIndex);

    const getPaginationRange = () => {
        const range = [];
        const delta = 2;

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

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);

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

    const getTotalDenda = () => {
        return dendaData.reduce((total, denda) => total + parseFloat(denda.jumlah_denda || 0), 0);
    };

    const exportToPDF = () => {
        if (dendaData.length === 0 || !selectedMember) {
            alert("Tidak ada data denda untuk di-export");
            return;
        }

        // Buat dokumen PDF baru
        const doc = new jsPDF();

        // Judul dokumen
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text(`LAPORAN DENDA MEMBER`, 105, 20, { align: 'center' });

        // Informasi member
        doc.setFontSize(12);
        doc.text(`Nama Member: ${selectedMember.nama}`, 14, 30);
        doc.text(`ID Member: ${selectedMember.id}`, 14, 38);
        doc.text(`Total Denda: ${formatCurrency(getTotalDenda())}`, 14, 46);
        doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 54);

        // Header tabel
        const headers = [
            ["ID Denda", "ID Buku", "Jumlah Denda", "Jenis Denda", "Deskripsi"]
        ];

        // Data tabel
        const data = dendaData.map(denda => [
            `#${denda.id}`,
            denda.id_buku,
            formatCurrency(denda.jumlah_denda),
            denda.jenis_denda,
            denda.deskripsi || '-'
        ]);

        // Buat tabel
        autoTable(doc, {
            head: headers,
            body: data,
            startY: 60,
            theme: 'grid',
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 20 },
                2: { cellWidth: 30 },
                3: { cellWidth: 30 },
                4: { cellWidth: 'auto' }
            },
            margin: { top: 60 }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(
                `Halaman ${i} dari ${pageCount}`,
                105,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }

        // Simpan PDF
        doc.save(`Denda_Member_${selectedMember.id}_${selectedMember.nama}.pdf`);
    };
    

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

                @keyframes slideInLeft {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }

                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
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

                .card-gradient {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .stats-card {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                }

                .form-floating-modern .form-control,
                .form-floating-modern .form-select {
                    border-radius: 15px;
                    border: 2px solid #e9ecef;
                    transition: all 0.3s ease;
                }

                .form-floating-modern .form-control:focus,
                .form-floating-modern .form-select:focus {
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

                .badge-animated {
                    transition: all 0.3s ease;
                }

                .badge-animated:hover {
                    animation: pulse 0.6s ease-in-out;
                }
            `}</style>

            <div className="container-fluid p-4 fade-in-up">
                {/* Header Section */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm hover-lift card-gradient">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div>
                                        <h2 className="mb-1 fw-bold">
                                            <span className="me-2">👤</span>
                                            Detail Denda berdasarkan Member
                                        </h2>
                                        <p className="mb-0 opacity-75">Lihat riwayat denda untuk member tertentu</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Member Selection Section */}
                <div className="row mb-4">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm hover-lift">
                            <div className="card-body">
                                <h5 className="card-title mb-3">
                                    <span className="me-2">🔍</span>
                                    Pilih Member
                                </h5>

                                <div className="form-floating-modern mb-3">
                                    <label className="form-label fw-semibold">
                                        <span className="me-2">👥</span>Daftar Member
                                    </label>
                                    <select
                                        className="form-select shadow-sm"
                                        value={idMember}
                                        onChange={handleMemberChange}
                                    >
                                        <option value="">-- Pilih Member --</option>
                                        {members.map((member) => (
                                            <option key={member.id} value={member.id}>
                                                {member.nama} (ID: {member.id})
                                            </option>
                                        ))}
                                    </select>
                                </div>



                                {selectedMember && (
                                    <div className="alert alert-info border-0 rounded-3 mb-3 fade-in-up">
                                        <div className="d-flex align-items-center">
                                            <span className="fs-4 me-3">ℹ️</span>
                                            <div>
                                                <strong>Member Dipilih:</strong><br />
                                                <span className="fw-semibold">{selectedMember.nama}</span>
                                                <span className="text-muted ms-2">(ID: {selectedMember.id})</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    className="btn btn-primary btn-modern shadow-sm px-4"
                                    onClick={fetchDendaByMember}
                                    disabled={!idMember}
                                >
                                    <span className="me-2">📊</span>
                                    Lihat Data Denda
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    {dendaData.length > 0 && (
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm hover-lift stats-card">
                                <div className="card-body text-center">
                                    <div className="fs-1 mb-2">💰</div>
                                    <h5 className="card-title mb-1">Total Denda</h5>
                                    <h3 className="fw-bold mb-2">{formatCurrency(getTotalDenda())}</h3>
                                    <small className="opacity-75">
                                        {dendaData.length} transaksi denda
                                    </small>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="row">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center py-5">
                                    <div className="spinner-border text-primary mb-3" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <h5 className="text-primary">Memuat data denda...</h5>
                                    <p className="text-muted">Sedang mengambil data dari server</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="row">
                        <div className="col-12">
                            <div className="alert alert-danger border-0 rounded-3 shadow-sm">
                                <div className="d-flex align-items-center">
                                    <span className="fs-4 me-3">❌</span>
                                    <div>
                                        <strong>Terjadi Kesalahan!</strong><br />
                                        {error}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Data Table */}
                {!loading && !error && dendaData.length > 0 && (
                    <div className="row">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm hover-lift">
                                <div className="card-header bg-transparent border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">
                                        <span className="me-2">📋</span>
                                        Riwayat Denda
                                    </h5>
                                    <button
                                        className="btn btn-success btn-modern shadow-sm px-4"
                                        onClick={exportToPDF}
                                    >
                                        <i className="fas fa-file-pdf me-2"></i> Export PDF
                                    </button>
                                </div>

                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover table-modern mb-0">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th className="fw-bold">
                                                        <span className="me-2">🆔</span>ID Denda
                                                    </th>
                                                    <th className="fw-bold">
                                                        <span className="me-2">📚</span>ID Buku
                                                    </th>
                                                    <th className="fw-bold">
                                                        <span className="me-2">💵</span>Jumlah Denda
                                                    </th>
                                                    <th className="fw-bold">
                                                        <span className="me-2">🏷️</span>Jenis Denda
                                                    </th>
                                                    <th className="fw-bold">
                                                        <span className="me-2">📝</span>Deskripsi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentData.map((denda, index) => (
                                                    <tr key={denda.id} style={{ animationDelay: `${index * 0.1}s` }}>
                                                        <td className="fw-semibold text-primary">#{denda.id}</td>
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
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="card-footer bg-light border-0 p-4">
                                        <div className="row align-items-center">
                                            <div className="col-md-6">
                                                <div className="text-muted">
                                                    <span className="me-2">📊</span>
                                                    Menampilkan {startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems} data
                                                </div>
                                            </div>
                                            <div className="col-md-6">
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
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && dendaData.length === 0 && selectedMember && (
                    <div className="row">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center py-5">
                                    <div className="text-muted">
                                        <div className="fs-1 mb-3">📋</div>
                                        <h5>Belum Ada Data Denda</h5>
                                        <p>Member <strong>{selectedMember.nama}</strong> belum memiliki riwayat denda.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}