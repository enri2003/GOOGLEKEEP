import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Note } from "./model/note.model";
import { CreateNoteDto, UpdateNoteDto } from "./dto/note.dto";
import { Usuario } from "../usuario/model/usuario.model";

@Injectable()
export class NoteService {
    constructor(
        @InjectRepository(Note)
        private readonly repository: Repository<Note>
    ) {}

    // Notas activas (no archivadas, no eliminadas)
    getNotes(userId: number) {
        return this.repository.find({
            where: { usuario: { id: userId }, archived: false },
            order: { pinned: 'DESC', updated_at: 'DESC' },
        });
    }

    // Notas archivadas
    getArchived(userId: number) {
        return this.repository.find({
            where: { usuario: { id: userId }, archived: true },
            order: { updated_at: 'DESC' },
        });
    }

    // Papelera (soft deleted)
    getTrash(userId: number) {
        return this.repository.find({
            where: { usuario: { id: userId } },
            withDeleted: true,
            order: { deleted_at: 'DESC' },
        }).then(notes => notes.filter(n => n.deleted_at !== null));
    }

    // Notas con recordatorio
    getReminders(userId: number) {
        return this.repository
            .createQueryBuilder('note')
            .where('note.usuario_id = :userId', { userId })
            .andWhere('note.reminder IS NOT NULL')
            .andWhere('note.archived = false')
            .orderBy('note.reminder', 'ASC')
            .getMany();
    }

    async create(dto: CreateNoteDto, userId: number) {
        const note = this.repository.create({
            ...dto,
            activo: true,
            usuario: { id: userId } as Usuario,
        });
        return this.repository.save(note);
    }

    async update(id: number, dto: UpdateNoteDto, userId: number) {
        await this.findOwned(id, userId);
        await this.repository.update(id, dto as any);
        return this.repository.findOne({ where: { id } });
    }

    async togglePin(id: number, userId: number) {
        const note = await this.findOwned(id, userId);
        await this.repository.update(id, { pinned: !note.pinned });
        return { pinned: !note.pinned };
    }

    async toggleArchive(id: number, userId: number) {
        const note = await this.findOwned(id, userId);
        await this.repository.update(id, { archived: !note.archived });
        return { archived: !note.archived };
    }

    // Mover a papelera (soft delete)
    async softDelete(id: number, userId: number) {
        await this.findOwned(id, userId);
        await this.repository.softDelete(id);
        return { message: 'Nota movida a papelera' };
    }

    // Restaurar desde papelera
    async restore(id: number, userId: number) {
        await this.repository.restore(id);
        return { message: 'Nota restaurada' };
    }

    // Eliminar permanentemente
    async deletePermanent(id: number, userId: number) {
        await this.repository.delete(id);
        return { message: 'Nota eliminada permanentemente' };
    }

    // Duplicar nota
    async duplicate(id: number, userId: number) {
        const note = await this.findOwned(id, userId);
        const copy = this.repository.create({
            title: note.title ? `${note.title} (copia)` : '',
            content: note.content,
            type: note.type,
            items: note.items ? [...note.items] : null,
            color: note.color,
            activo: true,
            pinned: false,
            archived: false,
            usuario: { id: userId } as Usuario,
        });
        return this.repository.save(copy);
    }

    // Búsqueda por texto
    search(query: string, userId: number) {
        return this.repository
            .createQueryBuilder('note')
            .where('note.usuario_id = :userId', { userId })
            .andWhere('note.archived = false')
            .andWhere('(LOWER(note.title) LIKE :q OR LOWER(note.content) LIKE :q)', { q: `%${query.toLowerCase()}%` })
            .orderBy('note.updated_at', 'DESC')
            .getMany();
    }

    private async findOwned(id: number, userId: number) {
        const note = await this.repository.findOne({
            where: { id, usuario: { id: userId } },
            relations: ['usuario'],
        });
        if (!note) throw new NotFoundException(`Nota con id ${id} no encontrada`);
        return note;
    }
}
