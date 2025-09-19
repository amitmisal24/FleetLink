// simplified ride duration function (per spec)
function estimatedRideDurationHours(fromPincode, toPincode) {
  const f = parseInt(fromPincode, 10);
  const t = parseInt(toPincode, 10);
  if (Number.isNaN(f) || Number.isNaN(t)) {
    // fallback: 1 hour if bad pins
    return 1;
  }
  return Math.abs(f - t) % 24;
}

module.exports = { estimatedRideDurationHours };
