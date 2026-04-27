import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString()
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    @MaxLength(50, { message: 'El nombre no debe exceder los 50 caracteres' })
    name: string;

    @IsNotEmpty({ message: 'El email es obligatorio' })
    @IsEmail({}, { message: 'El email no es válido' })
    @MaxLength(150)
    email: string;

    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    @MaxLength(50)
    password: string;

    @IsOptional()
    @IsDateString({}, { message: 'Fecha de nacimiento inválida' })
    fecha_nacimiento?: string;
}
