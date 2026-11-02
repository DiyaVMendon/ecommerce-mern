
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { UserRound, Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";

import { axiosRequest } from "../api/axiosRequest";
import BannerCarousel from "../helper/BannerCarousel";
import Styles from "./signup.module.css";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

export default function SignUp() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (loading) return;

  setLoading(true);

  try {
    const res = await axiosRequest("/auth/signup", form, "POST");

    toast.success(res.message || "Account created successfully");

    setForm(initialForm);
    navigate("/login");
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Something went wrong",
      { toastId: "signup-error" }
    );
  } finally {
    setLoading(false);
  }
};

  const showPasswordOnHold = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setShowPassword(true);
  };

  const hidePassword = () => {
    setShowPassword(false);
  };

  return (
    <div className={Styles.signup_main_wrapper}>
      {/* Left Banner */}
      <div className={Styles.signup_sub_wrap}>
        <BannerCarousel />
      </div>

      {/* Right Signup Form */}
      <div className={Styles.signup_sub_wrap_2}>
        <div className={Styles.signup_content}>
          <h1 className={Styles.signup_heading}>
            Create an Account
          </h1>

          <p className={Styles.signup_sub_heading}>
            Join LUXESHOP and start your shopping journey today.
          </p>

          <form
            onSubmit={handleSubmit}
            className={Styles.signup_form_wrapper}
            autoComplete="off"
          >
            {/* Username */}
            <div className={Styles.input_wrapper}>
              <UserRound
                size={20}
                className={Styles.input_icon}
              />

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                autoComplete="name"
                className="react_input_field"
                required
              />
            </div>

            {/* Email */}
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

            {/* Password */}
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
                autoComplete="new-password"
                className="react_input_field"
                minLength={8}
                required
              />

              <button
                type="button"
                className={Styles.password_toggle}
                onPointerDown={showPasswordOnHold}
                onPointerUp={hidePassword}
                onPointerCancel={hidePassword}
                onLostPointerCapture={hidePassword}
                onBlur={hidePassword}
                aria-label="Hold to show password"
              >
                {showPassword ? (
                  <Eye size={20} />
                ) : (
                  <EyeOff size={20} />
                )}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={Styles.signup_submit}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Login Navigation */}
          <div className={Styles.signup_login_text}>
            <span>Already have an account?</span>
            <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
