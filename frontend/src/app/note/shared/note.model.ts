export interface NoteItem {
    text: string;
    checked: boolean;
}

export interface Note {
    id: number;
    title: string;
    content: string;
    type: 'text' | 'checklist';
    items: NoteItem[] | null;
    color: string;
    pinned: boolean;
    archived: boolean;
    reminder: string | null;
    image_url: string | null;
    background_image: string | null;
    activo: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    collaborators?: string[];
}

export const NOTE_COLORS: { name: string; value: string; bg: string }[] = [
    { name: 'Default', value: 'default', bg: '#28292c' },
    { name: 'Rojo',     value: 'red',     bg: '#5c2b29' },
    { name: 'Naranja', value: 'orange',  bg: '#614a19' },
    { name: 'Amarillo',value: 'yellow',  bg: '#635d19' },
    { name: 'Verde',   value: 'green',   bg: '#345920' },
    { name: 'Teal',    value: 'teal',    bg: '#16504b' },
    { name: 'Azul',    value: 'blue',    bg: '#2d555e' },
    { name: 'Indigo',  value: 'indigo',  bg: '#1e3a5f' },
    { name: 'Morado',  value: 'purple',  bg: '#42275e' },
    { name: 'Rosa',    value: 'pink',    bg: '#5b2245' },
];

export function getNoteBackground(color: string): string {
    return NOTE_COLORS.find(c => c.value === color)?.bg ?? '#28292c';
}