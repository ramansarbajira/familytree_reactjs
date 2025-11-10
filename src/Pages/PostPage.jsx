import React, { useState, useEffect, useRef } from "react";
import CreatePostModal from "../Components/CreatePostModal";
import PostViewerModal from "../Components/PostViewerModal";
import { useUser } from "../Contexts/UserContext";
import {
  FiImage,
  FiUsers,
  FiPlusCircle,
  FiFeather,
  FiSearch,
  FiGlobe,
  FiClock,
} from "react-icons/fi";
import { FaRegHeart, FaHeart, FaCommentDots } from "react-icons/fa";
import { MdPublic, MdPeople } from "react-icons/md";

const PostPage = () => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [activeFeed, setActiveFeed] = useState("public");
  const [posts, setPosts] = useState([]);
  const [likeLoadingIds, setLikeLoadingIds] = useState(new Set());
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPostViewerOpen, setIsPostViewerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchCaption, setSearchCaption] = useState("");
  const searchTimeoutRef = useRef(null);
  const { userInfo } = useUser();
const [postComments, setPostComments] = useState({});
const [loadingComments, setLoadingComments] = useState(new Set());
const [postingComment, setPostingComment] = useState(new Set());
const [newComment, setNewComment] = useState({});
const [visibleComments, setVisibleComments] = useState({});
const [showHeart, setShowHeart] = useState(null);
const [showHeartAnimation, setShowHeartAnimation] = useState(false);
const [likedPostId, setLikedPostId] = useState(null);




  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!userInfo) return;
    setUser({
      id: userInfo.userId,
      avatar: userInfo.profileUrl || "/assets/user.png",
      name: userInfo.name || "Username",
      bio: userInfo.bio || "No bio yet",
      familyCode: userInfo.familyCode || "Not assigned",
    });
  }, [userInfo]);

  const fetchPosts = async (captionSearch = "") => {
    setLoadingFeed(true);
    try {
      const currentToken = localStorage.getItem("access_token");
      const headers = currentToken
        ? { Authorization: `Bearer ${currentToken}` }
        : {};

      let url =
        activeFeed === "family"
          ? `${import.meta.env.VITE_API_BASE_URL}/post/by-options?familyCode=${
              userInfo.familyCode
            }&privacy=private`
          : `${
              import.meta.env.VITE_API_BASE_URL
            }/post/by-options?privacy=public`;

      if (captionSearch.trim())
        url += `&caption=${encodeURIComponent(captionSearch.trim())}`;

      const res = await fetch(url, { headers });
      const data = await res.json();
      setPosts(
        Array.isArray(data)
          ? data.map((p) => ({
              id: p.id,
              author: p.user?.name || "Unknown",
              avatar: p.user?.profile || "/assets/user.png",
              time: new Date(p.createdAt).toLocaleString(),
              caption: p.caption,
              fullImageUrl: p.postImage,
              likes: p.likeCount,
              comments: p.commentCount,
              liked: p.isLiked,
              privacy: p.privacy,
            }))
          : []
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeFeed]);

  const toggleLike = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );

    // ✅ Only trigger heart animation when liking, not unliking
    const post = posts.find((p) => p.id === postId);
    if (!post.liked) {
      setLikedPostId(postId);
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 700);
    }
  };

    const handlePostComment = async (postId) => {
      const commentText = newComment[postId]?.trim();
      if (!commentText) return;

      const authToken = localStorage.getItem("access_token");
      if (!authToken) {
        console.error("No auth token found");
        return;
      }

      // 🟢 Optimistic comment (match your API structure)
      const newTempComment = {
        id: Date.now(), // temporary id
        content: commentText,
        createdAt: new Date().toISOString(),
        user: {
          firstName: userInfo?.firstName || "You",
          lastName: userInfo?.lastName || "",
          profile: userInfo?.profile || "/assets/user.png",
        },
      };

      // Update UI instantly
      setPostComments((prev) => ({
        ...prev,
        [postId]: prev[postId]
          ? [newTempComment, ...prev[postId]]
          : [newTempComment],
      }));

      // Clear input
      setNewComment((prev) => ({ ...prev, [postId]: "" }));
      setPostingComment((prev) => new Set(prev).add(postId));

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/post/${postId}/comment`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ comment: commentText }),
          }
        );

        if (res.ok) {
          const data = await res.json();
        
          console.log("User Infooooo - ",userInfo)
          // 🟣 Match your backend response structure:
          const createdComment = {
            id: data.id,
            content: data.comment || data.content,
            createdAt: data.createdAt,
            user: {
              firstName: data.user?.firstName || userInfo?.firstName || "You",
              lastName: data.user?.lastName || userInfo?.lastName || "",
              profile:
                data.user?.profile || userInfo?.profileUrl || "/assets/user.png",
            },
          };

          // Replace temp comment with actual one
          setPostComments((prev) => ({
            ...prev,
            [postId]: prev[postId].map((c) =>
              c.id === newTempComment.id ? createdComment : c
            ),
          }));
        } else {
          console.error("Failed to post comment");
          // rollback if failed
          setPostComments((prev) => ({
            ...prev,
            [postId]: prev[postId].filter((c) => c.id !== newTempComment.id),
          }));
        }
      } catch (err) {
        console.error("Error posting comment:", err);
        // rollback if error
        setPostComments((prev) => ({
          ...prev,
          [postId]: prev[postId].filter((c) => c.id !== newTempComment.id),
        }));
      } finally {
        setPostingComment((prev) => {
          const updated = new Set(prev);
          updated.delete(postId);
          return updated;
        });
      }
    };


    const handleLike = async (postId) => {
      toggleLike(postId); // Your existing like toggle logic
      setShowHeart(postId);
      setTimeout(() => setShowHeart(null), 1000); // Hide heart after 0.8s
    };


   const fetchComments = async (postId, authToken) => {
     try {
       const response = await fetch(
         `${import.meta.env.VITE_API_BASE_URL}/post/${postId}/comments`,
         {
           headers: {
             Authorization: `Bearer ${authToken}`,
           },
         }
       );
       const data = await response.json();
       return data?.comments || [];
     } catch (error) {
       console.error("Failed to fetch comments:", error);
       return [];
     }
   };

   const handleCommentClick = async (postId) => {
     const targetPost = posts.find((p) => p.id === postId);

     // Toggle comments visibility if already loaded
     if (targetPost.showComments && postComments[postId]) {
       setPosts((prev) =>
         prev.map((p) => (p.id === postId ? { ...p, showComments: false } : p))
       );
       return;
     } 

     // Otherwise, fetch comments
     setLoadingComments((prev) => new Set(prev).add(postId));

     const comments = await fetchComments(postId, token);
     setPostComments((prev) => ({ ...prev, [postId]: comments }));

     setPosts((prev) =>
       prev.map((p) => (p.id === postId ? { ...p, showComments: true } : p))
     );

     setLoadingComments((prev) => {
       const updated = new Set(prev);
       updated.delete(postId);
       return updated;
     });
   };


  const handleViewPost = (post) => {
    setSelectedPost(post);
    setIsPostViewerOpen(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-0 sm:px-4 py-2 sm:py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6 px-2 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Feed</h1>

        <div className="flex items-center gap-3">
          {/* Feed Switch */}
          <div className="bg-gray-100 border border-gray-200 rounded-full flex p-1 gap-1">
            <button
              onClick={() => setActiveFeed("public")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeFeed === "public"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-700 bg-white hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <MdPublic size={16} /> Public
            </button>

            {userInfo?.familyCode && (
              <button
                onClick={() => setActiveFeed("family")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  activeFeed === "family"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 bg-white hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <MdPeople size={16} /> Family
              </button>
            )}
          </div>

          {/* Search */}
          {showSearchInput ? (
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              value={searchCaption}
              onChange={(e) => {
                const val = e.target.value;
                setSearchCaption(val);
                clearTimeout(searchTimeoutRef.current);
                searchTimeoutRef.current = setTimeout(
                  () => fetchPosts(val),
                  400
                );
              }}
              onBlur={() => !searchCaption && setShowSearchInput(false)}
              className="w-32 sm:w-40 px-3 py-1.5 rounded-full border border-gray-300 text-sm focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <button
              onClick={() => setShowSearchInput(true)}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-all"
            >
              <FiSearch size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Post Creator */}
      {user && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 flex items-center gap-3 mb-4 sm:mb-6 hover:shadow-md transition-all">
          <img
            src={user.avatar}
            alt="User"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-blue-200 object-cover"
          />
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 bg-gray-100 text-gray-600 rounded-full py-2 px-4 text-left text-sm hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            What's on your mind, {user.name.split("_")[0]}?
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-2 sm:p-2.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
          >
            <FiImage size={18} />
          </button>
        </div>
      )}

      {/* Feed */}
      {loadingFeed ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : posts.length ? (
        <div className="">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={post.avatar}
                    alt={post.author}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {post.author}
                    </p>
                    <p className="text-xs text-gray-500">{post.time}</p>
                  </div>
                </div>
                <span className="text-blue-500 flex items-center gap-1 text-xs sm:text-sm">
                  {post.privacy === "family" ? <FiUsers /> : <FiGlobe />}
                  {post.privacy === "family" ? "Family" : "Public"}
                </span>
              </div>

              {/* Image */}
              {post.fullImageUrl && (
                <div
                  className="relative w-full bg-black cursor-pointer group overflow-hidden"
                  onClick={() => handleViewPost(post)}
                >
                  <img
                    src={post.fullImageUrl}
                    alt="Post"
                    className="w-full h-auto max-h-[700px] object-contain transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* ❤️ Like animation overlay */}
                  {likedPostId === post.id && showHeartAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center bg-transparent animate-heart-pop">
                      <FaHeart className="text-pink-700 text-7xl drop-shadow-lg" />
                    </div>
                  )}
                </div>
              )}

              {/* Caption */}
              {post.caption && (
                <div className="px-4 py-2 text-sm text-gray-700">
                  <span className="font-semibold mr-1">{post.author}</span>
                  {post.caption}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <div className="flex items-center gap-8">
                  {/* Like */}
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center bg-white gap-2 text-gray-700 hover:text-pink-600 transition-colors duration-200 active:scale-95"
                  >
                    {post.liked ? (
                      <FaHeart size={20} className="text-pink-600" />
                    ) : (
                      <FaRegHeart size={20} />
                    )}
                    <span className="text-sm">{post.likes}</span>
                  </button>

                  {/* Comment */}
                  <button
                    onClick={() => handleCommentClick(post.id)}
                    className="flex items-center bg-white gap-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 active:scale-95"
                  >
                    <FaCommentDots size={19} />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                </div>
              </div>

              {/* Comments */}
              {post.showComments && (
                <div className="px-4 pb-4 border-t border-gray-100 mt-2 animate-fadeIn">
                  <div className="max-w-[80%] sm:max-w-[70%] ml-6 mx-auto">
                    <h4 className="text-sm font-semibold text-gray-800 mt-3 mb-2 flex items-center gap-2">
                      <FaCommentDots size={19} className="text-gray-600" />
                      Comments
                    </h4>

                    {/* 🌀 Loading Skeleton */}
                    {loadingComments.has(post.id) ? (
                      <div className="space-y-3 mt-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 bg-gray-50 border border-gray-200/60 p-2.5 rounded-xl animate-pulse"
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                            <div className="flex-1 space-y-2">
                              <div className="w-24 h-3 bg-gray-300 rounded"></div>
                              <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : postComments[post.id]?.length ? (
                      <>
                        {/* 💬 Show limited comments */}
                        <div className="sp mt-2">
                          {postComments[post.id]
                            .slice(0, visibleComments[post.id] || 3)
                            .map((comment) => (
                              <div
                                key={comment.id}
                                className="flex items-start gap-2.5 bg-gray-50 hover:bg-gray-100 transition-all duration-300 opacity-0 animate-fadeIn p-2 rounded-lg"
                              >
                                <img
                                  src={
                                    comment.user?.profile || "/assets/user.png"
                                  }
                                  alt="User"
                                  className="w-7 h-7 rounded-full object-cover border border-gray-200"
                                />
                                <div className="flex-1 text-[13px] leading-tight">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900 text-[13px]">
                                      {comment.user?.firstName}{" "}
                                      {comment.user?.lastName}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {new Date(
                                        comment.createdAt
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-[13px] mt-0.5">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* 🔽 Load more button */}
                        {postComments[post.id].length >
                          (visibleComments[post.id] || 3) && (
                          <div className="flex justify-center mt-3">
                            <button
                              onClick={() =>
                                setVisibleComments((prev) => ({
                                  ...prev,
                                  [post.id]: (prev[post.id] || 3) + 3,
                                }))
                              }
                              className="text-sm bg-white mt-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              Show more comments...
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-gray-500 text-sm italic">
                        
                        No comments yet.
                      </div>
                    )}

                    {/* ✏️ Add comment box */}
                    <div className="flex items-center gap-2 mt-4">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment[post.id] || ""}
                        onChange={(e) =>
                          setNewComment((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            !e.shiftKey &&
                            newComment[post.id]?.trim()
                          ) {
                            e.preventDefault();
                            handlePostComment(post.id);
                          }
                        }}
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />

                      <button
                        onClick={() => handlePostComment(post.id)}
                        disabled={postingComment.has(post.id)}
                        className={`p-2 rounded-full ${
                          postingComment.has(post.id)
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                        } text-white flex items-center justify-center transition-all`}
                      >
                        {postingComment.has(post.id) ? (
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* All Caught Up Message */}
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-blue-100 mb-3">
              <FiClock className="text-gray-600 text-3xl" />
            </div>
            <h3 className="font-semibold text-gray-700 text-lg">
              You’re all caught up!
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              You’ve seen all new posts.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center bg-white rounded-xl border p-10 shadow-sm">
          <p className="text-gray-600 mb-4">
            No posts in the {activeFeed} feed yet.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all flex items-center gap-2 mx-auto"
          >
            <FiFeather /> Create First Post
          </button>
        </div>
      )}

      {/* Floating Create Button */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-20 right-5 sm:right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all lg:hidden"
      >
        <FiPlusCircle size={26} />
      </button>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={fetchPosts}
        currentUser={userInfo}
        authToken={token}
        mode="create"
      />

      <PostViewerModal
        isOpen={isPostViewerOpen}
        onClose={() => setIsPostViewerOpen(false)}
        post={selectedPost}
        authToken={token}
      />
    </div>
  );
};

export default PostPage;
