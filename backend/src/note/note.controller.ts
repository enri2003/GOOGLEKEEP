import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { NoteService } from "./note.service";
import { CreateNoteDto, UpdateNoteDto } from "./dto/note.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller('note')
@UseGuards(JwtAuthGuard)
export class NoteController {
    constructor(private readonly service: NoteService) {}

    // GET /api/v1/note — notas activas del usuario
    @Get()
    getNotes(@Request() req: any, @Query('q') q?: string) {
        if (q) return this.service.search(q, req.user.sub);
        return this.service.getNotes(req.user.sub);
    }

    // GET /api/v1/note/archived
    @Get('archived')
    getArchived(@Request() req: any) {
        return this.service.getArchived(req.user.sub);
    }

    // GET /api/v1/note/trash
    @Get('trash')
    getTrash(@Request() req: any) {
        return this.service.getTrash(req.user.sub);
    }

    // GET /api/v1/note/reminders
    @Get('reminders')
    getReminders(@Request() req: any) {
        return this.service.getReminders(req.user.sub);
    }

    // POST /api/v1/note — crear nota
    @Post()
    create(@Body() dto: CreateNoteDto, @Request() req: any) {
        return this.service.create(dto, req.user.sub);
    }

    // PATCH /api/v1/note/:id — actualizar nota
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNoteDto, @Request() req: any) {
        return this.service.update(id, dto, req.user.sub);
    }

    // DELETE /api/v1/note/:id — mover a papelera (soft delete)
    @Delete(':id')
    softDelete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.service.softDelete(id, req.user.sub);
    }

    // POST /api/v1/note/:id/restore — restaurar desde papelera
    @Post(':id/restore')
    restore(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.service.restore(id, req.user.sub);
    }

    // DELETE /api/v1/note/:id/permanent — eliminar permanentemente
    @Delete(':id/permanent')
    deletePermanent(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.service.deletePermanent(id, req.user.sub);
    }

    // POST /api/v1/note/:id/duplicate — duplicar nota
    @Post(':id/duplicate')
    duplicate(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.service.duplicate(id, req.user.sub);
    }

    // PATCH /api/v1/note/:id/pin — toggle pin
    @Patch(':id/pin')
    togglePin(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.service.togglePin(id, req.user.sub);
    }

    // PATCH /api/v1/note/:id/archive — toggle archive
    @Patch(':id/archive')
    toggleArchive(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.service.toggleArchive(id, req.user.sub);
    }
}
