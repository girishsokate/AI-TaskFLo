import { useState, useEffect } from "react";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

import { BUTTON_CLASSES } from "../assets/dummy";

const INITIAL_FORM = { email: "", password: "" };

const Login = ({ onSubmit, onSwitchMode }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [rememberMe, setrememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    const getUser = async (token) => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (data.success) {
          onSubmit?.({ token, userId, ...data.user });
          toast.success("Session restored. Redirecting...");
          navigate("/");
        } else {
          localStorage.clear();
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        toast.error(msg);
      }
    };

    if (token) {
      getUser(token);
    }
  }, [onSubmit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!rememberMe) {
    //   toast.error('You must enable "Remember Me" to login.')
    //   return
    // }
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/login`,
        formData,
      );
      console.log(data);
      if (!data.token) throw new Error(data.message || "Login failed.");
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", JSON.stringify(data.user.id));
        setFormData(INITIAL_FORM);
        onSubmit?.({ token: data.token, userId: data.user.id, ...data.user });
        toast.success("Login successful! Redirecting...");
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = () => {
    toast.dismiss();
    onSwitchMode?.();
  };

  const fields = [
    {
      name: "email",
      type: "email",
      placeholder: "Email",
      icon: Mail,
    },
    {
      name: "password",
      type: showPassword ? "text" : "password",
      placeholder: "Password",
      icon: Lock,
      isPassword: true,
    },
  ];

  return (
    <div className="max-w-md w-full bg-white shadow-lg border border-purple-100 rounded-xl p-8">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
        <p className="text-gray-500 text-sm mt-1">
          Sign in to continue to TaskFlow
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form-stack" noValidate>
        {fields.map(({ name, type, placeholder, isPassword, icon: Icon }) => (
          <div key={name} className="input-field">
            <span className="input-field__icon input-field__icon--accent">
              <Icon size={20} strokeWidth={1.75} />
            </span>
            <input
              type={type}
              placeholder={placeholder}
              value={formData[name]}
              onChange={(e) =>
                setFormData({ ...formData, [name]: e.target.value })
              }
              className="input-field__control"
              required
            />
            {isPassword && (
              <button
                type="button"
                className="input-field__action"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            )}
          </div>
        ))}
        <div className="form-check-bar">
          <label className="form-check">
            <input
              type="checkbox"
              name="rememberMe"
              checked={rememberMe}
              onChange={() => setrememberMe(!rememberMe)}
              className="form-check__input"
            />
            <span className="form-check__label">Remember Me</span>
          </label>

          <Link to={"/forgot-password"} className="form-check__label">
            Forgot Password?
          </Link>
        </div>
        <button type="submit" className={BUTTON_CLASSES} disabled={loading}>
          {loading ? (
            "Logging in..."
          ) : (
            <>
              <LogIn className="w-4 h-4" /> Login
            </>
          )}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={handleSwitchMode}
          className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default Login;
