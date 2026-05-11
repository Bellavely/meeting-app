import { FC, useState, useEffect } from "react";
import { User as UserIcon, Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

export const Profile: FC = () => {
  const { user, updateUserData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

      const response = await api.put("/auth/update", formData);
      updateUserData(response.data);
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card card">
        <header className="profile-header">
          <button className="back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={20} />
          </button>
          <h1>Profile Settings</h1>
          <p className="subtitle">Manage your personal information</p>
        </header>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <div className="avatar-large">
              {user?.firstName?.[0] || "U"}
            </div>
            <div className="user-meta">
              <h3>{user?.firstName} {user?.lastName}</h3>
              <p>{user?.email}</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <div className="input-with-icon">
                <UserIcon size={18} className="input-icon" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <div className="input-with-icon">
                <UserIcon size={18} className="input-icon" />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <footer className="profile-footer">
            <button 
              type="submit" 
              className="btn-primary submit-btn" 
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
