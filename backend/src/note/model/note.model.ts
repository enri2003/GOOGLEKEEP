import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../../usuario/model/usuario.model";

export interface NoteItem {
    text: string;
    checked: boolean;
}

@Entity()
export class Note {
    @PrimaryGeneratedColumn({ name: 'note_id' })
    id: number;

    @Column({ default: '' })
    title: string;

    @Column({ default: '' })
    content: string;

    @Column({ default: true })
    activo: boolean;

    @Column({ default: false })
    pinned: boolean;

    @Column({ default: false })
    archived: boolean;

    @Column({ default: 'default' })
    color: string;

    @Column({ default: 'text' })
    type: string; // 'text' | 'checklist'

    @Column({ type: 'jsonb', nullable: true })
    items: NoteItem[] | null;

    @Column({ type: 'timestamp', nullable: true })
    reminder: Date | null;

    @Column({ nullable: true })
    image_url: string | null;

    @ManyToOne(() => Usuario, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date | null;
}
