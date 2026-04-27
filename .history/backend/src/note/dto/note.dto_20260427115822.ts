import { IsArray, IsBoolean, IsDateString, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

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

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    collaborators?: string[];

    @IsOptional()
    @IsString()
    background_image?: string;
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

    @IsOptional()
<<<<<<< HEAD
    @IsArray()
    @IsString({ each: true })
    collaborators?: string[];
}
=======
    @IsString()
    background_image?: string;
}
>>>>>>> af70188 (mejoras)
