import React from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../../constant";

export default function Registrasi() {
    const [registrasi, setRegistrasi] = useState({
        name: "",
        email: "",
        password: "",
        c_password: "",
    });

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    let navigate = useNavigate();

    function registrasiProcess(e) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Validasi password confirmation
        if (registrasi.password !== registrasi.c_password) {
            setError({ message: "Password dan konfirmasi password tidak cocok!" });
            setIsLoading(false);
            return;
        }

        // Membuat FormData sesuai dengan API requirement
        const formData = new FormData();
        formData.append('name', registrasi.name);
        formData.append('email', registrasi.email);
        formData.append('password', registrasi.password);
        formData.append('c_password', registrasi.c_password);

        axios.post(`${API_URL}/register`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
            .then((res) => {
                console.log(res.data);
                if (res.data.token) {
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                    navigate("/dashboard");
                } else {
                    navigate("/dashboard"); // Redirect ke login jika tidak ada token
                }
            })
            .catch((err) => {
                console.error('Registration error:', err);
                setError(err.response?.data || { message: "Terjadi kesalahan saat registrasi" });
                setIsLoading(false);
            });
    }

    const handleInputChange = (field, value) => {
        setRegistrasi({ ...registrasi, [field]: value });
        // Clear error when user starts typing
        if (error) {
            setError("");
        }
    };

    return (
        <>
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                .fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }

                .slide-in-down {
                    animation: slideInDown 0.6s ease-out forwards;
                }

                .shake-animation {
                    animation: shake 0.5s ease-in-out;
                }

                .bg-gradient-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .bg-pattern {
                    background-image: 
                        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(255, 177, 153, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(102, 126, 234, 0.2) 0%, transparent 50%);
                    min-height: 100vh;
                }

                .card-modern {
                    border: none;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.95);
                    overflow: hidden;
                }

                .form-control-modern {
                    border: 2px solid #e9ecef;
                    border-radius: 12px;
                    padding: 12px 16px;
                    transition: all 0.3s ease;
                    background: rgba(248, 249, 250, 0.8);
                }

                .form-control-modern:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
                    background: white;
                }

                .input-group-text-modern {
                    border: 2px solid #e9ecef;
                    border-right: none;
                    border-radius: 12px 0 0 12px;
                    background: rgba(248, 249, 250, 0.8);
                    color: #667eea;
                    width: 50px;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .input-group:focus-within .input-group-text-modern {
                    border-color: #667eea;
                    background: white;
                }

                .btn-modern {
                    border-radius: 12px;
                    padding: 12px 24px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                }

                .btn-modern:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
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

                .password-toggle {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #6c757d;
                    cursor: pointer;
                    z-index: 5;
                    padding: 4px 8px;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                }

                .password-toggle:hover {
                    color: #667eea;
                    background: rgba(102, 126, 234, 0.1);
                }

                .strength-meter {
                    height: 4px;
                    border-radius: 2px;
                    background: #e9ecef;
                    margin-top: 8px;
                    overflow: hidden;
                }

                .strength-fill {
                    height: 100%;
                    transition: all 0.3s ease;
                    border-radius: 2px;
                }

                .link-modern {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 600;
                    position: relative;
                    transition: all 0.3s ease;
                }

                .link-modern:hover {
                    color: #764ba2;
                    text-decoration: none;
                }

                .link-modern:after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: -2px;
                    left: 0;
                    background: linear-gradient(90deg, #667eea, #764ba2);
                    transition: width 0.3s ease;
                }

                .link-modern:hover:after {
                    width: 100%;
                }
            `}</style>

            <div className="d-flex align-items-center justify-content-center py-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-11 col-sm-10 col-md-8 col-lg-6 col-xl-5 mx-auto" style={{ minWidth: 550, maxWidth: 500 }}>
                            <div className="card card-modern fade-in-up">
                                {/* Header */}
                                <div className="card-header bg-gradient-primary text-white text-center py-4 position-relative">
                                    <div className="slide-in-down">
                                        <h3 className="fw-bold mb-1 d-flex align-items-center justify-content-center">
                                            <span className="me-2 fs-2">🚀</span>
                                            Create Account
                                        </h3>
                                        <p className="mb-0 opacity-90">Join us and start your journey</p>
                                    </div>
                                </div>

                                {/* Error Alert */}
                                {error && (
                                    <div className="alert alert-danger m-3 border-0 rounded-3 shake-animation">
                                        <div className="d-flex align-items-center">
                                            <span className="fs-4 me-2">❌</span>
                                            <div>
                                                {error.message ? (
                                                    <div>{error.message}</div>
                                                ) : (
                                                    <ul className="mb-0 ps-3">
                                                        {Object.entries(error).map(([key, value]) => (
                                                            <li key={key}>{Array.isArray(value) ? value[0] : value}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="card-body p-4">
                                    <form onSubmit={registrasiProcess}>
                                        {/* Name Field */}
                                        <div className="mb-4">
                                            <label className="form-label fw-semibold mb-2">
                                                <span className="me-2">👤</span>
                                                Full Name
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text input-group-text-modern">
                                                    <i className="bi bi-person-fill"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-modern"
                                                    placeholder="Enter your full name"
                                                    value={registrasi.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Email Field */}
                                        <div className="mb-4">
                                            <label className="form-label fw-semibold mb-2">
                                                <span className="me-2">📧</span>
                                                Email Address
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text input-group-text-modern">
                                                    <i className="bi bi-envelope-fill"></i>
                                                </span>
                                                <input
                                                    type="email"
                                                    className="form-control form-control-modern"
                                                    placeholder="Enter your email"
                                                    value={registrasi.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Password Field */}
                                        <div className="mb-4">
                                            <label className="form-label fw-semibold mb-2">
                                                <span className="me-2">🔒</span>
                                                Password
                                            </label>
                                            <div className="input-group position-relative">
                                                <span className="input-group-text input-group-text-modern">
                                                    <i className="bi bi-lock-fill"></i>
                                                </span>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className="form-control form-control-modern pe-5"
                                                    placeholder="Create a strong password"
                                                    value={registrasi.password}
                                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="password-toggle"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                                </button>
                                            </div>
                                            {registrasi.password && (
                                                <div className="strength-meter">
                                                    <div
                                                        className="strength-fill bg-success"
                                                        style={{
                                                            width: registrasi.password.length >= 8 ? '100%' :
                                                                registrasi.password.length >= 6 ? '60%' : '30%'
                                                        }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Confirm Password Field */}
                                        <div className="mb-4">
                                            <label className="form-label fw-semibold mb-2">
                                                <span className="me-2">🔐</span>
                                                Confirm Password
                                            </label>
                                            <div className="input-group position-relative">
                                                <span className="input-group-text input-group-text-modern">
                                                    <i className="bi bi-shield-lock-fill"></i>
                                                </span>
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className="form-control form-control-modern pe-5"
                                                    placeholder="Confirm your password"
                                                    value={registrasi.c_password}
                                                    onChange={(e) => handleInputChange('c_password', e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="password-toggle"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                                </button>
                                            </div>
                                            {registrasi.c_password && (
                                                <small className={`mt-1 d-block ${registrasi.password === registrasi.c_password
                                                        ? 'text-success' : 'text-danger'
                                                    }`}>
                                                    {registrasi.password === registrasi.c_password
                                                        ? '✓ Password cocok' : '✗ Password tidak cocok'
                                                    }
                                                </small>
                                            )}
                                        </div>

                                        {/* Terms & Conditions */}
                                        <div className="mb-4">
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" id="terms" required />
                                                <label className="form-check-label small" htmlFor="terms">
                                                    I agree to the <a href="#" className="link-modern">Terms of Service</a> and
                                                    <a href="#" className="link-modern ms-1">Privacy Policy</a>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="d-grid gap-2">
                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-modern text-white"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Creating Account...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="me-2">🚀</span>
                                                        Create Account
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Footer */}
                                <div className="card-footer bg-transparent text-center py-3 border-0">
                                    <p className="mb-0">
                                        Already have an account?
                                        <Link to="/" className="link-modern ms-1">
                                            Sign In
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}