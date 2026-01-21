import {useEffect, useState} from "react";
import {useAuth} from "../context/useAuth";
import {Link} from "react-router-dom";
import "./Feed.css";
import {API_BASE_URL} from "../config/api.js";

const Feed = () => {
    const {token, userId} = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            if (!token || !userId) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(API_BASE_URL + "/posts", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch posts");
                }

                const data = await res.json();
                setPosts(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [token, userId]);

    if (loading) {
        return <p>Laddar inlägg...</p>;
    }

    return (
        <div className="feed-container">
            <Link to={`/wall/${userId}`}>Till min sida</Link>
            <h1>Inlägg</h1>

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

export default Feed;
