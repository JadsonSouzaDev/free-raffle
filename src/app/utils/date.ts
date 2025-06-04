export const getStartOfWeek = (date: Date = new Date()) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);  
  return startOfWeek.toISOString();
};

export const getEndOfWeek = (date: Date = new Date()) => {
  const endOfWeek = new Date(date);
  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek.toISOString();
};

export const getStartOfDay = (date: Date = new Date()) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay.toISOString();
};

export const getEndOfDay = (date: Date = new Date()) => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.toISOString();
};