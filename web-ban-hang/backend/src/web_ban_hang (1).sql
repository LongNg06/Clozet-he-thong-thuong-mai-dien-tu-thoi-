-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost:3306
-- Thời gian đã tạo: Th4 17, 2026 lúc 08:35 AM
-- Phiên bản máy phục vụ: 8.0.30
-- Phiên bản PHP: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `web_ban_hang`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `anh_sanpham_bienthe`
--

CREATE TABLE `anh_sanpham_bienthe` (
  `id_anh` int NOT NULL,
  `id_sanphambienthe` int DEFAULT NULL,
  `url_anh` varchar(500) DEFAULT NULL,
  `la_anh_chinh` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `anh_sanpham_bienthe`
--

INSERT INTO `anh_sanpham_bienthe` (`id_anh`, `id_sanphambienthe`, `url_anh`, `la_anh_chinh`) VALUES
(1, 1, '/img/meme.jpg', 0),
(2, 13, '/img/thudong1.jpg', 0),
(3, 13, '/img/thudong1-bt.jpg', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `baiviet`
--

CREATE TABLE `baiviet` (
  `id_baiviet` int NOT NULL,
  `tieu_de` varchar(255) DEFAULT NULL,
  `noi_dung` text,
  `anh_dai_dien` varchar(255) DEFAULT NULL,
  `trang_thai` tinyint DEFAULT '1',
  `tac_gia` varchar(100) DEFAULT 'Admin',
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  `tom_tat` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `baiviet`
--

INSERT INTO `baiviet` (`id_baiviet`, `tieu_de`, `noi_dung`, `anh_dai_dien`, `trang_thai`, `tac_gia`, `ngay_tao`, `tom_tat`) VALUES
(1, 'Xu Hướng Thời Trang Nam 2026 - Phong Cách Tối Giản Lên Ngôi', '<p>Năm 2026, phong cách tối giản (minimalism) tiếp tục chiếm lĩnh xu hướng thời trang nam. Không cần quá cầu kỳ, chỉ với những item cơ bản nhưng chất lượng, bạn hoàn toàn có thể tạo nên phong cách riêng ấn tượng.</p><p><strong>1. Áo Polo - Lịch lãm mà thoải mái</strong></p><p>Áo polo luôn là sự lựa chọn hoàn hảo cho những buổi gặp mặt bán trang trọng. Kết hợp cùng quần kaki hoặc quần âu, bạn sẽ có set đồ vừa lịch sự vừa năng động.</p><p><strong>2. Quần Kaki Slim-fit</strong></p><p>Quần kaki slim-fit với form dáng ôm vừa phải, tôn dáng người mặc. Đây là item không thể thiếu trong tủ đồ của bất kỳ chàng trai nào.</p><p><strong>3. Áo Khoác Đơn Sắc</strong></p><p>Một chiếc áo khoác đơn sắc như đen, xám hoặc be sẽ giúp bạn dễ dàng phối đồ trong mọi hoàn cảnh. Đặc biệt phù hợp với thời tiết se lạnh.</p><p>Hãy ghé Clozet để khám phá bộ sưu tập mới nhất với giá ưu đãi!</p>', '/img/aonam.png', 1, 'Admin', '2026-04-09 18:02:09', 'Năm 2026, phong cách tối giản tiếp tục chiếm lĩnh xu hướng thời trang nam. Những chiếc áo polo basic, quần kaki slim-fit và áo khoác đơn sắc trở thành lựa chọn hàng đầu của các quý ông hiện đại.'),
(2, 'Cách Phối Đồ Với Áo Sơ Mi Nam - 5 Công Thức Đơn Giản', '<p>Áo sơ mi nam là một trong những item linh hoạt nhất trong tủ đồ. Dù bạn đi làm, đi chơi hay dự tiệc, một chiếc áo sơ mi phù hợp sẽ giúp bạn luôn tự tin.</p><p><strong>Công thức 1: Sơ mi trắng + Quần âu đen</strong></p><p>Bộ đôi kinh điển không bao giờ lỗi mốt. Thêm một chiếc thắt lưng da và giày tây, bạn đã sẵn sàng cho mọi cuộc họp quan trọng.</p><p><strong>Công thức 2: Sơ mi xanh nhạt + Quần kaki be</strong></p><p>Sự kết hợp nhẹ nhàng, phù hợp cho những ngày làm việc thoải mái hoặc đi cafe cuối tuần.</p><p><strong>Công thức 3: Sơ mi kẻ sọc + Quần jean</strong></p><p>Phong cách smart casual hoàn hảo. Xắn tay áo lên một chút để thêm phần năng động.</p><p><strong>Công thức 4: Sơ mi + Áo khoác bomber</strong></p><p>Layer áo sơ mi bên trong áo khoác bomber tạo nên vẻ ngoài vừa nam tính vừa thời thượng.</p><p><strong>Công thức 5: Sơ mi oversize + Quần shorts</strong></p><p>Phong cách mùa hè thoải mái, phù hợp đi biển hay dạo phố.</p>', '/img/somi1.jpg', 1, 'Admin', '2026-04-09 18:02:09', 'Áo sơ mi là item quen thuộc nhưng không phải ai cũng biết cách phối đồ sao cho đẹp. Cùng Clozet khám phá 5 công thức phối đồ đơn giản mà hiệu quả với áo sơ mi nam.'),
(3, 'Bí Quyết Chọn Quần Jean Nam Chuẩn Form', '<p>Quần jean là một trong những item được yêu thích nhất trong thời trang nam. Tuy nhiên, việc chọn được chiếc quần jean phù hợp với vóc dáng không phải lúc nào cũng dễ dàng.</p><p><strong>Xác định form dáng phù hợp</strong></p><p>- <strong>Slim fit</strong>: Ôm vừa phải, phù hợp với hầu hết các dáng người. Đây là lựa chọn an toàn nhất.</p><p>- <strong>Skinny</strong>: Ôm sát, phù hợp với người gầy, tạo cảm giác chân dài hơn.</p><p>- <strong>Regular fit</strong>: Thoải mái, phù hợp cho những ai thích sự dễ chịu.</p><p>- <strong>Straight</strong>: Ống thẳng từ đùi xuống, phong cách classic.</p><p><strong>Chọn màu sắc</strong></p><p>- Xanh đậm (dark wash): Sang trọng, dễ phối đồ, phù hợp nhiều dịp.</p><p>- Xanh nhạt (light wash): Trẻ trung, năng động, phù hợp mùa hè.</p><p>- Đen: Thanh lịch, có thể mặc đi làm hoặc đi chơi.</p><p>Ghé Clozet ngay để tìm chiếc quần jean ưng ý với nhiều mẫu mã đa dạng!</p>', '/img/jean1.png', 1, 'Admin', '2026-04-09 18:02:09', 'Quần jean là item không thể thiếu trong tủ đồ nam giới. Nhưng làm sao để chọn được chiếc quần jean vừa vặn, tôn dáng? Hãy cùng tìm hiểu ngay!'),
(4, 'Top 5 Kiểu Áo Khoác Nam Không Thể Thiếu Mùa Đông', '<p>Khi nhiệt độ giảm, một chiếc áo khoác chất lượng không chỉ giúp bạn giữ ấm mà còn thể hiện gu thời trang cá nhân.</p><p><strong>1. Áo khoác da lộn cổ bẻ</strong></p><p>Phong cách nam tính, mạnh mẽ. Chất liệu da lộn mềm mại kết hợp lót lông ấm áp, hoàn hảo cho những ngày đông lạnh.</p><p><strong>2. Áo khoác gió 2 lớp</strong></p><p>Nhẹ nhàng, chống gió hiệu quả. Thiết kế mũ tháo rời tiện lợi, có thể mặc trong nhiều thời tiết khác nhau.</p><p><strong>3. Áo khoác bomber</strong></p><p>Phong cách trẻ trung, năng động. Dễ dàng kết hợp với áo thun và quần jean cho look hàng ngày.</p><p><strong>4. Áo khoác khaki chần bông</strong></p><p>Giữ ấm tuyệt vời với lớp bông bên trong. Form áo vừa vặn, không bị phồng quá mức.</p><p><strong>5. Áo khoác nhung tăm</strong></p><p>Chất liệu nhung tăm đang là xu hướng. Mang đến vẻ ngoài vintage, lịch lãm và khác biệt.</p><p>Tất cả đều có sẵn tại Clozet với giá cực ưu đãi!</p>', '/img/thudong1.jpg', 1, 'Admin', '2026-04-09 18:02:09', 'Mùa đông đến, áo khoác là item quan trọng nhất. Cùng điểm qua 5 kiểu áo khoác nam đang hot nhất, giúp bạn vừa ấm áp vừa phong cách.');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bo_suu_tap`
--

CREATE TABLE `bo_suu_tap` (
  `id_bosuutap` int NOT NULL,
  `ten_bosuutap` varchar(255) NOT NULL,
  `mo_ta` text,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `bo_suu_tap`
--

INSERT INTO `bo_suu_tap` (`id_bosuutap`, `ten_bosuutap`, `mo_ta`, `ngay_tao`) VALUES
(1, 'Bộ Sưu Tập Thu Đông ', NULL, '2026-03-03 11:26:28'),
(2, 'Bộ Sưu Tập Hè Mát Mẻ', NULL, '2026-03-03 11:26:28');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart`
--

CREATE TABLE `cart` (
  `id` int NOT NULL,
  `id_KH` int NOT NULL DEFAULT '0',
  `id_sanpham` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `size_name` varchar(50) DEFAULT NULL,
  `color_name` varchar(50) DEFAULT NULL,
  `variant_image` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `cart`
--

INSERT INTO `cart` (`id`, `id_KH`, `id_sanpham`, `quantity`, `size_name`, `color_name`, `variant_image`) VALUES
(40, 0, 1, 1, NULL, NULL, NULL),
(48, 2, 16, 1, NULL, NULL, 'http://localhost:5000/img/Áo khoác khaki 2 lớp chần bông cổ bomber.png'),
(63, 1, 35, 1, 'X', 'Đen', 'http://localhost:5000/img/somi2.jpg');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chi_tiet_donhang`
--

CREATE TABLE `chi_tiet_donhang` (
  `id` int NOT NULL,
  `id_donhang` int NOT NULL,
  `id_sanpham` int NOT NULL,
  `ten_sanpham` varchar(255) DEFAULT NULL,
  `so_luong` int DEFAULT '1',
  `gia` decimal(12,2) DEFAULT NULL,
  `size_name` varchar(50) DEFAULT NULL,
  `color_name` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `chi_tiet_donhang`
--

INSERT INTO `chi_tiet_donhang` (`id`, `id_donhang`, `id_sanpham`, `ten_sanpham`, `so_luong`, `gia`, `size_name`, `color_name`) VALUES
(1, 4, 34, 'Quần âu regularfit trơn', 1, 123000.00, NULL, NULL),
(2, 5, 35, 'hehe', 2, 100000.00, 'X', 'Đen'),
(3, 6, 35, 'hehe', 1, 100000.00, 'X', 'Đen'),
(4, 10, 35, 'hehe', 1, 100000.00, 'X', 'Đen'),
(5, 14, 13, 'Áo Polo Be', 1, 420000.00, 'X', 'Đen'),
(6, 15, 35, 'hehe', 1, 100000.00, 'X', 'Đen'),
(7, 16, 35, 'hehe', 1, 100000.00, 'X', 'Đen');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cong_thanh_toan`
--

CREATE TABLE `cong_thanh_toan` (
  `id_congthanhtoan` int NOT NULL,
  `ten_congthanhtoan` varchar(100) DEFAULT NULL,
  `mo_ta` text,
  `trang_thai` tinyint DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhmuc`
--

CREATE TABLE `danhmuc` (
  `id_danhmuc` int NOT NULL,
  `ten_danhmuc` varchar(255) DEFAULT NULL,
  `mo_ta` text,
  `trang_thai` tinyint DEFAULT NULL,
  `HinhAnh` varchar(225) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `danhmuc`
--

INSERT INTO `danhmuc` (`id_danhmuc`, `ten_danhmuc`, `mo_ta`, `trang_thai`, `HinhAnh`) VALUES
(1, 'Áo Khoác', NULL, NULL, 'aokhoac.jpg'),
(3, 'Quần Kaki', NULL, NULL, 'quankaki.jpg'),
(4, 'Quần Jean', NULL, NULL, 'quanjean.jpg'),
(5, 'Áo Polo', NULL, NULL, 'aopolo.jpg'),
(6, 'Quần Âu', NULL, NULL, 'quanAu.jpg'),
(7, 'Áo Sơ Mi', NULL, NULL, 'aosomi.jpg'),
(12, 'Phụ Kiện ', NULL, NULL, 'thắt lưng Mẫu basic.png');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danh_gia`
--

CREATE TABLE `danh_gia` (
  `id_danhgia` int NOT NULL,
  `id_sanpham` int NOT NULL,
  `id_KH` int NOT NULL,
  `id_donhang` int NOT NULL,
  `so_sao` tinyint NOT NULL DEFAULT '5',
  `noi_dung` text,
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `danh_gia`
--

INSERT INTO `danh_gia` (`id_danhgia`, `id_sanpham`, `id_KH`, `id_donhang`, `so_sao`, `noi_dung`, `ngay_tao`) VALUES
(1, 34, 1, 4, 5, 'hehe', '2026-04-09 19:03:41');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `diachi_nguoidung`
--

CREATE TABLE `diachi_nguoidung` (
  `id_diachi` int NOT NULL,
  `id_KH` int DEFAULT NULL,
  `ten_nguoinhan` varchar(255) DEFAULT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `dia_chi_cu_the` varchar(255) DEFAULT NULL,
  `phuong_xa` varchar(100) DEFAULT NULL,
  `quan_huyen` varchar(100) DEFAULT NULL,
  `tinh_thanh` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `diachi_nguoidung`
--

INSERT INTO `diachi_nguoidung` (`id_diachi`, `id_KH`, `ten_nguoinhan`, `so_dien_thoai`, `dia_chi_cu_the`, `phuong_xa`, `quan_huyen`, `tinh_thanh`) VALUES
(1, 2, 'sikibidi', '1234567890', 'D15/403', '5', '5', 'TPHCM'),
(3, 2, 'sikibidi', '1234567890', 'D15/403', '5', '5', 'TPHCM'),
(5, 1, 'kiki', '0937416990', 'd15/403', '5', '5', 'TPHCM');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `don_hang`
--

CREATE TABLE `don_hang` (
  `id_donhang` int NOT NULL,
  `id_KH` int DEFAULT NULL,
  `id_diachi` int DEFAULT NULL,
  `id_giamgia` int DEFAULT NULL,
  `tong_tien_hang` decimal(12,2) DEFAULT NULL,
  `phi_van_chuyen` decimal(12,2) DEFAULT NULL,
  `tong_thanh_toan` decimal(12,2) DEFAULT NULL,
  `trang_thai_donhang` varchar(100) DEFAULT NULL,
  `ngay_dat` datetime DEFAULT CURRENT_TIMESTAMP,
  `phuong_thuc_thanh_toan` varchar(20) DEFAULT 'cod'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `don_hang`
--

INSERT INTO `don_hang` (`id_donhang`, `id_KH`, `id_diachi`, `id_giamgia`, `tong_tien_hang`, `phi_van_chuyen`, `tong_thanh_toan`, `trang_thai_donhang`, `ngay_dat`, `phuong_thuc_thanh_toan`) VALUES
(16, 1, 5, NULL, 100000.00, 15000.00, 115000.00, 'đã thanh toán', '2026-04-13 18:04:03', 'vnpay');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `giam_gia`
--

CREATE TABLE `giam_gia` (
  `id_giamgia` int NOT NULL,
  `ma_giamgia` varchar(50) DEFAULT NULL,
  `loai_giamgia` enum('phan_tram','tien_mat') DEFAULT NULL,
  `gia_tri` decimal(12,2) DEFAULT NULL,
  `ngay_bat_dau` datetime DEFAULT NULL,
  `ngay_ket_thuc` datetime DEFAULT NULL,
  `so_luot_su_dung` int DEFAULT '0',
  `trang_thai` tinyint DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `kh`
--

CREATE TABLE `kh` (
  `id_KH` int NOT NULL,
  `ho_ten` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `mat_khau` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `trang_thai` tinyint DEFAULT '1',
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `kh`
--

INSERT INTO `kh` (`id_KH`, `ho_ten`, `email`, `so_dien_thoai`, `mat_khau`, `role`, `trang_thai`, `ngay_tao`) VALUES
(1, 'hehe', '782nguyenvantien@gmail.com', NULL, 'hoainam', 'user', 1, '2026-03-31 20:12:07'),
(2, 'sikibidi', 'biyao2912@gmail.com', NULL, '123', 'admin', 1, '2026-04-03 10:03:24');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `kich_co`
--

CREATE TABLE `kich_co` (
  `id_kichco` int NOT NULL,
  `ten_kichco` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `kich_co`
--

INSERT INTO `kich_co` (`id_kichco`, `ten_kichco`) VALUES
(1, 'X'),
(2, 'S'),
(3, 'XL'),
(4, 'L'),
(5, 'XL');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `mau`
--

CREATE TABLE `mau` (
  `id_mau` int NOT NULL,
  `ten_mau` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `mau`
--

INSERT INTO `mau` (`id_mau`, `ten_mau`) VALUES
(1, 'Đen'),
(2, 'Trắng'),
(3, NULL),
(4, 'Xám be');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sanpham`
--

CREATE TABLE `sanpham` (
  `id_sanpham` int NOT NULL,
  `id_danhmuc` int DEFAULT NULL,
  `id_thuonghieu` int DEFAULT NULL,
  `id_bosuutap` int DEFAULT NULL,
  `loai_sp` enum('single','set') DEFAULT NULL,
  `gia_khuyen_mai` decimal(10,2) DEFAULT NULL,
  `ten_sanpham` varchar(255) DEFAULT NULL,
  `anh` varchar(225) NOT NULL,
  `gia_goc` decimal(10,2) DEFAULT NULL,
  `mo_ta` text,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `so_luong_ton` int DEFAULT '0',
  `trang_thai` tinyint DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `sanpham`
--

INSERT INTO `sanpham` (`id_sanpham`, `id_danhmuc`, `id_thuonghieu`, `id_bosuutap`, `loai_sp`, `gia_khuyen_mai`, `ten_sanpham`, `anh`, `gia_goc`, `mo_ta`, `ngay_tao`, `so_luong_ton`, `trang_thai`) VALUES
(1, 1, 1, NULL, NULL, 350000.00, 'Áo Nam ', '/img/aonam.png', 400000.00, NULL, '2026-02-25 05:05:50', 0, 1),
(2, 1, 1, NULL, NULL, 230000.00, 'Áo khoác gió 2 lớp mũ tháo rời', '/img/aokhoac3.png', 240000.00, NULL, '2026-02-25 07:19:36', 0, 1),
(3, NULL, NULL, NULL, NULL, 350.00, 'hehe', '/img/Áo khoác gió 2 lớp mũ tháo rời.png', 400.00, NULL, '2026-03-02 07:07:27', 0, 1),
(4, NULL, NULL, NULL, NULL, 400000.00, 'Áo khoác gió 2 lớp lót lông cổ cao basic', '/img/Áo khoác gió 2 lớp lót lông cổ cao basic.png', 420000.00, NULL, '2026-03-02 07:07:27', 0, 1),
(5, NULL, NULL, NULL, NULL, NULL, 'Áo Phông Giữ Nhiệt', '/img/Áo Phông Giữ Nhiệt.jpg', 400.00, NULL, '2026-03-02 07:08:39', 0, 1),
(6, NULL, NULL, NULL, NULL, 400000.00, 'Quần Phông Giữ Nhiệt', '/img/Quần Phông Giữ Nhiệt.jpg', 420000.00, NULL, '2026-03-02 07:08:39', 0, 1),
(7, 1, 1, 1, 'set', NULL, 'Áo bí bo 2 lớp', '/img/Áo bí bo 2 lớp.png', 20000.00, NULL, '2026-03-03 11:43:59', 0, 1),
(8, 1, 1, 1, NULL, NULL, 'Áo khoác da lộn basic cổ bẻ lót lông', '/img/Áo khoác da lộn basic cổ bẻ lót lông.jpg', 23000.00, NULL, '2026-03-03 11:43:59', 0, 1),
(9, 1, 1, 1, NULL, NULL, 'Áo Khoác kaki Cổ Điển ', '/img/Áo Khoác kaki.png', 450000.00, NULL, '2026-03-03 11:43:59', 0, 1),
(11, 1, 1, 1, NULL, NULL, 'Áo khoác khaki 2 lớp túi khóa thêu', '/img/Áo khoác khaki 2 lớp túi khóa thêu.jpg', 12000.00, NULL, '2026-03-03 11:43:59', 0, 1),
(12, 1, 1, 1, NULL, NULL, 'Áo khoác nhung tăm cổ bẻ', '/img/Áo khoác nhung tăm cổ bẻ.jpg', 340000.00, NULL, '2026-03-03 11:43:59', 0, 1),
(13, 5, 1, 2, 'single', 420000.00, 'Áo Polo Be', '/img/áo polo be.png', 450000.00, NULL, '2026-03-10 07:46:01', 0, 1),
(14, 3, NULL, NULL, NULL, 23000.00, 'Quần Khaki Basic', '/img/quần Khaki Basic.jpg', 250000.00, NULL, '2026-03-10 07:50:10', 0, 1),
(15, 12, 1, NULL, NULL, 400000.00, 'Thắt Lưng Basic', '/img/thắt lưng Mẫu basic.png', 420000.00, NULL, '2026-04-05 10:32:53', 0, 1),
(16, 1, 1, 1, NULL, 200000.00, 'Áo khoác bomber lót lông thêu logo ngực', '/img/Áo khoác khaki 2 lớp chần bông cổ bomber.png', 210000.00, NULL, '2026-04-08 01:18:47', 0, 1),
(17, 3, NULL, NULL, NULL, NULL, 'Quần kaki dài basic cạp tender', '/img/kaki2.png', 120000.00, 'supciton', '2026-04-08 01:40:28', 0, 1),
(18, 3, 1, NULL, NULL, NULL, 'Quần kaki dài basic ', '/img/kaki3.jpg', 67000.00, NULL, '2026-04-08 01:40:28', 0, 1),
(19, NULL, NULL, NULL, NULL, NULL, 'Quần Âu Cổ Điển', '/img/quanau1.jpg', 400000.00, NULL, '2026-04-08 01:40:50', 0, 1),
(26, 3, 1, NULL, NULL, NULL, 'Quần kaki dài basic vải hiệu ứng', '/img/kaki4.png ', 230000.00, 'hehe', '2026-04-08 01:44:58', 0, 1),
(27, 3, 1, NULL, NULL, NULL, 'Quần kaki dài basic túi chéo', '/img/kaki5.png', 80000.00, 'hehe', '2026-04-08 01:44:58', 0, 1),
(28, 3, 1, NULL, NULL, NULL, 'Quần kaki dài túi chéo basic regularfit cúc rập logo', '/img/kaki6.png', 560000.00, 'hjhj', '2026-04-08 01:44:58', 0, 1),
(29, 4, 1, NULL, NULL, NULL, 'Quần jeans basic ', '/img/jean1.png', 78000.00, 'haha', '2026-04-08 01:52:51', 0, 1),
(30, 4, 1, NULL, NULL, NULL, 'Quần Jeans basic regularfit', '/img/jean2.png', 96000.00, 'hehe', '2026-04-08 01:52:51', 0, 1),
(31, 7, NULL, NULL, NULL, NULL, 'Sơ mi dài tay trơn regularfit thêu chữ ký ở măng xét tay', '/img/somi1.jpg', 230000.00, 'nunu', '2026-04-08 01:56:29', 0, 1),
(32, 7, 1, NULL, NULL, 790000.00, 'Sơ mi dài tay nhung tăm regularfit thêu logo ngực', '/img/somi2.jpg', 99000.00, 'heh', '2026-04-08 01:56:29', 0, 1),
(33, 6, 1, 1, NULL, NULL, 'Quần âu regular cạp lót in logo', '/img/quanau1.jpg', 450000.00, 'hehe', '2026-04-08 01:58:14', 0, 1),
(34, 6, 1, 1, NULL, NULL, 'Quần âu regularfit trơn', '/img/quanau2.jpg', 123000.00, NULL, '2026-04-08 01:58:14', 0, 1),
(35, 1, NULL, NULL, NULL, 100000.00, 'hehe', '/img/somi2.jpg', 120000.00, 'hehe', '2026-04-10 01:51:50', 10, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sanpham_bienthe`
--

CREATE TABLE `sanpham_bienthe` (
  `id_sanphambienthe` int NOT NULL,
  `id_sanpham` int DEFAULT NULL,
  `id_kichco` int DEFAULT NULL,
  `id_mau` int DEFAULT NULL,
  `so_luong_ton` int DEFAULT '0',
  `trang_thai` tinyint DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `sanpham_bienthe`
--

INSERT INTO `sanpham_bienthe` (`id_sanphambienthe`, `id_sanpham`, `id_kichco`, `id_mau`, `so_luong_ton`, `trang_thai`) VALUES
(1, 2, 2, 1, NULL, 1),
(2, 7, NULL, NULL, 11, 1),
(3, 7, 3, 2, 12, 1),
(11, 13, 1, 1, 99, 1),
(12, 16, 4, 4, 0, 1),
(13, 16, 5, 1, 0, 1),
(14, 35, 1, 1, 7, 1),
(16, 35, 1, NULL, 7, 1),
(17, 35, 1, NULL, 7, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thanh_toan`
--

CREATE TABLE `thanh_toan` (
  `id_thanhtoan` int NOT NULL,
  `id_donhang` int DEFAULT NULL,
  `id_khachhang` int DEFAULT NULL,
  `id_congthanhtoan` int DEFAULT NULL,
  `so_tien` decimal(15,2) DEFAULT NULL,
  `trang_thai` varchar(50) DEFAULT NULL,
  `ma_giao_dich` varchar(100) DEFAULT NULL,
  `thoi_gian` datetime DEFAULT CURRENT_TIMESTAMP,
  `ghi_chu` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thongbao`
--

CREATE TABLE `thongbao` (
  `id` int NOT NULL,
  `id_KH` int DEFAULT NULL,
  `nguoi_gui` enum('admin','user') NOT NULL DEFAULT 'admin',
  `tieu_de` varchar(255) NOT NULL,
  `noi_dung` text,
  `parent_id` int DEFAULT NULL,
  `da_doc` tinyint DEFAULT '0',
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `thongbao`
--

INSERT INTO `thongbao` (`id`, `id_KH`, `nguoi_gui`, `tieu_de`, `noi_dung`, `parent_id`, `da_doc`, `ngay_tao`) VALUES
(1, 1, 'admin', 'sisi', 'haha', NULL, 1, '2026-04-09 19:24:24'),
(2, 1, 'user', 'Phản hồi', 'hihi', 1, 1, '2026-04-09 19:24:51'),
(3, 1, 'admin', 'kiki', 'haha', NULL, 1, '2026-04-10 08:55:46'),
(4, 1, 'user', 'Phản hồi', 'juju', 3, 1, '2026-04-10 08:56:16');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thuonghieu`
--

CREATE TABLE `thuonghieu` (
  `id_thuonghieu` int NOT NULL,
  `ten_brand` varchar(255) DEFAULT NULL,
  `mo_ta` text,
  `logo` varchar(255) DEFAULT NULL,
  `trang_thai` tinyint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `thuonghieu`
--

INSERT INTO `thuonghieu` (`id_thuonghieu`, `ten_brand`, `mo_ta`, `logo`, `trang_thai`) VALUES
(1, 'Torano', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `yeu_thich`
--

CREATE TABLE `yeu_thich` (
  `id` int NOT NULL,
  `id_KH` int NOT NULL,
  `id_sanpham` int NOT NULL,
  `ngay_them` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `yeu_thich`
--

INSERT INTO `yeu_thich` (`id`, `id_KH`, `id_sanpham`, `ngay_them`) VALUES
(2, 1, 34, '2026-04-10 09:11:48'),
(3, 1, 6, '2026-04-10 09:11:52');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `anh_sanpham_bienthe`
--
ALTER TABLE `anh_sanpham_bienthe`
  ADD PRIMARY KEY (`id_anh`),
  ADD KEY `id_sanphambienthe` (`id_sanphambienthe`);

--
-- Chỉ mục cho bảng `baiviet`
--
ALTER TABLE `baiviet`
  ADD PRIMARY KEY (`id_baiviet`);

--
-- Chỉ mục cho bảng `bo_suu_tap`
--
ALTER TABLE `bo_suu_tap`
  ADD PRIMARY KEY (`id_bosuutap`);

--
-- Chỉ mục cho bảng `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `chi_tiet_donhang`
--
ALTER TABLE `chi_tiet_donhang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_donhang` (`id_donhang`),
  ADD KEY `id_sanpham` (`id_sanpham`);

--
-- Chỉ mục cho bảng `cong_thanh_toan`
--
ALTER TABLE `cong_thanh_toan`
  ADD PRIMARY KEY (`id_congthanhtoan`);

--
-- Chỉ mục cho bảng `danhmuc`
--
ALTER TABLE `danhmuc`
  ADD PRIMARY KEY (`id_danhmuc`);

--
-- Chỉ mục cho bảng `danh_gia`
--
ALTER TABLE `danh_gia`
  ADD PRIMARY KEY (`id_danhgia`),
  ADD KEY `id_sanpham` (`id_sanpham`),
  ADD KEY `id_KH` (`id_KH`);

--
-- Chỉ mục cho bảng `diachi_nguoidung`
--
ALTER TABLE `diachi_nguoidung`
  ADD PRIMARY KEY (`id_diachi`),
  ADD KEY `id_KH` (`id_KH`);

--
-- Chỉ mục cho bảng `don_hang`
--
ALTER TABLE `don_hang`
  ADD PRIMARY KEY (`id_donhang`),
  ADD KEY `id_KH` (`id_KH`),
  ADD KEY `id_diachi` (`id_diachi`),
  ADD KEY `id_giamgia` (`id_giamgia`);

--
-- Chỉ mục cho bảng `giam_gia`
--
ALTER TABLE `giam_gia`
  ADD PRIMARY KEY (`id_giamgia`);

--
-- Chỉ mục cho bảng `kh`
--
ALTER TABLE `kh`
  ADD PRIMARY KEY (`id_KH`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Chỉ mục cho bảng `kich_co`
--
ALTER TABLE `kich_co`
  ADD PRIMARY KEY (`id_kichco`);

--
-- Chỉ mục cho bảng `mau`
--
ALTER TABLE `mau`
  ADD PRIMARY KEY (`id_mau`);

--
-- Chỉ mục cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  ADD PRIMARY KEY (`id_sanpham`),
  ADD KEY `id_danhmuc` (`id_danhmuc`),
  ADD KEY `id_thuonghieu` (`id_thuonghieu`),
  ADD KEY `fk_sanpham_bosuutap` (`id_bosuutap`);

--
-- Chỉ mục cho bảng `sanpham_bienthe`
--
ALTER TABLE `sanpham_bienthe`
  ADD PRIMARY KEY (`id_sanphambienthe`),
  ADD UNIQUE KEY `unique_variant` (`id_sanpham`,`id_mau`,`id_kichco`),
  ADD KEY `id_kichco` (`id_kichco`),
  ADD KEY `id_mau` (`id_mau`);

--
-- Chỉ mục cho bảng `thanh_toan`
--
ALTER TABLE `thanh_toan`
  ADD PRIMARY KEY (`id_thanhtoan`);

--
-- Chỉ mục cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `thuonghieu`
--
ALTER TABLE `thuonghieu`
  ADD PRIMARY KEY (`id_thuonghieu`);

--
-- Chỉ mục cho bảng `yeu_thich`
--
ALTER TABLE `yeu_thich`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wish` (`id_KH`,`id_sanpham`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `anh_sanpham_bienthe`
--
ALTER TABLE `anh_sanpham_bienthe`
  MODIFY `id_anh` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `baiviet`
--
ALTER TABLE `baiviet`
  MODIFY `id_baiviet` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `bo_suu_tap`
--
ALTER TABLE `bo_suu_tap`
  MODIFY `id_bosuutap` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT cho bảng `chi_tiet_donhang`
--
ALTER TABLE `chi_tiet_donhang`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `cong_thanh_toan`
--
ALTER TABLE `cong_thanh_toan`
  MODIFY `id_congthanhtoan` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `danhmuc`
--
ALTER TABLE `danhmuc`
  MODIFY `id_danhmuc` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `danh_gia`
--
ALTER TABLE `danh_gia`
  MODIFY `id_danhgia` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `diachi_nguoidung`
--
ALTER TABLE `diachi_nguoidung`
  MODIFY `id_diachi` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `don_hang`
--
ALTER TABLE `don_hang`
  MODIFY `id_donhang` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT cho bảng `giam_gia`
--
ALTER TABLE `giam_gia`
  MODIFY `id_giamgia` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `kh`
--
ALTER TABLE `kh`
  MODIFY `id_KH` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `kich_co`
--
ALTER TABLE `kich_co`
  MODIFY `id_kichco` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `mau`
--
ALTER TABLE `mau`
  MODIFY `id_mau` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  MODIFY `id_sanpham` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT cho bảng `sanpham_bienthe`
--
ALTER TABLE `sanpham_bienthe`
  MODIFY `id_sanphambienthe` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `thanh_toan`
--
ALTER TABLE `thanh_toan`
  MODIFY `id_thanhtoan` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `thuonghieu`
--
ALTER TABLE `thuonghieu`
  MODIFY `id_thuonghieu` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `yeu_thich`
--
ALTER TABLE `yeu_thich`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `anh_sanpham_bienthe`
--
ALTER TABLE `anh_sanpham_bienthe`
  ADD CONSTRAINT `anh_sanpham_bienthe_ibfk_1` FOREIGN KEY (`id_sanphambienthe`) REFERENCES `sanpham_bienthe` (`id_sanphambienthe`);

--
-- Các ràng buộc cho bảng `diachi_nguoidung`
--
ALTER TABLE `diachi_nguoidung`
  ADD CONSTRAINT `diachi_nguoidung_ibfk_1` FOREIGN KEY (`id_KH`) REFERENCES `kh` (`id_KH`);

--
-- Các ràng buộc cho bảng `don_hang`
--
ALTER TABLE `don_hang`
  ADD CONSTRAINT `don_hang_ibfk_1` FOREIGN KEY (`id_KH`) REFERENCES `kh` (`id_KH`),
  ADD CONSTRAINT `don_hang_ibfk_2` FOREIGN KEY (`id_diachi`) REFERENCES `diachi_nguoidung` (`id_diachi`),
  ADD CONSTRAINT `don_hang_ibfk_3` FOREIGN KEY (`id_giamgia`) REFERENCES `giam_gia` (`id_giamgia`);

--
-- Các ràng buộc cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  ADD CONSTRAINT `fk_sanpham_bosuutap` FOREIGN KEY (`id_bosuutap`) REFERENCES `bo_suu_tap` (`id_bosuutap`) ON DELETE SET NULL,
  ADD CONSTRAINT `sanpham_ibfk_1` FOREIGN KEY (`id_danhmuc`) REFERENCES `danhmuc` (`id_danhmuc`),
  ADD CONSTRAINT `sanpham_ibfk_2` FOREIGN KEY (`id_thuonghieu`) REFERENCES `thuonghieu` (`id_thuonghieu`);

--
-- Các ràng buộc cho bảng `sanpham_bienthe`
--
ALTER TABLE `sanpham_bienthe`
  ADD CONSTRAINT `fk_sp_bienthe` FOREIGN KEY (`id_sanpham`) REFERENCES `sanpham` (`id_sanpham`),
  ADD CONSTRAINT `sanpham_bienthe_ibfk_2` FOREIGN KEY (`id_kichco`) REFERENCES `kich_co` (`id_kichco`),
  ADD CONSTRAINT `sanpham_bienthe_ibfk_3` FOREIGN KEY (`id_mau`) REFERENCES `mau` (`id_mau`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
