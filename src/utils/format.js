
export const formatHandle = (handle) => {
  if (!handle) return '';
  const clean = handle.trim().replace(/^@+/, '');
  return `@${clean}`;
};

export const cleanHandle = (handle) => {
  if (!handle) return '';
  return handle.trim().replace(/^@+/, '').toLowerCase();
};
