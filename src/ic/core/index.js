const idlFactory = ({ IDL }) => {
  const Reward = IDL.Record({
    usd: IDL.Float64,
    chain: IDL.Text,
    gameName: IDL.Text,
    amount: IDL.Nat,
    decimal: IDL.Nat,
    canisterid: IDL.Text,
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
    siwt: IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    getAllTotalReward: IDL.Func(
      [],
      [
        IDL.Record({
          id: IDL.Nat,
          icp: IDL.Nat,
          usdicp: IDL.Float64,
          fullData: IDL.Vec(IDL.Tuple(IDL.Text, Reward)),
        }),
      ],
      ["query"]
    ),
    getTotalReward: IDL.Func(
      [IDL.Text, IDL.Text],
      [IDL.Record({ usd: IDL.Float64, reward: IDL.Float64 })],
      ["query"]
    ),
    mintEyes: IDL.Func(
      [IDL.Principal, IDL.Nat],
      [IDL.Variant({ error: IDL.Text, success: IDL.Nat })],
      []
    ),
    mintTestEyes: IDL.Func(
      [IDL.Principal, IDL.Nat],
      [IDL.Variant({ error: IDL.Text, success: IDL.Nat })],
      []
    ),
    outcall: IDL.Func([IDL.Text], [IDL.Text], []),
    setATH: IDL.Func([IDL.Text, IDL.Float64], [], []),
    addCampaignBudget: IDL.Func([IDL.Nat], [], []),
    transform: IDL.Func(
      [TransformArgs],
      [CanisterHttpResponsePayload],
      ["query"]
    ),
    writeTotalReward: IDL.Func([IDL.Nat, IDL.Text, IDL.Text, IDL.Nat], [], []),
  });
};
const init = ({ IDL }) => {
  return [];
};

module.exports = idlFactory;
