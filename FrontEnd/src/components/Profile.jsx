import { useEffect, useState } from "react";
import axios from "axios";
import {
  Lock,
  ChevronLeft,
  Shield,
  LogOut,
  Save,
  UserCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  FULL_BUTTON,
  SECTION_WRAPPER,
  BACK_BUTTON,
  DANGER_BTN,
  personalFields,
  securityFields,
} from "../assets/dummy";

const Profile = ({ user, setCurrentUser, onLogout }) => {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`${import.meta.env.VITE_API_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(({ data }) => {
        console.log(data);
        if (data.success)
          setProfile({ name: data.user.name, email: data.user.email });
        else toast.error(data.message);
      })
      .catch(() => toast.error("Unable to load Profile"));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/user/profile`,
        { name: profile.name, email: profile.email },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (data.success) {
        setCurrentUser((prev) => ({
          ...prev,
          name: profile.name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            profile.name,
          )}&background=random`,
        }));
        toast.success("Profile updated");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Profile update failed");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match");
    }
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/user/password`,
        { oldPassword: passwords.current, newPassword: passwords.new },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (data.success) {
        toast.success("Password changed");
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        toast.error(data.message);
        setPasswords({ current: "", new: "", confirm: "" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => navigate(-1)} className={BACK_BUTTON}>
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {profile.name ? profile.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Account Settings
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your profile and security settings
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <section className={SECTION_WRAPPER}>
            <div className="flex items-center gap-2 mb-6">
              <UserCircle className="text-purple-500 w-5 h-5" />
              <h2 className="text-xl font-semibold text-gray-800">
                Personal Information
              </h2>
            </div>
            <form onSubmit={saveProfile} className="form-stack">
              {personalFields.map(({ name, type, placeholder, icon: Icon }) => (
                <div key={name} className="input-field">
                  <span className="input-field__icon input-field__icon--accent">
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={profile[name]}
                    onChange={(e) =>
                      setProfile({ ...profile, [name]: e.target.value })
                    }
                    className="input-field__control"
                    required
                  />
                </div>
              ))}
              <button type="submit" className={FULL_BUTTON}>
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </form>
          </section>

          <section className={SECTION_WRAPPER}>
            <div className="flex items-center gap-2 mb-6">
              <Shield className="text-purple-500 w-5 h-5" />
              <h2 className="text-xl font-semibold text-gray-800">Security</h2>
            </div>
            <form onSubmit={changePassword} className="form-stack">
              {securityFields.map(({ name, placeholder }) => (
                <div key={name} className="input-field">
                  <span className="input-field__icon input-field__icon--accent">
                    <Lock size={20} strokeWidth={1.75} />
                  </span>
                  <input
                    type="password"
                    placeholder={placeholder}
                    value={passwords[name]}
                    onChange={(e) =>
                      setPasswords({ ...passwords, [name]: e.target.value })
                    }
                    className="input-field__control"
                    required
                  />
                </div>
              ))}
              <button className={FULL_BUTTON}>
                <Shield className="w-4 h-4" /> Change Password
              </button>

              <div className="mt-8 pt-6 border-t border-purple-100">
                <button onClick={onLogout} className={DANGER_BTN}>
                  Logout
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
