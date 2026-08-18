export const dateKey = (ts: { toDate: () => Date }) => {
  return ts.toDate().toISOString().split('T')[0];
};
