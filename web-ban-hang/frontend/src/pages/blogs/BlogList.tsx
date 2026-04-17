import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./BlogList.css";

const API = "http://localhost:5000";
const imgUrl = (src: string) => src && src.startsWith("/") ? `${API}${src}` : src;

interface BlogPost {
  id_baiviet: number;
  tieu_de: string;
  noi_dung: string;
  anh_dai_dien: string;
  tom_tat: string;
  tac_gia: string;
  trang_thai: number;
  ngay_tao: string;
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch(`${API}/blogs`)
      .then((r) => r.json())
      .then((data) => setBlogs(Array.isArray(data) ? data : []))
      .catch(() => setBlogs([]));
  }, []);

  return (
    <div className="blog-list-page">
      <h1>Tin Tức & Bài Viết</h1>

      <div className="blog-list-layout">
        {/* Main */}
        <div className="blog-list-main">
          {blogs.length === 0 && <p style={{ color: "#999" }}>Chưa có bài viết nào.</p>}
          {blogs.map((post) => (
            <div className="blog-card" key={post.id_baiviet}>
              <div className="blog-card-image">
                <Link to={`/blogs/${post.id_baiviet}`}>
                  <img src={imgUrl(post.anh_dai_dien)} alt={post.tieu_de} />
                </Link>
              </div>
              <div className="blog-card-content">
                <Link to={`/blogs/${post.id_baiviet}`} style={{ textDecoration: "none" }}>
                  <h3>{post.tieu_de}</h3>
                </Link>
                <div className="blog-card-meta">
                  <span>📅 {post.ngay_tao ? new Date(post.ngay_tao).toLocaleDateString("vi-VN") : ""}</span>
                  <span>✍️ {post.tac_gia || "Admin"}</span>
                </div>
                <p className="blog-card-excerpt">{post.tom_tat || ""}</p>
                <Link to={`/blogs/${post.id_baiviet}`} className="blog-card-readmore">
                  Đọc thêm →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <aside className="blog-sidebar">
          {/* Recent posts */}
          <div className="sidebar-block">
            <h3>Tin Tức Mới Nhất</h3>
            {blogs.slice(0, 4).map((post) => (
              <div className="sidebar-recent-item" key={post.id_baiviet}>
                <img src={imgUrl(post.anh_dai_dien)} alt={post.tieu_de} />
                <div className="sidebar-recent-info">
                  <span>{post.ngay_tao ? new Date(post.ngay_tao).toLocaleDateString("vi-VN") : ""}</span>
                  <Link to={`/blogs/${post.id_baiviet}`}>{post.tieu_de}</Link>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
