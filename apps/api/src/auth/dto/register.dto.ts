import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Пароль должен быть минимум 8 символов' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Пароль должен содержать заглавные, строчные буквы, цифры и спецсимволы' },
  )
  password: string;

  @IsString()
  @MinLength(2, { message: 'Имя должно быть минимум 2 символа' })
  @MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Фамилия должна быть минимум 2 символа' })
  @MaxLength(50, { message: 'Фамилия не должна превышать 50 символов' })
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
