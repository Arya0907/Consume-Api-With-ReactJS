import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../constant";

export default function Login() {
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  let navigate = useNavigate();

  function loginProcess(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    axios
      .post(API_URL + "/login", login)
      .then((res) => {
        console.log(res.data);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      })
      .catch((err) => {
        if (err.response) {
          // Error dari backend
          if (err.response.status === 401) {
            setError({ message: "Email atau password salah." });
          } else if (err.response.data && err.response.data.errors) {
            setError(err.response.data.errors);
          } else {
            setError({ message: err.response.data.message || "Terjadi kesalahan." });
          }
        } else if (err.request) {
          // Request dibuat tapi tidak ada response
          setError({ message: "Tidak ada respon dari server." });
        } else {
          // Error lain
          setError({ message: err.message });
        }
        setIsLoading(false);
      });
  }

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center w-auto">
        <div className="col-11 col-sm-10 col-md-8 col-lg-6 col-xl-5 w-auto">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-primary text-white text-center py-3">
              <h3 className="fw-bold mb-0">Welcome Back</h3>
              <p className="mb-0">Please enter your credentials to login</p>
            </div>

            {/* Tampilkan error */}
            {error && error.message && (
              <div className="alert alert-danger m-3">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error.message}</div>
                </div>
              </div>
            )}

            {error && typeof error === "object" && !error.message && (
              <div className="alert alert-danger m-3">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <ul className="mb-0 ps-3">
                    {Object.entries(error).map(([key, value]) => (
                      <li key={key}>{value}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="card-body p-4">
              <form onSubmit={loginProcess}>
                <div className="mb-4">
                  <label className="form-label text-primary fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control py-2"
                      placeholder="Enter your email"
                      id="email"
                      onChange={(e) => setLogin({ ...login, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between">
                    <label className="form-label text-primary fw-semibold">Password</label>
                    <a href="#" className="text-decoration-none small text-primary">
                      Forgot password?
                    </a>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control py-2"
                      placeholder="Enter your password"
                      id="password"
                      onChange={(e) => setLogin({ ...login, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary py-2 fw-bold" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Logging in...
                      </>
                    ) : (
                      "Log In"
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="card-footer bg-white text-center py-3 border-0">
              <p className="mb-0">
                Don't have an account?{" "}
                <Link to="/registrasi" className="text-primary fw-bold">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
