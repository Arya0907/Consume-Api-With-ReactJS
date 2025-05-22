import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../../constant";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import * as XLSX from "xlsx";

export default function Member() {
    const [member, setMember] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formModal, setFormModal] = useState({
        no_ktp: "",
        nama: "",
        alamat: "",
        tgl_lahir: "",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateTargetId, setUpdateTargetId] = useState(null);
    const [updateFormModal, setUpdateFormModal] = useState({
        no_ktp: "",
        nama: "",
        alamat: "",
        tgl_lahir: "",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Token tidak ditemukan");
            setIsLoading(false);
            return;
        }

        axios
            .get(API_URL + `/member`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                setMember(res.data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err);
                if (err.response.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/";
                };
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return setError("Token tidak ditemukan");

        setIsLoading(true);
        axios
            .post(API_URL + `/member`, formModal, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(() => {
                fetchData();
                setIsModalOpen(false);
                showToast("Member berhasil ditambahkan!");
            })
            .catch((err) => {
                console.error("Gagal Menambahkan Member:", err);
                setError("Gagal menyimpan data baru");
                setIsLoading(false);
            });
    };

    const handleDeleteBtn = (memberId) => {
        setDeleteTargetId(memberId);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        const token = localStorage.getItem("token");
        if (!token) return setError("Token tidak ditemukan");

        setIsLoading(true);
        axios
            .delete(API_URL + `/member/${deleteTargetId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(() => {
                setIsDeleteModalOpen(false);
                fetchData();
                showToast("Member berhasil dihapus!", "danger");
            })
            .catch((err) => {
                console.error("Gagal Menghapus Member:", err);
                setError("Gagal menghapus member");
                setIsLoading(false);
            });
    };

    function handleEditBtn(memberId) {
        const selected = member.find((m) => m.id === memberId);
        if (!selected) return;

        setUpdateFormModal({
            no_ktp: selected.no_ktp,
            nama: selected.nama,
            alamat: selected.alamat,
            tgl_lahir: selected.tgl_lahir,
        });

        setUpdateTargetId(memberId);
        setIsUpdateModalOpen(true);
    }

    function handleEditConfirm(e) {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return setError("Token tidak ditemukan");

        setIsLoading(true);
        axios
            .put(API_URL + `/member/${updateTargetId}`, updateFormModal, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(() => {
                setIsUpdateModalOpen(false);
                fetchData();
                showToast("Member berhasil diperbarui!", "success");
            })
            .catch((err) => {
                console.error("Gagal Mengedit Member:", err);
                setError("Gagal mengedit member");
                setIsLoading(false);
            });
    }

    // Toast notification
    const showToast = (message, type = "success") => {
        const toastContainer = document.getElementById("toast-container");
        if (!toastContainer) {
            const container = document.createElement("div");
            container.id = "toast-container";
            container.className = "toast-container position-fixed top-0 end-0 p-3";
            document.body.appendChild(container);
        }

        const toastId = `toast-${Date.now()}`;
        const toastEl = document.createElement("div");
        toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
        toastEl.id = toastId;
        toastEl.setAttribute("role", "alert");
        toastEl.setAttribute("aria-live", "assertive");
        toastEl.setAttribute("aria-atomic", "true");

        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        document.getElementById("toast-container").appendChild(toastEl);

        const toast = new bootstrap.Toast(toastEl);
        toast.show();

        setTimeout(() => {
            toastEl.remove();
        }, 3000);
    };

    // Filter members based on search term
    const filteredMembers = member.filter(m =>
        m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.no_ktp.includes(searchTerm) ||
        m.alamat.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Export Excel
    const exportToExcel = () => {
        const wsData = [
            ["No", "No KTP", "Nama", "Alamat", "Tanggal Lahir"],
            ...filteredMembers.map((m, idx) => [
                idx + 1,
                m.no_ktp,
                m.nama,
                m.alamat,
                new Date(m.tgl_lahir).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric'
                })
            ])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Member");
        XLSX.writeFile(wb, `Daftar_Member_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    return (
        <div className="container-fluid py-4 animate__animated animate__fadeIn">
            {/* Toast container */}
            <div id="toast-container" className="toast-container position-fixed top-0 end-0 p-3"></div>

            {/* Error alert */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
            )}

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold text-primary">
                        <i className="bi bi-people-fill me-2"></i>Daftar Member
                    </h5>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-success d-flex align-items-center"
                            onClick={exportToExcel}
                        >
                            <i className="bi bi-file-earmark-excel me-2"></i> Export Excel
                        </button>
                        <button
                            className="btn btn-primary d-flex align-items-center"
                            onClick={() => {
                                setFormModal({
                                    no_ktp: "",
                                    nama: "",
                                    alamat: "",
                                    tgl_lahir: "",
                                });
                                setIsModalOpen(true);
                            }}
                        >
                            <i className="bi bi-plus-circle me-2"></i> Tambah Member
                        </button>
                    </div>
                </div>

                <div className="card-body">
                    {/* Search and filter */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Cari member berdasarkan nama, KTP, atau alamat..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 text-md-end mt-3 mt-md-0">
                            <span className="text-muted">
                                Total: <span className="fw-bold">{filteredMembers.length}</span> member
                            </span>
                            <button className="btn btn-sm btn-outline-secondary ms-2" onClick={fetchData}>
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive rounded">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4" width="5%">#</th>
                                    <th width="15%">No KTP</th>
                                    <th width="20%">Nama</th>
                                    <th width="25%">Alamat</th>
                                    <th width="15%">Tgl Lahir</th>
                                    <th width="20%" className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2 text-muted">Memuat data...</p>
                                        </td>
                                    </tr>
                                ) : filteredMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-5 text-muted">
                                            <i className="bi bi-inbox-fill fs-1 d-block mb-3 opacity-50"></i>
                                            {searchTerm ?
                                                "Tidak ada member yang cocok dengan pencarian Anda." :
                                                "Belum ada data member. Klik 'Tambah Member' untuk menambahkan."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMembers.map((m, index) => (
                                        <tr key={m.id} className="member-row">
                                            <td className="ps-4">{index + 1}</td>
                                            <td>{m.no_ktp}</td>
                                            <td className="fw-medium text-primary">{m.nama}</td>
                                            <td>
                                                <div className="text-truncate" style={{ maxWidth: "250px" }}>
                                                    <i className="bi bi-geo-alt text-muted me-1"></i>
                                                    {m.alamat}
                                                </div>
                                            </td>
                                            <td>
                                                <i className="bi bi-calendar3 text-muted me-1"></i>
                                                {new Date(m.tgl_lahir).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleEditBtn(m.id)}
                                                        data-bs-toggle="tooltip"
                                                        data-bs-placement="top"
                                                        title="Edit Member"
                                                    >
                                                        <i className="bi bi-pencil-square">Edit</i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDeleteBtn(m.id)}
                                                        data-bs-toggle="tooltip"
                                                        data-bs-placement="top"
                                                        title="Hapus Member"
                                                    >
                                                        <i className="bi bi-trash">Hapus</i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Tambah */}
            <Modal isOpen={isModalOpen} OnClose={() => setIsModalOpen(false)} title="Tambah Member">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="form-label fw-medium">No KTP <span className="text-danger">*</span></label>
                        <div className="input-group">
                            <span className="input-group-text bg-light">
                                <i className="bi bi-credit-card"></i>
                            </span>
                            <input
                                className="form-control"
                                type="text"
                                value={formModal.no_ktp}
                                onChange={(e) => setFormModal({ ...formModal, no_ktp: e.target.value })}
                                placeholder="Masukkan No KTP"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-medium">Nama <span className="text-danger">*</span></label>
                        <div className="input-group">
                            <span className="input-group-text bg-light">
                                <i className="bi bi-person"></i>
                            </span>
                            <input
                                className="form-control"
                                type="text"
                                value={formModal.nama}
                                onChange={(e) => setFormModal({ ...formModal, nama: e.target.value })}
                                placeholder="Masukkan Nama"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-medium">Alamat <span className="text-danger">*</span></label>
                        <div className="input-group">
                            <span className="input-group-text bg-light">
                                <i className="bi bi-geo-alt"></i>
                            </span>
                            <input
                                className="form-control"
                                type="text"
                                value={formModal.alamat}
                                onChange={(e) => setFormModal({ ...formModal, alamat: e.target.value })}
                                placeholder="Masukkan Alamat"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-medium">Tanggal Lahir <span className="text-danger">*</span></label>
                        <div className="input-group">
                            <span className="input-group-text bg-light">
                                <i className="bi bi-calendar-date"></i>
                            </span>
                            <input
                                className="form-control"
                                type="date"
                                value={formModal.tgl_lahir}
                                onChange={(e) => setFormModal({ ...formModal, tgl_lahir: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary px-4"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Tambahkan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Delete */}
            <Modal isOpen={isDeleteModalOpen} OnClose={() => setIsDeleteModalOpen(false)} title="Hapus Member">
                <div className="text-center mb-4">
                    <i className="bi bi-exclamation-triangle text-danger fs-1"></i>
                    <h5 className="mt-3">Konfirmasi Hapus</h5>
                    <p>
                        Apakah Anda yakin ingin menghapus member{" "}
                        <strong className="text-danger">{member.find((m) => m.id === deleteTargetId)?.nama}</strong>?
                        <br />
                        <small className="text-muted">Tindakan ini tidak dapat dibatalkan.</small>
                    </p>
                </div>
                <div className="d-flex justify-content-center gap-3">
                    <button
                        className="btn btn-light px-4"
                        onClick={() => setIsDeleteModalOpen(false)}
                    >
                        Batal
                    </button>
                    <button
                        className="btn btn-danger px-4"
                        onClick={handleDeleteConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Processing...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-trash me-2"></i>
                                Hapus
                            </>
                        )}
                    </button>
                </div>
            </Modal>

            {/* Modal Update */}
            <Modal isOpen={isUpdateModalOpen} OnClose={() => setIsUpdateModalOpen(false)} title="Edit Member">
                <form onSubmit={handleEditConfirm}>
                    <div className="mb-4">
                        <label className="form-label fw-medium">No KTP <span className="text-danger">*</span></label>
                        <div className="input-group">
                            <span className="input-group-text bg-light">
                                <i className="bi bi-credit-card"></i>
                            </span>
                            <input
                                className="form-control"
                                type="text"
                                value={updateFormModal.no_ktp}
                                onChange={(e) => setUpdateFormModal({ ...updateFormModal, no_ktp: e.target.value })}
                                placeholder="Masukkan No KTP"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-medium">Nama <span className="text-danger">*</span></label>
                        <div className="input-group">
                            <span className="input-group-text bg-light">
                                <i className="bi bi-person"></i>
                            </span>
                            <input
                                className="form-control"
                                type="text"
                                value={updateFormModal.nama}
                                onChange={(e) => setUpdateFormModal({ ...updateFormModal, nama: e.target.value })}
                                placeholder="Masukkan Nama"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-medium">Alamat <span className="text-danger">*</span></label>
                        <div className="input-group">
                            <span className="input-group-text bg-light">
                                <i className="bi bi-geo-alt"></i>
                            </span>
                            <input
                                className="form-control"
                                type="text"
                                value={updateFormModal.alamat}
                                onChange={(e) => setUpdateFormModal({ ...updateFormModal, alamat: e.target.value })}
                                placeholder="Masukkan Alamat"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-medium">Tanggal Lahir <span className="text-danger">*</span></label>
                        <div className="input-group">
                            <span className="input-group-text bg-light">
                                <i className="bi bi-calendar-date"></i>
                            </span>
                            <input
                                className="form-control"
                                type="date"
                                value={updateFormModal.tgl_lahir}
                                onChange={(e) => setUpdateFormModal({ ...updateFormModal, tgl_lahir: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => setIsUpdateModalOpen(false)}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="btn btn-success px-4"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check2-circle me-2"></i>
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Add necessary styles for animation */}
            <style jsx>{`
                .animate__animated {
                    animation-duration: 0.5s;
                }
                .animate__fadeIn {
                    animation-name: fadeIn;
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                .member-row {
                    transition: all 0.2s ease;
                }
                .member-row:hover {
                    background-color: rgba(13, 110, 253, 0.05);
                }
            `}</style>
        </div>
    );
}