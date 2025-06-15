// hooks/useReceiptPrinter.js
import { useState } from 'react';
import receiptPrinter from '../services/receiptPrinter';

const useReceiptPrinter = () => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState(null);
  const [lastPrintResult, setLastPrintResult] = useState(null);

const printReceipt = async (order) => {
  setIsPrinting(true);
  setPrintError(null);

  try {
    const result = await receiptPrinter.printBothReceipts(order);
    setLastPrintResult(result);
    return result;
  } catch (error) {
    setPrintError(error.message);
    throw error;
  } finally {
    setIsPrinting(false);
  }
};

  const testPrinter = async () => {
    setIsPrinting(true);
    setPrintError(null);
    
    try {
      const result = await receiptPrinter.testPrinter();
      setLastPrintResult(result);
      return result;
    } catch (error) {
      setPrintError(error.message);
      throw error;
    } finally {
      setIsPrinting(false);
    }
  };

  const previewReceipt = (order) => {
    return receiptPrinter.generateReceiptContent(order);
  };

  const clearError = () => {
    setPrintError(null);
  };

  return {
    printReceipt,
    testPrinter,
    previewReceipt,
    isPrinting,
    printError,
    lastPrintResult,
    clearError
  };
};

export default useReceiptPrinter;