
export const formatCountdown = (expiresAt) => {
  const expireTime = new Date(expiresAt).getTime();
  const now = Date.now();
  const remainingMs = expireTime - now;

  if (remainingMs <= 0) {
    return 'Expired';
  }

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
};

export const hasExpired = (expiresAt) => {
  const expireTime = new Date(expiresAt).getTime();
  return Date.now() >= expireTime;
};
