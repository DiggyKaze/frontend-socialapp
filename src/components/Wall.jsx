import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {useAuth} from "../context/useAuth";
import "./Feed.css";
import "./Wall.css";
import {API_BASE_URL} from "../config/api.js";

const Wall = () => {
    const {token, userId: loggedInUserId} = useAuth();
    const {userId: wallUserId} = useParams();

    const isOwnWall = Number(wallUserId) === Number(loggedInUserId);

    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [newPostText, setNewPostText] = useState("");
    const [editingPostId, setEditingPostId] = useState(null);
    const [editedText, setEditedText] = useState("");

    const fetchPosts = async () => {
        if (!token || !wallUserId) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(
                `${API_BASE_URL}/users/${wallUserId}/with-posts`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to fetch posts");
            }

            const data = await res.json();
            setPosts(data.posts);
            setUser(data.user);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [token, wallUserId]);

    const handleCreatePost = async () => {
        if (!newPostText.trim()) {
            return;
        }

        try {
            const res = await fetch(
                `${API_BASE_URL}/users/${loggedInUserId}/posts`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({text: newPostText}),
                }
            );

            if (!res.ok) {
                throw new Error("Failed to create post");
            }

            setNewPostText("");
            await fetchPosts();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            const res = await fetch(
                `${API_BASE_URL}/posts/${postId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to delete post");
            }

            setPosts((prev) => prev.filter((post) => post.id !== postId));
        } catch (error) {
            console.error(error);
        }
    };

    const startEdit = (post) => {
        setEditingPostId(post.id);
        setEditedText(post.text);
    };

    const handleUpdatePost = async (postId) => {
        if (!editedText.trim()) {
            return;
        }

        try {
            const res = await fetch(
                `${API_BASE_URL}/posts/${postId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({text: editedText}),
                }
            );

            if (!res.ok) {
                throw new Error("Failed to update post");
            }

            setPosts((prev) =>
                prev.map((post) =>
                    post.id === postId
                        ? {...post, text: editedText}
                        : post
                )
            );

            setEditingPostId(null);
            setEditedText("");
        } catch (error) {
            console.error(error);
        }
    };

    if (loading || !user) {
        return <p>Laddar inlägg...</p>;
    }

    return (
        <div className="feed-container">
            <h1 className="center">{user.displayName}</h1>

            <div className="about-me">
                <p>
                    <b>Om mig:</b> {user.bio}
                </p>
            </div>

            {isOwnWall && (
                <div className="create-post">
                    <textarea
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder="Skriv ett nytt inlägg..."
                    />
                    <button onClick={handleCreatePost}>
                        Publicera
                    </button>
                </div>
            )}

            {posts.length === 0 && <p>Inga inlägg hittades</p>}

            <ul className="post-list">
                {posts.map((post) => (
                    <li key={post.id} className="post-card">

                        <p className="post-text">{post.text}</p>

                        <small className="post-author">
                            av{" "}
                            <Link to={`/wall/${post.user.id}`}>
                                {post.user.displayName}
                            </Link>
                        </small>

                        {isOwnWall && (
                            <>
                                {editingPostId === post.id ? (
                                    <>
                                        <textarea
                                            value={editedText}
                                            onChange={(e) =>
                                                setEditedText(e.target.value)
                                            }
                                        />
                                        <button onClick={() => handleUpdatePost(post.id)}>
                                            Spara
                                        </button>
                                        <button onClick={() => setEditingPostId(null)}>
                                            Avbryt
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => startEdit(post)}>
                                            Redigera
                                        </button>
                                        <button onClick={() => handleDeletePost(post.id)}>
                                            Ta bort
                                        </button>
                                    </>
                                )}
                            </>
                        )}

                        <hr/>
                        <small className="post-date">
                            {new Date(post.createdAt).toLocaleString()}
                        </small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Wall;
