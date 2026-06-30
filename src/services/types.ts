export type UserRole =
  | 'USER'
  | 'SUPERADMIN'
  | 'CONDO_ADMIN'
  | 'VIGILANCIA'
  | 'ACCESS_OPERATOR';
export type CondominiumModule =
  | 'NOTICES'
  | 'SURVEYS'
  | 'COMMON_AREAS'
  | 'VISITOR_ACCESS'
  | 'TICKETS'
  | 'BULK_UPLOAD'
  | 'REPORTS'
  | 'TRANSPARENCY';
export type ChargeType = 'MAINTENANCE' | 'WATER' | 'FINE' | 'DEBT' | 'OTHER';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD' | 'DEPOSIT' | 'OTHER';
export type ReceiptStatusCode = 'NOT_SENT' | 'PENDING_REVIEW' | 'APPROVED';
export type TicketStatusCode =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_RESIDENT'
  | 'RESOLVED'
  | 'CLOSED';
export type TicketPriorityCode = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type NotificationType =
  | 'NEW_CHARGE'
  | 'PAYMENT_REVIEW'
  | 'PAYMENT_APPROVED'
  | 'PAYMENT_REJECTED'
  | 'VISITOR_ACCESS_APPROVED'
  | 'VISITOR_ACCESS_ENTRY_REGISTERED'
  | 'COMMON_AREA_RESERVATION_CREATED'
  | 'COMMON_AREA_RESERVATION_APPROVED'
  | 'TICKET_CREATED'
  | 'TICKET_MESSAGE'
  | 'NOTICE';

export interface AuthUserCondominium {
  id: number;
  name: string;
  activeModules: CondominiumModule[];
  enabledVisitorAccessTypes: VisitorAccessType[];
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  condominoId?: number | null;
  currentCondominiumId?: number | null;
  currentCondominium?: AuthUserCondominium | null;
  availableCondominiums: AuthUserCondominium[];
  mustChangePassword: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  accepted: boolean;
  debugResetUrl?: string;
}

export interface UpdateMePayload {
  name?: string;
  email?: string;
}

export interface DebtBreakdown {
  maintenance: number;
  water: number;
  fines: number;
  debt: number;
  other: number;
}

export interface UnitBalance {
  totalCharges: number;
  totalPayments: number;
  totalAllocated: number;
  credit: number;
  balance: number;
  debts: DebtBreakdown;
}

export interface PaymentReceiptDto {
  id: number;
  fileUrl: string;
  hasFile: boolean;
  fileName?: string | null;
  mimeType?: string | null;
  notes?: string | null;
  uploadedAt: string;
}

export interface ChargeAllocationDto {
  paymentId: number;
  amount: number;
  createdAt: string;
}

export interface PaymentAllocationDto {
  amount: number;
  chargeId?: number;
}

export interface PaymentDto {
  id: number;
  amount: number;
  creditAppliedAmount: number;
  paymentDate: string;
  method: PaymentMethod;
  status: string;
  isHistorical: boolean;
  reference?: string | null;
  trackingKey?: string | null;
  notes?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  types: ChargeType[];
  balanceAfterPayment: number;
  allocations: PaymentAllocationDto[];
  receipts: PaymentReceiptDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ChargeDto {
  id: number;
  type: ChargeType;
  concept: string;
  description?: string | null;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate?: string | null;
  status: string;
  notes?: string | null;
  allocations: ChargeAllocationDto[];
  createdAt: string;
  updatedAt: string;
}

export interface UnitDetailDto {
  id: number;
  houseNumber: string;
  street?: string | null;
  condominiumArea?: string | null;
  notes?: string | null;
  balance: UnitBalance;
  charges: ChargeDto[];
  payments: PaymentDto[];
}

export interface CondominoAccessUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface CondominoDetailDto {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  accessUser?: CondominoAccessUser | null;
  units: UnitDetailDto[];
  balance: UnitBalance;
  receiptStatus: ReceiptStatusCode;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  data: NotificationItemDto[];
}

export interface NotificationItemDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  href?: string;
}

export interface NoticeAuthorDto {
  id: number;
  name: string;
}

export interface NoticeDto {
  id: number;
  title: string;
  contentHtml: string;
  excerpt: string;
  publishedAt: string;
  imageUrl?: string | null;
  createdBy?: NoticeAuthorDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListNoticesResponse {
  data: NoticeDto[];
}

export interface SurveyAuthorDto {
  id: number;
  name: string;
}

export interface SurveyOptionDto {
  id: number;
  text: string;
  position: number;
  voteCount: number;
  isSelected: boolean;
}

export interface SurveyDto {
  id: number;
  title: string;
  description?: string | null;
  publishedAt: string;
  closesAt?: string | null;
  isOpen: boolean;
  totalVotes: number;
  myOptionId?: number | null;
  createdBy?: SurveyAuthorDto | null;
  options: SurveyOptionDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ListSurveysResponse {
  data: SurveyDto[];
}

export interface SurveyVotePayload {
  optionId: number;
}

export interface DashboardSummaryDto {
  totalBalance: number;
  totalPaidThisMonth: number;
  unitsWithDebt: number;
  totalUnits: number;
  totalCondominos: number;
  debts: DebtBreakdown;
}

export interface TicketCondominoSummaryDto {
  id: number;
  name: string;
}

export interface TicketUnitSummaryDto {
  id: number;
  houseNumber: string;
}

export interface TicketUserSummaryDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface TicketSummaryDto {
  id: number;
  subject: string;
  category: string;
  priority: TicketPriorityCode;
  status: TicketStatusCode;
  condomino: TicketCondominoSummaryDto;
  unit?: TicketUnitSummaryDto | null;
  createdBy?: TicketUserSummaryDto | null;
  assignedAdmin?: TicketUserSummaryDto | null;
  lastMessagePreview?: string | null;
  messagesCount: number;
  resolvedAt?: string | null;
  closedAt?: string | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessageDto {
  id: number;
  content: string;
  author?: TicketUserSummaryDto | null;
  createdAt: string;
}

export interface TicketDetailDto extends TicketSummaryDto {
  messages: TicketMessageDto[];
}

export interface TicketListResponse {
  data: TicketSummaryDto[];
}

export interface CreateTicketPayload {
  subject: string;
  category: string;
  priority?: TicketPriorityCode;
  message: string;
  condominoId?: number;
  unitId?: number;
  assignedAdminUserId?: number;
}

export interface CreateTicketMessagePayload {
  message: string;
}

export interface UpdateTicketPayload {
  status?: TicketStatusCode;
  priority?: TicketPriorityCode;
  assignedAdminUserId?: number | null;
}

export interface UploadReceiptFilePayload {
  uri: string;
  name: string;
  mimeType: 'image/jpeg' | 'image/png' | 'application/pdf';
  size?: number | null;
}

export interface ReportPaymentPayload {
  unitId: number;
  amount: number;
  creditAppliedAmount?: number;
  paymentDate: string;
  method: PaymentMethod;
  reference?: string;
  trackingKey?: string;
  notes?: string;
  receiptNotes?: string;
  allocations?: Array<{
    chargeId: number;
    amount: number;
  }>;
  file?: UploadReceiptFilePayload;
}

export interface CommonAreaAuthorDto {
  id: number;
  name: string;
}

export interface CommonAreaDto {
  id: number;
  condominiumId: number;
  name: string;
  description?: string | null;
  location?: string | null;
  capacity?: number | null;
  isActive: boolean;
  requiresApproval: boolean;
  openingTime: string;
  closingTime: string;
  minAdvanceHours: number;
  maxDurationMinutes: number;
  createdBy?: CommonAreaAuthorDto | null;
  updatedBy?: CommonAreaAuthorDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommonAreaListResponse {
  data: CommonAreaDto[];
}

export type CommonAreaReservationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface CommonAreaReservationAreaDto {
  id: number;
  name: string;
  location?: string | null;
}

export interface CommonAreaReservationCondominoDto {
  id: number;
  name: string;
}

export interface CommonAreaReservationUnitDto {
  id: number;
  houseNumber: string;
}

export interface CommonAreaReservationUserDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface CommonAreaReservationDto {
  id: number;
  status: CommonAreaReservationStatus;
  area: CommonAreaReservationAreaDto;
  condomino: CommonAreaReservationCondominoDto;
  unit: CommonAreaReservationUnitDto;
  createdBy?: CommonAreaReservationUserDto | null;
  reviewedBy?: CommonAreaReservationUserDto | null;
  cancelledBy?: CommonAreaReservationUserDto | null;
  startAt: string;
  endAt: string;
  attendees?: number | null;
  notes?: string | null;
  reviewNotes?: string | null;
  reviewedAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommonAreaReservationListResponse {
  data: CommonAreaReservationDto[];
}

export interface CreateCommonAreaReservationPayload {
  commonAreaId: number;
  unitId: number;
  startAt: string;
  endAt: string;
  notes?: string;
}

export type VisitorAccessType =
  | 'VISITOR'
  | 'PROVIDER'
  | 'DELIVERY'
  | 'MOVE'
  | 'MAINTENANCE'
  | 'RIDE_SERVICE'
  | 'OTHER';

export type VisitorAccessStatus =
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'USED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REJECTED';

export interface VisitorAccessVehicleDto {
  plate?: string | null;
  brand?: string | null;
  color?: string | null;
}

export interface VisitorAccessResidentSummaryDto {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface VisitorAccessUserSummaryDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface VisitorAccessUnitSummaryDto {
  id: number;
  houseNumber: string;
  street?: string | null;
}

export interface VisitorAccessLogDto {
  id: number;
  entryAt?: string | null;
  exitAt?: string | null;
  entryGuardName?: string | null;
  exitGuardName?: string | null;
  entryNotes?: string | null;
  exitNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VisitorAccessLogAccessSummaryDto {
  id: number;
  visitorName: string;
  visitType: VisitorAccessType;
  visitorPhone?: string | null;
  companyName?: string | null;
  trackingNumber?: string | null;
  peopleCount?: number | null;
  status: VisitorAccessStatus;
  validFrom: string;
  validTo: string;
  unit: VisitorAccessUnitSummaryDto;
  resident?: VisitorAccessResidentSummaryDto | null;
  createdBy: VisitorAccessUserSummaryDto;
  vehicle: VisitorAccessVehicleDto;
}

export interface VisitorAccessLogEntryDto extends VisitorAccessLogDto {
  access: VisitorAccessLogAccessSummaryDto;
}

export interface VisitorAccessLogsResponse {
  data: VisitorAccessLogEntryDto[];
}

export interface VisitorAccessDto {
  id: number;
  visitorName: string;
  visitType: VisitorAccessType;
  visitorPhone?: string | null;
  companyName?: string | null;
  trackingNumber?: string | null;
  peopleCount?: number | null;
  vehicle: VisitorAccessVehicleDto;
  validFrom: string;
  validTo: string;
  status: VisitorAccessStatus;
  rejectionReason?: string | null;
  unit: VisitorAccessUnitSummaryDto;
  resident?: VisitorAccessResidentSummaryDto | null;
  createdBy: VisitorAccessUserSummaryDto;
  log?: VisitorAccessLogDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface VisitorAccessCreatedDto extends VisitorAccessDto {
  qrToken: string;
}

export interface VisitorAccessListResponse {
  data: VisitorAccessDto[];
}

export interface CreateVisitorAccessPayload {
  visitorName: string;
  visitType: VisitorAccessType;
  visitorPhone?: string;
  companyName?: string;
  trackingNumber?: string;
  peopleCount?: number;
  vehiclePlate?: string;
  vehicleBrand?: string;
  vehicleColor?: string;
  validFrom: string;
  validTo: string;
}

export interface ValidateVisitorAccessPayload {
  qrToken: string;
}

export interface ValidateVisitorAccessResponse {
  accessId: number;
  unit: string;
  unitStreet?: string | null;
  visitorName: string;
  visitType: VisitorAccessType;
  visitorPhone?: string | null;
  companyName?: string | null;
  trackingNumber?: string | null;
  peopleCount?: number | null;
  vehicle: VisitorAccessVehicleDto;
  validFrom: string;
  validTo: string;
  status: VisitorAccessStatus;
  resident?: VisitorAccessResidentSummaryDto | null;
  createdBy: VisitorAccessUserSummaryDto;
}

export interface RegisterVisitorAccessPayload {
  guardName: string;
  notes?: string;
}
