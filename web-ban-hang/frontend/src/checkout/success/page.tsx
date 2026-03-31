'use client'
import Link from 'next/link'
import { useEffect } from 'react'

export default function OrderSuccessPage() {
  useEffect(() => {
    // Clear cart when success page loads
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }, [])

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Đặt hàng thành công!
        </h1>
        
        <p className="text-gray-600 mb-2">
          Cảm ơn bạn đã đặt hàng tại LTGEAR.
        </p>
        
        <p className="text-gray-600 mb-8">
          Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận đơn hàng.
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">
            Thông tin liên hệ
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>📞 Hotline: 1900 xxxx</p>
            <p>📧 Email: support@ltgear.com</p>
            <p>🕒 Thời gian làm việc: 8:00 - 22:00 (T2-CN)</p>
          </div>
        </div>
      </div>
    </div>
  )
}