const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { requireAdmin } = require('../src/middleware/admin');

test('Authentication - Password Hashing and Comparison', async () => {
  const plainPassword = 'SecurePassword@123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);

  assert.notEqual(hash, plainPassword, 'Password must not be stored in plain text');
  assert.ok(hash.startsWith('$2'), 'Hash must follow bcrypt format');

  const match = await bcrypt.compare(plainPassword, hash);
  assert.equal(match, true, 'Correct password must verify successfully');

  const wrongMatch = await bcrypt.compare('WrongPassword999', hash);
  assert.equal(wrongMatch, false, 'Incorrect password must be rejected');
});

test('Authentication - JWT Generation and Verification', () => {
  const secret = 'test_secret_key_12345';
  const payload = {
    id: '671234567890abcdef123456',
    email: 'student@college.edu',
    role: 'customer',
  };

  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  assert.ok(typeof token === 'string' && token.length > 20, 'Should generate valid JWT token');

  // Verify valid token
  const decoded = jwt.verify(token, secret);
  assert.equal(decoded.id, payload.id);
  assert.equal(decoded.email, payload.email);
  assert.equal(decoded.role, 'customer');

  // Invalid secret verification
  assert.throws(() => {
    jwt.verify(token, 'wrong_secret');
  }, /invalid signature/);

  // Expired token verification
  const expiredToken = jwt.sign(payload, secret, { expiresIn: '0s' });
  assert.throws(() => {
    jwt.verify(expiredToken, secret);
  }, /jwt expired/);
});

test('Authorization - Admin Middleware Guard', () => {
  let nextCalled = false;
  let responseStatus = null;
  let responseBody = null;

  const mockRes = () => ({
    status: (code) => {
      responseStatus = code;
      return {
        json: (data) => {
          responseBody = data;
        },
      };
    },
  });

  // 1. Unauthenticated request (no req.user)
  const reqUnauth = {};
  nextCalled = false;
  requireAdmin(reqUnauth, mockRes(), () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, false, 'Next must not be called when user is unauthenticated');
  assert.equal(responseStatus, 401, 'Should respond with 401 Unauthorized');

  // 2. Customer user (req.user.role = 'customer')
  const reqCustomer = { user: { role: 'customer', email: 'customer@imovies.com' } };
  nextCalled = false;
  requireAdmin(reqCustomer, mockRes(), () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, false, 'Next must not be called when user is a customer');
  assert.equal(responseStatus, 403, 'Should respond with 403 Forbidden');
  assert.ok(responseBody.message.includes('Administrator privileges required'));

  // 3. Admin user (req.user.role = 'admin')
  const reqAdmin = { user: { role: 'admin', email: 'admin@imovies.com' } };
  nextCalled = false;
  requireAdmin(reqAdmin, mockRes(), () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true, 'Next must be called when user is admin');
});
