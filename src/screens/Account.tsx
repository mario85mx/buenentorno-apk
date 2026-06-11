import { useState } from 'react';
import { View } from 'react-native';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
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
    <Card width="full">
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
    </Card>
  );
}
