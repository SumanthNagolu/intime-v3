/**
 * Export Utilities
 *
 * CSV, Excel, and PDF export functionality.
 */

import type { ColumnDef } from '@tanstack/react-table';

// ==========================================
// TYPES
// ==========================================

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportColumn {
  id: string;
  header: string;
  accessor: string | ((row: unknown) => unknown);
  format?: (value: unknown) => string;
}

export interface ExportOptions {
  /** Export format */
  format: ExportFormat;

  /** File name (without extension) */
  filename?: string;

  /** Columns to export */
  columns?: ExportColumn[];

  /** Include header row */
  includeHeader?: boolean;

  /** Custom date format */
  dateFormat?: string;

  /** Sheet name (Excel only) */
  sheetName?: string;

  /** PDF orientation */
  orientation?: 'portrait' | 'landscape';

  /** PDF page size */
  pageSize?: 'a4' | 'letter' | 'legal';
}

// ==========================================
// CSV EXPORT
// ==========================================

/**
 * Export data to CSV
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  options: Partial<ExportOptions> = {}
): void {
  const { filename = 'export', includeHeader = true } = options;

  const rows: string[][] = [];

  // Header row
  if (includeHeader) {
    rows.push(columns.map((col) => col.header));
  }

  // Data rows
  for (const row of data) {
    const values = columns.map((col) => {
      const value = typeof col.accessor === 'function'
        ? col.accessor(row)
        : getNestedValue(row, col.accessor);

      const formatted = col.format
        ? col.format(value)
        : formatValue(value);

      return escapeCSV(formatted);
    });
    rows.push(values);
  }

  // Create CSV content
  const csv = rows.map((row) => row.join(',')).join('\n');

  // Download
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Escape value for CSV
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ==========================================
// EXCEL EXPORT
// ==========================================

/**
 * Export data to Excel
 * Note: This creates a simple HTML table that Excel can open
 * For advanced Excel features, integrate a library like xlsx
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  options: Partial<ExportOptions> = {}
): void {
  const { filename = 'export', sheetName = 'Sheet1', includeHeader = true } = options;

  // Create HTML table
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${sheetName}</x:Name>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        td { mso-number-format:"@"; }
        .number { mso-number-format:"#,##0.00"; }
        .currency { mso-number-format:"$#,##0.00"; }
        .date { mso-number-format:"yyyy-mm-dd"; }
      </style>
    </head>
    <body>
      <table>
  `;

  // Header row
  if (includeHeader) {
    html += '<tr>';
    for (const col of columns) {
      html += `<th style="font-weight:bold;background:#f0f0f0">${escapeHTML(col.header)}</th>`;
    }
    html += '</tr>';
  }

  // Data rows
  for (const row of data) {
    html += '<tr>';
    for (const col of columns) {
      const value = typeof col.accessor === 'function'
        ? col.accessor(row)
        : getNestedValue(row, col.accessor);

      const formatted = col.format
        ? col.format(value)
        : formatValue(value);

      const cellClass = getCellClass(value);
      html += `<td class="${cellClass}">${escapeHTML(formatted)}</td>`;
    }
    html += '</tr>';
  }

  html += '</table></body></html>';

  // Download
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  downloadBlob(blob, `${filename}.xls`);
}

/**
 * Get cell class based on value type
 */
function getCellClass(value: unknown): string {
  if (typeof value === 'number') return 'number';
  if (value instanceof Date) return 'date';
  return '';
}

/**
 * Escape HTML special characters
 */
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ==========================================
// PDF EXPORT
// ==========================================

/**
 * Export data to PDF
 * Uses browser print dialog for basic PDF export
 * For advanced PDF features, integrate a library like jspdf
 */
export function exportToPDF<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  options: Partial<ExportOptions> = {}
): void {
  const {
    filename = 'export',
    includeHeader = true,
    orientation = 'portrait',
  } = options;

  // Create print-friendly HTML
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        @page {
          size: ${orientation};
          margin: 1cm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 6px 8px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background-color: #fafafa;
        }
        h1 {
          font-size: 16px;
          margin-bottom: 10px;
        }
        .timestamp {
          font-size: 9px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <h1>${filename}</h1>
      <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
      <table>
        ${includeHeader ? `
          <thead>
            <tr>
              ${columns.map((col) => `<th>${escapeHTML(col.header)}</th>`).join('')}
            </tr>
          </thead>
        ` : ''}
        <tbody>
          ${data.map((row) => `
            <tr>
              ${columns.map((col) => {
                const value = typeof col.accessor === 'function'
                  ? col.accessor(row)
                  : getNestedValue(row, col.accessor);
                const formatted = col.format ? col.format(value) : formatValue(value);
                return `<td>${escapeHTML(formatted)}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

// ==========================================
// COLUMN CONVERSION
// ==========================================

/**
 * Convert TanStack Table column defs to export columns
 */
export function columnsToExportColumns<T>(
  columnDefs: ColumnDef<T>[],
  visibleColumns?: string[]
): ExportColumn[] {
  return columnDefs
    .filter((col) => {
      // Exclude selection and actions columns
      if (col.id === 'select' || col.id === 'actions') return false;
      // Filter by visibility
      if (visibleColumns && col.id && !visibleColumns.includes(col.id)) return false;
      return true;
    })
    .map((col) => ({
      id: col.id ?? '',
      header: typeof col.header === 'string' ? col.header : col.id ?? '',
      accessor: (col as any).accessorKey ?? col.id ?? '',
    }));
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Get nested value from object
 */
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part: string) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

/**
 * Format value for export
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().split('T')[0];
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Download file with content
 */
function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  downloadBlob(blob, filename);
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==========================================
// EXPORT PROGRESS
// ==========================================

export interface ExportProgress {
  status: 'idle' | 'preparing' | 'exporting' | 'complete' | 'error';
  progress: number;
  message?: string;
  error?: Error;
}

export type ExportProgressCallback = (progress: ExportProgress) => void;

/**
 * Export with progress tracking
 */
export async function exportWithProgress<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  options: ExportOptions,
  onProgress: ExportProgressCallback
): Promise<void> {
  try {
    onProgress({ status: 'preparing', progress: 0, message: 'Preparing export...' });

    // Simulate preparation
    await new Promise((resolve) => setTimeout(resolve, 100));

    onProgress({ status: 'exporting', progress: 50, message: 'Generating file...' });

    switch (options.format) {
      case 'csv':
        exportToCSV(data, columns, options);
        break;
      case 'excel':
        exportToExcel(data, columns, options);
        break;
      case 'pdf':
        exportToPDF(data, columns, options);
        break;
    }

    onProgress({ status: 'complete', progress: 100, message: 'Export complete!' });
  } catch (error) {
    onProgress({
      status: 'error',
      progress: 0,
      message: 'Export failed',
      error: error instanceof Error ? error : new Error(String(error)),
    });
  }
}
