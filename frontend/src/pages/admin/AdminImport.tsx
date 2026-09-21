import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setReport(null);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select an Excel (.xlsx/.xls) or CSV file.');
      return;
    }

    setIsUploading(true);
    setReport(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.upload('/admin/import-products', formData);
      if (res.success && res.report) {
        setReport(res.report);
      }
    } catch (err: any) {
      alert(err.message || 'Import failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="font-serif text-2xl font-black text-slate-900">
          Bulk Excel Product Ingestion
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload any Excel workbook or CSV following Master Inventory or CRM schemas to ingest or sync products
        </p>
      </div>

      {/* Upload Dropzone Card */}
      <div className="bg-white p-8 rounded-3xl border border-vedic-border/70 shadow-sm space-y-6">
        <form onSubmit={handleImport} className="space-y-6">
          <div className="border-2 border-dashed border-slate-200 hover:border-vedic-gold rounded-2xl p-8 text-center space-y-3 cursor-pointer transition-colors bg-slate-50/50">
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="excel-upload" className="cursor-pointer block space-y-2">
              <div className="w-14 h-14 rounded-full bg-vedic-gold/10 text-vedic-gold flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div className="font-serif font-bold text-sm text-slate-900">
                {file ? file.name : 'Click to select or drag & drop Excel (.xlsx) file'}
              </div>
              <p className="text-xs text-slate-400">
                Supports &ldquo;Master Inventory&rdquo; sheet (Code, Category, Product Names, Size, Unit Price, Qty) and &ldquo;CRM&rdquo; format
              </p>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              {file ? (
                <span>Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</span>
              ) : (
                <span>No file selected yet.</span>
              )}
            </div>

            <button
              type="submit"
              disabled={!file || isUploading}
              className="w-full sm:w-auto px-8 py-3 bg-vedic-navy hover:bg-vedic-gold text-white font-bold text-xs rounded-xl shadow-luxury flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? 'Validating & Ingesting...' : 'Start Ingestion'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Validation & Import Report */}
      {report && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-vedic-border/70 shadow-card space-y-6 animate-in slide-in-from-top-4">
          <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Ingestion Report & Validation Results</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-400 font-medium">Rows Processed</div>
              <div className="font-serif text-xl font-bold text-slate-900 mt-1">{report.totalRows}</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-emerald-800 font-medium">New Products Added</div>
              <div className="font-serif text-xl font-bold text-emerald-700 mt-1">{report.added}</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-blue-800 font-medium">Existing Updated</div>
              <div className="font-serif text-xl font-bold text-blue-700 mt-1">{report.updated}</div>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <div className="text-rose-800 font-medium">Failed Rows</div>
              <div className="font-serif text-xl font-bold text-rose-700 mt-1">{report.failed}</div>
            </div>
          </div>

          {report.errors && report.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-rose-700 uppercase tracking-wider">
                Row Validation Warnings:
              </h4>
              <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1 text-xs text-rose-800">
                {report.errors.map((err: any, idx: number) => (
                  <div key={idx}>
                    Row {err.row}: {err.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
