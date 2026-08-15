import React, { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import axios from "axios";

import {
  FIELDS,
  BUTTONCLASSES,
  MESSAGE_SUCCESS,
  MESSAGE_ERROR,
} from "../assets/dummy";

const INITIAL_FORM = { name: "", email: "", password: "" };

const Signup = ({ onSwitchMode }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/register`,
        formData,
      );
      setMessage({
        text: "Registration successful! You can now log in.",
        type: "success",
      });
      setFormData(INITIAL_FORM);
    } catch (err) {
      console.log(err);
      setMessage({
        text:
          err.response?.data?.message || "An error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white shadow-lg border border-purple-100 rounded-xl p-8">
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-linear-to-br from-fuchsia-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
        <p className="text-gray-500 text-sm mt-1">
          Join TaskFlow to manage your tasks
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

      <form onSubmit={handleSubmit} className="form-stack">
        {FIELDS.map(({ name, type, placeholder, icon: Icon }) => (
          <div key={name} className="input-field">
            <span className="input-field__icon input-field__icon--accent">
              <Icon size={20} strokeWidth={1.75} />
            </span>
            <input
              name={name}
              type={type}
              placeholder={placeholder}
              value={formData[name]}
              onChange={(e) =>
                setFormData({ ...formData, [name]: e.target.value })
              }
              className="input-field__control"
              required
            />
          </div>
        ))}
        <button type="submit" className={BUTTONCLASSES} disabled={loading}>
          {loading ? (
            "Signing Up..."
          ) : (
            <>
              <UserPlus className="w-4 h-4" /> Sign Up
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{" "}
        <button
          onClick={onSwitchMode}
          className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
        >
          Login
        </button>
      </p>
    </div>
  );
};

export default Signup;
