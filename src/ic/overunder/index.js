const idlFactory = ({ IDL }) => {
  const Bet = IDL.Record({
    id: IDL.Nat,
    bet: IDL.Nat,
    multiplier: IDL.Float64,
    round_bet_id: IDL.Nat,
    txSignature: IDL.Text,
    time: IDL.Int,
    walletAddress: IDL.Principal,
    solanaWalletAddress: IDL.Text,
    game_id: IDL.Nat,
    totalReward: IDL.Nat,
    amount: IDL.Nat,
  });
  const CurrentGame = IDL.Record({
    id: IDL.Nat,
    previousBurntToken: IDL.Nat,
    is_spinning: IDL.Bool,
    result: IDL.Nat8,
    allTimeReward: IDL.Nat,
    overBets: IDL.Vec(Bet),
    dice: IDL.Nat8,
    underMultiplier: IDL.Float64,
    totalBets: IDL.Nat,
    underBets: IDL.Vec(Bet),
    totalBurnt: IDL.Nat,
    previousWinners: IDL.Vec(Bet),
    lastHouseRoll: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat8)),
    overMultiplier: IDL.Float64,
    nextSpin: IDL.Int,
  });
  const InitialData = IDL.Record({ game: CurrentGame });
  const GameData = IDL.Variant({ ok: InitialData, none: IDL.Null });
  const ClaimHistory = IDL.Record({
    reward_claimed: IDL.Nat,
    time: IDL.Int,
    icp_transfer_index: IDL.Nat,
    game_id: IDL.Nat,
  });
  const SpinUser = IDL.Record({
    walletAddress: IDL.Principal,
    claimableReward: IDL.Nat,
    currentGameBet: IDL.Nat,
    claimHistory: IDL.Vec(ClaimHistory),
    betHistory: IDL.Vec(Bet),
  });
  const TransferResult = IDL.Variant({
    error: IDL.Text,
    success: IDL.Nat,
  });
  const PlaceBetResult = IDL.Variant({
    closed: IDL.Nat,
    transferFailed: IDL.Text,
    invalidTx: IDL.Text,
    success: IDL.Variant({ ok: CurrentGame, none: IDL.Null }),
  });
  return IDL.Service({
    addAccess: IDL.Func([IDL.Text], [IDL.Nat], []),
    blacklist: IDL.Func([IDL.Text], [IDL.Bool], []),
    calculateReward: IDL.Func([], [IDL.Nat], []),
    clearData: IDL.Func([], [], []),
    currentDevFee: IDL.Func([], [IDL.Nat], ["query"]),
    failedTransfer: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    getBList: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Bool))], []),
    getCounter: IDL.Func([], [IDL.Nat], ["query"]),
    getCurrentGame: IDL.Func([], [GameData], []),
    getCurrentIndex: IDL.Func([], [IDL.Nat], ["query"]),
    getDevPool: IDL.Func(
      [],
      [IDL.Record({ hexa: IDL.Text, dragon: IDL.Text })],
      ["query"]
    ),
    getEventIndex: IDL.Func([], [IDL.Nat], []),
    getFailedPayment: IDL.Func([], [], ["oneway"]),
    getGame: IDL.Func([IDL.Nat], [GameData], []),
    getPendingBurns: IDL.Func([], [IDL.Nat], []),
    getPendingPayments: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(Bet)))],
      []
    ),
    getUserBets: IDL.Func(
      [IDL.Text],
      [IDL.Variant({ ok: IDL.Vec(Bet), none: IDL.Nat })],
      []
    ),
    getUserData: IDL.Func([], [SpinUser], []),
    isNotPaused: IDL.Func([], [IDL.Bool], ["query"]),
    isNowSpin: IDL.Func(
      [],
      [IDL.Record({ nes: IDL.Int, now: IDL.Int, res: IDL.Bool })],
      []
    ),
    mintEyes: IDL.Func([IDL.Principal, IDL.Nat], [TransferResult], []),
    pauseCanister: IDL.Func([IDL.Bool], [IDL.Bool], []),
    place_bet: IDL.Func(
      [IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text],
      [PlaceBetResult],
      []
    ),
    setAdmin: IDL.Func([IDL.Principal], [IDL.Principal], []),
    setDevPool: IDL.Func([IDL.Text, IDL.Text], [], []),
    setDevWallets: IDL.Func([IDL.Text, IDL.Text], [], ["query"]),
    setDuration: IDL.Func([IDL.Nat], [], []),
    setEyesToken: IDL.Func([IDL.Bool], [IDL.Bool], []),
    setMaxPlayer: IDL.Func([IDL.Nat], [IDL.Nat], []),
    setRewardPool: IDL.Func([IDL.Principal], [IDL.Principal], []),
    setSpin: IDL.Func([IDL.Bool], [IDL.Bool], []),
    spinInit: IDL.Func([], [IDL.Nat], []),
    spinManual: IDL.Func([IDL.Bool], [], []),
    startCanister: IDL.Func([], [], []),
    successfulTransfer: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    testGetPendingPayments: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(Bet)))],
      []
    ),
    updateTokenBurnt: IDL.Func([IDL.Nat, IDL.Nat], [], []),
    whoCall: IDL.Func([], [IDL.Principal], ["query"]),
  });
};
const init = ({ IDL }) => {
  return [];
};
module.exports = idlFactory;
