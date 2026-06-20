import type { Ticket } from '../screens/ticketsData';
import { API_BASE_URL, buildApiUrl } from './api';
import type {
  ChargeDto,
  ChargeType,
  CondominoDetailDto,
  DashboardSummaryDto,
  NotificationItemDto,
  NoticeDto,
  PaymentDto,
  TicketDetailDto,
  TicketPriorityCode,
  TicketStatusCode,
  TicketSummaryDto,
  UnitDetailDto,
  UserRole,
} from './types';
import type {
  HomeOverview,
  Notice,
  NotificationViewModel,
  PaymentConceptDetail,
  PaymentReceipt,
  PaymentTransactionReceipt,
  PaymentTransaction,
} from './viewModels';

function asText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null;
}

export function formatCurrency(value: number) {
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export function formatDate(value?: string | null) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function getMonthSourceParts(value?: string | null) {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{4})-(\d{2})/);

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);

    if (Number.isFinite(year) && Number.isFinite(month)) {
      return { year, month };
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  };
}

function getChargeDueDate(charge: {
  dueDate?: string | null;
  createdAt?: string | null;
}) {
  const source =
    getMonthSourceParts(charge.dueDate) ?? getMonthSourceParts(charge.createdAt);

  if (!source) {
    return null;
  }

  return new Date(source.year, source.month - 1, 10);
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatRelativeTime(value?: string | null) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha';
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return 'Hace un momento';
  }

  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `Hace ${diffHours} h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `Hace ${diffDays} d`;
  }

  return formatDate(value);
}

export function formatMonthLabel() {
  return `Fecha: ${formatDate(new Date().toISOString())}`;
}

export function formatCondominoHouseLabel(
  condomino: CondominoDetailDto | undefined,
) {
  const houseNumbers = (condomino?.units ?? [])
    .map((unit) => unit.houseNumber.trim())
    .filter(Boolean);

  if (!houseNumbers.length) {
    return 'Sin casa asociada';
  }

  return houseNumbers.join(', ');
}

function chargeTypeLabel(type: ChargeType) {
  switch (type) {
    case 'MAINTENANCE':
      return 'Mantenimiento';
    case 'WATER':
      return 'Agua';
    case 'FINE':
      return 'Multa';
    case 'DEBT':
      return 'Adeudo';
    default:
      return 'Otro';
  }
}

function paymentMethodLabel(method: PaymentDto['method']) {
  switch (method) {
    case 'TRANSFER':
      return 'Transferencia';
    case 'CARD':
      return 'Tarjeta';
    case 'DEPOSIT':
      return 'Depósito';
    case 'CASH':
      return 'Efectivo';
    default:
      return 'Otro';
  }
}

function paymentStatusLabel(status: string): PaymentReceipt['status'] {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === 'ACTIVE' || normalizedStatus === 'PAID') {
    return 'Pagado';
  }

  if (normalizedStatus === 'PENDING_REVIEW') {
    return 'En revisión';
  }

  if (normalizedStatus === 'REJECTED') {
    return 'Rechazado';
  }

  if (normalizedStatus === 'CANCELLED') {
    return 'Cancelado';
  }

  if (normalizedStatus === 'PARTIAL') {
    return 'Parcial';
  }

  if (normalizedStatus === 'PENDING') {
    return 'Pendiente';
  }

  return 'Pendiente';
}

function paymentStatusBadgeVariant(
  status: PaymentReceipt['status'],
): PaymentReceipt['badgeVariant'] {
  if (status === 'Pagado') {
    return 'success';
  }

  return status === 'Rechazado' || status === 'Cancelado'
    ? 'danger'
    : 'warning';
}

function getChargeStatusBadgeVariant(
  status: PaymentTransaction['status'],
): PaymentTransaction['badgeVariant'] {
  if (status === 'Pagado') {
    return 'success';
  }

  return status === 'Vencido' || status === 'Rechazado' || status === 'Cancelado'
    ? 'danger'
    : 'warning';
}

function getUnitBlockedChargeIds(unit: UnitDetailDto) {
  const blockedChargeIds = new Set<number>();

  unit.payments.forEach((payment) => {
    if (payment.status !== 'PENDING_REVIEW') {
      return;
    }

    payment.allocations.forEach((allocation) => {
      if (allocation.chargeId) {
        blockedChargeIds.add(allocation.chargeId);
      }
    });
  });

  return blockedChargeIds;
}

function getClientChargeStatus(
  charge: ChargeDto,
  hasPendingReview: boolean,
): PaymentTransaction['status'] {
  if (charge.pendingAmount <= 0 || charge.status === 'PAID') {
    return 'Pagado';
  }

  if (hasPendingReview) {
    return 'En revisión';
  }

  const dueDate = getChargeDueDate(charge);

  if (!dueDate) {
    return 'Pendiente';
  }

  const today = new Date();
  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  if (currentDate.getTime() > dueDate.getTime()) {
    return 'Vencido';
  }

  return 'Pendiente';
}

function paymentReviewLabel(payment: PaymentDto, status: PaymentReceipt['status']) {
  if (status === 'Pagado') {
    return asText(payment.reviewNotes) ?? 'Aprobado por administración';
  }

  if (status === 'Rechazado') {
    return asText(payment.reviewNotes) ?? 'Rechazado por administración';
  }

  if (status === 'Cancelado') {
    return asText(payment.cancelReason) ?? 'Pago cancelado';
  }

  if (status === 'Parcial') {
    return asText(payment.reviewNotes) ?? 'Pago aplicado parcialmente';
  }

  if (status === 'Pendiente') {
    return asText(payment.reviewNotes) ?? 'Pendiente de aplicación';
  }

  return 'Pendiente de revisión';
}

function dedupeConcepts(concepts: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      concepts
        .map((concept) => asText(concept))
        .filter((concept): concept is string => concept !== null),
    ),
  );
}

function getMovementConceptPreview(concepts: string[]) {
  return concepts.slice(0, 2).join(', ');
}

function getPaymentConcepts(payment: PaymentDto, unit: UnitDetailDto) {
  const conceptDetails = getPaymentConceptDetails(payment, unit);
  return conceptDetails.map((detail) => detail.label);
}

function getPaymentConceptDetails(
  payment: PaymentDto,
  unit: UnitDetailDto,
): PaymentConceptDetail[] {
  const detailMap = new Map<string, number>();

  payment.allocations.forEach((allocation) => {
    const charge = allocation.chargeId
      ? unit.charges.find((item) => item.id === allocation.chargeId) ?? null
      : null;
    const label =
      charge?.concept ??
      (payment.types.length === 1 ? chargeTypeLabel(payment.types[0]) : null) ??
      'Pago reportado';
    const current = detailMap.get(label) ?? 0;
    detailMap.set(label, current + allocation.amount);
  });

  if (detailMap.size > 0) {
    return Array.from(detailMap.entries()).map(([label, amount]) => ({
      label,
      amount: formatCurrency(amount),
    }));
  }
  const fallbackConcepts = dedupeConcepts(payment.types.map(chargeTypeLabel));

  if (fallbackConcepts.length > 0) {
    return fallbackConcepts.map((label) => ({
      label,
      amount: formatCurrency(payment.amount),
    }));
  }

  return [{ label: 'Pago reportado', amount: formatCurrency(payment.amount) }];
}

function getPaymentTypesSummary(payment: PaymentDto) {
  if (payment.types.length > 0) {
    return payment.types.map(chargeTypeLabel).join(', ');
  }

  return 'Pago reportado';
}

function getPaymentConceptsAmount(payment: PaymentDto) {
  const conceptsAmount = payment.allocations.reduce(
    (sum, allocation) => sum + allocation.amount,
    0,
  );

  return formatCurrency(conceptsAmount);
}

function getPaymentCreditGenerated(payment: PaymentDto) {
  const conceptsAmount = payment.allocations.reduce(
    (sum, allocation) => sum + allocation.amount,
    0,
  );

  return formatCurrency(Math.max(payment.amount - conceptsAmount, 0));
}

function sanitizeHtmlToParagraphs(html: string) {
  const normalized = html
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function isReceiptValidated(payment: PaymentDto) {
  const normalizedStatus = payment.status.toUpperCase();

  return (
    normalizedStatus.includes('APPROVED') ||
    normalizedStatus.includes('VALIDATED') ||
    (!!payment.reviewedAt && !normalizedStatus.includes('REJECT'))
  );
}

export function mapDashboardOverview(
  summary: DashboardSummaryDto | undefined,
  condomino: CondominoDetailDto | undefined,
): HomeOverview {
  const debts = condomino?.balance.debts ?? summary?.debts;

  return {
    periodLabel: formatMonthLabel(),
    houseLabel: formatCondominoHouseLabel(condomino),
    creditLabel: `Saldo a favor: ${formatCurrency(condomino?.balance.credit ?? 0)}`,
    pendingBalance: formatCurrency(condomino?.balance.balance ?? summary?.totalBalance ?? 0),
    maintenanceBalance: formatCurrency(debts?.maintenance ?? 0),
    waterBalance: formatCurrency(debts?.water ?? 0),
    otherBalance: formatCurrency(
      (debts?.fines ?? 0) + (debts?.debt ?? 0) + (debts?.other ?? 0),
    ),
  };
}

export function mapChargesToTransactions(
  condomino: CondominoDetailDto | undefined,
): PaymentTransaction[] {
  if (!condomino) {
    return [];
  }

  return condomino.units
    .flatMap((unit) =>
      unit.charges.map((charge) => ({
        charge,
        unit,
        sortAt: new Date(charge.dueDate ?? charge.createdAt).getTime(),
      })),
    )
    .sort((left, right) => right.sortAt - left.sortAt)
    .map(({ charge, unit }) => mapChargeToTransaction(charge, unit));
}

export function mapAccountMovements(
  condomino: CondominoDetailDto | undefined,
): PaymentTransaction[] {
  if (!condomino) {
    return [];
  }

  const chargeMovements = condomino.units.flatMap((unit) =>
    unit.charges.map((charge) => ({
      transaction: mapChargeToTransaction(charge, unit),
      sortAt: new Date(charge.dueDate ?? charge.createdAt).getTime(),
    })),
  );

  const paymentMovements = condomino.units.flatMap((unit) =>
    unit.payments.map((payment) => ({
      transaction: mapPaymentToTransaction(payment, unit),
      sortAt: new Date(payment.paymentDate ?? payment.createdAt).getTime(),
    })),
  );

  return [...chargeMovements, ...paymentMovements]
    .sort((left, right) => right.sortAt - left.sortAt)
    .map(({ transaction }) => transaction);
}

function mapChargeToTransaction(
  charge: ChargeDto,
  unit: UnitDetailDto,
): PaymentTransaction {
  const blockedChargeIds = getUnitBlockedChargeIds(unit);
  const status = getClientChargeStatus(charge, blockedChargeIds.has(charge.id));
  const amount = charge.pendingAmount > 0 ? charge.pendingAmount : charge.amount;
  const sourcePaymentId = charge.allocations[0]?.paymentId;
  const sourcePayment = sourcePaymentId
    ? unit.payments.find((payment) => payment.id === sourcePaymentId) ?? null
    : null;
  const concepts = [charge.concept];

  return {
    id: String(charge.id),
    kind: 'charge',
    concept: getMovementConceptPreview(concepts),
    concepts,
    summary: `Cargo de ${chargeTypeLabel(charge.type).toLowerCase()} asociado a la casa ${unit.houseNumber}.`,
    dateLabel: 'Fecha de vencimiento',
    dueDate: formatDate(charge.dueDate ?? charge.createdAt),
    status,
    amount: formatCurrency(amount),
    reference: sourcePayment ? asText(sourcePayment.reference) ?? 'Sin referencia' : 'Sin referencia',
    method: sourcePayment
      ? paymentMethodLabel(sourcePayment.method)
      : 'Sin método registrado',
    badgeVariant: getChargeStatusBadgeVariant(status),
    receipt: sourcePayment ? mapTransactionReceipt(sourcePayment, unit) : null,
  };
}

function mapPaymentToTransaction(
  payment: PaymentDto,
  unit: UnitDetailDto,
): PaymentTransaction {
  const receipt = mapTransactionReceipt(payment, unit);
  const concepts = getPaymentConcepts(payment, unit);
  const status = paymentStatusLabel(payment.status);
  const paymentLabel = payment.isHistorical ? 'Pago histórico' : 'Pago registrado';

  return {
    id: `payment-${payment.id}`,
    kind: 'payment',
    concept: getMovementConceptPreview(concepts),
    concepts,
    summary: `${paymentLabel} aplicado a la cuenta de la casa ${unit.houseNumber}.`,
    dateLabel: 'Fecha de pago',
    dueDate: formatDate(payment.paymentDate),
    status,
    amount: formatCurrency(payment.amount),
    reference: asText(payment.reference) ?? 'Sin referencia',
    method: paymentMethodLabel(payment.method),
    badgeVariant: paymentStatusBadgeVariant(status),
    receipt,
  };
}

function mapTransactionReceipt(
  payment: PaymentDto,
  unit: UnitDetailDto,
): PaymentTransactionReceipt {
  const printableStatus =
    payment.status.toUpperCase() === 'ACTIVE'
      ? 'Pagado'
      : paymentStatusLabel(payment.status);
  const concepts = getPaymentConcepts(payment, unit);
  const conceptDetails = getPaymentConceptDetails(payment, unit);

  return {
    id: String(payment.id),
    unit: unit.houseNumber,
    types: getPaymentTypesSummary(payment),
    concepts,
    conceptDetails,
    amount: formatCurrency(payment.amount),
    conceptsAmount: getPaymentConceptsAmount(payment),
    creditGenerated: getPaymentCreditGenerated(payment),
    paymentDate: formatDate(payment.paymentDate),
    method: paymentMethodLabel(payment.method),
    reference: asText(payment.reference) ?? 'Sin referencia',
    trackingKey: asText(payment.trackingKey) ?? 'Sin clave',
    status: printableStatus,
    reviewNotes: asText(payment.reviewNotes) ?? 'Aprobado sin archivo adjunto',
  };
}

export function mapPaymentsToReceipts(
  condomino: CondominoDetailDto | undefined,
): PaymentReceipt[] {
  if (!condomino) {
    return [];
  }

  return condomino.units
    .flatMap((unit) =>
      unit.payments.flatMap((payment) =>
        payment.receipts.map((receipt) => ({
          payment,
          receipt,
          unit,
          sortAt: new Date(receipt.uploadedAt).getTime(),
        })),
      ),
    )
    .sort((left, right) => right.sortAt - left.sortAt)
    .map(({ payment, receipt, unit }) =>
      mapReceipt(payment, receipt, unit),
    );
}

function mapReceipt(
  payment: PaymentDto,
  receipt: PaymentDto['receipts'][number],
  unit: UnitDetailDto,
): PaymentReceipt {
  const concepts = getPaymentConcepts(payment, unit);
  const conceptDetails = getPaymentConceptDetails(payment, unit);
  const status = paymentStatusLabel(payment.status);

  return {
    id: String(receipt.id),
    type: getMovementConceptPreview(concepts),
    unit: unit.houseNumber,
    types: getPaymentTypesSummary(payment),
    concepts,
    conceptDetails,
    amount: formatCurrency(payment.amount),
    conceptsAmount: getPaymentConceptsAmount(payment),
    creditGenerated: getPaymentCreditGenerated(payment),
    generated: formatDate(receipt.uploadedAt),
    paymentDate: formatDate(payment.paymentDate),
    dueDate: formatDate(payment.paymentDate),
    method: paymentMethodLabel(payment.method),
    reference: asText(payment.reference) ?? 'Sin referencia',
    trackingKey: asText(payment.trackingKey) ?? 'Sin clave',
    status,
    review: paymentReviewLabel(payment, status),
    voucher: receipt.fileName ?? `comprobante-${receipt.id}`,
    fileUrl: buildApiUrl(receipt.fileUrl),
    mimeType: receipt.mimeType,
    badgeVariant: paymentStatusBadgeVariant(status),
  };
}

export function mapNoticeDtoToViewModel(notice: NoticeDto): Notice {
  return {
    id: String(notice.id),
    title: notice.title,
    excerpt: notice.excerpt,
    date: formatDate(notice.publishedAt),
    publishedBy: notice.createdBy?.name ?? 'Administración Buen Entorno',
    imageUrl: buildApiUrl(notice.imageUrl ?? `/notices/${notice.id}/image`) || API_BASE_URL,
    content: sanitizeHtmlToParagraphs(notice.contentHtml),
  };
}

export function mapNotificationToViewModel(
  notification: NotificationItemDto,
): NotificationViewModel {
  const baseNotification = {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    time: formatRelativeTime(notification.createdAt),
    createdAt: notification.createdAt,
    href: notification.href,
  };

  switch (notification.type) {
    case 'NEW_CHARGE':
      return {
        ...baseNotification,
        icon: 'wallet-outline',
        accentClassName: 'bg-danger/10',
        iconColor: '#FF1F1F',
      };
    case 'NOTICE':
      return {
        ...baseNotification,
        icon: 'megaphone-outline',
        accentClassName: 'bg-warning/10',
        iconColor: '#C59D2D',
      };
    case 'PAYMENT_APPROVED':
    case 'PAYMENT_REJECTED':
    case 'PAYMENT_REVIEW':
      return {
        ...baseNotification,
        icon: 'wallet-outline',
        accentClassName: 'bg-success/10',
        iconColor: '#83A96A',
      };
    default:
      return {
        ...baseNotification,
        icon: 'ticket-outline',
        accentClassName: 'bg-[#E7DEF5]',
        iconColor: '#5A3D8A',
      };
  }
}

export function mapRoleLabel(role: UserRole) {
  switch (role) {
    case 'SUPERADMIN':
      return 'Superadministrador';
    case 'CONDO_ADMIN':
      return 'Administrador';
    case 'VIGILANCIA':
      return 'Vigilancia';
    default:
      return 'Residente';
  }
}

function mapTicketPriority(priority: TicketPriorityCode): Ticket['priority'] {
  switch (priority) {
    case 'LOW':
      return 'Baja';
    case 'MEDIUM':
      return 'Media';
    case 'URGENT':
      return 'Urgente';
    default:
      return 'Alta';
  }
}

export function unmapTicketPriority(priority: Ticket['priority']): TicketPriorityCode {
  switch (priority) {
    case 'Baja':
      return 'LOW';
    case 'Media':
      return 'MEDIUM';
    case 'Urgente':
      return 'URGENT';
    default:
      return 'HIGH';
  }
}

function mapTicketStatus(status: TicketStatusCode): Ticket['status'] {
  switch (status) {
    case 'IN_PROGRESS':
      return 'En proceso';
    case 'WAITING_RESIDENT':
      return 'En espera del condómino';
    case 'RESOLVED':
      return 'Resuelto';
    case 'CLOSED':
      return 'Cerrado';
    default:
      return 'Abierto';
  }
}

export function unmapTicketStatus(status: Ticket['status']): TicketStatusCode {
  switch (status) {
    case 'En proceso':
      return 'IN_PROGRESS';
    case 'En espera del condómino':
      return 'WAITING_RESIDENT';
    case 'Resuelto':
      return 'RESOLVED';
    case 'Cerrado':
      return 'CLOSED';
    default:
      return 'OPEN';
  }
}

function mapTicketMessageAuthorName(author?: { name: string; role: UserRole } | null) {
  if (!author) {
    return 'Sin autor';
  }

  return author.role === 'USER' ? 'Residente' : author.name;
}

function isResidentMessage(author?: { role: UserRole } | null) {
  return author?.role === 'USER';
}

export function mapTicketSummaryToViewModel(ticket: TicketSummaryDto): Ticket {
  return {
    id: String(ticket.id),
    subject: ticket.subject,
    house: ticket.unit?.houseNumber ?? 'General',
    category: ticket.category,
    priority: mapTicketPriority(ticket.priority),
    status: mapTicketStatus(ticket.status),
    residentName: ticket.condomino.name,
    assignedTo: ticket.assignedAdmin?.name ?? 'Sin asignar',
    createdAt: formatDateTime(ticket.createdAt),
    lastActivity: formatDateTime(ticket.lastMessageAt),
    messagesCount: ticket.messagesCount,
    messages: [],
  };
}

export function mapTicketDetailToViewModel(ticket: TicketDetailDto): Ticket {
  return {
    ...mapTicketSummaryToViewModel(ticket),
    messages: ticket.messages.map((message) => ({
      id: String(message.id),
      author: mapTicketMessageAuthorName(message.author),
      body: message.content,
      timestamp: formatDateTime(message.createdAt),
      isResident: isResidentMessage(message.author),
    })),
  };
}

export function buildTicketCreatePayload(params: {
  subject: string;
  category: string;
  priority: Ticket['priority'];
  message: string;
  condominoId?: number;
  unitId?: number;
}) {
  return {
    subject: params.subject,
    category: params.category,
    priority: unmapTicketPriority(params.priority),
    message: params.message,
    condominoId: params.condominoId,
    unitId: params.unitId,
  };
}
