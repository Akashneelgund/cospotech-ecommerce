import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import { InvoiceDetails } from '../types';
import { api } from '../services/api';

export const InvoicePage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/orders/${orderId}/invoice`);
        if (res.success && res.invoice) {
          setInvoice(res.invoice);
        }
      } catch (err) {
        console.error('Failed to load invoice:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchInvoice();
    }
  }, [orderId]);

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading Tax Invoice...</div>;
  }

  if (!invoice) {
    return <div className="p-12 text-center text-xs text-red-500">Invoice not found for this order.</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-100 min-h-screen py-8 px-4 sm:px-6">
      {/* Top Action Bar (Hidden on print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-5 py-2 bg-vedic-navy hover:bg-vedic-gold text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Invoice Sheet */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none text-slate-800">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b-2 border-vedic-gold/60 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img
                src="/images/cospotech-logo-horizontal.png"
                alt="Cospotech"
                className="h-9 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-slate-500 font-medium">Cospotech Private Limited</p>
            <p className="text-xs text-slate-500 mt-1">Plot 108, Temple View Enclave, 5th Main, Indiranagar</p>
            <p className="text-xs text-slate-500">Bengaluru, Karnataka - 560038, Bharat</p>
            <p className="text-xs text-slate-700 font-bold mt-1">GSTIN: 29AABCV1234F1Z5</p>
          </div>

          <div className="sm:text-right space-y-1">
            <div className="inline-block px-3 py-1 bg-vedic-navy text-vedic-lightgold font-bold text-xs uppercase tracking-widest rounded-md mb-1">
              Tax Invoice
            </div>
            <div className="text-xs font-bold text-slate-900">Invoice No: {invoice.invoiceNumber}</div>
            <div className="text-xs text-slate-500">Invoice Date: {invoice.invoiceDate}</div>
            <div className="text-xs text-slate-500">Order ID: #{invoice.orderNumber}</div>
            <div className="text-xs text-slate-500">Payment: {invoice.paymentMethod} ({invoice.paymentStatus})</div>
          </div>
        </div>

        {/* Customer & Shipping Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-slate-200 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1.5 text-[11px] text-vedic-gold">
              Billed To:
            </h4>
            <div className="font-bold text-slate-900 text-sm">{invoice.customerName}</div>
            <div className="text-slate-600 mt-0.5">{invoice.billingAddress?.addressLine1} {invoice.billingAddress?.addressLine2 || ''}</div>
            <div className="text-slate-600">{invoice.billingAddress?.city}, {invoice.billingAddress?.state} - {invoice.billingAddress?.pincode}</div>
            <div className="text-slate-600 mt-1">Phone: {invoice.customerPhone}</div>
            <div className="text-slate-600">Email: {invoice.customerEmail}</div>
          </div>

          <div className="sm:text-right">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1.5 text-[11px] text-vedic-gold">
              Shipped To:
            </h4>
            <div className="font-bold text-slate-900 text-sm">{invoice.customerName}</div>
            <div className="text-slate-600 mt-0.5">{invoice.shippingAddress?.addressLine1} {invoice.shippingAddress?.addressLine2 || ''}</div>
            <div className="text-slate-600">{invoice.shippingAddress?.city}, {invoice.shippingAddress?.state} - {invoice.shippingAddress?.pincode}</div>
            <div className="text-slate-600 mt-1">Insured Courier Dispatch</div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-[11px] uppercase tracking-wider text-slate-600">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Description & Consecration</th>
                <th className="py-3 px-3">HSN</th>
                <th className="py-3 px-3">Variant</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-3 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[10px] text-slate-400">Code: {item.code}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">{item.hsn}</td>
                  <td className="py-3 px-3 text-slate-600">{item.size}</td>
                  <td className="py-3 px-3 text-center font-bold">{item.qty}</td>
                  <td className="py-3 px-3 text-right">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right font-bold">₹{item.total.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Breakdown */}
        <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-6 text-xs">
          <div className="max-w-xs space-y-2">
            <div className="font-bold text-slate-900">Tax Summary (GST Act, 2017):</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tax rate of 3% applied on sacred metal yantras, gemstone rings, and temple artefacts. Output tax fully accounted under CGST/SGST/IGST.
            </p>
            <div className="pt-2">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://vedicveda.com/verify-invoice/${invoice.invoiceNumber}`}
                alt="GST QR Verification"
                className="w-20 h-20 border border-slate-200 p-1 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Scan to verify invoice</span>
            </div>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-right">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Subtotal:</span>
              <span>₹{invoice.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Blessing Discount:</span>
                <span>-₹{invoice.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {invoice.cgst > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>CGST (1.5%):</span>
                <span>₹{invoice.cgst.toLocaleString('en-IN')}</span>
              </div>
            )}
            {invoice.sgst > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>SGST (1.5%):</span>
                <span>₹{invoice.sgst.toLocaleString('en-IN')}</span>
              </div>
            )}
            {invoice.igst > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>IGST (3.0%):</span>
                <span>₹{invoice.igst.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Insured Shipping Fee:</span>
              <span>{invoice.shippingFee === 0 ? 'FREE' : `₹${invoice.shippingFee}`}</span>
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t-2 border-slate-900 font-black text-sm text-slate-900">
              <span className="uppercase tracking-wider">Grand Total:</span>
              <span className="font-serif text-lg text-vedic-navy">
                ₹{invoice.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Authorization */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-end justify-between gap-6 text-xs">
          <div className="text-slate-400 text-[10px] space-y-0.5">
            <div>This is a computer-generated GST tax invoice. No physical signature is required.</div>
            <div>Authenticity & Pran-Pratishtha certification guaranteed by VedicVeda Heritage.</div>
          </div>

          <div className="text-center sm:text-right">
            <div className="font-serif font-bold text-slate-800 italic">Acharya Vidyadhar</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Authorized Altar Signatory</div>
          </div>
        </div>

      </div>
    </div>
  );
};
