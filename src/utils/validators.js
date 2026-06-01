
export const validateBio = (bio) => {
  if (typeof bio!== 'string') return false;
  return bio.trim().length > 0 && bio.trim().length <= 100;
};

export const validatePost = (content) => {
  if (typeof content!== 'string') return false;
  return content.trim().length > 0 && content.trim().length <= 140;
};

export const validateHandle = (handle) => {
  if (typeof handle!== 'string') return false;
  const clean = handle.trim().replace(/^@+/, '');
  const handleRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return handleRegex.test(clean);
};
