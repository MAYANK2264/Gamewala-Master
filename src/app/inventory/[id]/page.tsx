import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getInventoryItems } from '@/lib/sheets'
import { generateQRDataUrl, buildQRPayload } from '@/lib/qr'
import AppHeader from '@/components/layout/AppHeader'
import BottomNav from '@/components/layout/BottomNav'
import RepairStatusUpdater from './RepairStatusUpdater'
import MarkAsSold from './MarkAsSold'
import { Phone, MapPin, Calendar, Tag, AlertCircle, CheckCircle, Download, Edit2, Trash2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

function Row({ label, value }: { label: string; value?: string | number }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-brand-border last:border-0">
      <span className="text-xs text-brand-text-dim font-display uppercase tracking-wider shrink-0">{label}</span>
      <span className="text-sm text-brand-text text-right">{value}</span>
    </div>
  )
}

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession().catch(() => null)
  if (!session) redirect('/login')

  const { newProducts, secondHand, repairs } = await getInventoryItems().catch(() => ({
    newProducts: [], secondHand: [], repairs: []
  }))

  const item =
    newProducts.find(p => p.id === params.id) ||
    secondHand.find(p => p.id === params.id) ||
    repairs.find(r => r.id === params.id)

  if (!item) notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
  const qrPayload = (item as { qr_code?: string; qrCode?: string }).qr_code ||
    (item as { qr_code?: string; qrCode?: string }).qrCode ||
    buildQRPayload(item.id, appUrl)
  const qrDataUrl = await generateQRDataUrl(qrPayload)

  const itemType = newProducts.find(p => p.id === params.id) ? 'new'
    : secondHand.find(p => p.id === params.id) ? 'secondhand'
    : 'repair'
  
  const itemName = (item as { name?: string }).name ||
  (item as { product_name?: string }).product_name ||
  (item as { productName?: string }).productName || 'Product'

  const inStock = String((item as any).in_stock || (item as any).inStock) !== 'FALSE'
  const canEdit = session.role === 'admin' || session.role === 'employee'

  return (
    <div className="min-h-screen bg-brand-black">
      <AppHeader
        title={itemName}
        back
        actions={canEdit && (
          <div className="flex items-center gap-1">
            <button className="p-2 text-brand-text-dim hover:text-brand-text">
              <Edit2 size={18} />
            </button>
            {session.role === 'admin' && (
              <button className="p-2 text-brand-red/70 hover:text-brand-red">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        )}
      />

      <div className="page-content px-4 space-y-4 pb-32">
        {/* Badge + name */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-2">
            {itemType === 'new' && <span className="badge-new">New</span>}
            {itemType === 'secondhand' && <span className="badge-used">Used</span>}
            {itemType === 'repair' && <span className="badge-repair">Repair</span>}
            {!inStock && itemType !== 'repair' && <span className="bg-brand-muted/20 text-brand-muted border border-brand-muted/20 text-[10px] font-display font-bold px-2 py-0.5 rounded-full uppercase">Sold</span>}
          </div>
          <h1 className="font-display font-bold text-2xl text-brand-text mt-3 leading-tight">
            {itemName}
          </h1>
          <p className="font-mono text-xs text-brand-muted mt-1">{item.id}</p>
        </div>
        
        {/* Photo display */}
        {((item as any).image_url || (item as any).imageUrl) && (
          <div className="card w-full aspect-video p-1 flex items-center justify-center overflow-hidden bg-brand-deep shadow-2xl">
            <img 
              src={(item as any).image_url || (item as any).imageUrl} 
              alt="Product Photo" 
              className="w-full h-full object-cover rounded-[20px]" 
            />
          </div>
        )}

        {/* Action: Mark as Sold */}
        {canEdit && inStock && itemType !== 'repair' && (
          <MarkAsSold itemId={item.id} itemType={itemType} />
        )}

        {/* QR code */}
        <div className="card p-6 flex flex-col items-center gap-4 bg-gradient-to-b from-brand-dark to-brand-black">
          <div className="bg-white rounded-2xl p-4 shadow-inner">
            <img src={qrDataUrl} alt="QR" className="w-48 h-48" />
          </div>
          <div className="text-center">
            <p className="text-xs text-brand-text-dim mb-1 font-display">Scan to view this item</p>
            <p className="font-mono text-[10px] text-brand-muted uppercase tracking-widest">{item.id}</p>
          </div>
          <a href={qrDataUrl} download={`QR-${item.id}.png`}
            className="btn-secondary text-xs py-2.5 px-6 flex items-center gap-2 border-brand-border/30">
            <Download size={14} /> Save QR Label
          </a>
        </div>

        {/* New product details */}
        {itemType === 'new' && (() => {
          const p = item as any
          return (
            <div className="card p-5 space-y-1">
              <p className="font-display font-bold text-brand-red text-[10px] uppercase tracking-widest mb-2">Specifications</p>
              <Row label="Category" value={p.category} />
              <Row label="Platform" value={p.platform} />
              <Row label="Listing Price" value={p.price ? `₹${Number(p.price).toLocaleString('en-IN')}` : ''} />
              <Row label="Mfg. Date" value={p.mfg_date || p.mfgDate} />
              <Row label="Status" value={inStock ? 'Available' : 'Sold Out'} />
              {p.sold_price && <Row label="Sold Price" value={`₹${Number(p.sold_price).toLocaleString('en-IN')}`} />}
              {p.sold_to && <Row label="Customer" value={p.sold_to} />}
              <Row label="Description" value={p.description} />
              <div className="pt-2 mt-2 border-t border-brand-border/30">
                 <Row label="Added By" value={p.added_by || p.addedBy} />
                 <Row label="Added At" value={p.added_at ? new Date(p.added_at).toLocaleDateString('en-IN') : ''} />
              </div>
            </div>
          )
        })()}

        {/* Second-hand details */}
        {itemType === 'secondhand' && (() => {
          const p = item as any
          return (
            <>
              <div className="card p-5 space-y-1">
                <p className="font-display font-bold text-brand-red text-[10px] uppercase tracking-widest mb-2">Product Info</p>
                <Row label="Category" value={p.category} />
                <Row label="Platform" value={p.platform} />
                <Row label="Condition" value={p.condition} />
                <Row label="Expected Price" value={p.selling_price || p.sellingPrice ? `₹${Number(p.selling_price || p.sellingPrice).toLocaleString('en-IN')}` : ''} />
                {p.sold_price && <Row label="Final Sale Price" value={`₹${Number(p.sold_price).toLocaleString('en-IN')}`} />}
                <Row label="Listing Status" value={inStock ? 'Available' : 'Sold'} />
                <Row label="Known Issues" value={p.known_issues || p.knownIssues} />
              </div>
              
              <div className="card p-5 space-y-1">
                <p className="font-display font-bold text-brand-red text-[10px] uppercase tracking-widest mb-2">Seller/Source</p>
                <Row label="Name" value={p.seller_name || p.sellerName} />
                <Row label="Phone" value={p.seller_phone || p.sellerPhone} />
                <Row label="Purchase Date" value={p.purchase_date || p.purchaseDate} />
                <Row label="Buying Cost" value={p.buying_price || p.buyingPrice ? `₹${Number(p.buying_price || p.buyingPrice).toLocaleString('en-IN')}` : ''} />
              </div>

              {!inStock && p.sold_to && (
                <div className="card p-5 space-y-1 border-brand-red/20 bg-brand-red/5">
                  <p className="font-display font-bold text-brand-red text-[10px] uppercase tracking-widest mb-2">Customer Info</p>
                  <Row label="Name" value={p.sold_to} />
                  <Row label="Phone" value={p.customer_phone} />
                  <Row label="Sale Note" value={p.sale_note} />
                </div>
              )}

              {(p.receipt_image_url || p.receiptImageUrl) && (
                <a href={p.receipt_image_url || p.receiptImageUrl} target="_blank" rel="noopener noreferrer"
                  className="btn-secondary w-full text-center text-sm py-3 border-brand-border/30">
                  View Original Receipt →
                </a>
              )}
            </>
          )
        })()}

        {/* Repair details */}
        {itemType === 'repair' && (() => {
          const r = item as any
          const status = r.status || 'pending'
          return (
            <>
              <div className="card p-5 space-y-1">
                <p className="font-display font-bold text-brand-red text-[10px] uppercase tracking-widest mb-2">Job Details</p>
                <div className="mb-4">
                  <span className={`text-[11px] border rounded-full px-3 py-1 font-display font-bold uppercase tracking-wider status-${status}`}>
                    {status}
                  </span>
                </div>
                <Row label="Platform" value={r.platform} />
                <Row label="Problem" value={r.problem_description || r.problemDescription} />
                <Row label="Received" value={r.received_date || r.receivedDate} />
                <Row label="Est. Cost" value={r.estimate_cost || r.estimateCost ? `₹${Number(r.estimate_cost || r.estimateCost).toLocaleString('en-IN')}` : 'Pending'} />
                <Row label="Actual Cost" value={r.actual_cost || r.actualCost ? `₹${Number(r.actual_cost || r.actualCost).toLocaleString('en-IN')}` : ''} />
              </div>
              <div className="card p-5 space-y-1">
                <p className="font-display font-bold text-brand-red text-[10px] uppercase tracking-widest mb-2">Owner Contact</p>
                <Row label="Name" value={r.owner_name || r.ownerName} />
                <Row label="Phone" value={r.owner_phone || r.ownerPhone} />
              </div>
              {(r.owner_phone || r.ownerPhone) && (
                <a href={`tel:${r.owner_phone || r.ownerPhone}`}
                  className="btn-secondary w-full text-center flex items-center justify-center gap-2 text-sm py-3 border-brand-border/30">
                  <Phone size={15} /> Call Owner
                </a>
              )}
              {/* Status updater (client component) */}
              <RepairStatusUpdater repairId={item.id} currentStatus={status} isAdmin={canEdit} />
            </>
          )
        })()}
      </div>

      <BottomNav isAdmin={session.role === 'admin'} />
    </div>
  )
}
