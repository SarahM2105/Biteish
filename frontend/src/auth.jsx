import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

function getDashboardPath(role) {
    if (role === "OWNER") return "/owner/dashboard";
    if (role === "ADMIN") return "/admin-dashboard";
    return "/customer/dashboard";
}

export default function Auth() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "CUSTOMER",
    });
    const [status, setStatus] = useState({ type: "", message: "" });
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    const heading = useMemo(() => {
        return isRegistering ? "Create your Biteish account" : "Welcome back to Biteish";
    }, [isRegistering]);

    const subheading = useMemo(() => {
        return isRegistering
            ? "Join Biteish to discover restaurants, manage bookings, or run your venue."
            : "Sign in to continue exploring restaurants and managing your bookings.";
    }, [isRegistering]);

    function handleChange(e) {
        const { id, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [id]: value,
        }));
    }

    function toggleMode() {
        setIsRegistering((prev) => !prev);
        setStatus({ type: "", message: "" });
        setForm((prev) => ({
            ...prev,
            password: "",
            confirmPassword: "",
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setStatus({ type: "", message: "" });

        if (isRegistering && form.password !== form.confirmPassword) {
            setStatus({
                type: "error",
                message: "Passwords do not match.",
            });
            setSubmitting(false);
            return;
        }

        const url = isRegistering ? "/api/auth/register" : "/api/auth/login";

        const payload = isRegistering
            ? {
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                role: form.role,
            }
            : {
                email: form.email.trim(),
                password: form.password,
            };

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const text = await res.text();
            const data = text ? JSON.parse(text) : {};

            if (!res.ok) {
                setStatus({
                    type: "error",
                    message: data.error || "Something went wrong.",
                });
                return;
            }

            if (isRegistering && !data.token) {
                setStatus({
                    type: "success",
                    message: "Registered successfully. Please log in.",
                });
                setIsRegistering(false);
                setForm((prev) => ({
                    ...prev,
                    name: "",
                    password: "",
                    confirmPassword: "",
                    role: "CUSTOMER",
                }));
                return;
            }

            if (data.token) {
                const userName = data.user?.name || "User";
                const userRole = data.user?.role || "CUSTOMER";
                const userId = data.user?.id || data.user?.userId || "";

                localStorage.setItem("token", data.token);
                localStorage.setItem("name", userName);
                localStorage.setItem("role", userRole);
                localStorage.setItem("userId", userId);

                setStatus({
                    type: "success",
                    message: "Login successful.",
                });

                setForm((prev) => ({
                    ...prev,
                    password: "",
                    confirmPassword: "",
                }));

                navigate(getDashboardPath(userRole));
                return;
            }

            setStatus({
                type: "success",
                message: isRegistering
                    ? "Registered successfully. Please log in."
                    : "Login successful.",
            });
        } catch (error) {
            console.error(error);
            setStatus({
                type: "error",
                message: "Error connecting to server.",
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-shell">
                <section className="auth-brand-panel">
                    <div className="auth-brand-panel__content">
                        <p className="auth-brand-panel__eyebrow">Restaurant booking made easier</p>
                        <h1 className="auth-brand-panel__logo">Biteish</h1>
                        <p className="auth-brand-panel__text">
                            Discover restaurants, manage reservations, and keep your dining plans
                            organised in one place.
                        </p>

                        <div className="auth-brand-panel__highlights">
                            <div className="auth-highlight-card">
                                <strong>Easy booking</strong>
                                <span>Find and reserve tables in just a few steps.</span>
                            </div>
                            <div className="auth-highlight-card">
                                <strong>Live updates</strong>
                                <span>Track confirmations, reminders, and booking changes.</span>
                            </div>
                            <div className="auth-highlight-card">
                                <strong>For every role</strong>
                                <span>Built for customers, restaurant owners, and admins.</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="auth-card">
                    <div className="auth-card__header">
                        <p className="auth-card__eyebrow">
                            {isRegistering ? "Sign up" : "Login"}
                        </p>
                        <h2>{heading}</h2>
                        <p>{subheading}</p>
                    </div>

                    <div className="auth-switch">
                        <button
                            type="button"
                            className={`auth-switch__button ${!isRegistering ? "is-active" : ""}`}
                            onClick={() => {
                                if (isRegistering) toggleMode();
                            }}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            className={`auth-switch__button ${isRegistering ? "is-active" : ""}`}
                            onClick={() => {
                                if (!isRegistering) toggleMode();
                            }}
                        >
                            Sign up
                        </button>
                    </div>

                    <form
                        className={`auth-form ${isRegistering ? "is-registering" : "is-login"}`}
                        onSubmit={handleSubmit}
                    >
                        <div className={`auth-form-extra ${isRegistering ? "is-open" : ""}`}>
                            <label className="auth-field">
                                <span>Name</span>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Enter your name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required={isRegistering}
                                    disabled={!isRegistering}
                                    autoComplete="name"
                                />
                            </label>

                            <label className="auth-field">
                                <span>Role</span>
                                <select
                                    id="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    disabled={!isRegistering}
                                >
                                    <option value="CUSTOMER">Customer</option>
                                    <option value="OWNER">Restaurant Owner</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </label>
                        </div>

                        <label className="auth-field">
                            <span>Email</span>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </label>

                        <label className="auth-field">
                            <span>Password</span>
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                autoComplete={isRegistering ? "new-password" : "current-password"}
                            />
                        </label>

                        {isRegistering && (
                            <label className="auth-field">
                                <span>Confirm password</span>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    placeholder="Re-enter your password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                />
                            </label>
                        )}

                        {status.message ? (
                            <div
                                className={`auth-status ${
                                    status.type === "error"
                                        ? "auth-status--error"
                                        : "auth-status--success"
                                }`}
                            >
                                {status.message}
                            </div>
                        ) : null}

                        <button className="auth-submit" type="submit" disabled={submitting}>
                            {submitting
                                ? isRegistering
                                    ? "Creating account..."
                                    : "Logging in..."
                                : isRegistering
                                    ? "Create account"
                                    : "Login"}
                        </button>
                    </form>

                    <p className="auth-footer-text">
                        {isRegistering
                            ? "Already have an account?"
                            : "Need an account?"}{" "}
                        <button type="button" className="auth-footer-link" onClick={toggleMode}>
                            {isRegistering ? "Switch to login" : "Switch to sign up"}
                        </button>
                    </p>
                </section>
            </div>
        </div>
    );
}