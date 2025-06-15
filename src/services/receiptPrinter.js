// services/receiptPrinter.js
import { format } from 'date-fns';

class ReceiptPrinter {
  constructor() {
    this.printerWidth = 48; // Standard thermal printer width (48 characters)
  }

  // Center text within the printer width
  centerText(text) {
    const padding = Math.max(0, Math.floor((this.printerWidth - text.length) / 2));
    return ' '.repeat(padding) + text;
  }

  // Create solid line separator
  createSolidLine() {
    return '═'.repeat(this.printerWidth);
  }

  // Create single line separator
  createSingleLine() {
    return '─'.repeat(this.printerWidth);
  }

  // Format table row with proper spacing
  formatTableRow(item, qty, cost, isHeader = false) {
    const itemWidth = 28;
    const qtyWidth = 6;
    const costWidth = 10;
    
    // Truncate item name if too long
    const truncatedItem = item.length > itemWidth ? 
      item.substring(0, itemWidth - 3) + '...' : item;
    
    // Pad each column
    const itemCol = truncatedItem.padEnd(itemWidth);
    const qtyCol = qty.toString().padStart(qtyWidth);
    const costCol = cost.toString().padStart(costWidth);
    
    if (isHeader) {
      return `${itemCol}│${qtyCol}│${costCol}`;
    }
    return `${itemCol}│${qtyCol}│${costCol}`;
  }

  // Generate logo (PNG only, no ASCII)
  generateLogo(isForBrowser = false) {
    if (isForBrowser) {
      // Return HTML img tag for browser preview using your PNG logo
      return `<div style="text-align: center; margin: 20px 0;">
                <img src="./images/wfg-logo.png" 
                     style="width: 180px; height: 180px; margin: 0 auto; display: block;" 
                     alt="The Waffle Guy Logo" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                <div style="display: none; font-size: 16px; font-weight: bold; color: #FF1493;">🧇 THE WAFFLE GUY 🧇</div>
              </div>`;
    } else {
      // For thermal printing, we'll handle the logo bitmap separately
      return '';
    }
  }


  generateRestaurantCopy(order) {
  const lines = [];
  const currentDate = new Date(order.createdAt);

  lines.push('');
  lines.push(this.centerText('THE WAFFLE GUY'));
  lines.push(this.centerText("Restaurant's Copy"));
  lines.push('');
  lines.push(this.createSolidLine());

  // Order Info
  lines.push('');
  lines.push(this.formatOrderDetail('Order ID', order._id.slice(-6).toUpperCase()));
  lines.push(this.formatOrderDetail('Date Ordered', format(currentDate, 'MMMM do, yyyy')));
  lines.push(this.formatOrderDetail('Time', format(currentDate, 'h:mm a')));
  lines.push(this.formatOrderDetail('Payment Type', order.paymentType.toLowerCase()));
  lines.push('');
  lines.push(this.createSolidLine());

  // Item Table
  lines.push('');
  const tableLines = this.formatItemsTable(order);
  lines.push(...tableLines);

  // Summary
  const subtotal = order.items.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);
  const discountAmount = subtotal * (order.discount / 100);
 
  lines.push('');
  lines.push('');
  lines.push(`Gross Total:${' '.repeat(20)}PKR ${subtotal.toFixed(2).padStart(7)}`);
  lines.push(`Total Disc:${' '.repeat(22)}PKR ${discountAmount.toFixed(2).padStart(7)}`);
  lines.push('');
  lines.push('─'.repeat(this.printerWidth));
  lines.push(`Net Total:${' '.repeat(22)}PKR ${order.finalPrice.toFixed(2).padStart(7)}`);

  lines.push('');
  lines.push('');
  return lines.join('\n');
}

async printRestaurantCopy(order) {
  const receiptContent = this.generateRestaurantCopy(order);
console.log(receiptContent)
  const printWindow = window.open('', '_blank', 'width=450,height=700');
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Restaurant Receipt - The Waffle Guy</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');

        @media print {
          @page {
            margin: 0;
            size: 80mm auto;
          }
          body {
            margin: 0;
            padding: 5mm;
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.3;
            width: 70mm;
          }
          .no-print {
            display: none !important;
          }
        }

        body {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          white-space: pre-line;
          margin: 0;
          padding: 20px;
          max-width: 350px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        .receipt-container {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          position: relative;
          overflow: hidden;
        }

        .receipt-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
        }

        .receipt-content {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          line-height: 1.2;
          color: #2c3e50;
          white-space: pre;
          overflow-x: auto;
        }

        .instructions {
          margin-top: 20px;
          padding: 20px;
          background: rgba(255,255,255,0.9);
          border-radius: 8px;
          font-size: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .print-button {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-family: inherit;
          font-weight: 600;
          cursor: pointer;
          margin-top: 15px;
          transition: transform 0.2s;
        }

        .print-button:hover {
          transform: translateY(-2px);
        }

        @media print {
          .receipt-container::before {
            display: none;
          }
          .receipt-container {
            border-radius: 0;
            box-shadow: none;
            padding: 0;
          }
          body {
            background: white;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="receipt-content">${receiptContent}</div>
      </div>

      <div class="instructions no-print">
        <h3 style="margin-top:0; color: #2c3e50;">🧾 Restaurant Copy Preview</h3>
        <ul style="margin: 10px 0;">
          <li>No logo, no thank-you message</li>
          <li>Uses full modern receipt styling</li>
          <li>Optimized for 80mm printers</li>
        </ul>
        <button class="print-button" onclick="window.print()">🖨️ Print Restaurant Copy</button>
        <p style="font-size: 11px; margin-top: 15px; opacity: 0.8;">
          Press Ctrl+P (Cmd+P on Mac) or use the button above to print
        </p>
      </div>

      <script>
        // Optionally auto-open print dialog:
        // setTimeout(() => window.print(), 500);
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();

  return { success: true, method: 'restaurant_browser_preview' };
}

async printBothReceipts(order) {
  const customerContent = this.generateReceiptContent(order);
  const restaurantContent = this.generateRestaurantCopy(order);

  const printWindow = window.open('', '_blank', 'width=450,height=1000');
  if (!printWindow) {
    throw new Error('Popup blocked! Please allow popups to print the receipt.');
  }

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - The Waffle Guy</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');

        @media print {
          @page {
            margin: 0;
            size: 80mm auto;
          }
          body {
            margin: 0;
            padding: 5mm;
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.3;
            width: 70mm;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
        }

        body {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          white-space: pre-line;
          margin: 0;
          padding: 20px;
          max-width: 350px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        .receipt-container {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          position: relative;
          overflow: hidden;
          margin-bottom: 40px;
        }

        .receipt-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
        }

        .receipt-content {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          line-height: 1.2;
          color: #2c3e50;
          white-space: pre;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        ${this.generateLogo(true)}
        <div class="receipt-content">${customerContent}</div>
      </div>

      <div class="receipt-container page-break">
        <div class="receipt-content">${restaurantContent}</div>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(() => window.print(), 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();

  return { success: true, method: 'combined_browser_preview' };
}



 formatItemsTable(order) {
  const lines = [];

  // Header
  lines.push('');
  lines.push('Description                      Qty  Price');
  lines.push('─'.repeat(this.printerWidth));

  // Items
  order.items.forEach(item => {
    const name = `${item.product.name} - ${item.variant.name}`;
    const qty = item.quantity.toString().padStart(3);
    const price = item.variant.price.toFixed(2).padStart(7);

    // Truncate name to fit 33 chars
    const desc = name.length > 33 ? name.slice(0, 30) + '...' : name.padEnd(33);

    const row = `${desc}${qty}  ${price}`;
    lines.push(row);
  });

  return lines;
}

  // Format order details with bold-like formatting
  formatOrderDetail(label, value) {
    const maxLabelWidth = 16;
    const formattedLabel = `${label}:`.padEnd(maxLabelWidth);
    return `${formattedLabel}**${value}**`;
  }
  async loadLogoForThermalPrinter() {
    try {
      // Create canvas to convert PNG to bitmap
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Set canvas size (thermal printer optimal: 384px width max)
          canvas.width = 120;
          canvas.height = 120;
          
          // Draw and convert to monochrome bitmap
          ctx.drawImage(img, 0, 0, 120, 120);
          const imageData = ctx.getImageData(0, 0, 120, 120);
          const bitmap = this.convertToBitmap(imageData);
          resolve(bitmap);
        };
        img.onerror = () => reject(new Error('Could not load logo'));
        img.src = './wfg-logo.png';
      });
    } catch (error) {
      console.warn('Logo loading failed, using ASCII fallback:', error);
      return null;
    }
  }

  // Convert image data to thermal printer bitmap format
  convertToBitmap(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const bitmap = [];
    
    // Convert to 1-bit bitmap (black/white)
    for (let y = 0; y < height; y++) {
      let byte = 0;
      let bitIndex = 0;
      
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const alpha = data[pixelIndex + 3];
        
        // Convert to grayscale and threshold
        const gray = (r + g + b) / 3;
        const isBlack = (alpha > 128) && (gray < 128);
        
        if (isBlack) {
          byte |= (1 << (7 - bitIndex));
        }
        
        bitIndex++;
        if (bitIndex === 8) {
          bitmap.push(byte);
          byte = 0;
          bitIndex = 0;
        }
      }
      
      // Handle remaining bits in row
      if (bitIndex > 0) {
        bitmap.push(byte);
      }
    }
    
    return { bitmap, width, height };
  }

  // Generate receipt content with modern design
  generateReceiptContent(order) {
    const lines = [];
    const currentDate = new Date(order.createdAt);
    
    // Logo and Header (no logo for thermal, only for browser)
    lines.push('');
    lines.push(this.centerText('THE WAFFLE GUY'));
    lines.push(this.centerText('Receipt'));
    lines.push('');
    lines.push(this.createSolidLine());
    
    // Order Details Section
    lines.push('');
    lines.push(this.formatOrderDetail('Order ID', order._id.slice(-6).toUpperCase()));
    lines.push(this.formatOrderDetail('Date Ordered', format(currentDate, 'MMMM do, yyyy')));
    lines.push(this.formatOrderDetail('Time', format(currentDate, 'h:mm a')));
    lines.push(this.formatOrderDetail('Payment Type', order.paymentType.toLowerCase()));
    lines.push('');
    lines.push(this.createSolidLine());
    
    // Items Table
    lines.push('');
    const tableLines = this.formatItemsTable(order);
    tableLines.forEach(line => lines.push(line));
    
    // Pricing Summary
    const subtotal = order.items.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);
    const discountAmount = subtotal * (order.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * 0.08;
    
    // lines.push('');
    // lines.push(`Subtotal:                    PKR ${subtotal.toLocaleString()}`);
    
    // if (order.discount > 0) {
    //   lines.push(`Discount (${order.discount}%):            -PKR ${discountAmount.toLocaleString()}`);
    // }
    
    
    // Pricing Summary
lines.push('');
lines.push('');
lines.push(`Gross Total:${' '.repeat(20)}PKR ${subtotal.toFixed(2).padStart(7)}`);
lines.push(`Total Disc:${' '.repeat(22)}PKR ${discountAmount.toFixed(2).padStart(7)}`);
lines.push('');
lines.push('─'.repeat(this.printerWidth));
lines.push(`Net Total:${' '.repeat(22)}PKR ${order.finalPrice.toFixed(2).padStart(7)}`);

    
    // Footer Messages
    lines.push('');
    lines.push(this.centerText('🙏 Thank you for your order! 🙏'));
    lines.push(this.centerText('Visit us again soon'));
    lines.push(this.centerText('Follow @thewaffleguy'));
    lines.push('');
    lines.push(this.centerText('Made with ❤️ in Pakistan'));
    lines.push('');
    lines.push('');
    
    return lines.join('\n');
  }

  // Print using Web API (modern browsers)
  async printReceipt(order) {
    try {
      // Fallback to browser print dialog
      return await this.printViaBrowser(order);
    } catch (error) {
      console.error('Printing failed:', error);
      throw new Error('Failed to print receipt: ' + error.message);
    }
  }

  // Print via Web Serial API (direct thermal printer)
  async printViaSerial(order) {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      
      const writer = port.writable.getWriter();
      
      // ESC/POS commands for thermal printers
      const initCommands = new Uint8Array([
        0x1B, 0x40, // Initialize printer
        0x1B, 0x61, 0x01, // Center alignment
      ]);
      
      await writer.write(initCommands);
      
      // Try to print logo bitmap
      try {
        const logoBitmap = await this.loadLogoForThermalPrinter();
        if (logoBitmap) {
          // ESC/POS image printing commands
          const imageCmd = new Uint8Array([
            0x1D, 0x76, 0x30, 0x00, // Print raster bitmap
            logoBitmap.width & 0xFF, (logoBitmap.width >> 8) & 0xFF, // Width
            logoBitmap.height & 0xFF, (logoBitmap.height >> 8) & 0xFF, // Height
            ...logoBitmap.bitmap
          ]);
          await writer.write(imageCmd);
          await writer.write(new TextEncoder().encode('\n\n'));
        }
      } catch (logoError) {
        console.warn('Logo printing failed, continuing with text:', logoError);
      }
      
      // Print text content
      const receiptContent = this.generateReceiptContent(order);
      await writer.write(new TextEncoder().encode(receiptContent));
      
      // Cut paper command
      const cutCommand = new Uint8Array([0x1D, 0x56, 0x00]);
      await writer.write(cutCommand);
      
      writer.releaseLock();
      await port.close();
      
      return { success: true, method: 'serial_with_logo' };
    } catch (error) {
      console.error('Serial printing failed:', error);
      throw error;
    }
  }

  // Modern browser printing with improved styling
  async printViaBrowser(order) {
    const receiptContent = this.generateReceiptContent(order);
    
    const printWindow = window.open('', '_blank', 'width=450,height=700');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - The Waffle Guy</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');
          
          @media print {
            @page {
              margin: 0;
              size: 80mm auto;
            }
            body {
              margin: 0;
              padding: 5mm;
              font-family: 'JetBrains Mono', 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.3;
              width: 70mm;
            }
            .no-print {
              display: none !important;
            }
          }
          
          body {
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            white-space: pre-line;
            margin: 0;
            padding: 20px;
            max-width: 350px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          
          .receipt-container {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            position: relative;
            overflow: hidden;
          }
          
          .receipt-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
          }
          
          .receipt-content {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            line-height: 1.2;
            color: #2c3e50;
            white-space: pre;
            overflow-x: auto;
          }
          
          .instructions {
            margin-top: 20px;
            padding: 20px;
            background: rgba(255,255,255,0.9);
            border-radius: 8px;
            font-size: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
          }
          
          .print-button {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-family: inherit;
            font-weight: 600;
            cursor: pointer;
            margin-top: 15px;
            transition: transform 0.2s;
          }
          
          .print-button:hover {
            transform: translateY(-2px);
          }
          
          @media print {
            .receipt-container::before {
              display: none;
            }
            .receipt-container {
              border-radius: 0;
              box-shadow: none;
              padding: 0;
            }
            body {
              background: white;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          ${this.generateLogo(true)} <!-- Logo image for browser -->
          <div class="receipt-content">${receiptContent}</div>
        </div>
        
        <div class="instructions no-print">
          <h3 style="margin-top:0; color: #2c3e50;">🧾 Modern Receipt Preview</h3>
          <p><strong>✨ Features:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Clean table-based layout</li>
            <li>Solid lines instead of dots</li>
            <li>Modern typography</li>
            <li>Optimized for 80mm thermal printers</li>
          </ul>
          <button class="print-button" onclick="window.print()">🖨️ Print Receipt</button>
          <p style="font-size: 11px; margin-top: 15px; opacity: 0.8;">
            Press Ctrl+P (Cmd+P on Mac) or use the button above to print
          </p>
        </div>
        
        <script>
          // Auto-open print dialog after content loads
          setTimeout(() => {
            // Uncomment the line below to auto-open print dialog
            // window.print();
          }, 800);
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    return { success: true, method: 'modern_browser_preview' };
  }

  // Test printer with sample data
  async testPrinter() {
    try {
      const testOrder = {
        _id: 'test4FA350123456',
        createdAt: new Date('2025-06-14T07:43:00'),
        paymentType: 'cash',
        discount: 10,
        finalPrice: 1330,
        items: [{
          product: { name: 'Waffle' },
          variant: { name: 'Kitkat Crunch', price: 700 },
          quantity: 2
        }]
      };
      
      await this.printReceipt(testOrder);
      return { success: true, message: 'Modern receipt test print successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// Create singleton instance
const receiptPrinter = new ReceiptPrinter();

export default receiptPrinter;