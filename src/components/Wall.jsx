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

    // Använder pageData och page-state för pagination. Linus
    const [pageData, setPageData] = useState(null);
    const [page, setPage] = useState(0);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [newPostText, setNewPostText] = useState("");
    const [editingPostId, setEditingPostId] = useState(null);
    const [editedText, setEditedText] = useState("");

    const fetchWallData = async () => {
        if (!token || !wallUserId) {
            setLoading(false);
            return;
        }

        try {
            // Hämtar användarinformation (för displayName och bio). Linus
            const userRes = await fetch(`${API_BASE_URL}/users/${wallUserId}`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            const userData = await userRes.json();
            setUser(userData);

            // Hämtar inlägg med pagination. Linus
            const postsRes = await fetch(
                `${API_BASE_URL}/users/${wallUserId}/posts?page=${page}&size=5`,
                {
                    headers: {Authorization: `Bearer ${token}`},
                }
            );

            if (!postsRes.ok) throw new Error("Failed to fetch posts");

            const data = await postsRes.json();
            setPageData(data); // Sparar hela Page-objektet. Linus
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Triggar omkörning även när 'page' ändras. Linus
    useEffect(() => {
        fetchWallData();
    }, [token, wallUserId, page]);

    const handleCreatePost = async () => {
        if (!newPostText.trim()) return;
        try {
            const res = await fetch(`${API_BASE_URL}/users/${loggedInUserId}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({text: newPostText}),
            });
            if (!res.ok) throw new Error("Failed to create post");
            setNewPostText("");
            setPage(0); // Gå till första sidan för att se det nya inlägget. Linus
            await fetchWallData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`},
            });
            if (!res.ok) throw new Error("Failed to delete post");
            await fetchWallData(); // Uppdatera listan
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdatePost = async (postId) => {
        if (!editedText.trim()) return;
        try {
            const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({text: editedText}),
            });
            if (!res.ok) throw new Error("Failed to update post");
            setEditingPostId(null);
            await fetchWallData();
        } catch (error) {
            console.error(error);
        }
    };

    const startEdit = (post) => {
        setEditingPostId(post.id);
        setEditedText(post.text);
    };

    if (loading || !user) return <p>Laddar inlägg...</p>;

    return (
        <div className="feed-container">
            <h1 className="center">{user.displayName}</h1>
            <div className="about-me">
                <p><b>Om mig:</b> {user.bio}</p>
            </div>

            {isOwnWall && (
                <div className="create-post">
                    <textarea
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder="Skriv ett nytt inlägg..."
                    />
                    <button onClick={handleCreatePost}>Publicera</button>
                </div>
            )}

            {(!pageData || pageData.content.length === 0) && <p>Inga inlägg hittades</p>}

            <ul className="post-list">
                {pageData && pageData.content.map((post) => (
                    <li key={post.id} className="post-card">
                        <p className="post-text">{post.text}</p>

                        {/* Använder fälten från PostResponseDTO */}
                        <small className="post-author">
                            av <Link to={`/wall/${post.userId}`}>{post.username}</Link>
                        </small>

                        {isOwnWall && (
                            <div className="post-actions">
                                {editingPostId === post.id ? (
                                    <>
                                        <textarea value={editedText} onChange={(e) => setEditedText(e.target.value)}/>
                                        <button onClick={() => handleUpdatePost(post.id)}>Spara</button>
                                        <button onClick={() => setEditingPostId(null)}>Avbryt</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => startEdit(post)}>Redigera</button>
                                        <button onClick={() => handleDeletePost(post.id)}>Ta bort</button>
                                    </>
                                )}
                            </div>
                        )}
                        <hr/>
                        <small className="post-date">{new Date(post.createdAt).toLocaleString()}</small>
                    </li>
                ))}
            </ul>

            {/* Pagination UI Linus */}
            {pageData && (
                <div className="pagination-controls" style={{
                    marginTop: "20px",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <button disabled={pageData.first} onClick={() => setPage(page - 1)}>Föregående</button>
                    <span>Sida {pageData.number + 1} av {pageData.totalPages}</span>
                    <button disabled={pageData.last} onClick={() => setPage(page + 1)}>Nästa</button>
                </div>
            )}
        </div>
    );
};

export default Wall;