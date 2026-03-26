-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost:3306
-- Thời gian đã tạo: Th3 03, 2026 lúc 05:30 PM
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

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `baiviet`
--

CREATE TABLE `baiviet` (
  `id_baiviet` int NOT NULL,
  `tieu_de` varchar(255) DEFAULT NULL,
  `noi_dung` text,
  `anh_dai_dien` varchar(255) DEFAULT NULL,
  `trang_thai` tinyint DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(7, 'Áo Sơ Mi', NULL, NULL, 'aosomi.jpg');

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
  `ngay_dat` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
-- Cấu trúc bảng cho bảng `giohang`
--

CREATE TABLE `giohang` (
  `id_giohang` int NOT NULL,
  `id_KH` int DEFAULT NULL,
  `id_sanphambienthe` int DEFAULT NULL,
  `so_luong` int DEFAULT NULL
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
(3, 'XL');

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
(1, 'den'),
(2, 'trắng');

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
  `trang_thai` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1 = con hang, 0 = het hang',
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `sanpham`
--

INSERT INTO `sanpham` (`id_sanpham`, `id_danhmuc`, `id_thuonghieu`, `id_bosuutap`, `loai_sp`, `gia_khuyen_mai`, `ten_sanpham`, `anh`, `gia_goc`, `mo_ta`, `trang_thai`, `ngay_tao`) VALUES
(1, 1, 1, NULL, NULL, 350000.00, 'Áo Nam ', '/img/aonam.png', 400000.00, NULL, 1, '2026-02-25 05:05:50'),
(2, 1, 1, NULL, NULL, 230000.00, 'Áo Khoác Mùa Đông', '/img/aokhoac3.png', 240000.00, NULL, 0, '2026-02-25 07:19:36'),
(3, NULL, NULL, NULL, NULL, 350.00, 'hehe', '/img/aonam.png', 400.00, NULL, 1, '2026-03-02 07:07:27'),
(4, NULL, NULL, NULL, NULL, 400000.00, 'huhu', '/img/aonam.png', 420000.00, NULL, 1, '2026-03-02 07:07:27'),
(5, NULL, NULL, NULL, NULL, NULL, 'hihi', '/img/aonam.png', 400.00, NULL, 1, '2026-03-02 07:08:39'),
(6, NULL, NULL, NULL, NULL, 400000.00, 'hghg', '/img/aonam.png', 420000.00, NULL, 1, '2026-03-02 07:08:39'),
(7, 1, 1, 1, 'set', NULL, 'Áo bí bo 2 lớp', '/img/Áo bí bo 2 lớp.png', 20000.00, NULL, 1, '2026-03-03 11:43:59'),
(8, 1, 1, 1, NULL, NULL, 'Áo khoác da lộn basic cổ bẻ lót lông', '/img/Áo khoác da lộn basic cổ bẻ lót lông.jpg', 23000.00, NULL, 1, '2026-03-03 11:43:59'),
(9, 1, 1, 1, NULL, NULL, 'Áo Khoác kaki Cổ Điển ', '/img/Áo Khoác kaki.png', 450000.00, NULL, 1, '2026-03-03 11:43:59'),
(10, 1, 1, 1, NULL, NULL, 'Áo khoác khaki 2 lớp chần bông cổ bomber', '/img/Áo khoác khaki 2 lớp chần bông cổ bomber.png', 76000.00, NULL, 1, '2026-03-03 11:43:59'),
(11, 1, 1, 1, NULL, NULL, 'Áo khoác khaki 2 lớp túi khóa thêu', '/img/Áo khoác khaki 2 lớp túi khóa thêu.jpg', 12000.00, NULL, 1, '2026-03-03 11:43:59'),
(12, 1, 1, 1, NULL, NULL, 'Áo khoác nhung tăm cổ bẻ', '/img/Áo khoác nhung tăm cổ bẻ.jpg', 340000.00, NULL, 1, '2026-03-03 11:43:59');

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
(1, 1, 2, 1, NULL, 1),
(2, 7, 1, 1, 11, 1),
(3, 7, 3, 2, 12, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sanpham_yeuthich`
--

CREATE TABLE `sanpham_yeuthich` (
  `id_yeuthich` int NOT NULL,
  `id_KH` int DEFAULT NULL,
  `id_sanphambienthe` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thanh_toan`
--

CREATE TABLE `thanh_toan` (
  `id_thanhtoan` int NOT NULL,
  `id_donhang` int DEFAULT NULL,
  `id_congthanhtoan` int DEFAULT NULL,
  `so_tien` decimal(12,2) DEFAULT NULL,
  `trang_thai_thanhtoan` varchar(100) DEFAULT NULL,
  `ma_giao_dich` varchar(255) DEFAULT NULL,
  `thoi_gian_thanhtoan` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
-- Chỉ mục cho bảng `giohang`
--
ALTER TABLE `giohang`
  ADD PRIMARY KEY (`id_giohang`),
  ADD KEY `id_KH` (`id_KH`),
  ADD KEY `id_sanphambienthe` (`id_sanphambienthe`);

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
-- Chỉ mục cho bảng `sanpham_yeuthich`
--
ALTER TABLE `sanpham_yeuthich`
  ADD PRIMARY KEY (`id_yeuthich`),
  ADD KEY `id_KH` (`id_KH`),
  ADD KEY `id_sanphambienthe` (`id_sanphambienthe`);

--
-- Chỉ mục cho bảng `thanh_toan`
--
ALTER TABLE `thanh_toan`
  ADD PRIMARY KEY (`id_thanhtoan`),
  ADD KEY `id_donhang` (`id_donhang`),
  ADD KEY `id_congthanhtoan` (`id_congthanhtoan`);

--
-- Chỉ mục cho bảng `thuonghieu`
--
ALTER TABLE `thuonghieu`
  ADD PRIMARY KEY (`id_thuonghieu`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `anh_sanpham_bienthe`
--
ALTER TABLE `anh_sanpham_bienthe`
  MODIFY `id_anh` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `baiviet`
--
ALTER TABLE `baiviet`
  MODIFY `id_baiviet` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `bo_suu_tap`
--
ALTER TABLE `bo_suu_tap`
  MODIFY `id_bosuutap` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `cong_thanh_toan`
--
ALTER TABLE `cong_thanh_toan`
  MODIFY `id_congthanhtoan` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `danhmuc`
--
ALTER TABLE `danhmuc`
  MODIFY `id_danhmuc` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `diachi_nguoidung`
--
ALTER TABLE `diachi_nguoidung`
  MODIFY `id_diachi` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `don_hang`
--
ALTER TABLE `don_hang`
  MODIFY `id_donhang` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `giam_gia`
--
ALTER TABLE `giam_gia`
  MODIFY `id_giamgia` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `giohang`
--
ALTER TABLE `giohang`
  MODIFY `id_giohang` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `kh`
--
ALTER TABLE `kh`
  MODIFY `id_KH` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `kich_co`
--
ALTER TABLE `kich_co`
  MODIFY `id_kichco` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `mau`
--
ALTER TABLE `mau`
  MODIFY `id_mau` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  MODIFY `id_sanpham` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `sanpham_bienthe`
--
ALTER TABLE `sanpham_bienthe`
  MODIFY `id_sanphambienthe` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `sanpham_yeuthich`
--
ALTER TABLE `sanpham_yeuthich`
  MODIFY `id_yeuthich` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `thanh_toan`
--
ALTER TABLE `thanh_toan`
  MODIFY `id_thanhtoan` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `thuonghieu`
--
ALTER TABLE `thuonghieu`
  MODIFY `id_thuonghieu` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
-- Các ràng buộc cho bảng `giohang`
--
ALTER TABLE `giohang`
  ADD CONSTRAINT `giohang_ibfk_1` FOREIGN KEY (`id_KH`) REFERENCES `kh` (`id_KH`),
  ADD CONSTRAINT `giohang_ibfk_2` FOREIGN KEY (`id_sanphambienthe`) REFERENCES `sanpham_bienthe` (`id_sanphambienthe`);

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

--
-- Các ràng buộc cho bảng `sanpham_yeuthich`
--
ALTER TABLE `sanpham_yeuthich`
  ADD CONSTRAINT `sanpham_yeuthich_ibfk_1` FOREIGN KEY (`id_KH`) REFERENCES `kh` (`id_KH`),
  ADD CONSTRAINT `sanpham_yeuthich_ibfk_2` FOREIGN KEY (`id_sanphambienthe`) REFERENCES `sanpham_bienthe` (`id_sanphambienthe`);

--
-- Các ràng buộc cho bảng `thanh_toan`
--
ALTER TABLE `thanh_toan`
  ADD CONSTRAINT `thanh_toan_ibfk_1` FOREIGN KEY (`id_donhang`) REFERENCES `don_hang` (`id_donhang`),
  ADD CONSTRAINT `thanh_toan_ibfk_2` FOREIGN KEY (`id_congthanhtoan`) REFERENCES `cong_thanh_toan` (`id_congthanhtoan`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
