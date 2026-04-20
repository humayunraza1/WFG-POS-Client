export const DIGITAL_PAYMENT_TYPES = ['online', 'card'];

export const PAYMENT_TAX_RATES = {
  cash: 0,
  online: 0,
  card: 0,
};

export const getTaxRate = (paymentType) =>
  PAYMENT_TAX_RATES[paymentType] ?? 0;

export const getTaxAmount = (afterDiscount, paymentType) =>
  Math.round(afterDiscount * getTaxRate(paymentType));

export const getTaxLabel = (paymentType) => {
  switch (paymentType) {
    case 'card':
      return 'Tax (8%)';
    default:
      return null;
  }
};

export const getPaymentTypeLabel = (paymentType) => {
  switch (paymentType) {
    case 'cash':
      return 'Cash';
    case 'online':
      return 'Mobile Wallets';
    case 'card':
      return 'Debit/Credit Cards';
    default:
      return paymentType ? String(paymentType) : 'N/A';
  }
};
