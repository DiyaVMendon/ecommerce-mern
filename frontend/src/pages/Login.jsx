
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { axiosRequest } from "../api/axiosRequest";
import BannerCarousel from "../helper/BannerCarousel";
import Styles from "./login.module.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

 
const handleSubmit = (e) => {
  e.preventDefault();

  if (loading) return;

  setLoading(true);

  axiosRequest(
    "/auth/login",
    form,
    "POST"
  )
    .then((res) => {
      toast.success(res?.message || "Login successful");

      localStorage.setItem("token", res?.data?.token);

      navigate("/admin");
    })
    .catch((error) => {
      toast.error(
        error?.response?.data?.message || "Login failed",
        { toastId: "login-error" }
      );
    })
    .finally(() => {
      setLoading(false);
    });
};


  return (
    <div className={Styles.login_main_wrapper}>
      <div className={Styles.login_carousel}>
        <BannerCarousel />
      </div>

      <div className={Styles.login_content}>
        <div className={Styles.login_card}>
          <div className={Styles.login_heading}>
            Welcome Back
          </div>

          <div className={Styles.login_sub_heading}>
            Sign in to LUXESHOP and continue your
            shopping journey.
          </div>

          <form
            className={Styles.login_form}
            onSubmit={handleSubmit}
          >
            <div className={Styles.input_wrapper}>
              <Mail
                size={20}
                className={Styles.input_icon}
              />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                autoComplete="email"
                className="react_input_field"
                required
              />
            </div>

            <div className={Styles.input_wrapper}>
              <LockKeyhole
                size={20}
                className={Styles.input_icon}
              />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="current-password"
                className="react_input_field"
                required
              />

              <button
                type="button"
                className={Styles.password_toggle}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture(
                    e.pointerId
                  );
                  setShowPassword(true);
                }}
                onPointerUp={() => setShowPassword(false)}
                onPointerCancel={() => setShowPassword(false)}
                onLostPointerCapture={() =>
                  setShowPassword(false)
                }
                onBlur={() => setShowPassword(false)}
                aria-label="Hold to show password"
              >
                {showPassword ? (
                  <Eye size={20} />
                ) : (
                  <EyeOff size={20} />
                )}
              </button>
            </div>

            <button
              className={Styles.login_submit}
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className={Styles.signup_link}>
            Don't have an account?
            <Link
              to="/signup"
              onClick={() => toast.dismiss()}
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
