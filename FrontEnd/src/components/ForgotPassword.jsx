import { useState } from "react";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

import {
  BUTTON_CLASSES,
  MESSAGE_SUCCESS,
  MESSAGE_ERROR,
} from "../assets/dummy";

const INITIAL_FORM = { email: "" };

const ForgotPassword = () => {
  //const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);

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
        `${import.meta.env.VITE_API_URL}/user/forgot-password`,
        formData,
      );
      console.log(data);
      if (data.success) {
        console.log(data);
        setFormData(INITIAL_FORM);
        setMessage({ text: data.message, type: "success" });
        //toast.success("Login successful! Redirecting...");
        //setTimeout(() => navigate("/"), 1000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "email",
      type: "email",
      placeholder: "Email",
      icon: Mail,
    },
  ];

  return (
    <div className="max-w-md w-full bg-white shadow-lg border border-purple-100 rounded-xl p-8">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
        <p className="text-gray-500 text-sm mt-1">
          Enter your email to reset your password
        </p>
      </div>
      {message.text && (
        <div
          className={
            message.type === "success" ? MESSAGE_SUCCESS : MESSAGE_ERROR
          }
        >
          {message.text}
        </div>
      )}
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

        <button type="submit" className={BUTTON_CLASSES} disabled={loading}>
          {loading ? (
            "Submitting..."
          ) : (
            <>
              <LogIn className="w-4 h-4" /> SUBMIT
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
