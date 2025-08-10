# Excel Export Utility

This utility provides a common method for exporting table data to Excel format (CSV) for both Lead and Property tables.

## Features

- ✅ Exports all columns except the Actions column
- ✅ Properly formats dates, currency, and status values
- ✅ Handles nested object properties
- ✅ Includes timestamp in filename
- ✅ Error handling and validation
- ✅ User-friendly success/error messages

## Usage

### For Leads Table

```javascript
import { exportLeads } from '../../../../../core/utils/excelExport';

const handleExport = () => {
  if (!leads || leads.length === 0) {
    customAlert('❌ No leads to export');
    return;
  }
  
  const result = exportLeads(leads);
  if (result.success) {
    customAlert(`✅ ${result.message}`);
  } else {
    customAlert(`❌ ${result.message}`);
  }
};
```

### For Properties Table

```javascript
import { exportProperties } from '../../../../../core/utils/excelExport';

const handleExport = () => {
  if (!properties || properties.length === 0) {
    customAlert('❌ No properties to export');
    return;
  }
  
  const result = exportProperties(properties);
  if (result.success) {
    customAlert(`✅ ${result.message}`);
  } else {
    customAlert(`❌ ${result.message}`);
  }
};
```

### Custom Export

For custom tables, you can use the generic `exportToExcel` function:

```javascript
import { exportToExcel } from '../../../../../core/utils/excelExport';

const customColumns = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'user.role', header: 'Role' } // Nested property
];

const result = exportToExcel(data, customColumns, 'custom_export');
```

## Exported Columns

### Leads Export
- Lead Name
- Phone
- Status
- Budget
- Requirement
- Location
- Source
- Created Date
- Assigned To

### Properties Export
- Property Name
- Status
- Type
- Price
- Location
- Sector
- BHK
- Unit Details
- Floor
- Owner Contact
- Source
- Created Date

## Data Formatting

The utility automatically formats:
- **Dates**: DD MMM YYYY format (e.g., "15 Jan 2024")
- **Currency**: Indian Rupee format (e.g., "₹1,00,000")
- **Status**: Human-readable format (e.g., "For Sale" instead of "AVAILABLE_FOR_SALE")

## File Naming

Exported files are named with the pattern: `{filename}_{YYYY-MM-DD}.csv`

Examples:
- `leads_export_2024-01-15.csv`
- `properties_export_2024-01-15.csv`

## Error Handling

The utility includes comprehensive error handling:
- Validates input data
- Handles missing or null values
- Provides clear error messages
- Graceful fallbacks for formatting errors

## Browser Compatibility

This utility works in all modern browsers that support:
- Blob API
- URL.createObjectURL()
- Download attribute on anchor tags
