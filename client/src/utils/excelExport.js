import * as XLSX from 'xlsx';

/**
 * Export data to Excel with formatting
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions with header and accessor
 * @param {String} filename - Name of the file (without extension)
 * @param {Object} options - Additional options for formatting
 */
export const exportToExcel = (data, columns, filename = 'export', options = {}) => {
    try {
        // Prepare data with column headers
        const headers = columns.map(col => col.header);
        const rows = data.map(row =>
            columns.map(col => {
                const value = row[col.accessor];
                // Handle different data types
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') return JSON.stringify(value);
                return value;
            })
        );

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

        // Auto-size columns
        const colWidths = columns.map((col, i) => {
            const headerLength = col.header.length;
            const maxDataLength = Math.max(
                ...rows.map(row => String(row[i] || '').length),
                0
            );
            return { wch: Math.max(headerLength, maxDataLength, 10) };
        });
        ws['!cols'] = colWidths;

        // Apply header styling
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_col(C) + "1";
            if (!ws[address]) continue;
            ws[address].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "3B82F6" } },
                alignment: { horizontal: "center" }
            };
        }

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, options.sheetName || 'Sheet1');

        // Add metadata
        wb.Props = {
            Title: filename,
            Subject: options.subject || 'Data Export',
            Author: options.author || 'Zyvra HR',
            CreatedDate: new Date()
        };

        // Generate file
        const timestamp = new Date().toISOString().split('T')[0];
        const finalFilename = `${filename}_${timestamp}.xlsx`;

        XLSX.writeFile(wb, finalFilename);

        return { success: true, filename: finalFilename };
    } catch (error) {
        console.error('Excel export error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Export multiple sheets to a single Excel file
 * @param {Array} sheets - Array of {name, data, columns} objects
 * @param {String} filename - Name of the file
 */
export const exportMultiSheetExcel = (sheets, filename = 'export') => {
    try {
        const wb = XLSX.utils.book_new();

        sheets.forEach(sheet => {
            const headers = sheet.columns.map(col => col.header);
            const rows = sheet.data.map(row =>
                sheet.columns.map(col => row[col.accessor] || '')
            );

            const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
            XLSX.utils.book_append_sheet(wb, ws, sheet.name);
        });

        const timestamp = new Date().toISOString().split('T')[0];
        const finalFilename = `${filename}_${timestamp}.xlsx`;

        XLSX.writeFile(wb, finalFilename);

        return { success: true, filename: finalFilename };
    } catch (error) {
        console.error('Multi-sheet Excel export error:', error);
        return { success: false, error: error.message };
    }
};
