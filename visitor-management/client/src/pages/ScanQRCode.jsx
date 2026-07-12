import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function ScanQRCode() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [scanner, setScanner] = useState(null)
  const [message, setMessage] = useState('Scan a visitor QR code to open the record.')
  const [visitor, setVisitor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const readerRef = useRef(null)

  useEffect(() => {
    if (!readerRef.current) return

    const html5Qrcode = new Html5Qrcode('qr-reader')
    setScanner(html5Qrcode)

    html5Qrcode
      .start({ facingMode: 'environment' }, { fps: 10, qrbox: 250 }, (decodedText) => {
        if (decodedText) {
          html5Qrcode.stop().catch(() => {})
          handleScan(decodedText)
        }
      })
      .catch((err) => {
        setError('Unable to access camera. Please enable permissions or use a supported browser.')
      })

    return () => {
      html5Qrcode.stop().catch(() => {})
      html5Qrcode.clear().catch(() => {})
    }
  }, [])

  const handleScan = async (qrCode) => {
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/visitor/scan', { qr_code: qrCode })
      setVisitor(response.data.visitor)
      setMessage('Visitor scanned successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to scan visitor QR code.')
      setMessage('Scan again or use a valid visitor QR code.')
    } finally {
      setLoading(false)
    }
  }

  const handleManual = () => {
    setVisitor(null)
    setError('')
    setMessage('Scan a visitor QR code to open the record.')
    if (scanner) {
      scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: 250 }, (decodedText) => {
        if (decodedText) {
          scanner.stop().catch(() => {})
          handleScan(decodedText)
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-textPrimary">QR Scanner</h2>
          <p className="text-sm text-textSecondary">Use your webcam to scan visitor passes.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
            <div id="qr-reader" ref={readerRef} className="h-[320px] w-full rounded-3xl bg-black" />
            <div className="mt-4 rounded-3xl bg-white p-4 text-sm text-textSecondary shadow-sm">
              {message}
            </div>
            {error && <div className="mt-4 rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={handleManual} className="rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600">
                Scan Again
              </button>
              <button onClick={() => navigate('/visitors')} className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-textPrimary hover:bg-slate-100">
                Back to Visitors
              </button>
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold text-textPrimary">Visitor Information</h3>
            {loading ? (
              <p className="text-sm text-textSecondary">Validating QR code...</p>
            ) : visitor ? (
              <div className="space-y-3 text-sm text-textPrimary">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <span className="block text-xs text-textSecondary">Visitor ID</span>
                    <p className="font-semibold">{visitor.visitor_id}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-textSecondary">Status</span>
                    <p className="font-semibold">{visitor.status}</p>
                  </div>
                </div>
                <div>
                  <span className="block text-xs text-textSecondary">Name</span>
                  <p className="font-semibold">{visitor.visitor_name}</p>
                </div>
                <div>
                  <span className="block text-xs text-textSecondary">Company</span>
                  <p>{visitor.company_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="block text-xs text-textSecondary">Person to Meet</span>
                  <p>{visitor.person_to_meet}</p>
                </div>
                <div>
                  <span className="block text-xs text-textSecondary">Department</span>
                  <p>{visitor.department}</p>
                </div>
                <div>
                  <span className="block text-xs text-textSecondary">Visit Date</span>
                  <p>{visitor.visit_date}</p>
                </div>
                <div>
                  <span className="block text-xs text-textSecondary">Purpose</span>
                  <p>{visitor.purpose}</p>
                </div>
                {visitor.qr_code && (
                  <div className="rounded-3xl border border-slate-200 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.24em] text-textSecondary">QR</p>
                    <div className="mt-3 inline-flex h-28 w-28 items-center justify-center rounded-3xl bg-slate-50 text-xs text-textSecondary">
                      {visitor.qr_code.slice(0, 6)}...
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-textSecondary">Scan a visitor pass to view details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
