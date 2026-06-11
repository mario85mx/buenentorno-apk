import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Badge from "../components/atoms/Badge";
import Button from "../components/atoms/Button";
import Card from "../components/atoms/Card";
import { BottomSheet } from "../components/molecules/fieldShared";
import MobileTabs from "../components/organisms/MobileTabs";
import type { PaymentReceipt } from "./PaymentReceiptDetail";
import type { PaymentTransaction } from "./PaymentTransactionDetail";

const movementItems: PaymentTransaction[] = [
  {
    id: "movement-1",
    concept: "Mantenimiento Junio 2026",
    dueDate: "10/06/2026",
    status: "Adeudo",
    amount: "$120.00",
    badgeVariant: "danger" as const,
  },
];

const movementStatusOptions = ["Todos", "Adeudo", "Pagado"] as const;
const receiptStatusOptions = ["Todos", "Pendiente", "Validado"] as const;

const receiptItems: PaymentReceipt[] = [
  {
    id: "receipt-1",
    type: "Pago de mantenimiento",
    amount: "$120.00",
    generated: "01/06/2026",
    paymentDate: "08/06/2026",
    dueDate: "10/06/2026",
    method: "Transferencia SPEI",
    reference: "REC-2026-06-001",
    trackingKey: "547382910456",
    status: "Validado",
    review: "Aprobado por administración",
    voucher: "comprobante-junio-2026.pdf",
    badgeVariant: "success",
  },
];

interface HomeProps {
  onOpenPaymentTransactionDetail?: (transaction: PaymentTransaction) => void;
  onOpenPaymentReceiptDetail?: (receipt: PaymentReceipt) => void;
  onOpenUploadReceipt?: () => void;
}

export default function Home({
  onOpenPaymentTransactionDetail,
  onOpenPaymentReceiptDetail,
  onOpenUploadReceipt,
}: HomeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMovementStatus, setSelectedMovementStatus] =
    useState<(typeof movementStatusOptions)[number]>("Todos");
  const [receiptSearchQuery, setReceiptSearchQuery] = useState("");
  const [isReceiptFilterOpen, setIsReceiptFilterOpen] = useState(false);
  const [selectedReceiptStatus, setSelectedReceiptStatus] =
    useState<(typeof receiptStatusOptions)[number]>("Todos");

  const filteredMovements = movementItems.filter((movement) => {
    const matchesSearch =
      searchQuery.trim().length === 0 ||
      movement.concept.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      movement.dueDate.includes(searchQuery.trim());
    const matchesStatus =
      selectedMovementStatus === "Todos" ||
      movement.status === selectedMovementStatus;

    return matchesSearch && matchesStatus;
  });

  const filteredReceipts = receiptItems.filter((receipt) => {
    const normalizedQuery = receiptSearchQuery.trim().toLowerCase();
    const matchesSearch =
      normalizedQuery.length === 0 ||
      receipt.type.toLowerCase().includes(normalizedQuery) ||
      receipt.trackingKey.includes(receiptSearchQuery.trim()) ||
      receipt.paymentDate.includes(receiptSearchQuery.trim());
    const matchesStatus =
      selectedReceiptStatus === "Todos" ||
      receipt.status === selectedReceiptStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <View className="gap-5">
        <View className="gap-4">
        <View className="flex-row flex-wrap justify-between gap-y-4">
          <Text className="font-heading text-sm text-primary">Marzo 2026</Text>
          <Text className="font-heading text-sm text-success">
            Saldo a favor: $0
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-between gap-y-4">
          <Card width="half">
            <Text className="font-body text-sm text-primary">
              Saldo Pendiente
            </Text>
            <Text className="mt-2 font-heading text-2xl text-danger">
              $120.00
            </Text>
          </Card>

          <Card width="half">
            <Text className="font-body text-sm text-primary">
              Mantenimiento
            </Text>
            <Text className="mt-2 font-heading text-2xl text-success">
              $120.00
            </Text>
          </Card>

          <Card width="half">
            <Text className="font-body text-sm text-primary">Agua</Text>
            <Text className="mt-2 font-heading text-2xl text-primary">
              $120.00
            </Text>
          </Card>

          <Card width="half">
            <Text className="font-body text-sm text-primary">
              Multas y Otros
            </Text>
            <Text className="mt-2 font-heading text-2xl text-gray-400">
              $120.00
            </Text>
          </Card>
        </View>

        <Button
          icon="document-text-outline"
          title="Subir comprobante"
          size="md"
          variant="primary"
          onPress={onOpenUploadReceipt}
        />
        </View>

        <MobileTabs
          defaultActiveKey="movimientos"
          items={[
            {
              key: "movimientos",
              label: "Movimientos",
              content: (
                <View className="gap-4">
                  <View className="flex-row items-center gap-3">
                    <Button
                      icon="options-outline"
                      title="Filtrar"
                      size="md"
                      variant="secondary"
                      onPress={() => setIsFilterOpen(true)}
                    />

                    <View className="flex-1 rounded-xl border border-light-gray bg-white px-3">
                      <View className="min-h-11 flex-row items-center gap-2">
                        <Ionicons color="#6B7280" name="search-outline" size={18} />
                        <TextInput
                          className="flex-1 font-body text-base text-primary"
                          placeholder="Buscar"
                          placeholderTextColor="#6B7280"
                          selectionColor="#18052E"
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                        />
                      </View>
                    </View>
                  </View>

                  {filteredMovements.length ? (
                    filteredMovements.map((movement) => (
                      <Pressable
                        key={movement.id}
                        accessibilityHint="Abre el detalle del movimiento"
                        accessibilityRole="button"
                        className="rounded-lg"
                        onPress={() => onOpenPaymentTransactionDetail?.(movement)}
                      >
                        <Card className="rounded-lg border border-light-gray px-3 py-2">
                          <View className="flex-row items-start justify-between">
                            <View className="flex-1 gap-2 pr-3">
                              <View className="flex-row items-center gap-1">
                                <Text className="font-heading text-sm text-primary">
                                  Concepto:
                                </Text>
                                <Text
                                  className="flex-1 font-body-semibold text-sm text-primary"
                                  numberOfLines={1}
                                >
                                  {movement.concept}
                                </Text>
                              </View>

                              <View className="flex-row items-center gap-1">
                                <Text className="font-heading text-sm text-primary">
                                  Vence:
                                </Text>
                                <Text
                                  className="font-body-semibold text-sm text-primary"
                                  numberOfLines={1}
                                >
                                  {movement.dueDate}
                                </Text>
                              </View>
                            </View>

                            <View className="shrink-0 items-end gap-2">
                              <View className="flex-row items-center gap-1">
                                <Badge
                                  className="self-end"
                                  label={movement.status}
                                  variant={movement.badgeVariant}
                                />
                                <Ionicons
                                  color="#9CA3AF"
                                  name="chevron-forward"
                                  size={18}
                                />
                              </View>

                              <Text className="w-full font-heading text-sm text-right text-danger">
                                {movement.amount}
                              </Text>
                            </View>
                          </View>
                        </Card>
                      </Pressable>
                    ))
                  ) : (
                    <Card className="rounded-lg border border-light-gray px-4 py-4">
                      <Text className="font-body text-sm text-med-gray">
                        No hay movimientos que coincidan con tu búsqueda o filtro.
                      </Text>
                    </Card>
                  )}
                </View>
              ),
            },
            {
              key: "comprobantes",
              label: "Comprobantes",
              content: (
                <View className="gap-4">
                  <View className="flex-row items-center gap-3">
                    <Button
                      icon="options-outline"
                      title="Filtrar"
                      size="md"
                      variant="secondary"
                      onPress={() => setIsReceiptFilterOpen(true)}
                    />

                    <View className="flex-1 rounded-xl border border-light-gray bg-white px-3">
                      <View className="min-h-11 flex-row items-center gap-2">
                        <Ionicons color="#6B7280" name="search-outline" size={18} />
                        <TextInput
                          className="flex-1 font-body text-base text-primary"
                          placeholder="Buscar"
                          placeholderTextColor="#6B7280"
                          selectionColor="#18052E"
                          value={receiptSearchQuery}
                          onChangeText={setReceiptSearchQuery}
                        />
                      </View>
                    </View>
                  </View>

                  {filteredReceipts.length ? (
                    filteredReceipts.map((receipt) => (
                      <Pressable
                        key={receipt.id}
                        accessibilityHint="Abre el detalle del comprobante"
                        accessibilityRole="button"
                        className="rounded-lg"
                        onPress={() => onOpenPaymentReceiptDetail?.(receipt)}
                      >
                        <Card className="rounded-lg border border-light-gray px-3 py-2">
                          <View className="gap-2">
                            <View className="flex-row items-start justify-between gap-3">
                              <View className="flex-1 gap-1">
                                <View className="flex-row items-center gap-1">
                                  <Text className="font-heading text-sm text-primary">
                                    Tipos:
                                  </Text>
                                  <Text
                                    className="flex-1 font-body-semibold text-sm text-primary"
                                    numberOfLines={1}
                                  >
                                    {receipt.type}
                                  </Text>
                                </View>

                                <View className="flex-row items-center gap-1">
                                  <Text className="font-heading text-sm text-primary">
                                    Monto:
                                  </Text>
                                  <Text className="font-body-semibold text-sm text-primary">
                                    {receipt.amount}
                                  </Text>
                                </View>
                              </View>

                              <Ionicons
                                color="#9CA3AF"
                                name="chevron-forward"
                                size={18}
                              />
                            </View>

                            <View className="flex-row items-center gap-1">
                              <Text className="font-heading text-sm text-primary">
                                Fecha pago:
                              </Text>
                              <Text className="font-body-semibold text-sm text-primary">
                                {receipt.paymentDate}
                              </Text>
                            </View>

                            <View className="flex-row items-center gap-1">
                              <Text className="font-heading text-sm text-primary">
                                Clave de Rastreo:
                              </Text>
                              <Text
                                className="flex-1 font-body-semibold text-sm text-primary"
                                numberOfLines={1}
                              >
                                {receipt.trackingKey}
                              </Text>
                            </View>

                            <View className="flex-row items-center gap-1">
                              <Text className="font-heading text-sm text-primary">
                                Estatus:
                              </Text>
                              <Badge
                                label={receipt.status}
                                variant={receipt.badgeVariant}
                              />
                            </View>
                          </View>
                        </Card>
                      </Pressable>
                    ))
                  ) : (
                    <Card className="rounded-lg border border-light-gray px-4 py-4">
                      <Text className="font-body text-sm text-med-gray">
                        No hay comprobantes que coincidan con tu búsqueda o filtro.
                      </Text>
                    </Card>
                  )}
                </View>
              ),
            },
          ]}
        />
      </View>

      <BottomSheet
        footer={
          <View className="gap-3">
            <Button
              title="Limpiar filtros"
              variant="secondary"
              onPress={() => setSelectedMovementStatus("Todos")}
            />
            <Button
              title="Aplicar"
              onPress={() => setIsFilterOpen(false)}
            />
          </View>
        }
        onClose={() => setIsFilterOpen(false)}
        title="Filtrar movimientos"
        visible={isFilterOpen}
      >
        <View className="gap-3">
          <Text className="font-heading text-base text-primary">Estado</Text>

          {movementStatusOptions.map((statusOption) => {
            const isSelected = statusOption === selectedMovementStatus;

            return (
              <Pressable
                key={statusOption}
                className={
                  isSelected
                    ? "rounded-lg border border-primary bg-primary px-4 py-2"
                    : "rounded-lg border border-light-gray bg-[#F8F7FA] px-4 py-2"
                }
                onPress={() => setSelectedMovementStatus(statusOption)}
              >
                <Text
                  className={
                    isSelected
                      ? "font-body text-base text-white"
                      : "font-body text-base text-primary"
                  }
                >
                  {statusOption}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>

      <BottomSheet
        footer={
          <View className="gap-3">
            <Button
              title="Limpiar filtros"
              variant="secondary"
              onPress={() => setSelectedReceiptStatus("Todos")}
            />
            <Button
              title="Aplicar"
              onPress={() => setIsReceiptFilterOpen(false)}
            />
          </View>
        }
        onClose={() => setIsReceiptFilterOpen(false)}
        title="Filtrar comprobantes"
        visible={isReceiptFilterOpen}
      >
        <View className="gap-3">
          <Text className="font-heading text-base text-primary">Estado</Text>

          {receiptStatusOptions.map((statusOption) => {
            const isSelected = statusOption === selectedReceiptStatus;

            return (
              <Pressable
                key={statusOption}
                className={
                  isSelected
                    ? "rounded-lg border border-primary bg-primary px-4 py-2"
                    : "rounded-lg border border-light-gray bg-[#F8F7FA] px-4 py-2"
                }
                onPress={() => setSelectedReceiptStatus(statusOption)}
              >
                <Text
                  className={
                    isSelected
                      ? "font-body text-base text-white"
                      : "font-body text-base text-primary"
                  }
                >
                  {statusOption}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </>
  );
}
