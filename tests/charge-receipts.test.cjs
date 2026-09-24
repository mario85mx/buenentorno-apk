const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Load the pure mappers without starting the native API/auth runtime.
const source = fs.readFileSync(path.join(__dirname, '../src/services/mappers.ts'), 'utf8');
const moduleExports = {};
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, {
  exports: moduleExports,
  require: (name) => {
    assert.equal(name, './api');
    return { API_BASE_URL: '', buildApiUrl: (value) => value };
  },
});

function movements(status = 'PAID', pendingAmount = 0, paymentOverrides = {}) {
  const charge = {
    id: 1, concept: 'Mantenimiento', type: 'MAINTENANCE', amount: 100,
    paidAmount: 100 - pendingAmount, pendingAmount, status,
    createdAt: '2026-01-01', dueDate: '2026-01-31', allocations: [],
  };
  const payment = (id, amount) => ({
    id, amount, creditAppliedAmount: 0, status: 'ACTIVE', isHistorical: false,
    paymentDate: `2026-01-0${id}`, createdAt: '2026-01-01', method: 'CASH',
    allocations: [{ chargeId: 1, amount }], types: ['MAINTENANCE'], receipts: [],
    ...paymentOverrides,
  });
  const first = payment(1, 40);
  // The second payment also pays another concept; the receipt must exclude it.
  const second = payment(2, 60);
  second.amount = 90;
  second.allocations.push({ chargeId: 2, amount: 30 });
  return moduleExports.mapAccountMovements({ units: [{
    id: 1, houseNumber: '10', charges: [charge], payments: [first, second],
  }] });
}

test('partial, pending, cancelled, and inconsistent paid charges have no receipt', () => {
  for (const [status, pending] of [['PARTIAL', 60], ['PENDING', 100], ['CANCELLED', 0], ['PAID', 0.01]]) {
    assert.ok(movements(status, pending).every((item) => !item.receipt));
  }
});

test('settled charge consolidates installments and excludes other concepts', () => {
  const items = movements();
  const receipt = items.find((item) => item.kind === 'charge').receipt;
  assert.equal(receipt.id, '1');
  assert.equal(receipt.amount, moduleExports.formatCurrency(100));
  assert.equal(receipt.concepts.length, 1);
  assert.equal(receipt.payments.length, 2);
  assert.equal(receipt.payments[0].amount, moduleExports.formatCurrency(40));
  assert.equal(receipt.payments[1].amount, moduleExports.formatCurrency(60));
  assert.ok(items.filter((item) => item.kind === 'payment').every((item) => !item.receipt));
});

test('unapproved, cancelled, and historical payments cannot generate a charge receipt', () => {
  for (const overrides of [{ status: 'PENDING_REVIEW' }, { status: 'REJECTED' }, { status: 'CANCELLED' }, { isHistorical: true }]) {
    assert.ok(movements('PAID', 0, overrides).every((item) => !item.receipt));
  }
});

test('groups installments and keeps only the amount belonging to absent charges separate', () => {
  const items = movements();
  const charge = items.find((item) => item.kind === 'charge');
  assert.equal(charge.appliedPayments.length, 2);
  assert.equal(charge.appliedPayments[0].amount, moduleExports.formatCurrency(40));
  assert.equal(charge.appliedPayments[1].amount, moduleExports.formatCurrency(60));
  const standalone = items.filter((item) => item.kind === 'payment');
  assert.equal(standalone.length, 1);
  assert.equal(standalone[0].amount, moduleExports.formatCurrency(30));
});

function groupedFixture({ historical = false, extra = 0, noAllocations = false } = {}) {
  const charges = [1, 2].map((id) => ({
    id, concept: `Cargo ${id}`, type: 'MAINTENANCE', amount: 100,
    paidAmount: 50, pendingAmount: 50, status: 'PARTIAL',
    createdAt: '2026-01-01', allocations: [],
  }));
  const payment = {
    id: 1, amount: 80 + extra, creditAppliedAmount: 20, status: 'ACTIVE', isHistorical: historical,
    paymentDate: '2026-01-02', createdAt: '2026-01-02', method: 'CASH',
    types: ['MAINTENANCE'], receipts: [],
    allocations: noAllocations ? [] : [
      { chargeId: 1, amount: 50, creditAppliedAmount: 20 },
      { chargeId: 2, amount: 50, creditAppliedAmount: 0 },
    ],
  };
  return moduleExports.mapAccountMovements({ units: [{ id: 1, houseNumber: '10', charges, payments: [payment] }] });
}

test('splits a payment including credit across two charges without duplicate standalone payments', () => {
  const items = groupedFixture();
  assert.equal(items.length, 2);
  assert.ok(items.every((item) => item.kind === 'charge'));
  assert.equal(items[0].appliedPayments[0].amount, moduleExports.formatCurrency(50));
  assert.equal(items[0].appliedPayments[0].creditAmount, moduleExports.formatCurrency(20));
  assert.equal(items[1].appliedPayments[0].amount, moduleExports.formatCurrency(50));
  assert.ok(items.every((item) => !item.receipt));
});

test('preserves generated credit, unallocated payments and historical payments', () => {
  const credit = groupedFixture({ extra: 25 }).find((item) => item.kind === 'payment');
  assert.equal(credit.amount, moduleExports.formatCurrency(25));
  assert.equal(credit.concept, 'Saldo a favor generado');
  const unallocated = groupedFixture({ noAllocations: true }).find((item) => item.kind === 'payment');
  assert.equal(unallocated.amount, moduleExports.formatCurrency(80));
  const historical = groupedFixture({ historical: true });
  assert.equal(historical.length, 3);
  assert.ok(historical.filter((item) => item.kind === 'charge').every((item) => item.appliedPayments.length === 0));
});
