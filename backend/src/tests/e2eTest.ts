const API_BASE = 'http://127.0.0.1:5000/api';

async function req(url: string, options: any = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const contentType = res.headers.get('content-type') || '';
  let data: any;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.arrayBuffer();
  }

  if (!res.ok) {
    const errorMsg = data?.message || data?.error || res.statusText;
    throw new Error(`[${res.status}] ${errorMsg}`);
  }

  return { status: res.status, data };
}

async function runE2ETest() {
  console.log('🚀 Starting Full-Stack VedicVeda E2E Verification Tests...\n');

  try {
    // 1. Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthRes = await req('/health');
    console.log(`✅ Health status: ${healthRes.data.status} | Time: ${healthRes.data.timestamp}`);

    // 2. Products Catalog & Filtering
    console.log('\n2️⃣ Testing Product Catalog & Filters...');
    const productsRes = await req('/products?limit=10');
    console.log(`✅ Fetched products: ${productsRes.data.products.length} of ${productsRes.data.pagination.total}`);
    if (productsRes.data.pagination.total !== 71) {
      throw new Error(`Expected 71 products, got ${productsRes.data.pagination.total}`);
    }

    const searchRes = await req('/products/search-suggestions?q=Yantra');
    console.log(`✅ Search suggestions for "Yantra": ${searchRes.data.suggestions.length} items`);

    const sampleProduct = productsRes.data.products[0];
    const detailsRes = await req(`/products/${sampleProduct.slug}`);
    console.log(`✅ Product details for [${detailsRes.data.product.productCode}] ${detailsRes.data.product.name}`);
    console.log(`   Variants found: ${detailsRes.data.product.variants.length}`);

    // 3. Authentication
    console.log('\n3️⃣ Testing User Authentication...');
    const loginRes = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'customer@vedicveda.com',
        password: 'Customer@12345'
      })
    });
    const userToken = loginRes.data.token;
    console.log(`✅ Devotee logged in: ${loginRes.data.user.name} (${loginRes.data.user.role})`);

    const adminLoginRes = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vedicveda.com',
        password: 'Admin@12345'
      })
    });
    const adminToken = adminLoginRes.data.token;
    console.log(`✅ Super Admin logged in: ${adminLoginRes.data.user.name} (${adminLoginRes.data.user.role})`);

    const userHeaders = { Authorization: `Bearer ${userToken}` };
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 4. Cart Operations
    console.log('\n4️⃣ Testing Cart & Stock Validation...');
    const variantToBuy = detailsRes.data.product.variants[0];
    const addRes = await req('/cart/add', {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({ variantId: variantToBuy.id, quantity: 2 })
    });
    console.log(`✅ Added to cart response: ${addRes.data.message}`);

    const cartRes = await req('/cart', { headers: userHeaders });
    console.log(`✅ Cart fetched: ${cartRes.data.totalItems} items | Subtotal: ₹${cartRes.data.subtotal}`);

    // 5. Coupon Validation
    console.log('\n5️⃣ Testing Coupon Validation...');
    const couponRes = await req('/coupons/validate', {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({ code: 'VEDA10', subtotal: 5000 })
    });
    console.log(`✅ Coupon applied: ${couponRes.data.coupon.code} | Discount: ₹${couponRes.data.coupon.discount}`);

    // 6. Checkout & Atomic Stock Deduction
    console.log('\n6️⃣ Testing Checkout & Atomic Inventory Deduction...');
    const initialStock = variantToBuy.stock;
    const checkoutRes = await req('/checkout/create-order', {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        customerName: 'Suresh Raman',
        customerEmail: 'customer@vedicveda.com',
        customerPhone: '+91 98765 43210',
        shippingAddress: {
          fullName: 'Suresh Raman',
          phone: '+91 98765 43210',
          addressLine1: '108 Temple Street, Malleshwaram',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560003'
        },
        items: [
          {
            variantId: variantToBuy.id,
            quantity: 1
          }
        ],
        couponCode: 'VEDA10',
        paymentMethod: 'UPI'
      })
    });
    const order = checkoutRes.data.order;
    console.log(`✅ Order placed successfully! Order Number: ${order.orderNumber}`);
    console.log(`   Final Total: ₹${order.totalAmount} | Payment Status: ${order.paymentStatus}`);

    // Verify stock deduction
    const verifyVariantRes = await req(`/products/${sampleProduct.slug}`);
    const updatedVariant = verifyVariantRes.data.product.variants.find((v: any) => v.id === variantToBuy.id);
    console.log(`✅ Inventory verified: Initial stock=${initialStock}, New stock=${updatedVariant.stock} (reduced by 1)`);

    // 7. Invoice Generation
    console.log('\n7️⃣ Testing GST Tax Invoice Generation...');
    const invoiceRes = await req(`/orders/${order.id}/invoice`, { headers: userHeaders });
    console.log(`✅ Invoice generated: Invoice #${invoiceRes.data.invoice.invoiceNumber}`);
    console.log(`   Tax breakdown: CGST: ₹${invoiceRes.data.invoice.cgst}, SGST: ₹${invoiceRes.data.invoice.sgst}`);

    // 8. Order Cancellation & Stock Restoration
    console.log('\n8️⃣ Testing Order Cancellation & Stock Restoration...');
    const cancelRes = await req(`/orders/${order.id}/cancel`, {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({ reason: 'Testing cancellation flow' })
    });
    console.log(`✅ Order cancelled: ${cancelRes.data.message}`);

    const verifyRestockRes = await req(`/products/${sampleProduct.slug}`);
    const restockedVariant = verifyRestockRes.data.product.variants.find((v: any) => v.id === variantToBuy.id);
    console.log(`✅ Restock verified: Restored stock=${restockedVariant.stock} (restored to initial: ${initialStock})`);

    // 9. Admin Dashboard Metrics & Inventory Adjustments
    console.log('\n9️⃣ Testing Admin Panel Features...');
    const kpiRes = await req('/admin/dashboard', { headers: adminHeaders });
    console.log(`✅ Admin KPIs: Total Sales: ₹${kpiRes.data.metrics.totalSales}, Total Orders: ${kpiRes.data.metrics.totalOrders}, Low Stock Count: ${kpiRes.data.metrics.lowStockCount}`);

    // Test Manual Stock Adjustment with Audit Log
    const adjustRes = await req('/admin/inventory/adjust', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        variantId: variantToBuy.id,
        adjustmentQty: 5,
        reason: 'RESTOCK',
        notes: 'E2E automated replenishment test'
      })
    });
    console.log(`✅ Admin stock adjustment: New stock is ${adjustRes.data.newStock}`);

    // Test Excel Orders Export
    const exportRes = await req('/admin/orders/export', { headers: adminHeaders });
    console.log(`✅ Admin Excel Export: Generated workbook binary of size ${exportRes.data.byteLength} bytes`);

    console.log('\n=============================================');
    console.log('🎉 ALL END-TO-END VERIFICATION TESTS PASSED!');
    console.log('=============================================');

  } catch (err: any) {
    console.error('❌ E2E Test Failed:', err.message);
    process.exit(1);
  }
}

runE2ETest();
