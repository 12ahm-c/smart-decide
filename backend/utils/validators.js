function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password && password.length >= 6;
}

function validateSessionData(data) {
  const { title, durationSeconds, analysisMethod } = data;

  if (!title || title.trim().length === 0) {
    return { valid: false, message: 'العنوان مطلوب' };
  }

  if (!durationSeconds || durationSeconds <= 0) {
    return { valid: false, message: 'المدة يجب أن تكون أكبر من صفر' };
  }

  if (!analysisMethod || !['majority', 'preference'].includes(analysisMethod)) {
    return { valid: false, message: 'طريقة التحليل غير صحيحة' };
  }

  return { valid: true };
}

module.exports = {
  validateEmail,
  validatePassword,
  validateSessionData
};
