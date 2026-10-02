# SK ENTERPRISES - JobWork Challan & GST Billing Software

Custom-built commercial billing software for **SK ENTERPRISES** (Aligarh, Uttar Pradesh) developed directly from the physical **JobWork Challan** specification.

The software permanently locks all seller/owner details while providing an intuitive, real-time dual-pane interface to edit buyer details, product descriptions, weights, rates, amounts, and GST calculations.

---

## 🌟 Key Features

### 🔒 1. Permanently Locked Seller Details (Fixed & Read-Only)
As per configuration, the seller information is permanently locked to prevent accidental modification:
- **Firm Name**: `SK ENTERPRISES`
- **Factory Address**: `AGARWAL STREET, SHAKTI NAGAR, GOOLAR ROAD, ALIGARH 202001 (UP) INDIA`
- **GSTIN**: `09AVQPG8947B1Z6`
- **State**: `UTTAR PRADESH` (State Code: `09`)
- **Declaration**: `The above goods are returned to principal after completion of job work.`
- **Signatory**: `For SK ENTERPRISES` / `Authorised Signatury`

---

### 👤 2. Fully Editable Buyer Details ("BUYER NAME & ADDRESS")
- **Customer / Firm Name**: (e.g. `M/s EVERSHINE SALES` or custom buyer)
- **Address Line 1**: Street, Gali, or Plot (e.g. `70/1, GALI NO.1, SAROJ NAGAR`)
- **Address Line 2**: Area, Locality, or City (e.g. `ETAH CHUNGI, ALIGARH`)
- **GSTIN**: 15-character GST identification number (e.g. `09AAHFE2287Q1ZP`)
- **State & Code**: State name (`U.P`) and code (`09`)
- **Saved Buyer Directory**: 1-click loading and saving of frequent buyers into local database.

---

### 📦 3. Editable Product Descriptions, Weights (Qty) & Rates
- **Challan Reference**: Challan Number (e.g. `Ch. No. - 21` with 1-click `+1` auto-increment) and Date (`Date - 30.09.2026`).
- **Product Description**: Multi-line formatted description with automatic line breaks (e.g. `Production/Processing : -\nRECIECVED ZINC SCRAP 23-09-2026\nCHALLAN NO. 003` or `ISSUED JOBWORK`).
- **Weight / QTY**: 2-decimal precision (e.g. `405.35`).
- **Unit**: Flexible unit naming (`Kgs`, `KGS`, `Pcs`, `Bags`, `Qtl`).
- **Rate & Amount**:
  - Rate in ₹ (e.g. `305.00`, `70.00`).
  - Auto-calculated Amount (`Qty × Rate` with 2 decimals: `123631.75`, `28374.50`).
- **Per-Item GST Tax Treatment**:
  - **Non-Taxable / Scrap Movement**: Displays `-` in CGST and SGST columns, with total rounded to whole rupee (e.g. `123632.00`), matching original physical document.
  - **Job Work GST 18%**: 9% CGST (`2553.71`) + 9% SGST (`2553.71`), total `33482.00`.
  - **Inter-State IGST 18%**: For customers outside Uttar Pradesh.
- **Totals Calculation**:
  - Amount sum: `152006.25`
  - CGST sum: `2553.71`
  - SGST sum: `2553.71`
  - Grand Total Amount: `157114.00`
- **Title-Case Amount in Words**: Auto-converted into Indian currency numbering format:
  `Rupees One Lakh Fifty Seven Thousand One Hundred Fourteen Only`
- **Table Spacers**: Minimum blank spacer rows (default 4 rows) to preserve the exact physical look of the original printed bill.

---

### 📋 4. Dual Template Architecture
1. **📋 JobWork Challan (Primary & Default)**: Pixel-perfect replica of the provided photograph with crisp black borders, split buyer box, 9-column grid table, amount in words, declaration, and authorised signatory box.
2. **🧾 Commercial GST Tax Invoice**: Standard GST commercial tax invoice with Consignment box, 6-column particulars, and Zinc Job Work Raw Material Ledger.

---

### ✍️ 5. Official Rubber Stamp & Signatory System
- **Official Vector Stamp**: SK Enterprises Aligarh rubber stamp with adjustable ink color (Navy Blue, Black, Ruby Red, Purple) and tilt angle.
- **Authorised Signature**:
  - ✏️ **Draw Sign**: Canvas supporting mouse, touch, and stylus pen.
  - ⌨️ **Type Name**: Generates cursive calligraphic signature.
  - 📁 **Upload File**: Upload signature image (PNG, JPG).
  - ⚡ **SK Preset**: 1-click partner signature preset.

---

### 🖨️ 6. Pixel-Perfect A4 Printing & PDF Export
- **Print / PDF**: Direct browser print (`window.print()`) formatted to single A4 portrait page.
- **Download PDF**: Client-side high-resolution PDF generation via bundled `html2pdf.js`.
- **Export ZIP**: Download all saved bills as individual PDFs packaged into a single `.zip` file.
- **Local Storage Database**: Save, search, load, duplicate, and delete past bills.

---

## 🚀 How to Run Locally

Start the local server using Python:

```bash
cd billing-software
python server.py
```

Then open your browser and go to:
👉 **http://localhost:8088**
