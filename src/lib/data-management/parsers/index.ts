import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface ParsedData {
  headers: string[]
  rows: Record<string, unknown>[]
  totalRows: number
  errors: ParseError[]
}

export interface ParseError {
  row?: number
  message: string
  code: string
}

export const parseCSV = async (file: File | string): Promise<ParsedData> => {
  return new Promise((resolve) => {
    const config: Papa.ParseConfig<Record<string, unknown>> = {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results: Papa.ParseResult<Record<string, unknown>>) => {
        resolve({
          headers: results.meta.fields || [],
          rows: results.data,
          totalRows: results.data.length,
          errors: results.errors.map(e => ({
            row: e.row,
            message: e.message,
            code: e.code,
          })),
        })
      },
    }

    if (typeof file === 'string') {
      Papa.parse(file, config)
    } else {
      // Papa.parse accepts File directly
      Papa.parse(file as unknown as File, config as Papa.ParseLocalConfig<Record<string, unknown>>)
    }
  })
}

export const parseExcel = async (file: File | ArrayBuffer): Promise<ParsedData> => {
  const buffer = file instanceof File ? await file.arrayBuffer() : file
  const workbook = XLSX.read(buffer, { type: 'array' })

  // Use first sheet
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  // Convert to JSON with headers
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
    raw: false,
  })

  // Normalize headers
  const normalizedData = jsonData.map(row => {
    const normalized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_')
      normalized[normalizedKey] = value
    }
    return normalized
  })

  // Get headers from first row
  const headers = normalizedData.length > 0 ? Object.keys(normalizedData[0]) : []

  return {
    headers,
    rows: normalizedData,
    totalRows: normalizedData.length,
    errors: [],
  }
}

export const parseJSON = async (file: File | string): Promise<ParsedData> => {
  const content = typeof file === 'string' ? file : await file.text()
  const data = JSON.parse(content)

  if (!Array.isArray(data)) {
    throw new Error('JSON file must contain an array of objects')
  }

  if (data.length === 0) {
    return { headers: [], rows: [], totalRows: 0, errors: [] }
  }

  // Normalize headers
  const normalizedData = data.map((row: Record<string, unknown>) => {
    const normalized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_')
      normalized[normalizedKey] = value
    }
    return normalized
  })

  const headers = Object.keys(normalizedData[0])

  return {
    headers,
    rows: normalizedData,
    totalRows: normalizedData.length,
    errors: [],
  }
}

export const detectFileType = (fileName: string): 'csv' | 'excel' | 'json' => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'csv':
      return 'csv'
    case 'xls':
    case 'xlsx':
      return 'excel'
    case 'json':
      return 'json'
    default:
      throw new Error(`Unsupported file type: ${extension}`)
  }
}

export const parseFile = async (file: File): Promise<ParsedData> => {
  const fileType = detectFileType(file.name)

  switch (fileType) {
    case 'csv':
      return parseCSV(file)
    case 'excel':
      return parseExcel(file)
    case 'json':
      return parseJSON(file)
  }
}

export const parseBase64File = async (base64Data: string, fileName: string): Promise<ParsedData> => {
  const fileType = detectFileType(fileName)

  // Remove data URL prefix if present
  const base64Content = base64Data.includes(',')
    ? base64Data.split(',')[1]
    : base64Data

  // Convert base64 to buffer
  const binaryString = atob(base64Content)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  switch (fileType) {
    case 'csv': {
      const text = new TextDecoder().decode(bytes)
      return parseCSV(text)
    }
    case 'excel': {
      return parseExcel(bytes.buffer)
    }
    case 'json': {
      const text = new TextDecoder().decode(bytes)
      return parseJSON(text)
    }
  }
}

// Export file generation utilities
export const generateCSV = (data: Record<string, unknown>[], columns: string[], includeHeaders: boolean = true): string => {
  return Papa.unparse(data, {
    columns,
    header: includeHeaders,
  })
}

export const generateExcel = (data: Record<string, unknown>[], columns: string[], includeHeaders: boolean = true): ArrayBuffer => {
  const ws = XLSX.utils.json_to_sheet(data, {
    header: includeHeaders ? columns : undefined,
  })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Export')
  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
}

export const generateJSON = (data: Record<string, unknown>[]): string => {
  return JSON.stringify(data, null, 2)
}
