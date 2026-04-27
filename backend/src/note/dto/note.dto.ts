import { IsArray, IsBoolean, IsDateString, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

// Alias para compatibilidad con módulos existentes
export class NoteDto {
    @IsOptional() id?: number;
    @IsOptional() @IsString() title?: string;
    @IsOptional() @IsString() content?: string;
    @IsOptional() @IsBoolean() activo?: boolean;
}

export class CreateNoteDto {
    @IsOptional()
    @IsString()
    @MaxLength(500)
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsIn(['text', 'checklist'])
    type?: string;

    @IsOptional()
    @IsArray()
    items?: { text: string; checked: boolean }[];

    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsBoolean()
    pinned?: boolean;

    @IsOptional()
    @IsDateString()
    reminder?: string;

    @IsOptional()
    @IsString()
    image_url?: string;
}

export class UpdateNoteDto {
    @IsOptional()
    @IsString()
    @MaxLength(500)
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsIn(['text', 'checklist'])
    type?: string;

    @IsOptional()
    @IsArray()
    items?: { text: string; checked: boolean }[];

    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsBoolean()
    pinned?: boolean;

    @IsOptional()
    @IsBoolean()
    archived?: boolean;

    @IsOptional()
    @IsDateString()
    reminder?: string;

    @IsOptional()
    @IsString()
    image_url?: string;
}
