/**
 * SK ENTERPRISES - JobWork Challan & Commercial GST Billing Software
 * 
 * Rules:
 * - Seller / Owner details are STRICTLY LOCKED to SK ENTERPRISES (Aligarh)
 * - Only Buyer Details ("BUYER NAME & ADDRESS"), Product Description, Weight (Qty) & Amount can be edited
 * - Supports exact replica JobWork Challan (from photograph) and Commercial Tax Invoice
 * - Includes Title-Case Indian currency Number-to-Words, Per-Item GST calculations (Nil/Scrap, 18% Jobwork),
 *   Buyer Directory, Local Storage Database, Pixel-Perfect A4 Printing and Client-Side PDF/ZIP Export.
 */

// =============================================================================
// 1. Permanent / Fixed Seller Configuration (Strictly Locked)
// =============================================================================
const FIXED_SELLER = {
  name: 'SK ENTERPRISES',
  factory: 'Factory : AGARWAL STREET, SHAKTI NAGAR, GOOLAR ROAD, ALIGARH 202001 (UP) INDIA',
  gstin: '09AVQPG8947B1Z6',
  stateCode: '09',
  state: 'UTTAR PRADESH',
  declaration: 'The above goods are returned to principal after completion of job work.',
  signatory: 'For SK ENTERPRISES',
  signCaption: 'Authorised Signatury',
  mobile: '93595 02004',
  bankName: 'CANARA BANK',
  branch: 'SME BRANCH, GULAR ROAD, ALIGARH',
  acNo: '120002136484',
  ifsc: 'CNRB0002375',
  jurisdiction: 'All Disputes are Subject to Aligarh Jurisdiction'
};

// =============================================================================
// 2. Default Partner Signature Preset Vector
// =============================================================================
const DEFAULT_PARTNER_SIGNATURE_DATAURL = (function() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="110" viewBox="0 0 320 110">
    <path d="M25 65 C 45 25, 75 20, 85 55 C 95 90, 115 25, 135 60 C 145 75, 160 35, 185 55 C 205 70, 230 45, 255 58 C 275 68, 290 55, 305 60" fill="none" stroke="#1d4ed8" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="35" y="68" font-family="'Caveat', cursive, sans-serif" font-size="44" font-weight="700" fill="#1d4ed8">SK Enterprises</text>
    <path d="M30 84 Q 160 76, 285 80" fill="none" stroke="#1d4ed8" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
})();

// =============================================================================
// 3. Authentic Image Sample Data (JobWork Challan Ch. No. 21)
// =============================================================================
const IMAGE_SAMPLE_CHALLAN = {
  templateType: 'challan', // 'challan' (default) or 'invoice'
  challanNo: '21',
  challanDate: '2026-09-30',
  invoiceNumber: '001',
  invoiceDate: '2026-09-30',
  copyType: 'ORIGINAL',
  category: 'JOB WORK',
  notes: '', // right box left blank as in photograph

  // Buyer Details ("BUYER NAME & ADDRESS")
  buyer: {
    name: 'M/s EVERSHINE SALES',
    addr1: '70/1, GALI NO.1, SAROJ NAGAR',
    addr2: 'ETAH CHUNGI, ALIGARH',
    cityPin: 'ALIGARH - 202001',
    gstin: '09AAHFE2287Q1ZP',
    state: 'U.P',
    stateCode: '09'
  },

  // Consignment Details (for Tax Invoice mode)
  consignment: {
    transport: '',
    lrNo: '',
    vehNo: '',
    ewbNo: '',
    placeOfSupply: 'ALIGARH (09)',
    noOfCases: '',
    reverseCharge: 'NO',
    weight: 405.35,
    freight: 0
  },

  // Line items matching the photograph
  items: [
    {
      id: 'item-1',
      particulars: 'Production/Processing : -\nRECIECVED ZINC SCRAP 23-09-2026\nCHALLAN NO. 003',
      qty: 405.35,
      unit: 'Kgs',
      rate: 305.00,
      taxType: 'none', // Nil GST on scrap receipt
      amount: 123631.75,
      cgst: 0,
      sgst: 0,
      totalAmount: 123632.00
    },
    {
      id: 'item-2',
      particulars: 'ISSUED JOBWORK',
      qty: 405.35,
      unit: 'KGS',
      rate: 70.00,
      taxType: 'intra', // 9% CGST + 9% SGST = 18%
      amount: 28374.50,
      cgst: 2553.71,
      sgst: 2553.71,
      totalAmount: 33482.00
    }
  ],

  minRows: 4,
  autoRoundoff: true,
  wordsOverride: '',

  // Material ledger (for Tax Invoice mode)
  material: {
    show: true,
    date: '2026-09-23',
    opening: 0.00,
    receivedEntries: [
      { id: 'rec-1', date: '2026-09-23', qty: 405.35, note: 'CHALLAN NO. 003' }
    ],
    received: 405.35,
    delivered: 405.35,
    loss: 0.00,
    returned: 0.00
  },

  // Stamp & Sign
  stamp: {
    show: true,
    color: '#1d4ed8',
    rotation: -7
  },
  signature: {
    show: true,
    dataUrl: DEFAULT_PARTNER_SIGNATURE_DATAURL,
    caption: 'Authorised Signatury'
  }
};

// Active Working State
let currentInvoice = JSON.parse(JSON.stringify(IMAGE_SAMPLE_CHALLAN));

// Default Saved Buyers
const DEFAULT_BUYERS = [
  {
    id: 'buyer-evershine',
    name: 'M/s EVERSHINE SALES',
    addr1: '70/1, GALI NO.1, SAROJ NAGAR',
    addr2: 'ETAH CHUNGI, ALIGARH',
    cityPin: 'ALIGARH - 202001',
    gstin: '09AAHFE2287Q1ZP',
    state: 'U.P',
    stateCode: '09'
  },
  {
    id: 'buyer-sree',
    name: 'M/s SREE CORPORATION',
    addr1: 'C-72, PHASE-I',
    addr2: 'TALANAGRI',
    cityPin: 'ALIGARH - 202001',
    gstin: '09AEZPG1543H1Z6',
    state: 'UTTAR PRADESH',
    stateCode: '09'
  },
  {
    id: 'buyer-radhey',
    name: 'M/s RADHEY KRISHNA HARDWARE',
    addr1: 'D-19, SECTOR 2',
    addr2: 'TALANAGRI INDUSTRIAL AREA',
    cityPin: 'ALIGARH - 202001',
    gstin: '09AAAFR1234A1Z3',
    state: 'UTTAR PRADESH',
    stateCode: '09'
  }
];

// =============================================================================
// 4. Indian Currency Number to Words Converter (Title Case matching image)
// =============================================================================
function numberToIndianWords(amount) {
  if (isNaN(amount) || amount === 0) return 'Rupees Zero Only';

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n) {
    if (n < 20) return ones[n];
    const unit = n % 10;
    const ten = Math.floor(n / 10);
    return tens[ten] + (unit > 0 ? ' ' + ones[unit] : '');
  }

  function convertThreeDigits(n) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred > 0) {
      res += ones[hundred] + ' Hundred';
      if (rest > 0) res += ' ';
    }
    if (rest > 0) {
      res += convertTwoDigits(rest);
    }
    return res;
  }

  // Indian Numbering System: Crores, Lakhs, Thousands, Hundreds
  let remaining = rupees;
  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;
  const hundredAndRest = remaining;

  let words = '';

  if (crore > 0) {
    words += convertTwoDigits(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertTwoDigits(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertTwoDigits(thousand) + ' Thousand ';
  }
  if (hundredAndRest > 0) {
    words += convertThreeDigits(hundredAndRest);
  }

  words = words.trim();
  if (words === '') words = 'Zero';

  let result = 'Rupees ' + words;
  if (paise > 0) {
    result += ' and ' + convertTwoDigits(paise) + ' Paise Only';
  } else {
    result += ' Only';
  }

  if (isNegative) result = 'Minus ' + result;
  return result;
}

// Date format DD.MM.YYYY (exact match to image)
function formatDateDDMMYYYYDot(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateString;
}

// Date format DD-MM-YYYY (for tax invoice mode)
function formatDateDDMMYYYY(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateString;
}

function formatCurrency(num) {
  return Number(num || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatQty(num) {
  return Number(num || 0).toFixed(2);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

// =============================================================================
// 5. Calculations Engine
// =============================================================================
function calculateBillTotals() {
  let totalAmountSum = 0;
  let totalTaxableSum = 0;
  let totalCgstSum = 0;
  let totalSgstSum = 0;
  let totalIgstSum = 0;
  let grandTotalSum = 0;

  const autoRoundoff = currentInvoice.autoRoundoff !== false;

  currentInvoice.items.forEach(item => {
    const qty = parseFloat(item.qty) || 0;
    const rate = parseFloat(item.rate) || 0;
    const amount = item.amountOverride ? (parseFloat(item.amount) || 0) : (qty * rate);
    item.amount = amount;
    totalAmountSum += amount;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let rowTotal = amount;

    const taxType = item.taxType || 'none';

    if (taxType === 'none' || taxType === 'exempt') {
      cgst = 0;
      sgst = 0;
      igst = 0;
      // In the physical challan, rounded to integer .00
      rowTotal = autoRoundoff ? Math.round(amount) : amount;
    } else if (taxType === 'intra') {
      totalTaxableSum += amount;
      cgst = amount * 0.09;
      sgst = amount * 0.09;
      const combined = amount + cgst + sgst;
      rowTotal = autoRoundoff ? Math.round(combined) : combined;
    } else if (taxType === 'inter') {
      totalTaxableSum += amount;
      igst = amount * 0.18;
      const combined = amount + igst;
      rowTotal = autoRoundoff ? Math.round(combined) : combined;
    }

    item.cgst = cgst;
    item.sgst = sgst;
    item.igst = igst;
    item.totalAmount = rowTotal;

    totalCgstSum += cgst;
    totalSgstSum += sgst;
    totalIgstSum += igst;
    grandTotalSum += rowTotal;
  });

  // Material ledger totals (for Tax Invoice mode)
  let matTotalReceived = 0;
  if (currentInvoice.material && currentInvoice.material.receivedEntries) {
    currentInvoice.material.receivedEntries.forEach(entry => {
      matTotalReceived += (parseFloat(entry.qty) || 0);
    });
  } else {
    matTotalReceived = parseFloat(currentInvoice.material?.received) || 0;
  }

  const matOpening = parseFloat(currentInvoice.material?.opening) || 0;
  const matTotal = matOpening + matTotalReceived;
  const matDelivered = parseFloat(currentInvoice.material?.delivered) || 0;
  const matLoss = parseFloat(currentInvoice.material?.loss) || 0;
  const matReturned = parseFloat(currentInvoice.material?.returned) || 0;
  const matBalance = matTotal - matDelivered - matLoss - matReturned;

  return {
    totalAmountSum,
    totalTaxableSum,
    totalCgstSum,
    totalSgstSum,
    totalIgstSum,
    grandTotalSum,
    material: {
      opening: matOpening,
      received: matTotalReceived,
      total: matTotal,
      delivered: matDelivered,
      loss: matLoss,
      returned: matReturned,
      balance: matBalance
    }
  };
}

// =============================================================================
// 6. DOM Synchronization: Update View (Live Preview Sheet)
// =============================================================================
function renderInvoiceSheet() {
  const totals = calculateBillTotals();
  const isChallan = currentInvoice.templateType === 'challan';

  const sheetChallan = document.getElementById('sheet-challan');
  const sheetInvoice = document.getElementById('sheet-invoice');

  if (isChallan) {
    if (sheetChallan) sheetChallan.style.display = 'block';
    if (sheetInvoice) sheetInvoice.style.display = 'none';
    document.getElementById('active-document-title').textContent = 'JobWork Challan Preview (Exact A4 Replica)';
  } else {
    if (sheetChallan) sheetChallan.style.display = 'none';
    if (sheetInvoice) sheetInvoice.style.display = 'block';
    document.getElementById('active-document-title').textContent = 'Commercial Tax Invoice Preview (A4)';
  }

  // ---------------------------------------------------------------------------
  // A. RENDER JOBWORK CHALLAN (IMAGE SPECIFICATION)
  // ---------------------------------------------------------------------------
  if (sheetChallan) {
    // 1. Meta Row
    document.getElementById('view-ch-no').textContent = currentInvoice.challanNo || '21';
    document.getElementById('view-ch-date').textContent = formatDateDDMMYYYYDot(currentInvoice.challanDate || currentInvoice.invoiceDate);

    // 2. Buyer Details
    document.getElementById('view-ch-buyer-name').textContent = currentInvoice.buyer.name || 'M/s EVERSHINE SALES';
    document.getElementById('view-ch-buyer-addr1').textContent = currentInvoice.buyer.addr1 || '';
    document.getElementById('view-ch-buyer-addr2').textContent = currentInvoice.buyer.addr2 || '';
    document.getElementById('view-ch-buyer-gstin').textContent = currentInvoice.buyer.gstin || '';
    document.getElementById('view-ch-buyer-state').textContent = currentInvoice.buyer.state || 'U.P';
    document.getElementById('view-ch-buyer-code').textContent = currentInvoice.buyer.stateCode || '09';

    // 3. Right Box Notes
    const notesEl = document.getElementById('view-ch-notes-text');
    if (notesEl) {
      notesEl.textContent = currentInvoice.notes || '';
    }

    // 4. Line Items Table
    const tbody = document.getElementById('view-challan-tbody');
    tbody.innerHTML = '';

    currentInvoice.items.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.className = 'challan-data-row';
      const isNoneTax = item.taxType === 'none' || item.taxType === 'exempt';
      const cgstStr = isNoneTax ? '-' : Number(item.cgst || 0).toFixed(2);
      const sgstStr = isNoneTax ? '-' : Number(item.sgst || 0).toFixed(2);

      tr.innerHTML = `
        <td class="td-c-sno">${index + 1}</td>
        <td class="td-c-desc">${escapeHtml(item.particulars || '')}</td>
        <td class="td-c-qty">${formatQty(item.qty)}</td>
        <td class="td-c-unit">${item.unit || ''}</td>
        <td class="td-c-rate">${Number(item.rate || 0).toFixed(2)}</td>
        <td class="td-c-amount">${Number(item.amount || 0).toFixed(2)}</td>
        <td class="td-c-cgst" style="text-align: ${isNoneTax ? 'center' : 'right'}">${cgstStr}</td>
        <td class="td-c-sgst" style="text-align: ${isNoneTax ? 'center' : 'right'}">${sgstStr}</td>
        <td class="td-c-total">${Number(item.totalAmount || 0).toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
    });

    // Blank Spacer Rows to maintain authentic height (default 4 rows like image)
    const minRows = parseInt(currentInvoice.minRows) || 4;
    const blankNeeded = Math.max(0, minRows - currentInvoice.items.length);
    for (let i = 0; i < blankNeeded; i++) {
      const rowNum = currentInvoice.items.length + i + 1;
      const tr = document.createElement('tr');
      tr.className = 'challan-blank-row';
      tr.innerHTML = `
        <td class="td-c-sno">${rowNum}</td>
        <td class="td-c-desc">&nbsp;</td>
        <td class="td-c-qty">&nbsp;</td>
        <td class="td-c-unit">&nbsp;</td>
        <td class="td-c-rate">&nbsp;</td>
        <td class="td-c-amount">&nbsp;</td>
        <td class="td-c-cgst">&nbsp;</td>
        <td class="td-c-sgst">&nbsp;</td>
        <td class="td-c-total">&nbsp;</td>
      `;
      tbody.appendChild(tr);
    }

    // 5. Total Row
    document.getElementById('view-ch-total-amount').textContent = totals.totalAmountSum.toFixed(2);
    document.getElementById('view-ch-total-cgst').textContent = totals.totalCgstSum > 0 ? totals.totalCgstSum.toFixed(2) : '-';
    document.getElementById('view-ch-total-sgst').textContent = totals.totalSgstSum > 0 ? totals.totalSgstSum.toFixed(2) : '-';
    document.getElementById('view-ch-grand-total').textContent = totals.grandTotalSum.toFixed(2);

    // 6. Amount in Words
    const wordsText = currentInvoice.wordsOverride || numberToIndianWords(totals.grandTotalSum);
    document.getElementById('view-ch-words').textContent = wordsText;

    // 7. Stamp & Signature
    const stampEl = document.getElementById('view-ch-stamp');
    if (stampEl) {
      stampEl.style.display = currentInvoice.stamp?.show ? 'block' : 'none';
      stampEl.style.transform = `rotate(${currentInvoice.stamp?.rotation || -7}deg)`;
    }

    const sigEl = document.getElementById('view-ch-signature');
    const sigImg = document.getElementById('view-ch-sig-img');
    if (sigEl && sigImg) {
      if (currentInvoice.signature?.show && currentInvoice.signature?.dataUrl) {
        sigEl.style.display = 'block';
        sigImg.src = currentInvoice.signature.dataUrl;
        sigImg.style.display = 'block';
      } else {
        sigEl.style.display = 'none';
        sigImg.style.display = 'none';
      }
    }

    const captionEl = document.getElementById('view-ch-sign-caption');
    if (captionEl) {
      captionEl.textContent = currentInvoice.signature?.caption || FIXED_SELLER.signCaption;
    }
  }

  // ---------------------------------------------------------------------------
  // B. RENDER COMMERCIAL TAX INVOICE (SECOND MODE)
  // ---------------------------------------------------------------------------
  if (sheetInvoice && !isChallan) {
    document.getElementById('view-seller-name').textContent = FIXED_SELLER.name;
    document.getElementById('view-seller-address').textContent = 'AGRAWAL STREET, SHAKTI NAGAR, GULAR ROAD, ALIGARH 202001 (UP) - INDIA';
    document.getElementById('view-seller-mobile').textContent = FIXED_SELLER.mobile;
    document.getElementById('view-seller-gstin').textContent = FIXED_SELLER.gstin;
    document.getElementById('view-seller-statecode').textContent = FIXED_SELLER.stateCode;

    document.getElementById('view-inv-number').textContent = currentInvoice.invoiceNumber || currentInvoice.challanNo || '001';
    document.getElementById('view-inv-date').textContent = formatDateDDMMYYYY(currentInvoice.invoiceDate || currentInvoice.challanDate);
    document.getElementById('view-copy-type').textContent = currentInvoice.copyType || 'ORIGINAL';
    document.getElementById('view-inv-category').textContent = currentInvoice.category || 'JOB WORK';

    document.getElementById('view-buyer-name').textContent = currentInvoice.buyer.name || 'M/s EVERSHINE SALES';
    document.getElementById('view-buyer-addr1').textContent = currentInvoice.buyer.addr1 || '';
    document.getElementById('view-buyer-addr2').textContent = currentInvoice.buyer.addr2 || '';
    document.getElementById('view-buyer-city-pin').textContent = currentInvoice.buyer.cityPin || 'ALIGARH - 202001';
    document.getElementById('view-buyer-gstin').textContent = currentInvoice.buyer.gstin || '';
    document.getElementById('view-buyer-state').textContent = currentInvoice.buyer.state || 'UTTAR PRADESH';
    document.getElementById('view-buyer-statecode').textContent = currentInvoice.buyer.stateCode || '09';

    // Consignment
    document.getElementById('view-cons-transport').textContent = currentInvoice.consignment.transport || '';
    document.getElementById('view-cons-lr-no').textContent = currentInvoice.consignment.lrNo || '';
    document.getElementById('view-cons-veh-no').textContent = currentInvoice.consignment.vehNo || '';
    document.getElementById('view-cons-ewb-no').textContent = currentInvoice.consignment.ewbNo || '';
    document.getElementById('view-cons-place-supply').textContent = currentInvoice.consignment.placeOfSupply || 'ALIGARH (09)';
    document.getElementById('view-cons-no-cases').textContent = currentInvoice.consignment.noOfCases || '';
    document.getElementById('view-cons-reverse-charge').textContent = currentInvoice.consignment.reverseCharge || 'NO';
    document.getElementById('view-cons-weight').textContent = formatQty(currentInvoice.consignment.weight);
    document.getElementById('view-cons-freight').textContent = (currentInvoice.consignment.freight || 0).toString();

    // Table
    const invTbody = document.getElementById('view-items-tbody');
    invTbody.innerHTML = '';
    currentInvoice.items.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.className = 'item-data-row';
      tr.innerHTML = `
        <td class="cell-sno">${index + 1}</td>
        <td class="cell-particulars">${escapeHtml(item.particulars || '')}</td>
        <td class="cell-hsn">9988</td>
        <td class="cell-qty">${formatQty(item.qty)}</td>
        <td class="cell-rate">${Number(item.rate || 0).toFixed(2)}</td>
        <td class="cell-amount">${Number(item.amount || 0).toFixed(2)}</td>
      `;
      invTbody.appendChild(tr);
    });

    const blankNeeded = Math.max(0, 4 - currentInvoice.items.length);
    for (let i = 0; i < blankNeeded; i++) {
      const tr = document.createElement('tr');
      tr.className = 'blank-item-row';
      tr.innerHTML = `<td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>`;
      invTbody.appendChild(tr);
    }

    document.getElementById('view-total-taxable').textContent = totals.totalAmountSum.toFixed(2);
    document.getElementById('view-total-sgst').textContent = totals.totalSgstSum.toFixed(2);
    document.getElementById('view-total-cgst').textContent = totals.totalCgstSum.toFixed(2);
    document.getElementById('view-grand-total').textContent = totals.grandTotalSum.toFixed(2);
    document.getElementById('view-amount-in-words').textContent = currentInvoice.wordsOverride || numberToIndianWords(totals.grandTotalSum);

    // Tax Summary
    document.getElementById('view-sum-taxable').textContent = totals.totalTaxableSum.toFixed(2);
    document.getElementById('view-sum-sgst').textContent = totals.totalSgstSum.toFixed(2);
    document.getElementById('view-sum-cgst').textContent = totals.totalCgstSum.toFixed(2);
    document.getElementById('view-sum-total-gst').textContent = (totals.totalCgstSum + totals.totalSgstSum).toFixed(2);

    // Material Ledger
    const matContainer = document.getElementById('view-material-container');
    if (currentInvoice.material?.show) {
      matContainer.style.display = '';
      document.getElementById('view-mat-date').textContent = formatDateDDMMYYYY(currentInvoice.material.date);
      document.getElementById('view-mat-opening').textContent = formatQty(totals.material.opening);

      const rowsWrapper = document.getElementById('view-mat-received-rows-wrapper');
      if (rowsWrapper) {
        rowsWrapper.innerHTML = '';
        const entries = currentInvoice.material.receivedEntries || [];
        entries.forEach(entry => {
          const row = document.createElement('div');
          row.className = 'mat-row mat-row-received';
          const dt = entry.date ? formatDateDDMMYYYY(entry.date) + ' ' : '';
          const nt = entry.note ? ` (${entry.note})` : '';
          row.innerHTML = `<div class="mat-label">${dt}ZINC RAW MATERIAL RECEIVED${nt}</div><div class="mat-val">${formatQty(entry.qty)}</div>`;
          rowsWrapper.appendChild(row);
        });
      }

      document.getElementById('view-mat-total').textContent = formatQty(totals.material.total);
      document.getElementById('view-mat-delivered').textContent = formatQty(totals.material.delivered);
      document.getElementById('view-mat-loss').textContent = formatQty(totals.material.loss);
      document.getElementById('view-mat-returned').textContent = totals.material.returned > 0 ? formatQty(totals.material.returned) : '';
      document.getElementById('view-mat-balance').textContent = formatQty(totals.material.balance);
    } else {
      matContainer.style.display = 'none';
    }

    // Rubber stamp & Signature
    const stampElInv = document.getElementById('view-rubber-stamp');
    if (stampElInv) {
      stampElInv.style.display = currentInvoice.stamp?.show ? 'block' : 'none';
      stampElInv.style.transform = `rotate(${currentInvoice.stamp?.rotation || -7}deg)`;
    }
    const sigElInv = document.getElementById('view-seller-signature');
    const sigImgInv = document.getElementById('view-sig-img');
    if (sigElInv && sigImgInv) {
      if (currentInvoice.signature?.show && currentInvoice.signature?.dataUrl) {
        sigElInv.style.display = 'block';
        sigImgInv.src = currentInvoice.signature.dataUrl;
        sigImgInv.style.display = 'block';
      } else {
        sigElInv.style.display = 'none';
        sigImgInv.style.display = 'none';
      }
    }
  }

  // Quick total in footer
  document.getElementById('quick-total-display').textContent = 'Rs. ' + totals.grandTotalSum.toFixed(2);
}

// =============================================================================
// 7. DOM Synchronization: Update Editor Fields from State
// =============================================================================
function populateEditorFields() {
  const isChallan = currentInvoice.templateType === 'challan';

  // Template switch buttons
  const btnChallan = document.getElementById('btn-tmpl-challan');
  const btnInvoice = document.getElementById('btn-tmpl-invoice');
  if (btnChallan && btnInvoice) {
    if (isChallan) {
      btnChallan.classList.add('active');
      btnInvoice.classList.remove('active');
    } else {
      btnInvoice.classList.add('active');
      btnChallan.classList.remove('active');
    }
  }

  // Mode indicators
  const indicator = document.getElementById('tmpl-mode-indicator');
  if (indicator) {
    indicator.textContent = isChallan ? 'JobWork Mode' : 'Tax Invoice Mode';
  }

  const lblInv = document.getElementById('lbl-inv-number');
  if (lblInv) {
    lblInv.textContent = isChallan ? 'Ch. No. *' : 'Invoice No. *';
  }

  const tabMetaLabel = document.getElementById('tab-label-meta');
  if (tabMetaLabel) {
    tabMetaLabel.textContent = isChallan ? 'Challan Info' : 'Invoice Info';
  }

  // Meta inputs
  document.getElementById('inv-number').value = isChallan ? (currentInvoice.challanNo || '21') : (currentInvoice.invoiceNumber || '001');
  document.getElementById('inv-date').value = currentInvoice.challanDate || currentInvoice.invoiceDate || '2026-09-30';
  document.getElementById('date-display-hint').innerHTML = `Displays as: <strong>${formatDateDDMMYYYYDot(document.getElementById('inv-date').value)}</strong>`;

  // Notes
  const notesInput = document.getElementById('challan-notes-input');
  if (notesInput) {
    notesInput.value = currentInvoice.notes || '';
  }

  // Buyer Details
  document.getElementById('buyer-name').value = currentInvoice.buyer.name || '';
  document.getElementById('buyer-addr1').value = currentInvoice.buyer.addr1 || '';
  document.getElementById('buyer-addr2').value = currentInvoice.buyer.addr2 || '';
  document.getElementById('buyer-gstin').value = currentInvoice.buyer.gstin || '';
  document.getElementById('buyer-state').value = currentInvoice.buyer.state || '';
  document.getElementById('buyer-state-code').value = currentInvoice.buyer.stateCode || '';

  // Settings
  const minRowsInput = document.getElementById('setting-min-rows');
  if (minRowsInput) minRowsInput.value = currentInvoice.minRows || 4;

  const roundoffToggle = document.getElementById('toggle-roundoff');
  if (roundoffToggle) roundoffToggle.checked = currentInvoice.autoRoundoff !== false;

  const wordsOverride = document.getElementById('words-override-input');
  if (wordsOverride) wordsOverride.value = currentInvoice.wordsOverride || '';

  // Stamp & Sign
  const toggleStamp = document.getElementById('toggle-stamp');
  if (toggleStamp) toggleStamp.checked = currentInvoice.stamp?.show !== false;

  const stampColor = document.getElementById('stamp-color');
  if (stampColor) stampColor.value = currentInvoice.stamp?.color || '#1d4ed8';

  const stampRot = document.getElementById('stamp-rotation');
  if (stampRot) stampRot.value = currentInvoice.stamp?.rotation || -7;

  const toggleSig = document.getElementById('toggle-signature');
  if (toggleSig) toggleSig.checked = currentInvoice.signature?.show !== false;

  const signCaption = document.getElementById('sign-caption-input');
  if (signCaption) signCaption.value = currentInvoice.signature?.caption || 'Authorised Signatury';

  // Render dynamic items editor
  renderItemEditorCards();
  renderInvoiceSheet();
}

// =============================================================================
// 8. Product Items Editor Rendering
// =============================================================================
function renderItemEditorCards() {
  const container = document.getElementById('items-editor-container');
  if (!container) return;

  container.innerHTML = '';
  document.getElementById('items-badge-count').textContent = currentInvoice.items.length;

  currentInvoice.items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'item-edit-card';
    card.dataset.index = index;

    const amount = Number(item.amount || 0).toFixed(2);
    const totalAmount = Number(item.totalAmount || 0).toFixed(2);
    const taxType = item.taxType || 'none';

    card.innerHTML = `
      <div class="item-edit-header">
        <span class="item-edit-title">Product / Item #${index + 1}</span>
        <div class="flex-align-gap">
          <button type="button" class="btn btn-sm btn-ghost btn-dup-item" data-index="${index}" title="Duplicate this item">Duplicate</button>
          ${currentInvoice.items.length > 1 ? `<button type="button" class="btn-del-item" data-index="${index}">Delete Row</button>` : ''}
        </div>
      </div>

      <!-- Description Textarea (Multi-line support) -->
      <div class="form-group">
        <label>Description (Multi-line formatted text) *</label>
        <textarea class="form-control item-particulars" rows="2" placeholder="e.g. Production/Processing : -&#10;RECIECVED ZINC SCRAP 23-09-2026&#10;CHALLAN NO. 003">${item.particulars || ''}</textarea>
      </div>

      <div class="form-row">
        <div class="form-group flex-1">
          <label>Weight / QTY *</label>
          <input type="number" step="0.01" class="form-control item-qty font-bold" value="${item.qty !== undefined ? item.qty : ''}" placeholder="405.35" required>
        </div>
        <div class="form-group" style="width: 90px;">
          <label>Unit</label>
          <input type="text" class="form-control item-unit" value="${item.unit || 'Kgs'}" placeholder="Kgs">
        </div>
        <div class="form-group flex-1">
          <label>Rate (Rs.) *</label>
          <input type="number" step="0.01" class="form-control item-rate" value="${item.rate !== undefined ? item.rate : ''}" placeholder="305.00" required>
        </div>
      </div>

      <div class="form-row align-center">
        <div class="form-group flex-2">
          <label>GST Tax Treatment</label>
          <select class="form-control item-tax-type">
            <option value="none" ${taxType === 'none' ? 'selected' : ''}>Non-Taxable / Scrap Movement (Nil / '-')</option>
            <option value="intra" ${taxType === 'intra' ? 'selected' : ''}>Job Work GST 18% (9% CGST + 9% SGST)</option>
            <option value="inter" ${taxType === 'inter' ? 'selected' : ''}>Inter-State IGST 18%</option>
          </select>
        </div>
        <div class="form-group flex-1">
          <label class="small-label">Calculated Amount</label>
          <div class="font-bold text-muted" style="font-size:0.85rem; padding-top:6px;">₹${amount}</div>
        </div>
        <div class="form-group flex-1">
          <label class="small-label">Row Total</label>
          <div class="font-bold" style="font-size:0.85rem; padding-top:6px; color:var(--primary);">₹${totalAmount}</div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  // Attach event listeners to item inputs
  container.querySelectorAll('.item-particulars').forEach((textarea, idx) => {
    textarea.addEventListener('input', (e) => {
      currentInvoice.items[idx].particulars = e.target.value;
      renderInvoiceSheet();
    });
  });

  container.querySelectorAll('.item-qty').forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      currentInvoice.items[idx].qty = parseFloat(e.target.value) || 0;
      renderInvoiceSheet();
      updateCardComputedValues(idx);
    });
  });

  container.querySelectorAll('.item-unit').forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      currentInvoice.items[idx].unit = e.target.value;
      renderInvoiceSheet();
    });
  });

  container.querySelectorAll('.item-rate').forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      currentInvoice.items[idx].rate = parseFloat(e.target.value) || 0;
      renderInvoiceSheet();
      updateCardComputedValues(idx);
    });
  });

  container.querySelectorAll('.item-tax-type').forEach((select, idx) => {
    select.addEventListener('change', (e) => {
      currentInvoice.items[idx].taxType = e.target.value;
      renderInvoiceSheet();
      updateCardComputedValues(idx);
    });
  });

  container.querySelectorAll('.btn-del-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      currentInvoice.items.splice(idx, 1);
      renderItemEditorCards();
      renderInvoiceSheet();
      showToast('Item row removed', 'toast-info');
    });
  });

  container.querySelectorAll('.btn-dup-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      const cloned = JSON.parse(JSON.stringify(currentInvoice.items[idx]));
      cloned.id = 'item-' + Date.now();
      currentInvoice.items.splice(idx + 1, 0, cloned);
      renderItemEditorCards();
      renderInvoiceSheet();
      showToast('Item duplicated', 'toast-success');
    });
  });
}

function updateCardComputedValues(idx) {
  const card = document.querySelector(`.item-edit-card[data-index="${idx}"]`);
  if (!card) return;
  const item = currentInvoice.items[idx];
  if (!item) return;

  calculateBillTotals();
  const amountDiv = card.querySelectorAll('.font-bold')[0];
  const totalDiv = card.querySelectorAll('.font-bold')[1];
  if (amountDiv) amountDiv.textContent = '₹' + Number(item.amount || 0).toFixed(2);
  if (totalDiv) totalDiv.textContent = '₹' + Number(item.totalAmount || 0).toFixed(2);
}

// =============================================================================
// 9. Buyer Directory & Saved Database
// =============================================================================
function getSavedBuyers() {
  const saved = localStorage.getItem('sk_saved_buyers');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return DEFAULT_BUYERS;
}

function saveBuyers(list) {
  localStorage.setItem('sk_saved_buyers', JSON.stringify(list));
  populateBuyerSelector();
  updateBuyerCountBadge();
}

function populateBuyerSelector() {
  const select = document.getElementById('select-saved-buyer');
  if (!select) return;

  const buyers = getSavedBuyers();
  select.innerHTML = '<option value="">-- Choose Existing Buyer --</option>';

  buyers.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.id || b.name;
    opt.textContent = `${b.name} (${b.cityPin || b.state || ''})`;
    select.appendChild(opt);
  });
}

function updateBuyerCountBadge() {
  const count = getSavedBuyers().length;
  const el1 = document.getElementById('buyer-count');
  const el2 = document.getElementById('modal-buyer-count');
  if (el1) el1.textContent = count;
  if (el2) el2.textContent = `${count} Buyers`;
}

function getSavedInvoices() {
  const saved = localStorage.getItem('sk_saved_invoices');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [];
}

function saveInvoicesToDb(list) {
  localStorage.setItem('sk_saved_invoices', JSON.stringify(list));
  updateSavedInvoiceCount();
}

function updateSavedInvoiceCount() {
  const count = getSavedInvoices().length;
  const el1 = document.getElementById('saved-count');
  const el2 = document.getElementById('modal-invoice-count');
  if (el1) el1.textContent = count;
  if (el2) el2.textContent = `${count} Bills`;
}

function saveCurrentBillToDb() {
  const totals = calculateBillTotals();
  const isChallan = currentInvoice.templateType === 'challan';
  const docNo = isChallan ? (currentInvoice.challanNo || '21') : (currentInvoice.invoiceNumber || '001');
  const docDate = isChallan ? currentInvoice.challanDate : currentInvoice.invoiceDate;

  const record = {
    id: 'bill-' + Date.now(),
    templateType: currentInvoice.templateType || 'challan',
    docNo: docNo,
    docDate: docDate,
    buyerName: currentInvoice.buyer.name || 'M/s EVERSHINE SALES',
    buyerGstin: currentInvoice.buyer.gstin || '',
    grandTotal: totals.grandTotalSum,
    savedAt: new Date().toISOString(),
    data: JSON.parse(JSON.stringify(currentInvoice))
  };

  const list = getSavedInvoices();
  // Check if updating existing
  const existingIdx = list.findIndex(item => item.docNo === docNo && item.templateType === record.templateType);
  if (existingIdx >= 0) {
    list[existingIdx] = record;
  } else {
    list.unshift(record);
  }

  saveInvoicesToDb(list);
  showToast(`Saved Bill #${docNo} for ${record.buyerName}`, 'toast-success');
}

function updateSavedInvoicesModal(searchQuery = '') {
  const container = document.getElementById('saved-invoices-list');
  if (!container) return;

  const list = getSavedInvoices();
  const q = searchQuery.toLowerCase().trim();

  const filtered = list.filter(item => {
    return (item.docNo && item.docNo.toLowerCase().includes(q)) ||
           (item.buyerName && item.buyerName.toLowerCase().includes(q)) ||
           (item.docDate && item.docDate.includes(q));
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state-card">No bills found in database. Click "Save Bill" to store invoices.</div>`;
    return;
  }

  container.innerHTML = '';
  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'saved-inv-card';
    const isChallan = item.templateType === 'challan';
    card.innerHTML = `
      <div class="saved-inv-info">
        <div class="saved-inv-title-row">
          <strong class="saved-inv-num">${isChallan ? 'Challan #' : 'Invoice #'}${item.docNo}</strong>
          <span class="badge-tmpl-tag">${isChallan ? 'JobWork Challan' : 'Tax Invoice'}</span>
          <span class="saved-inv-date">${formatDateDDMMYYYYDot(item.docDate)}</span>
        </div>
        <div class="saved-inv-buyer">${escapeHtml(item.buyerName)}</div>
        <div class="saved-inv-meta">GSTIN: ${escapeHtml(item.buyerGstin || 'N/A')}</div>
      </div>
      <div class="saved-inv-actions">
        <strong class="saved-inv-amount">₹${Number(item.grandTotal || 0).toFixed(2)}</strong>
        <div class="btn-group-row">
          <button type="button" class="btn btn-sm btn-primary btn-load-saved" data-id="${item.id}">Load</button>
          <button type="button" class="btn btn-sm btn-outline btn-pdf-saved" data-id="${item.id}">PDF</button>
          <button type="button" class="btn btn-sm btn-ghost btn-del-saved text-danger" data-id="${item.id}">Delete</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Attach actions
  container.querySelectorAll('.btn-load-saved').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const found = list.find(it => it.id === id);
      if (found && found.data) {
        currentInvoice = JSON.parse(JSON.stringify(found.data));
        populateEditorFields();
        document.getElementById('modal-saved-invoices').close();
        showToast(`Loaded Bill #${found.docNo}`, 'toast-success');
      }
    });
  });

  container.querySelectorAll('.btn-pdf-saved').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const found = list.find(it => it.id === id);
      if (found && found.data) {
        exportSingleInvoiceToPdf(found.data, found.docNo, found.buyerName);
      }
    });
  });

  container.querySelectorAll('.btn-del-saved').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const updated = list.filter(it => it.id !== id);
      saveInvoicesToDb(updated);
      updateSavedInvoicesModal(searchQuery);
      showToast('Bill removed from database', 'toast-info');
    });
  });
}

function updateBuyerDirectoryModal() {
  const container = document.getElementById('buyer-directory-list');
  if (!container) return;

  const buyers = getSavedBuyers();
  if (buyers.length === 0) {
    container.innerHTML = `<div class="empty-state-card">No saved buyers. Click "Save Buyer" on the main screen to add.</div>`;
    return;
  }

  container.innerHTML = '';
  buyers.forEach(b => {
    const card = document.createElement('div');
    card.className = 'saved-inv-card';
    card.innerHTML = `
      <div class="saved-inv-info">
        <strong>${escapeHtml(b.name)}</strong>
        <div class="saved-inv-meta">${escapeHtml(b.addr1 || '')} ${escapeHtml(b.addr2 || '')}</div>
        <div class="saved-inv-meta">GSTIN: <strong>${escapeHtml(b.gstin || '')}</strong> • State: ${escapeHtml(b.state || '')} (${escapeHtml(b.stateCode || '')})</div>
      </div>
      <div class="saved-inv-actions">
        <button type="button" class="btn btn-sm btn-primary btn-apply-buyer" data-id="${b.id}">Select</button>
        <button type="button" class="btn btn-sm btn-ghost btn-del-buyer text-danger" data-id="${b.id}">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.btn-apply-buyer').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const found = buyers.find(it => it.id === id);
      if (found) {
        currentInvoice.buyer = JSON.parse(JSON.stringify(found));
        populateEditorFields();
        document.getElementById('modal-buyer-directory').close();
        showToast(`Loaded ${found.name}`, 'toast-success');
      }
    });
  });

  container.querySelectorAll('.btn-del-buyer').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const updated = buyers.filter(it => it.id !== id);
      saveBuyers(updated);
      updateBuyerDirectoryModal();
      showToast('Buyer removed', 'toast-info');
    });
  });
}

// =============================================================================
// 10. PDF & ZIP Export Functions (html2pdf + JSZip)
// =============================================================================
async function exportSingleInvoiceToPdf(invoiceData, docNum, buyerName) {
  if (typeof html2pdf === 'undefined') {
    showToast('PDF engine is loading. Please try again.', 'toast-error');
    return;
  }

  const backupInvoice = JSON.parse(JSON.stringify(currentInvoice));
  currentInvoice = JSON.parse(JSON.stringify(invoiceData || currentInvoice));
  renderInvoiceSheet();

  const isChallan = currentInvoice.templateType === 'challan';
  const sheet = isChallan ? document.getElementById('sheet-challan') : document.getElementById('sheet-invoice');
  const originalTransform = sheet.style.transform;
  sheet.style.transform = 'scale(1)';

  showToast(`Generating PDF for #${docNum}...`, 'toast-info');

  try {
    await new Promise(resolve => setTimeout(resolve, 80));

    const safeBuyer = (buyerName || 'Buyer').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
    const filename = `${isChallan ? 'JobWork_Challan' : 'Tax_Invoice'}_${docNum || '21'}_${safeBuyer}.pdf`;

    const opt = {
      margin: [6, 6, 6, 6],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0, scrollX: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(opt).from(sheet).save();
    showToast(`Downloaded ${filename}`, 'toast-success');
  } catch (err) {
    console.error('Error generating PDF:', err);
    showToast('Failed to generate PDF.', 'toast-error');
  } finally {
    currentInvoice = backupInvoice;
    populateEditorFields();
    renderInvoiceSheet();
    sheet.style.transform = originalTransform;
  }
}

async function exportAllInvoicesToZip() {
  if (typeof JSZip === 'undefined' || typeof html2pdf === 'undefined') {
    showToast('Export libraries are loading. Please try again.', 'toast-error');
    return;
  }

  let invoices = getSavedInvoices();
  if (!invoices || invoices.length === 0) {
    const totals = calculateBillTotals();
    const isChallan = currentInvoice.templateType === 'challan';
    invoices = [{
      id: 'current-bill',
      templateType: currentInvoice.templateType || 'challan',
      docNo: isChallan ? (currentInvoice.challanNo || '21') : (currentInvoice.invoiceNumber || '001'),
      docDate: isChallan ? currentInvoice.challanDate : currentInvoice.invoiceDate,
      buyerName: currentInvoice.buyer.name || 'M/s EVERSHINE SALES',
      grandTotal: totals.grandTotalSum,
      data: JSON.parse(JSON.stringify(currentInvoice))
    }];
  }

  const savedModal = document.getElementById('modal-saved-invoices');
  if (savedModal && savedModal.open) savedModal.close();

  const progressModal = document.getElementById('modal-export-progress');
  const progressTitle = document.getElementById('export-progress-title');
  const progressDetail = document.getElementById('export-progress-detail');
  const progressBar = document.getElementById('export-progress-bar');
  const progressPercent = document.getElementById('export-progress-percent');
  const progressFooter = document.getElementById('export-progress-footer');
  const spinnerWrapper = document.querySelector('.export-spinner-wrapper');

  progressFooter.style.display = 'none';
  spinnerWrapper.style.display = 'block';
  progressTitle.textContent = 'Preparing Bills for Export...';
  progressDetail.textContent = `Converting ${invoices.length} bill(s) into A4 PDF files...`;
  progressBar.style.width = '0%';
  progressPercent.textContent = '0%';
  progressModal.showModal();

  const backupInvoice = JSON.parse(JSON.stringify(currentInvoice));
  const zip = new JSZip();
  const folder = zip.folder("SK_Enterprises_Bills");

  try {
    for (let i = 0; i < invoices.length; i++) {
      const inv = invoices[i];
      const isChallan = (inv.templateType || inv.data?.templateType) === 'challan';
      currentInvoice = JSON.parse(JSON.stringify(inv.data || currentInvoice));
      renderInvoiceSheet();

      const sheet = isChallan ? document.getElementById('sheet-challan') : document.getElementById('sheet-invoice');
      const originalTransform = sheet.style.transform;
      sheet.style.transform = 'scale(1)';

      const percent = Math.round(((i + 1) / invoices.length) * 100);
      progressTitle.textContent = `Converting Bill ${i + 1} of ${invoices.length}...`;
      progressDetail.textContent = `#${inv.docNo} - ${inv.buyerName}`;
      progressBar.style.width = `${percent}%`;
      progressPercent.textContent = `${percent}%`;

      await new Promise(resolve => setTimeout(resolve, 100));

      const safeBuyer = (inv.buyerName || 'Customer').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
      const pdfFileName = `${isChallan ? 'Challan' : 'Invoice'}_${inv.docNo}_${safeBuyer}.pdf`;

      const opt = {
        margin: [6, 6, 6, 6],
        filename: pdfFileName,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 1.8, useCORS: true, letterRendering: true, scrollY: 0, scrollX: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const pdfBlob = await html2pdf().set(opt).from(sheet).outputPdf('blob');
      folder.file(pdfFileName, pdfBlob);
      sheet.style.transform = originalTransform;
    }

    progressTitle.textContent = 'Compressing into ZIP...';
    progressDetail.textContent = 'Finalizing packaging...';

    const zipContent = await zip.generateAsync({ type: "blob" });
    const now = new Date().toISOString().slice(0, 10);
    const zipName = `SK_Enterprises_Bills_${now}.zip`;

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(zipContent);
    downloadLink.download = zipName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);

    progressTitle.textContent = '✓ Export Complete!';
    progressDetail.textContent = `Downloaded ${invoices.length} bill(s) in ${zipName}`;
    progressBar.style.width = '100%';
    progressPercent.textContent = '100%';
    spinnerWrapper.style.display = 'none';
    progressFooter.style.display = 'flex';

    showToast(`Successfully exported ${invoices.length} bills in ZIP!`, 'toast-success');
  } catch (err) {
    console.error('ZIP Export error:', err);
    progressTitle.textContent = 'Export Encountered an Error';
    progressDetail.textContent = err.message || 'Error converting bills to PDF.';
    spinnerWrapper.style.display = 'none';
    progressFooter.style.display = 'flex';
    showToast('Failed to export ZIP.', 'toast-error');
  } finally {
    currentInvoice = backupInvoice;
    populateEditorFields();
    renderInvoiceSheet();
  }
}

// =============================================================================
// 11. Signature Canvas & Pad Engine
// =============================================================================
let signatureCtx = null;
let signatureCanvas = null;

function initSignaturePad() {
  const canvas = document.getElementById('signature-pad');
  if (!canvas) return;

  signatureCanvas = canvas;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  signatureCtx = ctx;

  let isDrawing = false;
  let currentColor = '#1d4ed8';
  let currentLineWidth = 3.5;

  canvas.width = 600;
  canvas.height = 200;

  function updateContextStyle() {
    ctx.lineWidth = currentLineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;
  }
  updateContextStyle();

  function getCanvasPoint(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width ? (canvas.width / rect.width) : 1;
    const scaleY = rect.height ? (canvas.height / rect.height) : 1;
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function startDraw(e) {
    isDrawing = true;
    updateContextStyle();
    const pt = getCanvasPoint(e);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    const hint = document.getElementById('signature-hint');
    if (hint) hint.style.display = 'none';
    const status = document.getElementById('sig-status-badge');
    if (status) status.textContent = 'Drawing...';
  }

  function moveDraw(e) {
    if (!isDrawing) return;
    const pt = getCanvasPoint(e);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  }

  function endDraw() {
    if (!isDrawing) return;
    isDrawing = false;
    const dataUrl = canvas.toDataURL('image/png');
    currentInvoice.signature.dataUrl = dataUrl;
    currentInvoice.signature.show = true;
    const toggleSig = document.getElementById('toggle-signature');
    if (toggleSig) toggleSig.checked = true;
    const status = document.getElementById('sig-status-badge');
    if (status) status.textContent = '✓ Signature synced to bill';
    renderInvoiceSheet();
  }

  canvas.addEventListener('pointerdown', (e) => {
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    startDraw(e);
  });
  canvas.addEventListener('pointermove', moveDraw);
  canvas.addEventListener('pointerup', (e) => {
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    endDraw();
  });
  canvas.addEventListener('pointercancel', (e) => {
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    endDraw();
  });

  // Pen color picker
  document.querySelectorAll('.pen-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      document.querySelectorAll('.pen-dot').forEach(d => d.classList.remove('active'));
      e.target.classList.add('active');
      currentColor = e.target.dataset.color || '#1d4ed8';
      updateContextStyle();
    });
  });

  // Clear canvas
  document.getElementById('btn-clear-sig')?.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const hint = document.getElementById('signature-hint');
    if (hint) hint.style.display = 'block';
    const status = document.getElementById('sig-status-badge');
    if (status) status.textContent = 'Canvas cleared';
  });

  // Mode tabs: Draw, Type, Upload, Preset
  document.querySelectorAll('.btn-sig-mode').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mode = e.target.dataset.sigMode;
      if (!mode) return;

      document.querySelectorAll('.btn-sig-mode').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      document.getElementById('sig-mode-draw-panel').style.display = mode === 'draw' ? 'block' : 'none';
      document.getElementById('sig-mode-type-panel').style.display = mode === 'type' ? 'block' : 'none';
      document.getElementById('sig-mode-upload-panel').style.display = mode === 'upload' ? 'block' : 'none';
    });
  });

  // Type name generator
  const typedInput = document.getElementById('typed-sig-input');
  const typedDisplay = document.getElementById('typed-signature-display');
  if (typedInput && typedDisplay) {
    typedInput.addEventListener('input', (e) => {
      const val = e.target.value || 'SK Enterprises';
      typedDisplay.textContent = val;
      generateTypedSignatureDataUrl(val);
    });
  }

  // SK Preset button
  document.getElementById('btn-sig-preset')?.addEventListener('click', () => {
    currentInvoice.signature.dataUrl = DEFAULT_PARTNER_SIGNATURE_DATAURL;
    currentInvoice.signature.show = true;
    document.getElementById('toggle-signature').checked = true;
    renderInvoiceSheet();
    showToast('Applied SK Enterprises Partner signature preset', 'toast-success');
  });

  // File upload
  const fileInput = document.getElementById('input-sign-file');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        currentInvoice.signature.dataUrl = evt.target.result;
        currentInvoice.signature.show = true;
        document.getElementById('toggle-signature').checked = true;
        renderInvoiceSheet();
        showToast('Uploaded custom signature image', 'toast-success');
      };
      reader.readAsDataURL(file);
    });
  }
}

function generateTypedSignatureDataUrl(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "bold 44px 'Caveat', 'Dancing Script', cursive, sans-serif";
  ctx.fillStyle = "#1d4ed8";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 20, 60);

  // Underline stroke
  ctx.strokeStyle = "#1d4ed8";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(18, 90);
  ctx.quadraticCurveTo(200, 84, 380, 88);
  ctx.stroke();

  currentInvoice.signature.dataUrl = canvas.toDataURL('image/png');
  currentInvoice.signature.show = true;
  document.getElementById('toggle-signature').checked = true;
  renderInvoiceSheet();
}

// =============================================================================
// 12. Toast Notification Helper
// =============================================================================
function showToast(message, type = 'toast-info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// =============================================================================
// 13. Application Initialization & Event Wiring
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {

  // 1. Template Switcher: JobWork Challan (Default) vs Commercial Tax Invoice
  document.getElementById('btn-tmpl-challan')?.addEventListener('click', () => {
    currentInvoice.templateType = 'challan';
    populateEditorFields();
    showToast('Switched to JobWork Challan format (Image Match)', 'toast-success');
  });

  document.getElementById('btn-tmpl-invoice')?.addEventListener('click', () => {
    currentInvoice.templateType = 'invoice';
    populateEditorFields();
    showToast('Switched to Commercial GST Tax Invoice format', 'toast-info');
  });

  // 2. Load Original Bill (From Image)
  document.getElementById('btn-load-sample')?.addEventListener('click', () => {
    currentInvoice = JSON.parse(JSON.stringify(IMAGE_SAMPLE_CHALLAN));
    populateEditorFields();
    showToast('Loaded authentic JobWork Challan from photograph!', 'toast-success');
  });

  // 3. New Bill (+1 auto-increment)
  document.getElementById('btn-new-bill')?.addEventListener('click', () => {
    const isChallan = currentInvoice.templateType === 'challan';
    const currentNum = parseInt(isChallan ? currentInvoice.challanNo : currentInvoice.invoiceNumber) || 21;
    const nextNum = (currentNum + 1).toString();

    if (isChallan) {
      currentInvoice.challanNo = nextNum;
    } else {
      currentInvoice.invoiceNumber = nextNum;
    }

    currentInvoice.challanDate = '2026-09-30';
    currentInvoice.invoiceDate = '2026-09-30';
    currentInvoice.items = [
      {
        id: 'item-' + Date.now(),
        particulars: 'ISSUED JOBWORK',
        qty: 405.35,
        unit: 'KGS',
        rate: 70.00,
        taxType: 'intra',
        amount: 28374.50,
        cgst: 2553.71,
        sgst: 2553.71,
        totalAmount: 33482.00
      }
    ];

    populateEditorFields();
    showToast(`Created New Bill #${nextNum}. Seller remains fixed.`, 'toast-success');
  });

  // 4. Save Bill to Local Storage
  document.getElementById('btn-save-bill')?.addEventListener('click', () => {
    saveCurrentBillToDb();
  });

  // 5. History Modal
  document.getElementById('btn-history')?.addEventListener('click', () => {
    updateSavedInvoicesModal();
    document.getElementById('modal-saved-invoices').showModal();
  });
  document.getElementById('btn-close-saved-modal')?.addEventListener('click', () => {
    document.getElementById('modal-saved-invoices').close();
  });
  document.getElementById('btn-close-saved-modal-2')?.addEventListener('click', () => {
    document.getElementById('modal-saved-invoices').close();
  });
  document.getElementById('input-search-saved')?.addEventListener('input', (e) => {
    updateSavedInvoicesModal(e.target.value);
  });

  // 6. Buyer Directory Modal
  document.getElementById('btn-buyer-directory')?.addEventListener('click', () => {
    updateBuyerDirectoryModal();
    document.getElementById('modal-buyer-directory').showModal();
  });
  document.getElementById('btn-close-buyer-modal')?.addEventListener('click', () => {
    document.getElementById('modal-buyer-directory').close();
  });
  document.getElementById('btn-close-buyer-modal-2')?.addEventListener('click', () => {
    document.getElementById('modal-buyer-directory').close();
  });

  // 7. Save Current Buyer
  document.getElementById('btn-save-current-buyer')?.addEventListener('click', () => {
    const name = document.getElementById('buyer-name').value.trim();
    if (!name) {
      showToast('Please enter a buyer name to save.', 'toast-error');
      return;
    }
    const buyers = getSavedBuyers();
    const newBuyer = {
      id: 'buyer-' + Date.now(),
      name: name,
      addr1: document.getElementById('buyer-addr1').value.trim(),
      addr2: document.getElementById('buyer-addr2').value.trim(),
      cityPin: document.getElementById('buyer-city-pin')?.value.trim() || 'ALIGARH - 202001',
      gstin: document.getElementById('buyer-gstin').value.trim(),
      state: document.getElementById('buyer-state').value.trim() || 'U.P',
      stateCode: document.getElementById('buyer-state-code').value.trim() || '09'
    };
    buyers.unshift(newBuyer);
    saveBuyers(buyers);
    showToast(`Saved ${name} to buyer directory!`, 'toast-success');
  });

  // 8. Quick Select Buyer Dropdown
  document.getElementById('select-saved-buyer')?.addEventListener('change', (e) => {
    const id = e.target.value;
    if (!id) return;
    const buyers = getSavedBuyers();
    const found = buyers.find(b => b.id === id || b.name === id);
    if (found) {
      currentInvoice.buyer = JSON.parse(JSON.stringify(found));
      populateEditorFields();
      showToast(`Selected buyer: ${found.name}`, 'toast-info');
    }
  });

  // 9. Clear & Reset Buyer Buttons
  document.getElementById('btn-clear-buyer')?.addEventListener('click', () => {
    currentInvoice.buyer = { name: '', addr1: '', addr2: '', cityPin: '', gstin: '', state: '', stateCode: '' };
    populateEditorFields();
  });
  document.getElementById('btn-sample-buyer')?.addEventListener('click', () => {
    currentInvoice.buyer = JSON.parse(JSON.stringify(IMAGE_SAMPLE_CHALLAN.buyer));
    populateEditorFields();
    showToast('Reset buyer to Evershine Sales', 'toast-info');
  });

  // 10. Direct PDF Downloads & Prints
  document.getElementById('btn-print')?.addEventListener('click', () => window.print());
  document.getElementById('btn-quick-print')?.addEventListener('click', () => window.print());

  document.getElementById('btn-download-pdf-top')?.addEventListener('click', () => {
    const docNo = currentInvoice.templateType === 'challan' ? currentInvoice.challanNo : currentInvoice.invoiceNumber;
    exportSingleInvoiceToPdf(currentInvoice, docNo, currentInvoice.buyer.name);
  });
  document.getElementById('btn-download-pdf-preview')?.addEventListener('click', () => {
    const docNo = currentInvoice.templateType === 'challan' ? currentInvoice.challanNo : currentInvoice.invoiceNumber;
    exportSingleInvoiceToPdf(currentInvoice, docNo, currentInvoice.buyer.name);
  });

  // 11. Bulk Export ZIP (PDFs)
  document.getElementById('btn-export-zip-top')?.addEventListener('click', exportAllInvoicesToZip);
  document.getElementById('btn-export-all-zip-pdf')?.addEventListener('click', exportAllInvoicesToZip);
  document.getElementById('btn-close-progress-modal')?.addEventListener('click', () => {
    document.getElementById('modal-export-progress').close();
  });

  // 12. Add Product Row Button
  document.getElementById('btn-add-item')?.addEventListener('click', () => {
    currentInvoice.items.push({
      id: 'item-' + Date.now(),
      particulars: 'ZINC JOB WORK CHARGES',
      qty: 405.35,
      unit: 'KGS',
      rate: 70.00,
      taxType: 'intra',
      amount: 28374.50,
      cgst: 2553.71,
      sgst: 2553.71,
      totalAmount: 33482.00
    });
    renderItemEditorCards();
    renderInvoiceSheet();
    showToast('Added product row', 'toast-success');
  });

  // 13. Presets Chips
  document.getElementById('chip-zinc-scrap')?.addEventListener('click', () => {
    currentInvoice.items.push({
      id: 'item-' + Date.now(),
      particulars: 'Production/Processing : -\nRECIECVED ZINC SCRAP 23-09-2026\nCHALLAN NO. 003',
      qty: 405.35,
      unit: 'Kgs',
      rate: 305.00,
      taxType: 'none',
      amount: 123631.75,
      cgst: 0,
      sgst: 0,
      totalAmount: 123632.00
    });
    renderItemEditorCards();
    renderInvoiceSheet();
    showToast('Added Zinc Scrap Received preset (Nil Tax)', 'toast-success');
  });

  document.getElementById('chip-issued-jobwork')?.addEventListener('click', () => {
    currentInvoice.items.push({
      id: 'item-' + Date.now(),
      particulars: 'ISSUED JOBWORK',
      qty: 405.35,
      unit: 'KGS',
      rate: 70.00,
      taxType: 'intra',
      amount: 28374.50,
      cgst: 2553.71,
      sgst: 2553.71,
      totalAmount: 33482.00
    });
    renderItemEditorCards();
    renderInvoiceSheet();
    showToast('Added Issued Jobwork preset (18% GST)', 'toast-success');
  });

  document.getElementById('chip-die-casting')?.addEventListener('click', () => {
    currentInvoice.items.push({
      id: 'item-' + Date.now(),
      particulars: 'ZINC DIE CASTING CHARGES',
      qty: 405.35,
      unit: 'Kgs',
      rate: 45.00,
      taxType: 'intra',
      amount: 18240.75,
      cgst: 1641.67,
      sgst: 1641.67,
      totalAmount: 21524.00
    });
    renderItemEditorCards();
    renderInvoiceSheet();
  });

  document.getElementById('chip-buffing')?.addEventListener('click', () => {
    currentInvoice.items.push({
      id: 'item-' + Date.now(),
      particulars: 'FINISHING & BUFFING CHARGES',
      qty: 405.35,
      unit: 'Kgs',
      rate: 15.00,
      taxType: 'intra',
      amount: 6080.25,
      cgst: 547.22,
      sgst: 547.22,
      totalAmount: 7175.00
    });
    renderItemEditorCards();
    renderInvoiceSheet();
  });

  document.getElementById('chip-returned')?.addEventListener('click', () => {
    currentInvoice.items.push({
      id: 'item-' + Date.now(),
      particulars: 'ZINC SCRAP RETURNED AFTER JOBWORK',
      qty: 405.35,
      unit: 'Kgs',
      rate: 0.00,
      taxType: 'none',
      amount: 0.00,
      cgst: 0,
      sgst: 0,
      totalAmount: 0.00
    });
    renderItemEditorCards();
    renderInvoiceSheet();
  });

  // 14. Inputs Sync to State
  document.getElementById('inv-number')?.addEventListener('input', (e) => {
    if (currentInvoice.templateType === 'challan') {
      currentInvoice.challanNo = e.target.value;
    } else {
      currentInvoice.invoiceNumber = e.target.value;
    }
    renderInvoiceSheet();
  });

  document.getElementById('btn-next-inv-no')?.addEventListener('click', () => {
    const isChallan = currentInvoice.templateType === 'challan';
    const num = parseInt(isChallan ? currentInvoice.challanNo : currentInvoice.invoiceNumber) || 21;
    const nextVal = (num + 1).toString();
    if (isChallan) {
      currentInvoice.challanNo = nextVal;
    } else {
      currentInvoice.invoiceNumber = nextVal;
    }
    document.getElementById('inv-number').value = nextVal;
    renderInvoiceSheet();
  });

  document.getElementById('inv-date')?.addEventListener('change', (e) => {
    currentInvoice.challanDate = e.target.value;
    currentInvoice.invoiceDate = e.target.value;
    document.getElementById('date-display-hint').innerHTML = `Displays as: <strong>${formatDateDDMMYYYYDot(e.target.value)}</strong>`;
    renderInvoiceSheet();
  });

  document.getElementById('challan-notes-input')?.addEventListener('input', (e) => {
    currentInvoice.notes = e.target.value;
    renderInvoiceSheet();
  });

  document.getElementById('buyer-name')?.addEventListener('input', (e) => {
    currentInvoice.buyer.name = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('buyer-addr1')?.addEventListener('input', (e) => {
    currentInvoice.buyer.addr1 = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('buyer-addr2')?.addEventListener('input', (e) => {
    currentInvoice.buyer.addr2 = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('buyer-gstin')?.addEventListener('input', (e) => {
    currentInvoice.buyer.gstin = e.target.value.toUpperCase();
    renderInvoiceSheet();
  });
  document.getElementById('buyer-state')?.addEventListener('input', (e) => {
    currentInvoice.buyer.state = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('buyer-state-code')?.addEventListener('input', (e) => {
    currentInvoice.buyer.stateCode = e.target.value;
    renderInvoiceSheet();
  });

  document.getElementById('setting-min-rows')?.addEventListener('input', (e) => {
    currentInvoice.minRows = parseInt(e.target.value) || 4;
    renderInvoiceSheet();
  });

  document.getElementById('toggle-roundoff')?.addEventListener('change', (e) => {
    currentInvoice.autoRoundoff = e.target.checked;
    renderInvoiceSheet();
  });

  document.getElementById('words-override-input')?.addEventListener('input', (e) => {
    currentInvoice.wordsOverride = e.target.value;
    renderInvoiceSheet();
  });

  // Stamp & Sign controls
  document.getElementById('toggle-stamp')?.addEventListener('change', (e) => {
    if (!currentInvoice.stamp) currentInvoice.stamp = {};
    currentInvoice.stamp.show = e.target.checked;
    renderInvoiceSheet();
  });

  document.getElementById('stamp-color')?.addEventListener('change', (e) => {
    if (!currentInvoice.stamp) currentInvoice.stamp = {};
    currentInvoice.stamp.color = e.target.value;
    renderInvoiceSheet();
  });

  document.getElementById('stamp-rotation')?.addEventListener('input', (e) => {
    if (!currentInvoice.stamp) currentInvoice.stamp = {};
    currentInvoice.stamp.rotation = parseInt(e.target.value) || 0;
    renderInvoiceSheet();
  });

  document.getElementById('toggle-signature')?.addEventListener('change', (e) => {
    if (!currentInvoice.signature) currentInvoice.signature = {};
    currentInvoice.signature.show = e.target.checked;
    renderInvoiceSheet();
  });

  document.getElementById('sign-caption-input')?.addEventListener('input', (e) => {
    if (!currentInvoice.signature) currentInvoice.signature = {};
    currentInvoice.signature.caption = e.target.value;
    renderInvoiceSheet();
  });

  // Zoom controls
  let zoomLevel = 100;
  const sheetWrapper = document.getElementById('sheet-wrapper');

  function updateZoom(val) {
    zoomLevel = Math.max(50, Math.min(150, val));
    document.getElementById('zoom-value').textContent = `${zoomLevel}%`;
    const targetSheet = currentInvoice.templateType === 'challan'
      ? document.getElementById('sheet-challan')
      : document.getElementById('sheet-invoice');
    if (targetSheet) {
      targetSheet.style.transform = `scale(${zoomLevel / 100})`;
    }
  }

  document.getElementById('btn-zoom-in')?.addEventListener('click', () => updateZoom(zoomLevel + 10));
  document.getElementById('btn-zoom-out')?.addEventListener('click', () => updateZoom(zoomLevel - 10));
  document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
    if (sheetWrapper) {
      const containerWidth = sheetWrapper.clientWidth - 40;
      const sheetWidth = 794; // approx 210mm in px
      const fitZoom = Math.min(100, Math.floor((containerWidth / sheetWidth) * 100));
      updateZoom(fitZoom);
    }
  });

  // Dark/Light Theme Toggle
  const themeToggle = document.getElementById('btn-theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  themeToggle?.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('theme-dark');
    document.body.classList.toggle('theme-light', !isDark);
    if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('sk_theme', isDark ? 'dark' : 'light');
  });

  if (localStorage.getItem('sk_theme') === 'dark') {
    document.body.classList.add('theme-dark');
    document.body.classList.remove('theme-light');
    if (themeIcon) themeIcon.textContent = '☀️';
  }

  // Sidebar Tab Navigation
  document.querySelectorAll('.sidebar-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabTarget = e.currentTarget.dataset.tab;
      document.querySelectorAll('.sidebar-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(sec => sec.classList.remove('active'));
      const activeSection = document.getElementById(tabTarget);
      if (activeSection) activeSection.classList.add('active');
    });
  });

  // Collapsible Locked Seller Info
  document.getElementById('toggle-seller-info')?.addEventListener('click', () => {
    document.getElementById('seller-info-card')?.classList.toggle('collapsed-group');
  });

  // JSON Export / Import
  document.getElementById('btn-export-all-json')?.addEventListener('click', () => {
    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      currentInvoice: currentInvoice,
      savedInvoices: getSavedInvoices(),
      savedBuyers: getSavedBuyers()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `SK_Enterprises_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Exported database backup JSON', 'toast-success');
  });

  document.getElementById('input-import-json')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (parsed.savedInvoices) saveInvoicesToDb(parsed.savedInvoices);
        if (parsed.savedBuyers) saveBuyers(parsed.savedBuyers);
        if (parsed.currentInvoice) currentInvoice = parsed.currentInvoice;
        populateEditorFields();
        showToast('Successfully restored database from JSON!', 'toast-success');
      } catch (err) {
        showToast('Failed to import invalid JSON file.', 'toast-error');
      }
    };
    reader.readAsText(file);
  });

  // Initialize Canvas & populate
  initSignaturePad();
  populateBuyerSelector();
  updateBuyerCountBadge();
  updateSavedInvoiceCount();
  populateEditorFields();
});
