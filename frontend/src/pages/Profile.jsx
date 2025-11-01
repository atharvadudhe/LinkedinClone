import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getUserProfile,
  getUserPosts,
  deletePost,
  updateProfile,
} from "../services/api";
import PostCard from "../components/PostCard";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "" });

  const { user, token, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token === undefined) return;
    if (!token) navigate("/");
    else fetchProfileData();
  }, [token, navigate]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const profileRes = await getUserProfile();
      const userData = profileRes.data.user || profileRes.data;
      setProfile(userData);

      const postsRes = await getUserPosts();
      const posts = postsRes.data || [];
      const sortedPosts = posts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setUserPosts(sortedPosts);
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(id);
        fetchProfileData();
      } catch {
        alert("Failed to delete post");
      }
    }
  };

  const handleEditClick = () => {
    setEditForm({ name: user?.name || "", bio: profile?.bio || "" });
    setIsEditing(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateProfile(editForm);
      const updatedUser = response.data.user;
      setProfile(updatedUser);

      const newUserData = { ...user, ...updatedUser };
      setUser(newUserData);
      localStorage.setItem("user", JSON.stringify(newUserData));

      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-inner">
        <div className="profile-grid">
          <div className="main-section">
            <div className="profile-card">
              <div className="profile-banner"></div>
              <div className="profile-avatar">
                {profile?.profilePic ? (
                  <img
                    src={profile.profilePic}
                    alt={profile.name}
                    className="profile-img"
                  />
                ) : (
                  <div className="profile-placeholder">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div className="profile-details">
                {!isEditing ? (
                  <div>
                    <div className="profile-header">
                      <div>
                        <h1>{user?.name || "User"}</h1>
                        <p className="email">{user?.email || "user@example.com"}</p>
                        {profile?.bio ? (
                          <p className="bio">{profile.bio}</p>
                        ) : (
                          <p className="no-bio">No bio added yet.</p>
                        )}
                      </div>
                      <button onClick={handleEditClick} className="edit-btn">
                        Edit Profile
                      </button>
                    </div>

                    <div className="profile-stats">
                      <div>
                        <span>{userPosts.length}</span>
                        <p>Posts</p>
                      </div>
                      <div>
                        <span>0</span>
                        <p>Connections</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleEditSubmit} className="edit-form">
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        id="name"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="bio">Bio</label>
                      <textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bio: e.target.value })
                        }
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="save-btn">
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="posts-section">
              <h2>Your Posts ({userPosts.length})</h2>
              {userPosts.length === 0 ? (
                <div className="no-posts">
                  <div>📝</div>
                  <p>You haven't posted anything yet.</p>
                  <button onClick={() => navigate("/feed")}>
                    Create Your First Post
                  </button>
                </div>
              ) : (
                userPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    isOwner={true}
                    onDelete={handleDelete}
                    onEdit={fetchProfileData}
                  />
                ))
              )}
            </div>
          </div>

          <div className="sidebar">
            <div className="insights-card">
              <h3>Profile Insights</h3>
              <p>See who viewed your profile and posts soon!</p>
              <div>Coming soon...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
