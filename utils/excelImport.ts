import { MedicalSupply } from "@/components/SupplyCard";
import * as DocumentPicker from "expo-document-picker";
import * as XLSX from "xlsx";

export interface ImportResult {
  success: boolean;
  data?: Omit<MedicalSupply, "id">[];
  error?: string;
  count?: number;
}

export interface ExcelRow {
  [key: string]: any;
}

const COLUMN_MAPPING = {
  Store: [
    "store",
    "store_number",
    "store_id",
    "warehouse_id",
    "location",
    "shop",
  ],
  StoreName: [
    "store_name",
    "storename",
    "store name",
    "warehouse",
    "location_name",
    "shop_name",
    "facility",
  ],
  ProductCode: [
    "product_code",
    "productcode",
    "product code",
    "code",
    "item_code",
    "sku",
    "part_number",
    "item_number",
    "product_id",
    "id",
    "barcode",
  ],
  ProductDescription: [
    "product_description",
    "productdescription",
    "product description",
    "description",
    "item_description",
    "name",
    "product_name",
    "item_name",
    "title",
    "product",
    "item",
    "details",
  ],
  Category: [
    "category",
    "product_category",
    "item_category",
    "type",
    "class",
    "group",
  ],
  UOM: ["uom", "unit", "unit_of_measure", "measure", "units", "packaging"],
};

class ExcelImportService {
  static async importFromExcel(): Promise<ImportResult> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/csv",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return { success: false, error: "Import cancelled" };
      }

      const file = result.assets[0];
      if (!file) {
        return { success: false, error: "No file selected" };
      }

      if (file.size && file.size > 10 * 1024 * 1024) {
        return {
          success: false,
          error: "File too large. Maximum size is 10MB.",
        };
      }

      const parsedData = await this.parseExcelFile(file.uri);
      return parsedData;
    } catch (error) {
      console.error("Excel import error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private static async parseExcelFile(uri: string): Promise<ImportResult> {
    try {
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        return { success: false, error: "No sheets found in the Excel file" };
      }

      const worksheet = workbook.Sheets[sheetName];

      // Check if this is a product master file format (title in first row)
      const rawDataWithTitleRow: ExcelRow[] =
        XLSX.utils.sheet_to_json(worksheet);

      if (!rawDataWithTitleRow || rawDataWithTitleRow.length === 0) {
        return { success: false, error: "No data found in the Excel file" };
      }

      // Check if first row looks like a title row
      const firstRowKeys = Object.keys(rawDataWithTitleRow[0] || {});
      const isProductMasterFormat = firstRowKeys.some(
        (key) =>
          key.toLowerCase().includes("product") &&
          key.toLowerCase().includes("master")
      );

      let rawData: ExcelRow[];

      if (isProductMasterFormat && rawDataWithTitleRow.length > 1) {
        // Skip the title row and parse from row 2 as headers
        console.log(
          "Excel Debug - Detected Product Master format with title row"
        );
        rawData = XLSX.utils.sheet_to_json(worksheet, { range: 1 }); // Start from row 2 (0-indexed)
      } else {
        // Standard format - use first row as headers
        rawData = rawDataWithTitleRow;
      }

      if (!rawData || rawData.length === 0) {
        return { success: false, error: "No data found after parsing headers" };
      }

      console.log("Excel Debug - Raw data sample:", rawData[0]);
      console.log(
        "Excel Debug - Available columns:",
        Object.keys(rawData[0] || {})
      );

      const transformedData = this.transformExcelData(rawData);

      if (transformedData.length === 0) {
        const availableColumns = Object.keys(rawData[0] || {});
        return {
          success: false,
          error: `No valid data found. Available columns: ${availableColumns.join(
            ", "
          )}.\n\nRequired: At least one column containing product codes and descriptions.`,
        };
      }

      return {
        success: true,
        data: transformedData,
        count: transformedData.length,
      };
    } catch (error) {
      console.error("Parse error:", error);
      return {
        success: false,
        error:
          "Failed to parse Excel file. Please ensure it's a valid Excel format.",
      };
    }
  }

  private static transformExcelData(
    rawData: ExcelRow[]
  ): Omit<MedicalSupply, "id">[] {
    const transformed: Omit<MedicalSupply, "id">[] = [];

    const columnMapping = this.analyzeColumns(rawData[0]);
    console.log("Excel Debug - Column mapping:", columnMapping);

    for (const row of rawData) {
      try {
        const supply = this.mapRowToSupplyFlexible(row, columnMapping);
        if (supply && this.validateSupplyFlexible(supply)) {
          transformed.push(supply);
        }
      } catch (error) {
        console.warn("Error processing row:", row, error);
      }
    }

    return transformed;
  }

  private static analyzeColumns(sampleRow: ExcelRow): {
    [key: string]: string | null;
  } {
    const mapping: { [key: string]: string | null } = {
      Store: null,
      StoreName: null,
      ProductCode: null,
      ProductDescription: null,
      Category: null,
      UOM: null,
    };

    if (!sampleRow) return mapping;

    const availableColumns = Object.keys(sampleRow);
    console.log("Excel Debug - Available columns:", availableColumns);

    for (const [targetField, possibleColumns] of Object.entries(
      COLUMN_MAPPING
    )) {
      let bestMatch = null;
      let bestScore = 0;

      for (const availableCol of availableColumns) {
        const score = this.getColumnMatchScore(availableCol, possibleColumns);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = availableCol;
        }
      }

      if (bestScore > 0) {
        mapping[targetField] = bestMatch;
      }
    }

    if (!mapping.ProductCode && availableColumns.length > 0) {
      mapping.ProductCode = availableColumns[0];
    }

    if (!mapping.ProductDescription && availableColumns.length > 0) {
      mapping.ProductDescription =
        availableColumns.length > 1 ? availableColumns[1] : availableColumns[0];
    }

    return mapping;
  }

  private static getColumnMatchScore(
    columnName: string,
    possibleNames: string[]
  ): number {
    const colLower = columnName.toLowerCase().replace(/[^a-z0-9]/g, "");

    for (const possible of possibleNames) {
      const possibleLower = possible.toLowerCase().replace(/[^a-z0-9]/g, "");

      if (colLower === possibleLower) return 100;

      if (colLower.includes(possibleLower) || possibleLower.includes(colLower))
        return 80;

      // Partial match
      if (this.getLevenshteinDistance(colLower, possibleLower) <= 2) return 60;
    }

    return 0;
  }

  private static getLevenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private static mapRowToSupplyFlexible(
    row: ExcelRow,
    columnMapping: { [key: string]: string | null }
  ): Omit<MedicalSupply, "id"> | null {
    const supply: Partial<MedicalSupply> = {};

    for (const [targetField, sourceColumn] of Object.entries(columnMapping)) {
      if (
        sourceColumn &&
        row[sourceColumn] !== undefined &&
        row[sourceColumn] !== null
      ) {
        const value = row[sourceColumn];
        if (targetField === "Store") {
          supply.Store = Number(value) || 0;
        } else {
          (supply as any)[targetField] = String(value).trim();
        }
      }
    }

    const hasCode = supply.ProductCode && supply.ProductCode.trim().length > 0;
    const hasDescription =
      supply.ProductDescription && supply.ProductDescription.trim().length > 0;

    if (!hasCode && !hasDescription) {
      return null;
    }

    return {
      Store: supply.Store || 0,
      StoreName: supply.StoreName || "Imported Store",
      ProductCode: supply.ProductCode || `AUTO_${Date.now()}`,
      ProductDescription:
        supply.ProductDescription || supply.ProductCode || "Imported Item",
      Category: supply.Category || "IMPORTED",
      UOM: supply.UOM || "EACH",
    };
  }

  private static validateSupplyFlexible(
    supply: Omit<MedicalSupply, "id">
  ): boolean {
    return !!(
      (supply.ProductCode && supply.ProductCode.trim().length > 0) ||
      (supply.ProductDescription && supply.ProductDescription.trim().length > 0)
    );
  }

  static getSampleFormat(): string[] {
    return [
      "Store (number)",
      "StoreName (text)",
      "ProductCode (text) *required",
      "ProductDescription (text) *required",
      "Category (text)",
      "UOM (text)",
    ];
  }
}

export default ExcelImportService;
