import { useState } from 'react';
import { Text, View } from 'react-native';
import Button from '../components/atoms/Button';
import {
  DatePickerField,
  InputField,
  PasswordInputField,
  SelectField,
} from '../components/molecules';

const residentTypeOptions = [
  { label: 'Propietario', value: 'owner' },
  { label: 'Inquilino', value: 'tenant' },
  { label: 'Administrador', value: 'admin' },
];

export default function Account() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [residentType, setResidentType] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  return (
    <View className="gap-5">
      <View className="rounded-[32px] bg-primary px-6 py-7">
        <Text className="font-heading text-3xl text-white">Mi cuenta</Text>
        <Text className="mt-2 font-body text-body text-[#D8CEE4]">
          Base inicial para el formulario de perfil con molecules reutilizables
          y labels estándar.
        </Text>
      </View>

      <View className="rounded-[32px] border border-light-gray bg-white p-5">
        <View className="gap-4">
          <InputField
            autoCapitalize="words"
            label="Nombre completo"
            placeholder="Mario Hernández"
            value={fullName}
            onChangeText={setFullName}
          />

          <InputField
            autoCapitalize="none"
            keyboardType="email-address"
            label="Correo electrónico"
            placeholder="mario@buenentorno.mx"
            value={email}
            onChangeText={setEmail}
          />

          <PasswordInputField
            label="Contraseña"
            placeholder="Tu contraseña"
            value={password}
            onChangeText={setPassword}
          />

          <SelectField
            label="Tipo de residente"
            options={residentTypeOptions}
            value={residentType}
            onChange={setResidentType}
          />

          <DatePickerField
            label="Fecha de nacimiento"
            value={birthDate}
            onChange={setBirthDate}
          />
        </View>

        <View className="mt-6">
          <Button title="Guardar cambios" />
        </View>
      </View>
    </View>
  );
}
