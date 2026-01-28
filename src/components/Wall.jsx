import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {useAuth} from "../context/useAuth";
import SendFriendRequestButton from "./SendFriendRequestButton";
import FriendRequestList from "./FriendRequestList";
import FriendList from "./FriendList";
import "./Feed.css";
import "./Wall.css";
import {API_BASE_URL} from "../config/api.js";

const Wall = () => {
    const {token, userId: loggedInUserId} = useAuth();
    const {userId: wallUserId} = useParams();
    const isOwnWall = Number(wallUserId) === Number(loggedInUserId);

    const [user, setUser] = useState(null);
    const [pageData, setPageData] = useState(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [newPostText, setNewPostText] = useState("");
    const [editingPostId, setEditingPostId] = useState(null);
    const [editedText, setEditedText] = useState("");

    // Hämta användare och inlägg
    const fetchWallData = async () => {
        if (!token || !wallUserId) {
            setLoading(false);
            return;
        }

        try {
            // Hämta wall-användare info
            const userRes = await fetch(`${API_BASE_URL}/users/my-profile`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            const userData = await userRes.json();
            setUser(userData);

            /**
             * Hämta inlägg med pagination
             * Linus
             */
            const postsRes = await fetch(
                `${API_BASE_URL}/users/${wallUserId}/posts?page=${page}&size=5`,
                {headers: {Authorization: `Bearer ${token}`}}
            );
            if (!postsRes.ok) throw new Error("Failed to fetch posts");
            const data = await postsRes.json();
            setPageData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallData();
    }, [token, wallUserId, page]);

    // Skapa inlägg
    const handleCreatePost = async () => {
        if (!newPostText.trim()) return;
        try {
            const res = await fetch(`${API_BASE_URL}/users/${loggedInUserId}/posts`, {
                method: "POST",
                headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
                body: JSON.stringify({text: newPostText}),
            });
            if (!res.ok) throw new Error("Failed to create post");
            setNewPostText("");
            setPage(0);
            await fetchWallData();
        } catch (err) {
            console.error(err);
        }
    };

    // Radera inlägg
    const handleDeletePost = async (postId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`},
            });
            if (!res.ok) throw new Error("Failed to delete post");
            await fetchWallData();
        } catch (err) {
            console.error(err);
        }
    };

    // Uppdatera inlägg
    const handleUpdatePost = async (postId) => {
        if (!editedText.trim()) return;
        try {
            const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
                body: JSON.stringify({text: editedText}),
            });
            if (!res.ok) throw new Error("Failed to update post");
            setEditingPostId(null);
            await fetchWallData();
        } catch (err) {
            console.error(err);
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

            {/* Friendship-sektion */}
            <div className="friendship-section">
                <FriendList wallUserId={Number(wallUserId)} token={token}/>

                {isOwnWall && <FriendRequestList token={token}/>}

                {!isOwnWall && <SendFriendRequestButton wallUserId={Number(wallUserId)} token={token}/>}
            </div>

            {/* Skapa inlägg */}
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

            {/* Inlägg */}
            {(!pageData || pageData.content.length === 0) && <p>Inga inlägg hittades</p>}
            <ul className="post-list">
                {pageData && pageData.content.map((post) => (
                    <li key={post.id} className="post-card">
                        <p className="post-text">{post.text}</p>
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

            {/* Pagination Linus */}
            {pageData && (
                <div className="pagination-controls">
                    <button disabled={pageData.first} onClick={() => setPage(page - 1)}>Föregående</button>
                    <span>Sida {pageData.number + 1} av {pageData.totalPages}</span>
                    <button disabled={pageData.last} onClick={() => setPage(page + 1)}>Nästa</button>
                </div>
            )}
        </div>
    );
};

export default Wall;
