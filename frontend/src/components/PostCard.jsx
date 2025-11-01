import { useState } from "react";
import { editPost, likePost } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./PostCard.css";

const PostCard = ({ post, isOwner, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleEdit = async () => {
    if (!editContent.trim()) {
      alert("Post content cannot be empty");
      return;
    }

    setLoading(true);
    try {
      await editPost(post._id, { content: editContent });
      setIsEditing(false);
      if (onEdit) onEdit();
    } catch (error) {
      console.error("Edit error:", error);
      alert(error.response?.data?.message || "Failed to edit post");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        {post.user?.profilePic ? (
          <img
            src={post.user.profilePic}
            alt={post.user.name}
            className="post-avatar"
          />
        ) : (
          <div className="post-avatar-fallback">
            {post.username?.[0]?.toUpperCase() ||
              post.user?.name?.[0]?.toUpperCase() ||
              "U"}
          </div>
        )}

        <div className="post-header-info">
          <div className="post-user-details">
            <div>
              <h3 className="post-username">
                {post.username || post.user?.name || "Unknown User"}
              </h3>
              <p className="post-date">{formatDate(post.createdAt)}</p>
            </div>
            {isOwner && (
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this post?")) {
                    onDelete(post._id);
                  }
                }}
                className="delete-btn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21
                     c.342.052.682.107 1.022.166m-1.022-.165L18.16 
                     19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 
                     2.25 0 01-2.244-2.077L4.772 5.79m14.456 
                     0a48.108 48.108 0 00-3.478-.397m-12 
                     .562c.34-.059.68-.114 1.022-.165m0 
                     0a48.11 48.11 0 013.478-.397m7.5 
                     0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 
                     51.964 0 00-3.32 0c-1.18.037-2.09 
                     1.022-2.09 2.201v.916m7.5 0a48.667 
                     48.667 0 00-7.5 0"
                  />
                </svg>
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="post-edit-section">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="edit-textarea"
            placeholder="What's on your mind?"
            disabled={loading}
          />
          <div className="edit-buttons">
            <button
              onClick={() => setIsEditing(false)}
              disabled={loading}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={loading || !editContent.trim()}
              className="save-btn"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div className="post-content">
          <p>{post.content}</p>
        </div>
      )}

      {post.image && (
        <div className="post-image-container">
          <img src={post.image} alt="Post" className="post-image" />
        </div>
      )}

      <div className="post-footer">
        <button
          onClick={async () => {
            try {
              await likePost(post._id);
              if (onEdit) onEdit();
            } catch (error) {
              console.error("Error liking post:", error);
            }
          }}
          className="like-btn"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={post.likes?.includes(user?._id) ? "currentColor" : "none"}
            stroke="currentColor"
            className="icon"
          >
            <path d="M21.947 9.179a1.001 1.001 0 0 0-.868-.676l-5.701-.453-2.467-5.461a.998.998 0 0 0-1.822-.001L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.213 4.107-1.49 6.452a1 1 0 0 0 1.53 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082c.297-.268.406-.686.278-1.065z" />
          </svg>
          <span>
            {post.likes?.length || 0}{" "}
            {post.likes?.length === 1 ? "like" : "likes"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
