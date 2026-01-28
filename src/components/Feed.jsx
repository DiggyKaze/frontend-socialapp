import {useEffect, useState} from "react";
import {useAuth} from "../context/useAuth";
import {Link} from "react-router-dom";
import "./Feed.css";
import {API_BASE_URL} from "../config/api.js";

const Feed = () => {
    const {token, userId} = useAuth();
    /**
     * Spara hela pageData istället för bara en lista.
     * Linus
     */
    const [pageData, setPageData] = useState(null)
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                /**
                 * Lägger till pagination-parametrar i URL:en. Linus
                 * Linus
                 */
                const res = await fetch(`${API_BASE_URL}/posts?page=${page}&size=10`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch posts");
                }

                const data = await res.json();
                /**
                 * Data är nu ett objekt med { content: [...], totalPages: X, number: Y, etc. }
                 * Linus
                 */
                setPageData(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
        /**
         * Körs om när 'page' ändras.
         * Linus
         */
    }, [token, page]);

    if (loading) {
        return <p>Laddar inlägg...</p>;
    }

    return (
        <div className="feed-container">
            <Link to={`/wall/${userId}`}>Till min sida</Link>
            <h1>Inlägg</h1>

            {/* Kontrollera inlägg via pageData.content. Linus */}
            {(!pageData || pageData.content?.length === 0) && <p>Inga inlägg hittades</p>}

            <ul className="post-list">
                {pageData && pageData.content.map((post) => (
                    <li key={post.id} className="post-card">
                        <p className="post-text">{post.text}</p>

                        <small className="post-author">
                            av{" "}
                            {/* Använder post.userId som är i DTO. Linus */}
                            <Link to={`/wall/${post.userId}`}>
                                {post.username}
                            </Link>
                        </small>

                        <hr/>
                        <small className="post-date">
                            {new Date(post.createdAt).toLocaleString()}
                        </small>
                    </li>
                ))}
            </ul>

            {/* Pagination UI. Linus */}
            {pageData && (
                <div className="pagination-controls"
                     style={{marginTop: "20px", display: "flex", gap: "10px", alignItems: "center"}}>
                    <button
                        disabled={pageData.first}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Föregående
                    </button>
                    {/* Exponera metadata. Linus */}
                    <span>Sida {pageData.number + 1} av {pageData.totalPages}</span>

                    <button
                        disabled={pageData.last}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Nästa
                    </button>
                </div>
            )}
        </div>
    );
};

export default Feed;
