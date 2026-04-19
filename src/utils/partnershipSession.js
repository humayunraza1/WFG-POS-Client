import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const clampPercent = (value) => {
  const numericValue = Number(value || 0);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(100, Math.max(0, numericValue));
};

const roundAmount = (value) => Number((Number(value || 0)).toFixed(2));

const getPartnershipMeta = (item) => {
  const category = item?.category || {};

  return {
    categoryName: item?.categoryName || category?.name || 'Uncategorized',
    isPartnership: Boolean(item?.isPartnershipCategory ?? category?.isPartnership),
    partnershipBusinessName: item?.partnershipBusinessName || category?.partnershipBusinessName || '',
    sharePercent: clampPercent(item?.partnershipSharePercent ?? category?.partnershipSharePercent ?? 0),
  };
};

const getPartnershipItemLabel = (item) => {
  if (item?.dealName) {
    const selectionLabel = item?.dealSelectionLabel || item?.optionName;
    return selectionLabel ? `${item.dealName} - ${selectionLabel}` : item.dealName;
  }

  return item?.product?.name || item?.optionName || 'Unknown Product';
};

const getPartnershipBaseUnitPrice = (item) => {
  const optionPrices = Array.isArray(item?.product?.options)
    ? item.product.options
        .map((option) => Number(option?.price))
        .filter((price) => Number.isFinite(price) && price >= 0)
    : [];

  if (optionPrices.length > 0) {
    return roundAmount(Math.min(...optionPrices));
  }

  const fallbackUnitPrice = Number(item?.unitPrice || 0);
  return Number.isFinite(fallbackUnitPrice) && fallbackUnitPrice >= 0 ? roundAmount(fallbackUnitPrice) : 0;
};

const getOrderNumber = (orderId) => {
  const normalizedId = String(orderId || '');
  return normalizedId ? `#${normalizedId.slice(-6).toUpperCase()}` : '#N/A';
};

const buildSessionOptionLabel = (session) => {
  if (!session) {
    return 'Select session';
  }

  const openedAt = session.openedAt ? new Date(session.openedAt).toLocaleString() : 'Unknown time';
  return `${session.manager || 'Unknown'} • ${openedAt}`;
};

export const getSessionOptionLabel = buildSessionOptionLabel;

const getSafeSessionId = (session) => session?.sessionId || session?._id || 'session';

const getDocumentNumber = (session) => `PSS-${String(getSafeSessionId(session)).slice(-8).toUpperCase()}`;

const getFileTimestamp = () => new Date().toISOString().replace(/[.:]/g, '-');

const getDocumentTitle = (report) => {
  const businessNames = (report?.partnershipBusinessNames || []).filter(Boolean);

  if (businessNames.length === 1) {
    return `The Waffle Guy X ${businessNames[0]}`;
  }

  if (businessNames.length > 1) {
    return 'The Waffle Guy X Partnerships';
  }

  return 'The Waffle Guy Partnership Statement';
};

const getShareDisplay = (report) => {
  const sharePercents = (report?.sharePercents || []).filter((value) => Number.isFinite(value));

  if (sharePercents.length === 0) {
    return 'N/A';
  }

  if (sharePercents.length === 1) {
    return `${sharePercents[0]}%`;
  }

  return `Mixed (${sharePercents.map((value) => `${value}%`).join(', ')})`;
};

export const formatPartnershipCurrency = (amount) => `PKR ${(amount || 0).toLocaleString()}`;

export const formatPartnershipDateTime = (value) => {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleString();
};

export const buildPartnershipSessionReport = (session) => {
  if (!session) {
    return {
      hasPartnershipSales: false,
      orderCount: 0,
      lineCount: 0,
      totalQuantity: 0,
      grossSales: 0,
      partnerPayout: 0,
      retainedSales: 0,
      partnershipBusinessNames: [],
      sharePercents: [],
      lineItems: [],
      itemSummaries: [],
    };
  }

  const lineItemMap = new Map();
  const itemSummaryMap = new Map();
  const partnershipOrderIds = new Set();
  const partnershipBusinessNames = new Set();
  const sharePercents = new Set();

  (session.orders || []).forEach((order, orderIndex) => {
    const orderId = order?._id || `${session.sessionId || 'session'}-${orderIndex}`;

    (order.items || []).forEach((item, itemIndex) => {
      const { categoryName, isPartnership, partnershipBusinessName, sharePercent } = getPartnershipMeta(item);
      if (!isPartnership) {
        return;
      }

      const grossSales = roundAmount(item?.totalPrice || 0);
      const quantity = Number(item?.quantity || 0);
      const unitCost = getPartnershipBaseUnitPrice(item);
      const baseSales = roundAmount(unitCost * quantity);
      const addOnAmount = roundAmount(Math.max(0, grossSales - baseSales));
      const retainedSales = roundAmount((baseSales * sharePercent) / 100);
      const partnerPayout = roundAmount(baseSales - retainedSales);
      const itemLabel = getPartnershipItemLabel(item);
      const productIdentifier = item?.dealName
        ? `${item.dealName}::${item.dealSelectionLabel || item.optionName || ''}`
        : String(item?.product?._id || itemLabel);
      const summaryKey = `${productIdentifier}::${partnershipBusinessName || 'N/A'}::${sharePercent}`;
      const lineKey = `${String(orderId)}::${summaryKey}`;

      partnershipOrderIds.add(String(orderId));
      if (partnershipBusinessName) {
        partnershipBusinessNames.add(partnershipBusinessName);
      }
      sharePercents.add(sharePercent);

      if (!lineItemMap.has(lineKey)) {
        lineItemMap.set(lineKey, {
          id: `${orderId}-${itemIndex}`,
          orderId: String(orderId),
          orderNumber: getOrderNumber(orderId),
          orderedAt: order?.dateOrdered || order?.createdAt || null,
          paymentType: order?.paymentType || 'N/A',
          receiptTotal: roundAmount(order?.finalPrice || 0),
          categoryName,
          partnershipBusinessName,
          itemLabel,
          quantity: 0,
          unitCost,
          actualSales: 0,
          addOnAmount: 0,
          grossSales: 0,
          sharePercent,
          partnerPayout: 0,
          retainedSales: 0,
        });
      }

      const existingLineItem = lineItemMap.get(lineKey);
      existingLineItem.quantity += quantity;
      existingLineItem.actualSales = roundAmount(existingLineItem.actualSales + grossSales);
      existingLineItem.addOnAmount = roundAmount(existingLineItem.addOnAmount + addOnAmount);
      existingLineItem.grossSales = roundAmount(existingLineItem.grossSales + baseSales);
      existingLineItem.partnerPayout = roundAmount(existingLineItem.partnerPayout + partnerPayout);
      existingLineItem.retainedSales = roundAmount(existingLineItem.retainedSales + retainedSales);
      existingLineItem.unitCost = unitCost;

      if (!itemSummaryMap.has(summaryKey)) {
        itemSummaryMap.set(summaryKey, {
          itemLabel,
          categoryName,
          partnershipBusinessName,
          sharePercent,
          quantity: 0,
          unitCost: 0,
          actualSales: 0,
          addOnAmount: 0,
          grossSales: 0,
          partnerPayout: 0,
          retainedSales: 0,
        });
      }

      const existingSummary = itemSummaryMap.get(summaryKey);
      existingSummary.quantity += quantity;
      existingSummary.actualSales = roundAmount(existingSummary.actualSales + grossSales);
      existingSummary.addOnAmount = roundAmount(existingSummary.addOnAmount + addOnAmount);
      existingSummary.grossSales = roundAmount(existingSummary.grossSales + baseSales);
      existingSummary.partnerPayout = roundAmount(existingSummary.partnerPayout + partnerPayout);
      existingSummary.retainedSales = roundAmount(existingSummary.retainedSales + retainedSales);
      existingSummary.unitCost = unitCost;
    });
  });

  const itemSummaries = Array.from(itemSummaryMap.values()).sort((left, right) => right.grossSales - left.grossSales);
  const lineItems = Array.from(lineItemMap.values());
  const orderedLineItems = lineItems.sort((left, right) => new Date(right.orderedAt || 0) - new Date(left.orderedAt || 0));

  const totals = orderedLineItems.reduce(
    (accumulator, lineItem) => ({
      totalQuantity: accumulator.totalQuantity + lineItem.quantity,
      grossSales: roundAmount(accumulator.grossSales + lineItem.grossSales),
      partnerPayout: roundAmount(accumulator.partnerPayout + lineItem.partnerPayout),
      retainedSales: roundAmount(accumulator.retainedSales + lineItem.retainedSales),
    }),
    {
      totalQuantity: 0,
      grossSales: 0,
      partnerPayout: 0,
      retainedSales: 0,
    }
  );

  return {
    hasPartnershipSales: orderedLineItems.length > 0,
    orderCount: partnershipOrderIds.size,
    lineCount: orderedLineItems.length,
    totalQuantity: totals.totalQuantity,
    grossSales: totals.grossSales,
    partnerPayout: totals.partnerPayout,
    retainedSales: totals.retainedSales,
    partnershipBusinessNames: Array.from(partnershipBusinessNames).sort(),
    sharePercents: Array.from(sharePercents).sort((left, right) => left - right),
    lineItems: orderedLineItems,
    itemSummaries,
  };
};

const escapeCsvValue = (value) => {
  const normalizedValue = value ?? '';
  const stringValue = String(normalizedValue);

  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

export const buildPartnershipSessionCsv = (session, report) => {
  const rows = [
    ['Title', getDocumentTitle(report)],
    ['Session ID', session?.sessionId || 'N/A'],
    ['Opened At', session?.openedAt ? new Date(session.openedAt).toLocaleString() : 'N/A'],
    ['Closed At', session?.closedAt ? new Date(session.closedAt).toLocaleString() : 'Open'],
    ['Partnership Orders', report.orderCount],
    ['Partnership Quantity', report.totalQuantity],
    ['Partnership Base Sales', report.grossSales],
    ['Our Share', report.retainedSales],
    ['Partner Payout', report.partnerPayout],
    [],
    ['Item Summary'],
    ['Item', 'Category', 'Partner', 'Quantity', 'Unit Cost', 'Base Sales', 'Our Share', 'Partner Payout'],
    ...report.itemSummaries.map((item) => [
      item.itemLabel,
      item.categoryName,
      item.partnershipBusinessName || 'N/A',
      item.quantity,
      item.unitCost,
      item.grossSales,
      item.retainedSales,
      item.partnerPayout,
    ]),
    [],
    ['Partnership Order Lines'],
    ['Ordered At', 'Order Number', 'Order ID', 'Payment Type', 'Receipt Total', 'Item', 'Category', 'Partner', 'Quantity', 'Unit Cost', 'Line Sales', 'Our Share', 'Partner Payout'],
    ...report.lineItems.map((lineItem) => [
      lineItem.orderedAt ? new Date(lineItem.orderedAt).toLocaleString() : 'N/A',
      lineItem.orderNumber,
      lineItem.orderId,
      lineItem.paymentType,
      lineItem.receiptTotal,
      lineItem.itemLabel,
      lineItem.categoryName,
      lineItem.partnershipBusinessName || 'N/A',
      lineItem.quantity,
      lineItem.unitCost,
      lineItem.grossSales,
      lineItem.retainedSales,
      lineItem.partnerPayout,
    ]),
  ];

  return rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n');
};

export const downloadPartnershipSessionCsv = (session, report) => {
  const csvContent = buildPartnershipSessionCsv(session, report);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  const safeSessionId = getSafeSessionId(session);
  const timestamp = getFileTimestamp();

  downloadLink.href = url;
  downloadLink.setAttribute('download', `partnership-session-${safeSessionId}-${timestamp}.csv`);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  window.URL.revokeObjectURL(url);
};

export const downloadPartnershipSessionPdf = (session, report) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 40;
  const marginTop = 46;
  const contentWidth = pageWidth - marginX * 2;
  const safeSessionId = getSafeSessionId(session);
  const timestamp = getFileTimestamp();
  const openedAt = formatPartnershipDateTime(session?.openedAt);
  const closedAt = session?.closedAt ? formatPartnershipDateTime(session.closedAt) : 'Open';
  const generatedAt = formatPartnershipDateTime(new Date());
  const documentTitle = getDocumentTitle(report);
  const documentSubtitle = 'Partnership Settlement Statement';
  const sessionReferenceLines = doc.splitTextToSize(String(safeSessionId), 190);

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(marginX, marginTop, pageWidth - marginX * 2, 84, 12, 12, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(documentTitle, marginX + 20, marginTop + 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(documentSubtitle, marginX + 20, marginTop + 49);
  doc.setFontSize(10);
  doc.text(`Document No: ${getDocumentNumber(session)}`, marginX + 20, marginTop + 67);
  doc.text(`Generated: ${generatedAt}`, marginX + 180, marginTop + 67);

  doc.setFont('helvetica', 'bold');
  doc.text('Session Reference', pageWidth - marginX - 210, marginTop + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(sessionReferenceLines, pageWidth - marginX - 210, marginTop + 45);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Session Details', marginX, marginTop + 124);

  const sessionDetailRows = [
    ['Opened At', openedAt],
    ['Closed At', closedAt],
  ];

  autoTable(doc, {
    startY: marginTop + 136,
    theme: 'grid',
    margin: { left: marginX, right: marginX },
    body: sessionDetailRows,
    styles: { fontSize: 10, cellPadding: 8, textColor: [15, 23, 42] },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 110 },
      1: { cellWidth: contentWidth - 110 },
    },
  });

  const summaryStartY = doc.lastAutoTable.finalY + 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Settlement Summary', marginX, summaryStartY);

  const summaryRows = [
    ['Partnership Orders', String(report.orderCount), 'Partnership Quantity', String(report.totalQuantity)],
    ['Partnership Base Sales', formatPartnershipCurrency(report.grossSales), 'Share', getShareDisplay(report)],
    ['Final Take Away', formatPartnershipCurrency(report.retainedSales), 'Partner Payout', formatPartnershipCurrency(report.partnerPayout)],
    ['Order Lines', String(report.lineCount), 'Settlement Ref', getDocumentNumber(session)],
  ];

  autoTable(doc, {
    startY: summaryStartY + 10,
    theme: 'grid',
    margin: { left: marginX, right: marginX },
    body: summaryRows,
    styles: { fontSize: 10, cellPadding: 8, textColor: [15, 23, 42] },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [240, 253, 244], cellWidth: 120 },
      1: { cellWidth: 120 },
      2: { fontStyle: 'bold', fillColor: [255, 251, 235], cellWidth: 120 },
      3: { cellWidth: contentWidth - 360 },
    },
  });

  const itemStartY = doc.lastAutoTable.finalY + 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Item Breakdown', marginX, itemStartY);

  autoTable(doc, {
    startY: itemStartY + 10,
    theme: 'striped',
    margin: { left: marginX, right: marginX },
    head: [['Item', 'Category', 'Partner', 'Qty', 'Unit Cost', 'Base Sales', 'Our Share', 'Partner Payout']],
    body: report.itemSummaries.map((item) => [
      item.itemLabel,
      item.categoryName,
      item.partnershipBusinessName || 'N/A',
      String(item.quantity),
      formatPartnershipCurrency(item.unitCost),
      formatPartnershipCurrency(item.grossSales),
      formatPartnershipCurrency(item.retainedSales),
      formatPartnershipCurrency(item.partnerPayout),
    ]),
    styles: { fontSize: 8, cellPadding: 5, textColor: [15, 23, 42], overflow: 'linebreak', valign: 'middle' },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    tableWidth: contentWidth,
    columnStyles: {
      0: { cellWidth: 230 },
      1: { cellWidth: 75 },
      2: { cellWidth: 95 },
      3: { halign: 'right', cellWidth: 35 },
      4: { halign: 'right', cellWidth: 70 },
      5: { halign: 'right', cellWidth: 82 },
      6: { halign: 'right', cellWidth: 82 },
      7: { halign: 'right', cellWidth: 87 },
    },
  });

  const lineStartY = doc.lastAutoTable.finalY + 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Order Line Details', marginX, lineStartY);

  autoTable(doc, {
    startY: lineStartY + 10,
    theme: 'striped',
    margin: { left: marginX, right: marginX },
    head: [['Order #', 'Ordered At', 'Item', 'Payment', 'Unit Cost', 'Line Sales', 'Our Share', 'Partner Payout']],
    body: report.lineItems.map((lineItem) => [
      lineItem.orderNumber,
      formatPartnershipDateTime(lineItem.orderedAt),
      `${lineItem.itemLabel} (${lineItem.categoryName}, Qty ${lineItem.quantity})`,
      lineItem.paymentType,
      formatPartnershipCurrency(lineItem.unitCost),
      formatPartnershipCurrency(lineItem.grossSales),
      formatPartnershipCurrency(lineItem.retainedSales),
      formatPartnershipCurrency(lineItem.partnerPayout),
    ]),
    styles: { fontSize: 8, cellPadding: 5, textColor: [15, 23, 42], overflow: 'linebreak', valign: 'middle' },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    tableWidth: contentWidth,
    columnStyles: {
      0: { cellWidth: 52 },
      1: { cellWidth: 94 },
      2: { cellWidth: 245 },
      3: { cellWidth: 48 },
      4: { halign: 'right', cellWidth: 68 },
      5: { halign: 'right', cellWidth: 70 },
      6: { halign: 'right', cellWidth: 82 },
      7: { halign: 'right', cellWidth: 87 },
    },
    didDrawPage: (data) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `${documentTitle} • Session ${String(safeSessionId)}`,
        marginX,
        pageHeight - 18
      );
      doc.text(
        `Page ${doc.internal.getNumberOfPages()}`,
        pageWidth - marginX - 40,
        pageHeight - 18
      );
    },
  });

  doc.save(`partnership-session-${safeSessionId}-${timestamp}.pdf`);
};