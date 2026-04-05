// types/index.ts

export type UserRole = 'admin' | 'employee'

export interface User {
  id: string
  name: string
  phone: string
  role: UserRole
  pin: string          // 4-digit PIN for login
  active: boolean
  addedAt: string
}

export type ProductCategory = 'Console' | 'Game' | 'Accessory' | 'Controller' | 'Other'
export type ProductPlatform = 'PlayStation' | 'Xbox' | 'Nintendo' | 'PC' | 'Retro' | 'Other'
export type ProductCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor'
export type ProductType = 'new' | 'secondhand' | 'repair'

export interface NewProduct {
  id: string
  qrCode: string
  type: 'new'
  name: string
  category: ProductCategory
  platform: ProductPlatform
  price: number
  mfgDate: string
  description: string
  imageUrl?: string
  inStock: boolean
  addedBy: string        // employee name
  addedAt: string
  soldAt?: string
  soldBy?: string
}

export interface SecondHandProduct {
  id: string
  qrCode: string
  type: 'secondhand'
  name: string
  category: ProductCategory
  platform: ProductPlatform
  sellingPrice: number           // price we sell at
  buyingPrice: number            // price we bought at
  originalPrice?: number         // original MRP when new
  purchaseDate: string           // when we bought it
  condition: ProductCondition
  knownIssues: string
  description: string
  imageUrl?: string
  receiptImageUrl?: string       // photo of original bill
  // Seller info
  sellerName: string
  sellerPhone: string
  sellerAddress?: string
  // Internal
  processedBy: string            // employee name
  addedAt: string
  inStock: boolean
  soldAt?: string
  soldBy?: string
}

export type RepairStatus = 'pending' | 'started' | 'finished' | 'delivered' | 'cancelled'

export interface RepairJob {
  id: string
  qrCode: string
  type: 'repair'
  // Product info
  productName: string
  platform: ProductPlatform
  // Problem
  problemDescription: string
  // Owner info
  ownerName: string
  ownerPhone: string
  ownerAddress?: string
  // Dates
  receivedDate: string
  estimatedDelivery?: string
  deliveredDate?: string
  // Costs
  estimateCost: number
  actualCost?: number
  // Status
  status: RepairStatus
  statusHistory: { status: RepairStatus; note: string; updatedBy: string; updatedAt: string }[]
  // Internal
  assignedTo?: string       // employee name
  receivedBy: string        // employee who took it in
  notes?: string
  imageUrl?: string         // photo of the product
}

export type InventoryItem = NewProduct | SecondHandProduct | RepairJob

export interface Task {
  id: string
  title: string
  description: string
  assignedTo: string       // employee name
  assignedBy: string       // admin name
  dueDate?: string
  status: 'pending' | 'done'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  completedAt?: string
}

export interface Session {
  userId: string
  name: string
  role: UserRole
  token: string
}
