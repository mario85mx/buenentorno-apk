import { useQuery } from "@tanstack/react-query";
import { getMyCondominoDetail } from "../services/condomino";
import { queryKeys } from "../services/queryKeys";
import {
  mapAccountMovements,
  mapPaymentsToReceipts,
  formatCurrency,
} from "../services/mappers";
import type { PaymentReceipt } from "../services/viewModels";
import { useAppThemeColors } from "../theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Badge from "../components/atoms/Badge";
import Button from "../components/atoms/Button";
import Card from "../components/atoms/Card";
import type { PaymentTransaction } from "../services/viewModels";
import {
  formatPaidConceptLabel,
  getPaymentReceiptLabels,
} from "../utils/paymentReceiptLabels";

export type { PaymentTransaction } from "../services/viewModels";

export interface PaymentTransactionDetailProps {
  onBack?: () => void;
  onUpload?: (unitId: number, chargeId: number) => void;
  onReceipt?: (receipt: PaymentReceipt) => void;
  transaction?: PaymentTransaction | null;
}

function formatReceiptDate(value: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default function PaymentTransactionDetail({
  onBack,
  transaction,
  onUpload,
  onReceipt,
}: PaymentTransactionDetailProps) {
  const themeColors = useAppThemeColors();
  const [isReceiptVisible, setIsReceiptVisible] = useState(false);
  const query = useQuery({
    queryKey: queryKeys.condominiumDetail,
    queryFn: getMyCondominoDetail,
    refetchInterval: 15000,
  });
  const currentTransaction: PaymentTransaction = mapAccountMovements(
    query.data,
  ).find(
    (item) => item.id === transaction?.id && item.kind === transaction?.kind,
  ) ??
    transaction ?? {
      id: "movement-1",
      kind: "charge",
      concept: "Mantenimiento Junio 2026",
      concepts: ["Mantenimiento Junio 2026"],
      summary: "Cargo de mantenimiento asociado a la casa.",
      notes: "Sin notas",
      dateLabel: "Fecha de vencimiento",
      dueDate: "10/06/2026",
      status: "Pendiente",
      amount: "$120.00",
      reference: "Sin referencia",
      method: "Sin método registrado",
      badgeVariant: "warning",
      receipt: null,
    };

  const unit = query.data?.units.find(
    (unit) => unit.id === currentTransaction.unitId,
  );
  const charge = unit?.charges.find(
    (charge) => charge.id === currentTransaction.chargeId,
  );
  const relatedPayments =
    unit?.payments.filter((p) =>
      p.allocations.some((a) => a.chargeId === charge?.id),
    ) ?? [];
  const relatedIds = new Set(
    relatedPayments.flatMap((p) => p.receipts.map((r) => String(r.id))),
  );
  const relatedReceipts = mapPaymentsToReceipts(query.data).filter((r) =>
    relatedIds.has(r.id),
  );
  const paidPercentage =
    charge && charge.amount > 0
      ? Math.min(Math.max((charge.paidAmount / charge.amount) * 100, 0), 100)
      : 0;
  const currentReceipt = currentTransaction.receipt;
  const transactionConcepts =
    Array.isArray(currentTransaction.concepts) &&
    currentTransaction.concepts.length > 0
      ? currentTransaction.concepts
      : [currentTransaction.concept];
  const receiptConcepts =
    Array.isArray(currentReceipt?.concepts) &&
    currentReceipt.concepts.length > 0
      ? currentReceipt.concepts
      : [];
  const receiptConceptDetails =
    Array.isArray(currentReceipt?.conceptDetails) &&
    currentReceipt.conceptDetails.length > 0
      ? currentReceipt.conceptDetails
      : receiptConcepts.map((concept) => ({
          label: concept,
          amount:
            currentReceipt?.conceptsAmount ?? currentReceipt?.amount ?? "$0.00",
          notes: "Sin notas",
        }));
  const receiptLabels = getPaymentReceiptLabels(receiptConceptDetails.length);
  const downloadDate = useMemo(() => formatReceiptDate(new Date()), []);
  const detailRows = [
    { label: currentTransaction.dateLabel, value: currentTransaction.dueDate },
    {
      label: "Referencia",
      value: currentReceipt?.reference ?? currentTransaction.reference,
    },
    {
      label: "Metodo de pago",
      value: currentReceipt?.method ?? currentTransaction.method,
    },
    ...(currentTransaction.kind === "charge"
      ? [{ label: "Notas", value: currentTransaction.notes ?? "Sin notas" }]
      : []),
  ];
  const amountColor =
    currentTransaction.status === "Pagado"
      ? "text-success"
      : currentTransaction.status === "Vencido" ||
          currentTransaction.status === "Rechazado" ||
          currentTransaction.status === "Cancelado"
        ? "text-danger"
        : "text-warning";
  const showReceiptButton =
    currentTransaction.status === "Pagado" && !!currentReceipt;
  const receiptRows = useMemo(
    () =>
      currentReceipt
        ? [
            { label: "Folio", value: `#${currentReceipt.id}` },
            {
              label: "Casa",
              value: `Casa ${currentReceipt.unit ?? "Sin casa"}`,
            },
            {
              label: "Tipos",
              value:
                currentReceipt.types ??
                (receiptConcepts.join(", ") || "Pago reportado"),
            },
            { label: receiptLabels.paidAmount, value: currentReceipt.amount },
            {
              label: receiptLabels.conceptsAmount,
              value: currentReceipt.conceptsAmount ?? currentReceipt.amount,
            },
            {
              label: "Saldo a favor generado",
              value: currentReceipt.creditGenerated ?? "$0.00",
            },
            { label: "Fecha de pago", value: currentReceipt.paymentDate },
            { label: "Método", value: currentReceipt.method },
            { label: "Referencia", value: currentReceipt.reference },
            { label: "Clave de rastreo", value: currentReceipt.trackingKey },
            { label: "Estatus", value: currentReceipt.status },
            { label: "Revisión", value: currentReceipt.reviewNotes },
          ]
        : [],
    [currentReceipt, receiptConcepts, receiptLabels],
  );

  return (
    <View className="gap-5">
      <Pressable
        accessibilityRole="button"
        className="flex-row items-center self-start rounded-full px-1 py-1"
        onPress={onBack}
      >
        <Ionicons color={themeColors.text} name="chevron-back" size={20} />
        <Text className="font-heading text-sm text-primary dark:text-[#F7F2FB]">
          Volver
        </Text>
      </Pressable>

      <View className="gap-2">
        <Text className="font-heading text-2xl text-primary dark:text-[#F7F2FB]">
          Detalle del movimiento
        </Text>
        <Text className="font-body text-base text-med-gray dark:text-[#B9B2C2]">
          Revisa el estado y la informacion del movimiento.
        </Text>
      </View>

      <Card width="full">
        <View className="gap-5">
          {isReceiptVisible && currentReceipt ? (
            <View className="gap-5">
              <View className="overflow-hidden rounded-2xl border border-light-gray dark:border-[#3B3345] bg-white dark:bg-[#211A29]">
                <View className="bg-primary px-5 py-5">
                  <Text className="font-heading text-2xl text-white">
                    Buen Entorno
                  </Text>
                  <Text className="mt-2 font-body text-sm text-white/85">
                    Recibo del movimiento
                  </Text>
                </View>

                <View className="h-2 bg-accent" />

                <View className="gap-4 px-5 py-5">
                  <View className="gap-1">
                    <Text className="font-heading text-lg text-primary dark:text-[#F7F2FB]">
                      Detalle del pago
                    </Text>
                    <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                      Puedes capturar esta pantalla si necesitas guardarlo como
                      imagen.
                    </Text>
                  </View>

                  <View className="gap-3">
                    {receiptRows.map((row) => (
                      <View
                        key={row.label}
                        className="flex-row items-start justify-between gap-4 border-b border-light-gray dark:border-[#3B3345] pb-3"
                      >
                        <Text className="font-heading text-sm text-primary dark:text-[#F7F2FB]">
                          {row.label}
                        </Text>
                        <Text className="flex-1 text-right font-body-semibold text-sm text-primary dark:text-[#F7F2FB]">
                          {row.value}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {receiptConceptDetails.length > 0 ? (
                    <View className="gap-3 border-t border-light-gray dark:border-[#3B3345] pt-4">
                      <Text className="font-heading text-lg text-primary dark:text-[#F7F2FB]">
                        {receiptLabels.conceptsTitle}
                      </Text>
                      <View className="gap-2">
                        {receiptConceptDetails.map((detail, index) => (
                          <View
                            key={`${detail.label}-${index}`}
                            className="flex-row items-start justify-between gap-4 border-b border-light-gray dark:border-[#3B3345] pb-3"
                          >
                            <Text className="flex-1 font-body-semibold text-base text-primary dark:text-[#F7F2FB]">
                              {formatPaidConceptLabel(
                                detail.label,
                                index,
                                receiptConceptDetails.length,
                              )}
                              {"\n"}
                              <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                                Notas: {detail.notes ?? "Sin notas"}
                              </Text>
                            </Text>
                            <Text className="font-heading text-base text-primary dark:text-[#F7F2FB]">
                              {detail.amount}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : null}

                  <View className="gap-2 pt-2">
                    <Text className="font-body text-xs text-med-gray dark:text-[#B9B2C2]">
                      Documento generado desde el portal de condominio de Buen
                      Entorno.
                    </Text>
                    <Text className="font-body text-xs text-med-gray dark:text-[#B9B2C2]">
                      Fecha de descarga: {downloadDate}
                    </Text>
                  </View>
                </View>
              </View>

              <Button
                title="Volver al detalle"
                variant="secondary"
                onPress={() => setIsReceiptVisible(false)}
              />
            </View>
          ) : (
            <>
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1 gap-2">
                  <Text className="font-heading text-lg text-primary dark:text-[#F7F2FB]">
                    {currentTransaction.concept}
                  </Text>
                  <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                    {currentTransaction.summary}
                  </Text>
                </View>

                <View className="items-end gap-2">
                  <Badge
                    label={currentTransaction.status}
                    variant={currentTransaction.badgeVariant}
                  />
                  <Text className={`font-heading text-2xl ${amountColor}`}>
                    {currentTransaction.amount}
                  </Text>
                </View>
              </View>

              <View className="gap-3">
                <Text className="font-heading text-sm text-primary dark:text-[#F7F2FB]">
                  Conceptos
                </Text>
                <View className="gap-2">
                  {transactionConcepts.map((concept, index) => (
                    <View
                      key={`${concept}-${index}`}
                      className="flex-row items-start gap-3 border-b border-light-gray dark:border-[#3B3345] pb-3"
                    >
                      <Text className="font-heading text-sm text-primary dark:text-[#F7F2FB]">
                        {index + 1}.
                      </Text>
                      <Text className="flex-1 font-body-semibold text-sm text-primary dark:text-[#F7F2FB]">
                        {concept}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className="gap-3">
                {detailRows.map((row) => (
                  <View
                    key={row.label}
                    className="flex-row items-start justify-between gap-4 border-b border-light-gray dark:border-[#3B3345] pb-3"
                  >
                    <Text className="font-heading text-sm text-primary dark:text-[#F7F2FB]">
                      {row.label}
                    </Text>
                    <Text className="flex-1 text-right font-body-semibold text-sm text-primary dark:text-[#F7F2FB]">
                      {row.value}
                    </Text>
                  </View>
                ))}
              </View>

              {charge ? (
                <View className="gap-5">
                  <View className="gap-3 rounded-2xl border border-light-gray bg-[#F8F7FA] p-4 dark:border-[#3B3345] dark:bg-[#18131F]">
                    <View className="gap-3 sm:flex-row">
                      <View className="flex-1 rounded-xl border border-light-gray bg-white p-3 dark:border-[#3B3345] dark:bg-[#211A29]">
                        <Text className="font-body-semibold text-xs uppercase text-med-gray dark:text-[#B9B2C2]">
                          Importe total
                        </Text>
                        <Text className="mt-1 font-heading text-xl text-primary dark:text-[#F7F2FB]">
                          {formatCurrency(charge.amount)}
                        </Text>
                      </View>
                      <View className="flex-1 rounded-xl border border-light-gray bg-white p-3 dark:border-[#3B3345] dark:bg-[#211A29]">
                        <Text className="font-body-semibold text-xs uppercase text-med-gray dark:text-[#B9B2C2]">
                          Total abonado
                        </Text>
                        <Text className="mt-1 font-heading text-xl text-success">
                          {formatCurrency(charge.paidAmount)}
                        </Text>
                      </View>
                      <View className="flex-1 rounded-xl border border-light-gray bg-white p-3 dark:border-[#3B3345] dark:bg-[#211A29]">
                        <Text className="font-body-semibold text-xs uppercase text-med-gray dark:text-[#B9B2C2]">
                          Saldo pendiente
                        </Text>
                        <Text
                          className={`mt-1 font-heading text-xl ${
                            charge.pendingAmount > 0
                              ? "text-warning"
                              : "text-success"
                          }`}
                        >
                          {formatCurrency(charge.pendingAmount)}
                        </Text>
                      </View>
                    </View>

                    <View className="gap-2">
                      <View className="flex-row items-center justify-between">
                        <Text className="font-body-semibold text-xs text-med-gray dark:text-[#D1CAD9]">
                          Progreso del pago
                        </Text>
                        <Text className="font-heading text-xs text-primary dark:text-[#F7F2FB]">
                          {paidPercentage.toFixed(0)}%
                        </Text>
                      </View>
                      <View className="h-2 overflow-hidden rounded-full bg-light-gray dark:bg-[#3B3345]">
                        <View
                          className="h-full rounded-full bg-primary dark:bg-[#633FA1]"
                          style={{
                            width: `${paidPercentage}%` as `${number}%`,
                          }}
                        />
                      </View>
                      <Text className="font-body text-xs text-med-gray dark:text-[#B9B2C2]">
                        Abonado: {formatCurrency(charge.paidAmount)} de{" "}
                        {formatCurrency(charge.amount)} · Saldo pendiente:{" "}
                        {formatCurrency(charge.pendingAmount)}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <Ionicons
                      color={themeColors.textMuted}
                      name="person-outline"
                      size={18}
                    />
                    <Text className="font-body text-sm text-med-gray dark:text-[#D1CAD9]">
                      {query.data?.name} ·{" "}
                      {new Date(charge.createdAt).toLocaleDateString("es-MX")}
                    </Text>
                  </View>

                  {charge.pendingAmount > 0 && charge.status !== "CANCELLED" ? (
                    <Button
                      icon="cloud-upload-outline"
                      title="Subir otro comprobante"
                      onPress={() => onUpload?.(unit!.id, charge.id)}
                    />
                  ) : null}

                  <View className="gap-1 border-b border-light-gray pb-3 dark:border-[#3B3345]">
                    <View className="flex-row items-center justify-between gap-3">
                      <Text className="font-heading text-lg text-primary dark:text-[#F7F2FB]">
                        Comprobantes relacionados
                      </Text>
                      <View className="min-w-7 items-center rounded-full bg-primary/10 px-2 py-1 dark:bg-[#633FA1]/20">
                        <Text className="font-heading text-xs text-primary dark:text-[#A98BDD]">
                          {relatedReceipts.length}
                        </Text>
                      </View>
                    </View>
                    <Text className="font-body text-xs text-med-gray dark:text-[#B9B2C2]">
                      Historial completo de pagos y revisiones del cargo.
                    </Text>
                  </View>

                  {!relatedReceipts.length ? (
                    <View className="items-center gap-2 rounded-2xl border border-dashed border-light-gray px-4 py-8 dark:border-[#3B3345]">
                      <Ionicons
                        color={themeColors.textSubtle}
                        name="document-text-outline"
                        size={30}
                      />
                      <Text className="font-body-semibold text-sm text-primary dark:text-[#F7F2FB]">
                        Sin comprobantes registrados
                      </Text>
                      <Text className="text-center font-body text-xs text-med-gray dark:text-[#B9B2C2]">
                        Los comprobantes enviados para este cargo aparecerán
                        aquí.
                      </Text>
                    </View>
                  ) : null}

                  {relatedReceipts.map((receipt) => {
                    const payment = relatedPayments.find((item) =>
                      item.receipts.some(
                        (itemReceipt) => String(itemReceipt.id) === receipt.id,
                      ),
                    );

                    return (
                      <View
                        key={receipt.id}
                        className="gap-3 rounded-2xl border border-light-gray bg-white p-4 dark:border-[#3B3345] dark:bg-[#211A29]"
                      >
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1 flex-row items-start gap-3">
                            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-[#633FA1]/20">
                              <Ionicons
                                color={themeColors.text}
                                name="cash-outline"
                                size={21}
                              />
                            </View>
                            <View className="flex-1 gap-1">
                              <Text className="font-heading text-sm text-primary dark:text-[#F7F2FB]">
                                Comprobante #{receipt.id}
                              </Text>
                              <Text className="font-body text-xs text-med-gray dark:text-[#B9B2C2]">
                                Pago #{payment?.id ?? "—"} · {receipt.generated}
                              </Text>
                            </View>
                          </View>
                          <View className="items-end gap-1">
                            <Text className="font-heading text-base text-primary dark:text-[#F7F2FB]">
                              {receipt.amount}
                            </Text>
                            <Badge
                              label={receipt.status}
                              variant={receipt.badgeVariant}
                            />
                          </View>
                        </View>

                        <View className="gap-2 border-t border-light-gray pt-3 dark:border-[#3B3345]">
                          <Text className="font-body text-xs text-med-gray dark:text-[#D1CAD9]">
                            Usuario:{" "}
                            {payment?.submittedByUserId ?? query.data?.name}
                          </Text>
                          <Text className="font-body text-xs text-med-gray dark:text-[#D1CAD9]">
                            Revisión:{" "}
                            {payment?.reviewedAt
                              ? new Date(payment.reviewedAt).toLocaleString(
                                  "es-MX",
                                )
                              : "Pendiente"}
                            {" · "}Administrador:{" "}
                            {payment?.reviewedByUserId ?? "—"}
                          </Text>
                        </View>

                        <Button
                          icon="document-attach-outline"
                          title="Consultar comprobante"
                          variant="outline"
                          size="sm"
                          onPress={() => onReceipt?.(receipt)}
                        />
                      </View>
                    );
                  })}
                </View>
              ) : null}
              <View className="gap-3">
                {showReceiptButton ? (
                  <Button
                    icon="document-text-outline"
                    title="Ver recibo"
                    onPress={() => setIsReceiptVisible(true)}
                  />
                ) : null}
                <Button
                  title="Regresar a movimientos"
                  variant="secondary"
                  onPress={onBack}
                />
              </View>
            </>
          )}
        </View>
      </Card>
    </View>
  );
}
