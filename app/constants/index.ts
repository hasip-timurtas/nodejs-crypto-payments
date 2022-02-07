export const TRANSACTION_CATEGORIES = {
  receive: 'receive',
  generate: 'generate',
  immature: 'immature',
  orphan: 'orphan',
  send: 'send',
};

export const MIN_VALID_CONFIRMATION = 6;

export const CONFIRMATIONS = {
  [TRANSACTION_CATEGORIES.generate]: 100,
  [TRANSACTION_CATEGORIES.immature]: 100,
};

export const MIN_DEPOSIT_AMOUNT = 0;

export const VALID_DEPOSIT_QUERY = {
  amount: {
    // I assume that deposit amount should be more than 0.
    $gt: MIN_DEPOSIT_AMOUNT,
  },
  confirmations: {
    $gte: MIN_VALID_CONFIRMATION,
  },
  $or: [
    {
      category: TRANSACTION_CATEGORIES.receive,
    },
    {
      category: TRANSACTION_CATEGORIES.generate,
      confirmations: {
        $gt: CONFIRMATIONS.generate,
      },
    },
    {
      category: TRANSACTION_CATEGORIES.immature,
      confirmations: {
        $lte: CONFIRMATIONS.immature,
      },
    },
    {
      category: TRANSACTION_CATEGORIES.orphan,
    },
  ],
};
