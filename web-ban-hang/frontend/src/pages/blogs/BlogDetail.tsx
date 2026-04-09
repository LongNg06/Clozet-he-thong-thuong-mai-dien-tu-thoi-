import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./BlogDetail.css";
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

export default function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [recent, setRecent] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/blogs/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => setPost(data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));

    fetch(`${API}/blogs`)
      .then((r) => r.json())
      .then((data) => setRecent(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => setRecent([]));
  }, [id]);

  if (loading) {
    return <div className="blog-detail-page"><p>Đang tải...</p></div>;
  }

  if (!post) {
    return (
      <div className="blog-detail-page">
        <h2>Bài viết không tồn tại</h2>
        <Link to="/blogs">← Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-layout">
        {/* Main */}
        <div className="blog-detail-main">
          <h1 className="blog-detail-title">{post.tieu_de}</h1>

          <div className="blog-detail-meta">
            <span>📅 {post.ngay_tao ? new Date(post.ngay_tao).toLocaleDateString("vi-VN") : ""}</span>
            <span>✍️ Bởi: {post.tac_gia || "Admin"}</span>
          </div>

          {post.anh_dai_dien && (
            <img src={imgUrl(post.anh_dai_dien)} alt={post.tieu_de} className="blog-detail-cover" />
          )}

          <div
            className="blog-detail-body"
            dangerouslySetInnerHTML={{ __html: post.noi_dung }}
          />

          {/* Share */}
          <div className="blog-detail-footer">
            <div className="blog-detail-share">
              <span>Chia sẻ:</span>
              <a href="#" title="Facebook">f</a>
              <a href="#" title="Twitter">t</a>
              <a href="#" title="Pinterest">p</a>
              <a href="#" title="Email">✉</a>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="blog-sidebar">
          <div className="sidebar-block">
            <h3>Tin Tức Mới Nhất</h3>
            {recent.map((p) => (
              <div className="sidebar-recent-item" key={p.id_baiviet}>
                <img src={imgUrl(p.anh_dai_dien)} alt={p.tieu_de} />
                <div className="sidebar-recent-info">
                  <span>{p.ngay_tao ? new Date(p.ngay_tao).toLocaleDateString("vi-VN") : ""}</span>
                  <Link to={`/blogs/${p.id_baiviet}`}>{p.tieu_de}</Link>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
