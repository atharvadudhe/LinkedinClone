import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllPosts, createPost, deletePost } from "../services/api";
import PostCard from "../components/PostCard";
import "./Feed.css";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token === undefined) return;
    if (!token) {
      navigate("/");
    } else {
      fetchPosts();
    }
  }, [token, navigate]);

  const fetchPosts = async () => {
    setFetchLoading(true);
    try {
      const { data } = await getAllPosts();
      const allPosts = data.posts || data;
      const sortedPosts = allPosts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      const postsWithOwnership = sortedPosts.map(post => ({
        ...post,
        isCurrentUserOwner: String(post.user?._id) === String(user?._id)
      }));
      setPosts(postsWithOwnership);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("Please enter some content");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      await createPost(formData);
      setContent("");
      setImage(null);
      setImagePreview(null);
      fetchPosts();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(id);
        fetchPosts();
      } catch (error) {
        alert("Failed to delete post");
      }
    }
  };

  return (
    <div className="feed-container">
      <div className="feed-inner">
        <div className="feed-grid">
          <div className="left-sidebar">
            <div className="profile-card">
              <div className="cover"></div>
              <div className="profile-pic-wrapper">
                {user?.profilePic ? (
                  <div className="profile-pic">
                    <img src={user.profilePic} alt={user.name} />
                  </div>
                ) : (
                  <div className="profile-placeholder">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="profile-info">
                <h2>{user?.name}</h2>
                <p>{user?.email}</p>
                <div className="profile-stats">
                  <div>
                    <span>Who's viewed your profile</span>
                    <span>0</span>
                  </div>
                  <div>
                    <span>Post impressions</span>
                    <span>{posts.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="feed-main">
            <div className="create-post-card">
              <div className="create-post-header">
                {user?.profilePic ? (
                  <div className="user-avatar">
                    <img src={user.profilePic} alt={user.name} />
                  </div>
                ) : (
                  <div className="user-avatar-placeholder">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <form onSubmit={handleCreatePost} className="create-post-form">
                  <textarea
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows="3"
                  />
                  {imagePreview && (
                    <div className="image-preview-wrapper">
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <div className="create-post-actions">
                    <label>
                      📷 Add Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <button type="submit" disabled={loading}>
                      {loading ? "Posting..." : "Post"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="recent-posts">
              <h2>Recent Posts</h2>
              {fetchLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="no-posts">
                  <div>📝</div>
                  <p>No posts yet. Be the first to share something!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    isOwner={post.isCurrentUserOwner}
                    onDelete={handleDelete}
                    onEdit={fetchPosts}
                  />
                ))
              )}
            </div>
          </div>

          <div className="right-sidebar">
            <div className="sponsor-card">
              <p>Sponsored</p>
              <div className="sponsor-banner">
                <span>Ad Space</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
