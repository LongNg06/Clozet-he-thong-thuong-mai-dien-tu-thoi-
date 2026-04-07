const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const SAVE_DIR = path.join(__dirname, "img");

// Các collection cần crawl
const COLLECTIONS = [
  "ao-khoac",
  "set-bo",
  "quan-dai-kaki",
  "quan-jeans",
  "ao-polo",
  "quan-au",
  "ao-so-mi",
  "ao-thun",
  "onsale",
  "hot-products",
];

// Tối đa số trang mỗi collection
const MAX_PAGES = 3;

// Hàm fetch URL trả về HTML string
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchPage(res.headers.location).then(resolve).catch(reject);
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

// Hàm download 1 ảnh
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadImage(res.headers.location, filePath).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const ws = fs.createWriteStream(filePath);
        res.pipe(ws);
        ws.on("finish", () => {
          ws.close();
          resolve();
        });
        ws.on("error", reject);
      })
      .on("error", reject);
  });
}

// Trích xuất tất cả URL ảnh sản phẩm từ HTML
function extractImageUrls(html) {
  const urls = new Set();

  // Tìm ảnh từ data-src, data-lazyload, data-srcset, src - chỉ lấy ảnh sản phẩm từ cdn.hstatic.net
  const patterns = [
    /data-src=["'](https?:\/\/cdn\.hstatic\.net\/[^"']+)["']/gi,
    /data-lazyload=["'](https?:\/\/cdn\.hstatic\.net\/[^"']+)["']/gi,
    /data-srcset=["'](https?:\/\/cdn\.hstatic\.net\/[^"'\s]+)/gi,
    /src=["'](https?:\/\/cdn\.hstatic\.net\/products\/[^"']+)["']/gi,
    // Cũng lấy ảnh từ theme (banner, category...)
    /(?:data-src|src)=["'](https?:\/\/theme\.hstatic\.net\/[^"']+)["']/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let imgUrl = match[1];
      // Bỏ qua placeholder base64
      if (imgUrl.includes("data:image")) continue;
      // Bỏ qua ảnh quá nhỏ (icon)
      if (imgUrl.includes("_icon") || imgUrl.includes("favicon")) continue;
      urls.add(imgUrl);
    }
  }

  return [...urls];
}

// Tạo tên file từ URL
function urlToFilename(url) {
  try {
    const parsed = new URL(url);
    // Lấy phần cuối của path
    let filename = path.basename(parsed.pathname);
    // Xóa query string nếu dính vào
    filename = filename.split("?")[0];
    // Nếu filename quá dài, cắt ngắn
    if (filename.length > 100) {
      const ext = path.extname(filename);
      filename = filename.substring(0, 90) + ext;
    }
    return filename;
  } catch {
    return "image_" + Date.now() + ".jpg";
  }
}

// Delay helper
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  // Tạo thư mục nếu chưa có
  if (!fs.existsSync(SAVE_DIR)) {
    fs.mkdirSync(SAVE_DIR, { recursive: true });
  }

  const allImageUrls = new Set();

  console.log("=== BẮT ĐẦU CRAWL ẢNH TỪ TORANO.VN ===\n");

  // 1. Crawl từng collection
  for (const collection of COLLECTIONS) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = `https://torano.vn/collections/${collection}?page=${page}`;
      console.log(`Đang fetch: ${url}`);
      try {
        const html = await fetchPage(url);
        const images = extractImageUrls(html);
        console.log(`  -> Tìm thấy ${images.length} ảnh`);
        images.forEach((img) => allImageUrls.add(img));
        await delay(500); // Chờ 500ms giữa mỗi request
      } catch (err) {
        console.error(`  -> Lỗi: ${err.message}`);
      }
    }
  }

  // 2. Cũng crawl trang chủ
  console.log("\nĐang fetch trang chủ...");
  try {
    const html = await fetchPage("https://torano.vn/");
    const images = extractImageUrls(html);
    console.log(`  -> Tìm thấy ${images.length} ảnh`);
    images.forEach((img) => allImageUrls.add(img));
  } catch (err) {
    console.error(`  -> Lỗi: ${err.message}`);
  }

  console.log(`\n=== TỔNG CỘNG: ${allImageUrls.size} ảnh unique ===\n`);

  // 3. Lọc chỉ lấy ảnh sản phẩm (chất lượng cao)
  const productImages = [...allImageUrls].filter((url) => {
    // Ưu tiên ảnh master/large
    return url.includes("/products/") || url.includes("theme.hstatic.net");
  });

  console.log(`Ảnh sản phẩm + theme: ${productImages.length}\n`);

  // 4. Download tất cả
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const imgUrl of productImages) {
    const filename = urlToFilename(imgUrl);
    const filePath = path.join(SAVE_DIR, filename);

    // Bỏ qua nếu đã tồn tại
    if (fs.existsSync(filePath)) {
      skipped++;
      continue;
    }

    try {
      await downloadImage(imgUrl, filePath);
      downloaded++;
      console.log(`✓ [${downloaded}] ${filename}`);
      await delay(300); // Chờ giữa mỗi download
    } catch (err) {
      failed++;
      console.error(`✗ Lỗi download ${filename}: ${err.message}`);
    }
  }

  console.log(`\n=== HOÀN TẤT ===`);
  console.log(`Đã tải: ${downloaded}`);
  console.log(`Đã có sẵn: ${skipped}`);
  console.log(`Lỗi: ${failed}`);
  console.log(`Thư mục: ${SAVE_DIR}`);
}

main().catch(console.error);
