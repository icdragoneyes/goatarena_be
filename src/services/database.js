const { Pool } = require("pg");

// Configure PostgreSQL connection
var dbHost = "localhost";
if (process.env.DEV == "dev") dbHost = "104.248.43.26";
const pool = new Pool({
  host: dbHost, // Database host
  port: 5432, // Default PostgreSQL port
  user: "shepherd", // Your PostgreSQL username
  password: "goat888agi", // Your PostgreSQL password
  database: "goatarena", // Your database name
});

// Function to perform database operations
async function dbOperation(query, values = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, values);
    return result.rows; // Return rows for SELECT or success for others
  } catch (error) {
    console.error("Database error:", error);
    throw error; // Rethrow error for proper handling
  } finally {
    client.release(); // Release the client back to the pool
  }
}

// Example: SELECT data
async function selectExample() {
  const query = "SELECT * FROM game ";
  const values = [1]; // Replace with your condition
  const rows = await dbOperation(query, []);
  console.log("Selected rows:", rows);
}

// Example: INSERT data
async function insertExample() {
  const query =
    "INSERT INTO game (contract_address, memecoin_name) VALUES ($1, $2) RETURNING *";
  const values = ["value1", "value2"]; // Replace with your values
  const rows = await dbOperation(query, values);
  console.log("Inserted rows:", rows);
}

async function createGame(values) {
  console.log(values, "<<val to insert");
  const query = `
      INSERT INTO public.game (
        time_started,
        memecoin_name,
        contract_address,
        memecoin_price_start,
        memecoin_price_end,
        overunder_price_line,
        time_ended,
        total_pot,
        over_pot,
        under_pot,
        over_token_minted,
        under_token_minted,
        over_token_burnt,
        under_token_burnt,
        over_price,
        under_price,
        claimable_winning_pot_in_sol,
        over_token_address,
        under_token_address,
        memecoin_symbol,
        memecoin_usd_start,
        memecoin_usd_end,
        token_decimal,
        buy_fee,
        sell_fee,
        over_pot_address,
        under_pot_address
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
      )
      RETURNING *;
    `;
  try {
    const result = dbOperation(query, values);
    console.log("Inserted row:", result);
    return result;
  } catch (error) {
    console.error("Error inserting into game table:", error);
    throw error;
  }
}

async function executeBuyToken(values) {
  //get latest token price
  //calculate slippage
  //insert buy transaction
  //update token price on game table
  const query = `
      INSERT INTO public.buy_transactions (
      session_id,
      solana_wallet_address,
      fees,
      solana_tx_signature,
      side,
      token_price,
      buy_token_amount,
      total_in_solana,
      "time",
      tokens_received
    ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        RETURNING *;
      `;
  try {
    const result = dbOperation(query, values);
    console.log("Inserted row:", result);
    return result;
  } catch (error) {
    console.error("Error inserting into game table:", error);
    throw error;
  }
}

async function executeSellToken(values) {
  //get latest token price
  //calculate slippage
  //insert buy transaction
  //update token price on game table
  const query = `ß
        INSERT INTO public.sell_transactions (
             session_id, solana_wallet_address, fees,
            solana_tx_signature, side, token_price,
            sell_token_amount, "time", sol_received,
            progressive_fees, burn_tx_signature
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING id;
    `;
  try {
    const result = dbOperation(query, values);
    console.log("Inserted sell row:", result);
    return result;
  } catch (error) {
    console.error("Error inserting into game table:", error);
    throw error;
  }
}

async function getGameInfo(gameId, latest) {
  try {
    var query = "SELECT * FROM public.game WHERE id = $1;";
    var values = [gameId];

    if (latest) {
      query = `
            SELECT * FROM public.game
            ORDER BY id DESC
            LIMIT 1;
        `;
      values = [];
    }

    const res = await dbOperation(query, values);
    //console.log(res, "<< res");
    if (res.length === 0) {
      return null; // Return null if no game is found
    }

    // Map the result into a JSON object
    const game = res[0];
    const gameJson = {
      id: game.id,
      timeStarted: game.time_started,
      memecoinName: game.memecoin_name,
      contractAddress: game.contract_address,
      memecoinPriceStart: game.memecoin_price_start,
      memecoinPriceEnd: game.memecoin_price_end,
      overUnderPriceLine: game.overunder_price_line,
      timeEnded: game.time_ended,
      totalPot: game.total_pot,
      overPot: game.over_pot,
      underPot: game.under_pot,
      overTokenMinted: game.over_token_minted,
      underTokenMinted: game.under_token_minted,
      overTokenBurnt: game.over_token_burnt,
      underTokenBurnt: game.under_token_burnt,
      overPrice: game.over_price,
      underPrice: game.under_price,
      claimableWinningPotInSol: game.claimable_winning_pot_in_sol,
      over_token_address: game.over_token_address,
      under_token_address: game.under_token_address,
      memecoin_symbol: game.memecoin_symbol,
      memecoin_usd_start: game.memecoin_usd_start,
      memecoin_usd_end: game.memecoin_usd_end,
      token_decimal: game.token_decimal,
      buy_fee: game.buy_fee,
      sell_fee: game.sell_fee,
      over_pot_address: game.over_pot_address,
      under_pot_address: game.under_pot_address,
    };
    // console.log(gameJson, "<<<< game ");
    return gameJson;
  } catch (err) {
    console.error("Error fetching game by ID:", err);
    //throw err;
    return { error: err };
  }
}

async function getBuyTransaction(by, val, all) {
  try {
    var query = `
            SELECT * 
            FROM public.buy_transactions
            WHERE ${by} = $1;
        `;
    var values = [val];

    if (all) {
      query = `
        SELECT * 
        FROM public.buy_transactions;
    `;
      const values = [];
    }

    const res = await dbOperation(query, values);

    if (res.length === 0) {
      return null; // No transaction found
    }

    // Map the result into a JSON object
    const transaction = res;
    const transactionJson = {
      id: transaction.id,
      sessionId: transaction.session_id,
      solanaWalletAddress: transaction.solana_wallet_address,
      fees: transaction.fees,
      solanaTxSignature: transaction.solana_tx_signature,
      side: transaction.side,
      tokenPrice: transaction.token_price,
      buyTokenAmount: transaction.buy_token_amount,
      totalInSolana: transaction.total_in_solana,
      time: transaction.time,
      tokensReceived: transaction.tokens_received,
    };

    return transactionJson;
  } catch (err) {
    console.error("Error fetching buy transaction by ID:", err);
    return { error: err };
  }
}

async function getSellTransaction(by, val, all) {
  try {
    var query = `
            SELECT * 
            FROM public.sell_transactions
            WHERE ${by} = $1;
        `;
    var values = [val];

    if (all) {
      query = `
        SELECT * 
        FROM public.buy_transactions;
    `;
      const values = [];
    }

    const res = await dbOperation(query, values);

    if (res.length === 0) {
      return null; // No transaction found
    }

    // Map the result into a JSON object
    const transaction = res;
    const transactionJson = {
      id: transaction.id,
      /* sessionId: transaction.session_id,
      solanaWalletAddress: transaction.solana_wallet_address,
      fees: transaction.fees,
      solanaTxSignature: transaction.solana_tx_signature,
      side: transaction.side,
      tokenPrice: transaction.token_price,
      buyTokenAmount: transaction.buy_token_amount,
      totalInSolana: transaction.total_in_solana,
      time: transaction.time,
      tokensReceived: transaction.tokens_received, */
    };

    return transactionJson;
  } catch (err) {
    console.error("Error fetching buy transaction by ID:", err);
    return { error: err };
  }
}

// Example: UPDATE data
async function updateExample() {
  const query = "UPDATE your_table SET column1 = $1 WHERE id = $2 RETURNING *";
  const values = ["new_value", 1]; // Replace with your values and condition
  const rows = await dbOperation(query, values);
  console.log("Updated rows:", rows);
}

async function updateGame(values) {
  const query = `
    UPDATE public.game
    SET
        time_started = $2,
        memecoin_name = $3,
        contract_address = $4,
        memecoin_price_start = $5,
        memecoin_price_end = $6,
        overunder_price_line = $7,
        time_ended = $8,
        total_pot = $9,
        over_pot = $10,
        under_pot = $11,
        over_token_minted = $12,
        under_token_minted = $13,
        over_token_burnt = $14,
        under_token_burnt = $15,
        over_price = $16,
        under_price = $17,
        claimable_winning_pot_in_sol = $18,
        over_token_address = $19,
        under_token_address = $20,
        memecoin_symbol = $21,
        memecoin_usd_start = $22,
        memecoin_usd_end = $23,
        token_decimal = $24,
        buy_fee = $25,
        sell_fee = $26,
        over_pot_address = $27,
        under_pot_address = $28
    WHERE
        id = $1;
  `;

  try {
    const result = await dbOperation(query, values);
    console.log(`Game updated successfully.`);
    return result;
  } catch (error) {
    console.error("Error updating game:", error);
    throw error;
  }
}

module.exports = {
  createGame,
  dbOperation,
  selectExample,
  insertExample,
  getGameInfo,
  executeBuyToken,
  getBuyTransaction,
  updateGame,
  getSellTransaction,
  executeSellToken
};
