'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { stripePromise, hasStripeKey } from '@/lib/stripe'
import StripePaymentForm from '../components/StripePaymentForm'

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    companyName: '',
    buyFor: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    note: '',
    address: '',
    city: '',
    ward: ''
  })
  
  // Selected saved address id (if any) and loading flag
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [addressesLoading, setAddressesLoading] = useState(false)

  const [selectedShipping, setSelectedShipping] = useState('standard')
  const [discountCode, setDiscountCode] = useState('')
  const [discountValue, setDiscountValue] = useState(0)
  const [discountMessage, setDiscountMessage] = useState('')

  // Payment states
  const [errors, setErrors] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('') // Thay đổi từ 'bank-transfer' thành '' để bắt buộc chọn
  const [showStripeForm, setShowStripeForm] = useState(false)
  const [clientSecret, setClientSecret] = useState('')
  const [stripeError, setStripeError] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')

  // Voucher modal state
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([])
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string>('')
  const [voucherLoading, setVoucherLoading] = useState(false)
  const [voucherError, setVoucherError] = useState('')

 
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  
  // Shipping options
  const shippingOptions = [
    {
      id: 'standard',
      name: 'Giao hàng tiêu chuẩn',
      description: '3-5 ngày làm việc',
      price: 15000
    },
    {
      id: 'express',
      name: 'Giao hàng nhanh',
      description: '1-2 ngày làm việc',
      price: 35000
    },
    {
      id: 'same-day',
      name: 'Giao hàng trong ngày',
      description: 'Trong vòng 24h (chỉ HCM, HN)',
      price: 50000
    },
    {
      id: 'free',
      name: 'Miễn phí vận chuyển',
      description: 'Đơn hàng trên 500.000₫',
      price: 0,
      condition: subtotal >= 500000
    }
  ]
  
  const selectedShippingOption = shippingOptions.find(option => option.id === selectedShipping)
  const shippingFee = selectedShippingOption?.price || 0
  const total = subtotal + shippingFee - discountValue

  // Apply discount via backend validation
  const applyDiscount = async () => {
    const rawCode = discountCode.trim();
    if (!rawCode) {
      setDiscountMessage('Vui lòng nhập mã giảm giá');
      setDiscountValue(0);
      return;
    }
    try {
      const orderAmount = subtotal + shippingFee;
      const res = await fetch(`http://localhost:4000/api/discounts/${encodeURIComponent(rawCode)}/validate?orderAmount=${orderAmount}`);
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Không thể parse JSON từ API:', text);
        setDiscountValue(0);
        setDiscountMessage('Lỗi phản hồi từ máy chủ.');
        return;
      }
      console.log('API discount validate response:', data);
      if (!res.ok) {
        setDiscountValue(0);
        setDiscountMessage(data.message || 'Mã giảm giá không hợp lệ');
        return;
      }
      // Kiểm tra kỹ discountAmount
      if (!data.data || typeof data.data.discountAmount === 'undefined') {
        console.error('Không có discountAmount trong phản hồi:', data);
        setDiscountValue(0);
        setDiscountMessage('Mã giảm giá không hợp lệ hoặc không có giá trị giảm.');
        return;
      }
      let discountAmount = Number(data.data.discountAmount);
      if (data.data.type === 'freeship') {
        discountAmount = shippingFee;
      }
      if (isNaN(discountAmount) || discountAmount <= 0) discountAmount = 0;
      setDiscountValue(discountAmount);
      setDiscountMessage('Áp dụng mã giảm giá thành công!');
    } catch (err) {
      setDiscountValue(0);
      setDiscountMessage('Không thể áp dụng mã giảm giá. Vui lòng thử lại.');
    }
  }

  // Remove discount
  const removeDiscount = () => {
    setDiscountCode('')
    setDiscountValue(0)
    setDiscountMessage('')
  }

  useEffect(() => {
    setMounted(true)
    
    // Kiểm tra đăng nhập
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      alert('Vui lòng đăng nhập để tiến hành thanh toán')
      router.push('/login')
      return
    }
    
    try {
      const userData = JSON.parse(userStr)
      setUser(userData)
      
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        firstName: userData.fullname?.split(' ')[0] || '',
        lastName: userData.fullname?.split(' ').slice(1).join(' ') || '',
        email: userData.email || '',
        phone: userData.phone || ''
      }))

      // Fetch user's saved addresses and prefill default address (if any)
      const tokenForAddr = localStorage.getItem('token')
      if (tokenForAddr) {
        ;(async () => {
          setAddressesLoading(true)
          try {
            const res = await fetch('http://localhost:4000/api/addresses', {
              headers: { Authorization: `Bearer ${tokenForAddr}` }
            })
            const json = await res.json().catch(() => ({}))
            if (res.ok && Array.isArray(json.data) && json.data.length > 0) {
              const defaultAddr = json.data.find((a: any) => a.is_default) || json.data[0]
              setFormData(prev => ({
                ...prev,
                address: defaultAddr.house_number || prev.address,
                city: defaultAddr.city || prev.city,
                ward: defaultAddr.ward || prev.ward
              }))
              setSelectedAddressId(defaultAddr.id)
            }
          } catch (err) {
            console.warn('Failed to fetch addresses:', err)
          } finally {
            setAddressesLoading(false)
          }
        })()
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
      return
    }
    
    // Lấy sản phẩm đã chọn để thanh toán từ localStorage.checkoutItems
    // Nếu không có checkoutItems, fallback về toàn bộ giỏ hàng 'cartItems'
    const checkoutItems = JSON.parse(localStorage.getItem('checkoutItems') || '[]')
    if (Array.isArray(checkoutItems) && checkoutItems.length > 0) {
      setCartItems(checkoutItems)
    } else {
      const allCart = JSON.parse(localStorage.getItem('cartItems') || '[]')
      setCartItems(Array.isArray(allCart) ? allCart : [])
    }
    setLoading(false)
  }, [])

  // Nếu giỏ hàng trống, chuyển hướng về trang cart
  useEffect(() => {
    if (mounted && !loading && cartItems.length === 0) {
      router.push('/cart')
    }
  }, [cartItems, loading, mounted, router])

  // Fetch vouchers from MySQL API when opening the modal
  const fetchVouchers = async () => {
    setVoucherLoading(true)
    setVoucherError('')
    try {
      // Gọi API trực tiếp và log mọi thứ để debug
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch('http://localhost:4000/api/discounts', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      })
      const text = await res.text()
      let json: any = []
      try {
        json = text ? JSON.parse(text) : []
      } catch {
        throw new Error('Phản hồi không phải JSON hợp lệ: ' + text)
      }
      if (!res.ok) {
        throw new Error(json?.message || `HTTP ${res.status}`)
      }
      // Debug: log dữ liệu thực tế trả về từ API
      console.log('Voucher API raw:', json)
      // Xử lý các trường hợp trả về khác nhau
      let list: any[] = []
      if (Array.isArray(json)) {
        list = json
      } else if (Array.isArray(json?.data)) {
        list = json.data
      } else if (Array.isArray(json?.data?.items)) {
        list = json.data.items
      } else if (json?.rows && Array.isArray(json.rows)) {
        list = json.rows
      } else if (json?.result && Array.isArray(json.result)) {
        list = json.result
      } else if (json?.discounts && Array.isArray(json.discounts)) {
        list = json.discounts
      } else {
        // Nếu là object có các key, thử lấy tất cả value là array
        for (const k in json) {
          if (Array.isArray(json[k])) {
            list = json[k]
            break
          }
        }
      }
      console.log('Voucher list:', list)
      setAvailableVouchers(Array.isArray(list) ? list : [])
    } catch (e: any) {
      setVoucherError(e?.message || 'Không thể tải mã giảm giá')
      setAvailableVouchers([])
    } finally {
      setVoucherLoading(false)
    }
  }

  // Open modal and fetch vouchers
  const openVoucherModal = () => {
    setShowVoucherModal(true)
    fetchVouchers()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // If user modifies address fields, unset the selected saved address so we create/use a new one
    if ((name === 'address' || name === 'city' || name === 'ward') && selectedAddressId) {
      setSelectedAddressId(null)
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vui lòng nhập họ'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Vui lòng nhập tên'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại'
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ'
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'Vui lòng nhập thành phố'
    }
    
    // Kiểm tra phương thức thanh toán
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Vui lòng chọn phương thức thanh toán'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Hàm tạo đơn hàng (dùng cho cả COD, Bank Transfer và Stripe)
  const createOrder = async () => {
    const token = localStorage.getItem('token')
    if (!token || !user) {
      throw new Error('Vui lòng đăng nhập để tiếp tục')
    }

    // Validate giỏ hàng trước khi gọi API để tránh gửi variant_id không hợp lệ
    if (!cartItems.length) {
      throw new Error('Giỏ hàng trống')
    }
    const invalidItems = cartItems.filter(
      (item) => !item.variant_id || Number.isNaN(Number(item.variant_id))
    )
    if (invalidItems.length > 0) {
      throw new Error('Sản phẩm trong giỏ thiếu mã biến thể. Vui lòng chọn màu/size trước khi đặt.')
    }

    // Use selected saved address if available; otherwise create a new address
    let address_id: number | undefined
    if (selectedAddressId) {
      address_id = selectedAddressId
    } else {
      const addressResponse = await fetch('http://localhost:4000/api/orders/create-address', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          city: formData.city,
          ward: formData.ward || null,
          house_number: formData.address
        })
      })
      
      if (!addressResponse.ok) {
        const errorData = await addressResponse.json().catch(() => ({}))
        throw new Error(errorData.message || 'Không thể tạo địa chỉ giao hàng')
      }
      
      const addressData = await addressResponse.json()
      address_id = addressData.data?.id
      
      if (!address_id) {
        throw new Error('Không lấy được ID địa chỉ')
      }
    }
    
    // Prepare order items (chỉ dùng variant_id đã được lưu khi thêm vào giỏ)
    const items = cartItems.map(item => ({
      variant_id: Number(item.variant_id),
      quantity: item.quantity
    }))
    
    // Create order
    const orderPayload = {
      user_id: user.id,
      address_id: address_id,
      items: items,
      note_client: formData.note || null,
      discount_code: discountCode || null,
      payment_method: paymentMethod,
      payment_intent_id: paymentIntentId || null,
      shippingFee: shippingFee
    };
    console.log('🔎 Payload gửi lên API tạo đơn hàng:', JSON.stringify(orderPayload, null, 2));
    const orderResponse = await fetch('http://localhost:4000/api/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    })

    // Parse response an toàn: nếu không phải JSON thì dùng text
    let orderData: any = {}
    let rawText = ''
    try {
      rawText = await orderResponse.text()
      orderData = rawText ? JSON.parse(rawText) : {}
    } catch {
      // body không phải JSON, giữ nguyên rawText
    }
    
    if (!orderResponse.ok) {
      const detail =
        orderData?.message ||
        orderData?.error ||
        rawText ||
        `Không thể tạo đơn hàng (HTTP ${orderResponse.status})`

      console.error('Order API failed', {
        status: orderResponse.status,
        statusText: orderResponse.statusText,
        body: orderData || rawText
      })
      throw new Error(detail)
    }

    // Increment discount usage after successful order when a code was applied
    try {
      if (discountCode && discountValue > 0) {
        await fetch(`http://localhost:4000/api/discounts/${encodeURIComponent(discountCode)}/use`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      }
    } catch (e) {
      console.warn('Failed to increment discount usage:', e)
    }

    return orderData
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token || !user) {
        alert('Vui lòng đăng nhập để tiếp tục')
        router.push('/login')
        return
      }

      // Nếu chọn Stripe, tạo payment intent trước
      if (paymentMethod === 'stripe') {
        console.log('🔵 Creating Stripe payment intent...')
        console.log('Token:', token)
        console.log('Amount:', total)
        
        const paymentIntentResponse = await fetch('http://localhost:4000/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: total,
            metadata: {
              customerEmail: formData.email,
              customerName: `${formData.firstName} ${formData.lastName}`
            }
          })
        })

        if (!paymentIntentResponse.ok) {
          const errorData = await paymentIntentResponse.json()
          console.error('❌ Payment intent error:', errorData)
          throw new Error(errorData.message || 'Không thể tạo phiên thanh toán')
        }

        const paymentIntentData = await paymentIntentResponse.json()
        console.log('✅ Payment intent created:', paymentIntentData)
        
        setClientSecret(paymentIntentData.data.clientSecret)
        setPaymentIntentId(paymentIntentData.data.paymentIntentId)
        setShowStripeForm(true)
        setIsSubmitting(false)
        return // Dừng lại để người dùng nhập thông tin thẻ
      }

      // Nếu chọn VNPay, gọi API backend để tạo link thanh toán và chuyển hướng
      if (paymentMethod === 'vnpay') {
        try {
          const res = await fetch('http://localhost:4000/api/create-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: total })
          })

          if (!res.ok) {
            const err = await res.text()
            throw new Error(err || 'Không tạo được phiên VNPay')
          }

          const data = await res.json()
          const url = data?.url
          if (!url) throw new Error('Không nhận được URL thanh toán VNPay từ server')

          // Mở link VNPay để mô phỏng thanh toán
          window.location.href = url
          return
        } catch (err: any) {
          console.error('VNPay error:', err)
          alert(err.message || 'Lỗi khi chuyển tới VNPay. Vui lòng thử lại.')
          setIsSubmitting(false)
          return
        }
      }
      
      // Với COD hoặc Bank Transfer, tạo đơn hàng ngay
      await createOrder()
      
      // Chỉ xóa những sản phẩm đã thanh toán, giữ lại sản phẩm không được chọn
      const allCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
      const checkoutItemKeys = cartItems.map((item: any) => item.key)
      const remainingItems = allCartItems.filter((item: any) => !checkoutItemKeys.includes(item.key))
      
      if (remainingItems.length > 0) {
        localStorage.setItem('cartItems', JSON.stringify(remainingItems))
      } else {
        localStorage.removeItem('cartItems')
      }
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      
      // Redirect to success page
      router.push('/checkout/success')
      
    } catch (error: any) {
      console.error('Error creating order:', error)
      alert(error.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Select voucher
  const handleVoucherClick = async (voucher: any) => {
    const code =
      voucher?.code ||
      voucher?.discount_code ||
      voucher?.coupon_code ||
      voucher?.code_value
    if (!code) return
    setDiscountCode(code)
    setSelectedVoucherCode(code)
    setShowVoucherModal(false)
    // Gọi API cập nhật usage_limit trên MySQL (giảm đi 1)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch(`http://localhost:4000/api/discounts/${encodeURIComponent(code)}/decrement-usage`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      })
      // Nếu API trả về usage_limit mới, cập nhật lại UI
      if (res.ok) {
        const data = await res.json()
        const newUsageLimit =
          data?.data?.usage_limit ??
          data?.usage_limit ??
          (typeof data === 'number' ? data : undefined)
        setAvailableVouchers((prev) =>
          prev.map((v) =>
            (v.code || v.discount_code || v.coupon_code || v.code_value) === code
              ? {
                  ...v,
                  usage_limit:
                    typeof newUsageLimit === 'number'
                      ? Math.max(0, newUsageLimit)
                      : (typeof v.usage_limit === 'number'
                        ? Math.max(0, v.usage_limit - 1)
                        : v.usage_limit),
                }
              : v
          )
        )
      } else {
        // Nếu API lỗi, vẫn trừ ở UI (dự phòng)
        setAvailableVouchers((prev) =>
          prev.map((v) =>
            (v.code || v.discount_code || v.coupon_code || v.code_value) === code
              ? {
                  ...v,
                  usage_limit:
                    typeof v.usage_limit === 'number'
                      ? Math.max(0, v.usage_limit - 1)
                      : v.usage_limit,
                }
              : v
          )
        )
      }
    } catch (e) {
      // Nếu lỗi, vẫn trừ ở UI (dự phòng)
      setAvailableVouchers((prev) =>
        prev.map((v) =>
          (v.code || v.discount_code || v.coupon_code || v.code_value) === code
            ? {
                ...v,
                usage_limit:
                  typeof v.usage_limit === 'number'
                    ? Math.max(0, v.usage_limit - 1)
                    : v.usage_limit,
              }
            : v
        )
      )
      console.warn('Không thể cập nhật số lượng mã giảm giá trên server:', e)
    }
    // Tự động áp dụng luôn khi chọn mã
    setTimeout(() => {
      applyDiscount()
    }, 0)
  }

  // Khi mở modal, nếu chỉ còn 1 mã giảm giá, tự động áp dụng luôn
  useEffect(() => {
    if (
      showVoucherModal &&
      !voucherLoading &&
      !voucherError &&
      availableVouchers.length === 1
    ) {
      handleVoucherClick(availableVouchers[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showVoucherModal, voucherLoading, voucherError, availableVouchers])


  // Nhưng vẫn giữ nút "Áp dụng" để người dùng chủ động bấm lại nếu muốn
  useEffect(() => {
    if (!discountCode) return
    const timeout = setTimeout(() => {
      applyDiscount()
    }, 500)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountCode])

  // Duplicate initialization effect removed (handled above)

  if (!mounted || loading) {
    // Only render a static loading indicator to avoid hydration mismatch
    return <div className="max-w-6xl mx-auto py-8 text-center">Đang tải...</div>
  }

  if (cartItems.length === 0) {
    return null // Will redirect to cart
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/cart"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại giỏ hàng
        </Link>
        <h1 className="text-2xl font-bold">Xác nhận thanh toán</h1>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form thông tin */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Chi tiết thanh toán</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
          
            <div>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ*
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập họ"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên*
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tên"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email*
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại*
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập số điện thoại"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ*
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Số nhà, tên đường"
              />

              {addressesLoading && (
                <p className="text-sm text-gray-500 mt-1">Đang tải địa chỉ đã lưu...</p>
              )}

              {selectedAddressId && !addressesLoading && (
                <div className="mt-2 text-sm text-green-600 flex items-center gap-3">
                  <span>Đang sử dụng địa chỉ đã lưu.</span>
                  <button
                    type="button"
                    className="text-blue-600 underline text-sm"
                    onClick={() => {
                      setSelectedAddressId(null)
                      setFormData(prev => ({ ...prev, address: '', city: '', ward: '' }))
                    }}
                  >
                    Dùng địa chỉ khác
                  </button>
                </div>
              )}

              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            {/* Ward and City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phường/Xã
                </label>
                <input
                  type="text"
                  name="ward"
                  value={formData.ward}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phường/Xã"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thành phố*
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Thành phố"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ghi chú đơn hàng (không bắt buộc)"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Phương thức thanh toán*
              </h3>
              
              {/* Stripe Online Payment */}
              <div className={`bg-gray-50 p-4 rounded-lg border-2 ${
                paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id="stripe"
                    name="payment"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value)
                      setShowStripeForm(true)
                      // Clear payment method error khi chọn
                      if (errors.paymentMethod) {
                        setErrors((prev: any) => ({
                          ...prev,
                          paymentMethod: ''
                        }))
                      }
                    }}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="stripe" className="text-sm text-gray-700 flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <strong className="text-blue-600">💳 Thanh toán online (Stripe)</strong>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        Bảo mật
                      </span>
                    </div>
                    Thanh toán trực tuyến an toàn với thẻ tín dụng/ghi nợ qua Stripe. Hỗ trợ Visa, Mastercard, và nhiều loại thẻ khác.
                  </label>
                </div>
              </div>
              {/* VNPay */}
              <div className={`bg-gray-50 p-4 rounded-lg border-2 ${
                paymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id="vnpay"
                    name="payment"
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value)
                      setShowStripeForm(false)
                      if (errors.paymentMethod) {
                        setErrors((prev: any) => ({
                          ...prev,
                          paymentMethod: ''
                        }))
                      }
                    }}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="vnpay" className="text-sm text-gray-700 flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <strong className="text-blue-600">🏦 Thanh toán VNPay (mô phỏng)</strong>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        Thanh toán qua VNPay
                      </span>
                    </div>
                    Thanh toán qua cổng VNPay (sẽ chuyển hướng tới trang thanh toán VNPay Sandbox để mô phỏng).
                  </label>
                </div>
              </div>
              
              {/* COD */}
              <div className={`bg-gray-50 p-4 rounded-lg border-2 ${
                paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id="cod"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value)
                      setShowStripeForm(false)
                      // Clear payment method error khi chọn
                      if (errors.paymentMethod) {
                        setErrors((prev: any) => ({
                          ...prev,
                          paymentMethod: ''
                        }))
                      }
                    }}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="cod" className="text-sm text-gray-700 flex-1 cursor-pointer">
                    <strong>💵 Thanh toán khi nhận hàng (COD)</strong>
                    <br />
                    Thanh toán bằng tiền mặt khi nhận hàng. Vui lòng chuẩn bị đủ tiền để thanh toán cho nhân viên giao hàng.
                  </label>
                </div>
              </div>

              {/* Error message for payment method */}
              {errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {errors.paymentMethod}
                </p>
              )}

              {/* Stripe Payment Form */}
              {showStripeForm && paymentMethod === 'stripe' && clientSecret && (
                <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
                  <h3 className="text-lg font-semibold mb-4">Thông tin thanh toán</h3>
                  {hasStripeKey && stripePromise ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripePaymentForm
                      amount={total}
                      onSuccess={async () => {
                        try {
                          console.log('🎉 Stripe payment successful, creating order...')
                          console.log('📦 Payment Intent ID:', paymentIntentId)
                          
                          // Tạo đơn hàng sau khi thanh toán thành công
                          const orderResult = await createOrder()
                          console.log('✅ Order created successfully:', orderResult)
                          
                          // Chỉ xóa những sản phẩm đã thanh toán, giữ lại sản phẩm không được chọn
                          const allCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
                          const checkoutItemKeys = cartItems.map((item: any) => item.key)
                          const remainingItems = allCartItems.filter((item: any) => !checkoutItemKeys.includes(item.key))
                          
                          if (remainingItems.length > 0) {
                            localStorage.setItem('cartItems', JSON.stringify(remainingItems))
                          } else {
                            localStorage.removeItem('cartItems')
                          }
                          window.dispatchEvent(new CustomEvent('cartUpdated'))
                          
                          // Redirect về success page sau một chút để đảm bảo order đã được tạo
                          setTimeout(() => {
                            router.push('/checkout/success')
                          }, 500)
                        } catch (error: any) {
                          console.error('❌ Error creating order after payment:', error)
                          setStripeError(error.message || 'Thanh toán thành công nhưng không thể tạo đơn hàng. Vui lòng liên hệ hỗ trợ.')
                          setIsSubmitting(false)
                        }
                      }}
                      onError={(error) => {
                        console.error('❌ Stripe payment error:', error)
                        setStripeError(error)
                        setIsSubmitting(false)
                      }}
                    />
                    </Elements>
                  ) : (
                    <div className="text-sm text-red-500">Stripe chưa được cấu hình. Vui lòng thêm NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY vào file .env.local để sử dụng thanh toán bằng thẻ.</div>
                  )}
                  {stripeError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {stripeError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Đơn hàng của bạn</h2>
          
          {/* Product List */}
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item.key} className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="relative">
                  <Image
                    src={item.image || '/assets/img/default.jpg'}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                  <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{item.name}</h4>
                  {item.color && <p className="text-sm text-gray-500">Màu: {item.color}</p>}
                  {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                </div>
                
                <div className="text-right">
                  <p className="font-semibold">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                </div>
              </div>
            ))}
          </div>

          {/* Discount Code */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Mã giảm giá</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Nhập mã giảm giá"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Nút chọn mã giảm giá với UI nổi bật hơn */}
              <button
                type="button"
                onClick={openVoucherModal}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow hover:from-blue-600 hover:to-blue-700 transition-all border border-blue-600"
                style={{ minWidth: 0 }}
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m0 0v6m0-6H9"></path>
                </svg>
                Chọn mã giảm giá
              </button>
            </div>
            {discountMessage && (
              <div className="flex items-center justify-between mt-2">
                <p className={`text-sm ${discountMessage.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>
                  {discountMessage}
                </p>
                {discountValue > 0 && (
                  <button
                    type="button"
                    onClick={removeDiscount}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Xóa
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Voucher Modal */}
          {showVoucherModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-0 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
                  <h2 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m0 0v6m0-6H9"></path></svg>
                    Chọn mã giảm giá
                  </h2>
                  <button
                    className="text-gray-400 hover:text-gray-700 text-2xl"
                    onClick={() => setShowVoucherModal(false)}
                    aria-label="Đóng"
                  >
                    ×
                  </button>
                </div>
                {/* Loading / Error / List */}
                <div className="px-6 py-4">
                  {voucherLoading && (
                    <div className="py-8 text-center text-gray-500">Đang tải mã giảm giá...</div>
                  )}
                  {!voucherLoading && voucherError && (
                    <div className="py-3 px-4 mb-4 rounded bg-red-50 border border-red-200 text-red-600 text-sm">
                      {voucherError}
                    </div>
                  )}
                  {!voucherLoading && !voucherError && (
                    <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                      {availableVouchers.map((voucher: any) => {
                        const code =
                          voucher?.code ||
                          voucher?.discount_code ||
                          voucher?.coupon_code ||
                          voucher?.code_value
                        const isSelected = selectedVoucherCode === code
                        const status = (voucher?.status || voucher?.state || '').toString().toLowerCase()

                        // So sánh ngày hết hạn chỉ theo ngày, không xét giờ
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const expiryStr = voucher?.expiry || voucher?.end_date || voucher?.expiry_date || voucher?.valid_to
                        let expiryDate: Date | null = null
                        if (expiryStr) {
                          // Lấy yyyy-MM-dd nếu có, hoặc lấy phần ngày của chuỗi ISO
                          const dateOnly = expiryStr.split('T')[0]
                          expiryDate = new Date(dateOnly)
                          expiryDate.setHours(0, 0, 0, 0)
                        }
                        // Mã hết hạn nếu expiryDate < today (chỉ xét ngày)
                        const isExpired =
                          status === 'expired' ||
                          status === 'hết hạn' ||
                          voucher?.expired === true ||
                          voucher?.isExpired === true ||
                          (expiryDate ? expiryDate < today : false)
                        const isPaused =
                          status === 'paused' ||
                          status === 'tạm dừng' ||
                          voucher?.paused === true ||
                          voucher?.isPaused === true
                        const disabled = isExpired || isPaused
                        let statusText = ''
                        if (isExpired) statusText = 'Đã hết hạn'
                        else if (isPaused) statusText = 'Tạm dừng'
                        else if (status === 'active' || status === 'đang hoạt động') statusText = 'Đang hoạt động'
                        else if (status) statusText = status.charAt(0).toUpperCase() + status.slice(1)
                        // UI enhancement
                        return (
                          <div
                            key={code}
                            className={`relative border rounded-xl p-4 flex items-center gap-3 transition-all ${
                              disabled
                                ? 'opacity-60 cursor-not-allowed bg-gray-50 pointer-events-none'
                                : 'cursor-pointer hover:border-blue-400 hover:shadow'
                            } ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200'}`}
                            tabIndex={disabled ? -1 : 0}
                            aria-disabled={disabled}
                            onClick={() => {
                              if (!disabled) handleVoucherClick(voucher)
                            }}
                          >
                            {/* Icon */}
                            <div className="flex-shrink-0">
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold border-2 ${
                                isSelected ? 'bg-blue-100 border-blue-400 text-blue-600' : 'bg-blue-50 border-blue-200 text-blue-500'
                              }`}>
                                %
                              </div>
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold truncate">{voucher?.name || voucher?.title || code}</span>
                                {isSelected && (
                                  <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">Đã chọn</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 truncate">
                                {voucher?.description || voucher?.note || 'Ưu đãi cho đơn hàng của bạn'}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">
                                  HSD: {voucher?.expiry || voucher?.end_date || voucher?.expiry_date || voucher?.valid_to || 'Không rõ'}
                                </span>
                                {/* Status */}
                                <span className={`text-xs font-semibold ml-2 ${
                                  isExpired || isPaused
                                    ? 'text-red-500'
                                    : status === 'active' || status === 'đang hoạt động'
                                      ? 'text-green-600'
                                      : 'text-gray-500'
                                }`}>
                                  {statusText}
                                </span>
                              </div>
                            </div>
                            {/* Radio */}
                            <input
                              type="radio"
                              readOnly
                              checked={isSelected}
                              className="accent-blue-600 ml-2"
                              disabled={disabled}
                              tabIndex={-1}
                            />
                            {/* Ribbon for disabled */}
                            {disabled && (
                              <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded font-semibold pointer-events-none">
                                {statusText}
                              </div>
                            )}
                          </div>
                        )
                      })}

                      {availableVouchers.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                          Không có mã giảm giá khả dụng.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <button
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    onClick={() => setShowVoucherModal(false)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Options */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Phương thức vận chuyển</h3>
            <div className="space-y-3">
              {shippingOptions.map((option) => {
                const isDisabled = option.condition !== undefined && !option.condition
                return (
                  <div key={option.id} className={`border rounded-lg p-3 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-500'} ${selectedShipping === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <label className={`flex items-start gap-3 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={selectedShipping === option.id}
                        onChange={(e) => setSelectedShipping(e.target.value)}
                        disabled={isDisabled}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-gray-800">{option.name}</span>
                            <p className="text-sm text-gray-600">{option.description}</p>
                            {option.condition !== undefined && !option.condition && (
                              <p className="text-xs text-red-500 mt-1">
                                Cần đơn hàng tối thiểu 500.000₫
                              </p>
                            )}
                          </div>
                          <span className="font-semibold text-gray-800">
                            {option.price === 0 ? 'Miễn phí' : `${option.price.toLocaleString('vi-VN')}₫`}
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            {/* ...existing code... */}
            <div className="flex justify-between text-sm">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Phí vận chuyển</span>
              <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
              </span>
            </div>
            {discountValue > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Giảm giá</span>
                <span>-{discountValue.toLocaleString('vi-VN')}₫</span>
              </div>
            )}
            {/* Thông báo giảm giá nổi bật ở vị trí này */}
            {discountValue > 0 && (
              <div className="my-2 p-2 rounded-lg bg-green-100 border border-green-300 text-green-800 text-center font-semibold">
                🎉 Bạn đã được giảm {discountValue.toLocaleString('vi-VN')}₫ từ mã giảm giá!
              </div>
            )}
            {selectedShippingOption && (
              <div className="text-xs text-gray-500">
                {selectedShippingOption.name} - {selectedShippingOption.description}
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Tổng cộng</span>
              <span className="text-blue-600">{total.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full mt-2 py-3 rounded-lg font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting
              ? 'Đang xử lý...'
              : discountValue > 0
                ? `ĐẶT HÀNG (Đã giảm ${discountValue.toLocaleString('vi-VN')}₫)`
                : 'ĐẶT HÀNG'}
          </button>
        </div>
      </div>
    </div>
  )
}