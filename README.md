# MongoDB Slow Log Analyzer

A web-based tool for analyzing MongoDB slow query logs. This application helps database administrators and developers identify performance bottlenecks by visualizing slow query patterns, providing actionable recommendations, and offering detailed query analysis.

**🌐 Try it now**: [https://n1klion.github.io/mongodb-slow-log/](https://n1klion.github.io/mongodb-slow-log/)

## 🔒 Privacy & Security

**100% Client-Side Processing** - This application processes all log files entirely in your browser. No data is ever uploaded to any server or stored anywhere except in your browser's memory. Your log files remain completely private and secure on your machine.

- ✅ No server uploads
- ✅ No data storage
- ✅ No network requests for log processing
- ✅ All analysis happens locally in your browser
- ✅ Your sensitive database information never leaves your device

## Features

- **🚀 Easy Upload**: Drag and drop or browse to upload MongoDB log files
- **📊 Visual Dashboard**: Interactive table with sorting, filtering, and pagination
- **📈 Statistics Overview**: Key metrics including total queries, average duration, and performance distribution
- **🔍 Detailed Analysis**: In-depth query examination with recommendations
- **⚡ Performance Insights**: Efficiency ratios, execution plans, and optimization suggestions

## Installation

### Prerequisites

- Node.js 20+
- npm

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd mongodb-slow-log
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Uploading Log Files

1. **Drag & Drop**: Simply drag your MongoDB log file into the upload area
2. **Browse**: Click the upload area to select a file from your system
3. **Supported Format**: JSON-formatted MongoDB logs with `COMMAND` entries

> **Privacy Note**: Files are processed entirely in your browser - nothing is uploaded to any server. Your log files remain on your device at all times.

### Log File Format

The application expects MongoDB log files in JSON format with the following structure:

```json
{
  "t": {"$date": "2024-01-15T10:30:00.123Z"},
  "s": "I",
  "c": "COMMAND",
  "id": 51803,
  "ctx": "conn123",
  "msg": "Slow query",
  "attr": {
    "type": "command",
    "ns": "database.collection",
    "command": {...},
    "durationMillis": 1500,
    "planSummary": "COLLSCAN",
    "docsExamined": 100000,
    "nreturned": 10,
    "keysExamined": 0,
    "queryHash": "ABC123"
  }
}
```

### Dashboard Features

- **Sorting**: Click column headers to sort by duration, documents examined, etc.
- **Filtering**: Use the search functionality to find specific queries
- **Pagination**: Navigate through large log files efficiently
- **Row Selection**: Click any row to view detailed analysis

## Performance Analysis

### Key Metrics

- **Duration**: Query execution time in milliseconds
- **Documents Examined**: Total documents scanned during execution
- **Documents Returned**: Number of documents returned to the client
- **Keys Examined**: Number of index keys examined
- **Efficiency Ratio**: (Documents Returned / Documents Examined) × 100

### Query Types Supported

- `find` - Document queries
- `insert` - Document insertions
- `update` - Document updates
- `delete` - Document deletions
- `aggregate` - Aggregation pipeline operations
- `getmore` - Cursor continuation operations

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Security & Privacy Notes**:

- This tool processes all data client-side in your browser - no files are uploaded to any server
- Your MongoDB log files never leave your device and are not stored anywhere
- The application is completely safe to use with production log files as all processing is local
- No network requests are made during log analysis, ensuring complete privacy
