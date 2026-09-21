import { Router } from 'express';
import multer from 'multer';
import {
  getDashboardMetrics,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getInventoryList,
  adjustStock,
  getInventoryTransactions,
  getAdminOrders,
  updateOrderStatus,
  exportOrdersExcel,
  importProductsExcel,
  getAdminCustomers,
  toggleCustomerStatus
} from '../controllers/adminController.js';
import { requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';

const uploadMemory = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

// Dashboard & Analytics
router.get('/dashboard', requireStaffOrAdmin, getDashboardMetrics);

// Product Management
router.get('/products', requireStaffOrAdmin, getAdminProducts);
router.post('/products', requireAdmin, createProduct);
router.put('/products/:id', requireAdmin, updateProduct);
router.delete('/products/:id', requireAdmin, deleteProduct);

// Inventory Management
router.get('/inventory', requireStaffOrAdmin, getInventoryList);
router.post('/inventory/adjust', requireStaffOrAdmin, adjustStock);
router.get('/inventory/transactions', requireStaffOrAdmin, getInventoryTransactions);

// Orders Management
router.get('/orders', requireStaffOrAdmin, getAdminOrders);
router.patch('/orders/:id/status', requireStaffOrAdmin, updateOrderStatus);
router.get('/orders/export', requireStaffOrAdmin, exportOrdersExcel);

// Customers Management
router.get('/customers', requireAdmin, getAdminCustomers);
router.patch('/customers/:id/toggle-status', requireAdmin, toggleCustomerStatus);

// Excel Bulk Import
router.post('/import-products', requireAdmin, uploadMemory.single('file'), importProductsExcel);

export default router;
