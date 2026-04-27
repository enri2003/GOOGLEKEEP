import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateUsuarioDto {
    @IsOptional()
    @IsString()
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    @MaxLength(50, { message: 'El nombre no debe exceder los 50 caracteres' })
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'El email no es válido' })
    @MaxLength(150)
    email?: string;

    @IsOptional()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    @MaxLength(50, { message: 'La contraseña no debe exceder los 50 caracteres' })
    password?: string;
}
