const idlFactory = ({ IDL }) => {
  const DSOLBurn = IDL.Record({
    principal: IDL.Text,
    signature: IDL.Text,
    time: IDL.Int,
    targetWallet: IDL.Text,
    amount: IDL.Nat,
  });
  const TransferResult = IDL.Variant({
    error: IDL.Text,
    success: IDL.Nat,
  });
  const HttpHeader = IDL.Record({ value: IDL.Text, name: IDL.Text });
  const HttpResponsePayload = IDL.Record({
    status: IDL.Nat,
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(HttpHeader),
  });
  const TransformArgs = IDL.Record({
    context: IDL.Vec(IDL.Nat8),
    response: HttpResponsePayload,
  });
  const CanisterHttpResponsePayload = IDL.Record({
    status: IDL.Nat,
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(HttpHeader),
  });
  return IDL.Service({
    addAccess: IDL.Func([IDL.Text], [IDL.Nat], []),
    confirmBurn: IDL.Func([IDL.Text, IDL.Text, IDL.Nat, IDL.Text], [], []),
    getMinterAddress: IDL.Func([], [IDL.Opt(IDL.Text)], []),
    getUpdateRequest: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
      []
    ),
    getWithdrawRequest: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Text, DSOLBurn))],
      []
    ),
    map: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
    mintDSOL: IDL.Func(
      [IDL.Text, IDL.Nat, IDL.Text, IDL.Text],
      [
        IDL.Variant({
          no: IDL.Bool,
          ok: TransferResult,
          error: IDL.Text,
        }),
      ],
      []
    ),
    mintDSOLToGame: IDL.Func(
      [IDL.Nat, IDL.Text],
      [
        IDL.Variant({
          no: IDL.Bool,
          ok: TransferResult,
          error: IDL.Text,
        }),
      ],
      []
    ),
    outcall: IDL.Func([IDL.Text], [IDL.Text], []),
    transform: IDL.Func(
      [TransformArgs],
      [CanisterHttpResponsePayload],
      ["query"]
    ),
    updateBalance: IDL.Func(
      [],
      [IDL.Variant({ no: IDL.Bool, ok: IDL.Nat })],
      []
    ),
    withdrawSOL: IDL.Func(
      [IDL.Nat, IDL.Text],
      [
        IDL.Variant({
          no: IDL.Bool,
          transferFailed: IDL.Text,
          success: IDL.Nat,
        }),
      ],
      []
    ),
  });
};
const init = ({ IDL }) => {
  return [];
};

module.exports = idlFactory;
