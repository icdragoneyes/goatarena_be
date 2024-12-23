 const gameModel = {
  time_started_1: 0,
  memecoin_name_2: "",
  contract_address_3: "",
  memecoin_price_start_4: 0,
  memecoin_price_end_5: 0,
  overunder_price_line_6: 0,
  time_ended_7: null,
  total_pot_8: 0,
  over_pot_9: 0,
  under_pot_10: 0,
  over_token_minted_11: 0,
  under_token_minted_12: 0,
  over_token_burnt_13: 0,
  under_token_burnt_14: 0,
  over_price_15: 0,
  under_price_16: 0,
  claimable_winning_pot_in_sol_17: 0,
  over_token_address_18: "",
  under_token_address_19: "",
  memecoin_symbol_20: "",
  memecoin_usd_start_21: 0.0,
  memecoin_usd_end_22: 0.0,
  token_decimal_23: 0,
  buy_fee_24: 0,
  sell_fee_25: 0,
  over_pot_address: "",
  under_pot_address: "",
};

const buyModel = {
  session_id: 0,
  solana_wallet_address: "",
  fees: 0,
  solana_tx_signature: "",
  side: "",
  token_price: 0,
  buy_token_amount: 0,
  total_in_solana: 0,
  time: "",
  tokens_received: 0,
};

const sellTransactionModel = {
  session_id: 0, // Foreign key, default to null
  solana_wallet_address: "", // Default to an empty string
  fees: 0, // Default to 0
  solana_tx_signature: "", // Default to an empty string
  side: "", // Default to an empty string
  token_price: 0, // Default to 0
  sell_token_amount: 0, // Default to 0
  time: null, // Default to null (timestamp to be set when creating a record)
  sol_received: 0, // Default to 0
  progressive_fees: 0, // Default to 0
  burn_tx_signature: "",
};

module.exports = {
  gameModel,
  buyModel,
  sellTransactionModel
};