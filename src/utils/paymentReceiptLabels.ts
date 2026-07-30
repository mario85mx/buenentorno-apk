export function getPaymentReceiptLabels(conceptCount: number) {
  if (conceptCount === 1) {
    return {
      paidAmount: 'Monto pagado',
      conceptsAmount: 'Monto del concepto',
      conceptsTitle: 'Concepto pagado',
    };
  }

  if (conceptCount > 1) {
    return {
      paidAmount: 'Monto total pagado',
      conceptsAmount: 'Monto de conceptos',
      conceptsTitle: 'Conceptos pagados',
    };
  }

  return {
    paidAmount: 'Monto',
    conceptsAmount: 'Monto de conceptos',
    conceptsTitle: '',
  };
}

export function formatPaidConceptLabel(
  label: string,
  index: number,
  conceptCount: number,
) {
  return conceptCount > 1 ? `${index + 1}. ${label}` : label;
}
