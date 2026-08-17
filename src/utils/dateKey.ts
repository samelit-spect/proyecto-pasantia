export const dateKey = (ts: { toDate: () => Date }) => {
  const d = ts.toDate();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().split('T')[0];
};
