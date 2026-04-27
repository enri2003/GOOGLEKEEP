import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { Usuario } from "./model/usuario.model";
import { InjectRepository } from "@nestjs/typeorm";
import { UsuarioDto } from "./dto/usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
// import { bcrypt } from 'bcrypt';
const bcrypt = require('bcrypt');

@Injectable()
export class UsuarioService {
    constructor(
        @InjectRepository(Usuario)
        private readonly repository: Repository<Usuario>
    ) {}

    getAll() {
        return this.repository.find({
            select: ['id', 'name', 'email', 'created_at', 'updated_at'] // Excluye el campo password
        });
    }

    getById(id: number) {
        // var data = this.repository.findOneBy({id: id}); // Recupera todos los campos, incluyendo password
        var data = this.repository.findOne({
            where: { id },
            select: ['id', 'name', 'email', 'created_at', 'updated_at'] // Excluye el campo password
        });
        return data;
    }

    async save(data: UsuarioDto) {
        if(data.id != undefined && data.id != null && data.id != 0) {
            const usuario = await this.repository.findOneBy({id: data.id});
            if(!usuario) throw new Error(`Usuario con id ${data.id} no encontrado`);

            if(data.password) {
                data.password = await this.createHashedPassword(data.password);
            }

            await this.repository.update({id: data.id}, data);
            return 'Se actualizo correctamente!!!';
        } else {
            const email = await this.repository.findOne({ where: { email: data.email } });
            if(email) throw new Error(`El email ${data.email} ya está registrado`);

            const hashedPassword = await this.createHashedPassword(data.password);
            data.password = hashedPassword;

            await this.repository.save(data);
            return 'Se guardo correctamente!!!';
        }
    }

    async delete(id: number) {
        await this.findById(id); // Verifica si el usuario existe antes de eliminarlo
        await this.repository.delete({ id });
        return { message: `Usuario con id ${id} eliminado correctamente` };
    }

    // Actualización parcial: solo actualiza los campos enviados
    async update(id: number, data: UpdateUsuarioDto) {
        await this.findById(id); // Lanza NotFoundException si no existe

        if (data.email) {
            const existing = await this.repository.findOne({ where: { email: data.email } });
            if (existing && existing.id !== id) {
                throw new BadRequestException(`El email ${data.email} ya está registrado por otro usuario`);
            }
        }

        if (data.password && data.password.trim().length > 0) {
            data.password = await this.createHashedPassword(data.password);
        } else {
            delete data.password;
        }

        await this.repository.update({ id }, data);
        return this.getById(id);
    }

    async findById(id: number) {
        const usuario = await this.repository.findOne({
            where: { id },
            select: ['id', 'name', 'email', 'created_at', 'updated_at'] // Excluye el campo password
        });

        if(!usuario) throw new NotFoundException(`Usuario con id ${id} no encontrado`);

        return usuario;
    }

    async generateJWT(data: UsuarioDto) {
        return await this.createHashedPassword(data.password);
    }

    // Metodo para crear una contraseña hasheada
    async createHashedPassword(password: string): Promise<string> {
        var SALT_ROUNDS = 12;
        return await bcrypt.hashSync(password, SALT_ROUNDS);
    }
    // Método para verificar la contraseña
    async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compareSync(plainPassword, hashedPassword);
    }
}