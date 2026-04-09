import { useState } from "react";
import "./lienhe.css";

export default function LienHe() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="contact-page">
      {/* Google Map */}
      <div className="contact-map">
        <iframe
          title="Clozet Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.485!2d106.6297!3d10.8531!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752bee0b0ef9e5%3A0x5b4da59e47aa97a8!2zQ8O0bmcgdmnDqm4gcGjhuqduIG3hu4FtIFF1YW5nIFRydW5n!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Contact Body */}
      <div className="contact-body">
        {/* Left: Form */}
        <div className="contact-form-section">
          <h2>Gửi thắc mắc cho chúng tôi</h2>
          <p>
            Nếu bạn có thắc mắc gì, có thể gửi yêu cầu cho chúng tôi, và chúng tôi sẽ liên lạc lại với bạn sớm nhất có thể.
          </p>

          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Tên của bạn"
              value={form.name}
              onChange={handleChange}
              required
            />

            <div className="form-row">
              <input
                type="email"
                name="email"
                placeholder="Email của bạn"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Số điện thoại của bạn"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <textarea
              name="message"
              placeholder="Nội dung"
              value={form.message}
              onChange={handleChange}
              required
            />

            <p className="contact-recaptcha">
              This site is protected by reCAPTCHA and the Google{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and{" "}
              <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">Terms of Service</a> apply.
            </p>

            <button type="submit" className="contact-submit-btn">
              GỬI CHO CHÚNG TÔI
            </button>
          </form>
        </div>

        {/* Right: Info */}
        <div className="contact-info-section">
          <h2>Thông tin liên hệ</h2>

          <div className="contact-info-item">
            <div className="contact-info-icon">
              <i className="fa-solid fa-location-dot"></i>
            </div>
            <div className="contact-info-text">
              <h4>Địa chỉ</h4>
              <p>Tòa nhà Quang Trung, Công viên phần mềm Quang Trung, Quận 12, TP. Hồ Chí Minh</p>
            </div>
          </div>

          <div className="contact-info-item">
            <div className="contact-info-icon">
              <i className="fa-solid fa-phone"></i>
            </div>
            <div className="contact-info-text">
              <h4>Điện thoại</h4>
              <p>0964.942.121</p>
            </div>
          </div>

          <div className="contact-info-item">
            <div className="contact-info-icon">
              <i className="fa-solid fa-clock"></i>
            </div>
            <div className="contact-info-text">
              <h4>Thời gian làm việc</h4>
              <p>Thứ 2 đến thứ 6: từ 8h30 đến 18h</p>
              <p>Thứ 7: từ 8h30 đến 12h00</p>
            </div>
          </div>

          <div className="contact-info-item">
            <div className="contact-info-icon">
              <i className="fa-regular fa-envelope"></i>
            </div>
            <div className="contact-info-text">
              <h4>Email</h4>
              <p>cskh@clozet.vn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
