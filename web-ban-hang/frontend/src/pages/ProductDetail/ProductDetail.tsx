import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ProductDetail.css";

export default function ProductDetail() {

  const { id } = useParams();

  const [product,setProduct] = useState<any>(null)
  const [colors,setColors] = useState<any[]>([])
  const [sizes,setSizes] = useState<any[]>([])
  const [variantImgs,setVariantImgs] = useState<string[]>([])
  const [qty,setQty] = useState(1)

  const [mainImg,setMainImg] = useState("")

  useEffect(()=>{

    fetch(`http://localhost:5000/products/${id}`)
    .then(res=>res.json())
    .then(data=>{

      const p = data[0]

      setProduct(p)

      // ảnh chính
      const img = p.anh.startsWith("http")
      ? p.anh
      : `http://localhost:5000${p.anh}`

      setMainImg(img)

      // ảnh biến thể
      const imgs = data
      .map((v:any)=>v.anh_bienthe)
      .filter((i:any)=>i)

      const uniqueImgs = [...new Set(imgs)]

      const fullImgs = uniqueImgs.map((i:any)=>
        i.startsWith("http")
        ? i
        : `http://localhost:5000${i}`
      )

      setVariantImgs(fullImgs)

      // COLORS
      const colorList = [...new Map(
        data.map((item:any)=>[item.id_mau,item])
      ).values()]

      // SIZES
      const sizeList = [...new Map(
        data.map((item:any)=>[item.id_kichco,item])
      ).values()]

      setColors(colorList)
      setSizes(sizeList)

    })

  },[id])


  if(!product) return <h2>Loading...</h2>


  // ===== PRICE =====

  const giaGoc = Number(product.gia_goc)

  const giaKM =
  product.gia_khuyen_mai
  ? Number(product.gia_khuyen_mai)
  : null

  const finalPrice = giaKM ?? giaGoc

  const hasDiscount =
  giaKM && giaKM < giaGoc

  const salePercent =
  hasDiscount
  ? Math.round(((giaGoc-giaKM)/giaGoc)*100)
  : 0


  return (

<div className="product-detail">

{/* LEFT IMAGE */}

<div className="product-image">

<img
src={mainImg}
alt={product.ten_sanpham}
className="main-image"
/>

<div className="variant-gallery">

{Array.from({length:4}).map((_,i)=>{

const img = variantImgs[i]

return img ? (

<img
key={i}
src={img}
className="variant-thumb"
onMouseEnter={()=>setMainImg(img)}
/>

) : (

<div
key={i}
className="variant-empty"
/>

)

})}

</div>

</div>


{/* RIGHT INFO */}

<div className="product-info">

<h1>{product.ten_sanpham}</h1>

<div className="product-meta">

Mã sản phẩm: <b>SP{id}</b> |

Tình trạng:
{product.trang_thai ? " Còn hàng":" Hết hàng"} |

Thương hiệu:
<b> {product.ten_thuonghieu}</b>

</div>


{/* PRICE */}

<div className="price-box">

<span className="price-new">

{finalPrice.toLocaleString("vi-VN")}đ

</span>

{hasDiscount && (

<span className="price-old">

{giaGoc.toLocaleString("vi-VN")}đ

</span>

)}

{hasDiscount && (

<span className="sale">

-{salePercent}%

</span>

)}

</div>


{/* COLOR */}

{colors.length>0 && (

<div className="option">

<p>Màu sắc:</p>

<div className="options">

{colors.map((c)=>{

const img = c.anh_bienthe || product.anh

const url = img.startsWith("http")
? img
: `http://localhost:5000${img}`

return(

<button
key={c.id_mau}
onMouseEnter={()=>setMainImg(url)}
onClick={()=>setMainImg(url)}
>

{c.ten_mau}

</button>

)

})}

</div>

</div>

)}


{/* SIZE */}

{sizes.length>0 && (

<div className="option">

<p>Kích thước:</p>

<div className="options">

{sizes.map((s)=>(

<button key={s.id_kichco}>

{s.ten_kichco}

</button>

))}

</div>

</div>

)}


{/* QUANTITY */}

<div className="quantity">

<p>Số lượng:</p>

<button onClick={()=>setQty(qty>1?qty-1:1)}>-</button>

<span>{qty}</span>

<button onClick={()=>setQty(qty+1)}>+</button>

</div>


{/* BUTTON */}

<div className="product-buttons">

<button className="add-cart">
THÊM VÀO GIỎ
</button>

<button className="buy-now">
MUA NGAY
</button>

</div>

</div>

</div>

  )
}