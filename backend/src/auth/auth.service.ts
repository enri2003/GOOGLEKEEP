import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Usuario } from "../usuario/model/usuario.model";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Usuario)
        private readonly repository: Repository<Usuario>,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const existing = await this.repository.findOne({ where: { email: dto.email } });
        if (existing) {
            throw new BadRequestException(`El email ${dto.email} ya esta registrado`);
        }

        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const usuario = this.repository.create({
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
            fecha_nacimiento: dto.fecha_nacimiento ? new Date(dto.fecha_nacimiento) : null,
        });

        const saved = await this.repository.save(usuario);
        return this.signToken(saved);
    }

    async login(dto: LoginDto) {
        const usuario = await this.repository.findOne({ where: { email: dto.email } });
        if (!usuario) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        const valid = await bcrypt.compare(dto.password, usuario.password);
        if (!valid) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        return this.signToken(usuario);
    }

    async me(userId: number) {
        const usuario = await this.repository.findOne({
            where: { id: userId },
            select: ['id', 'name', 'email', 'fecha_nacimiento', 'created_at', 'updated_at']
        });

        if (!usuario) {
            throw new UnauthorizedException('Sesion invalida');
        }

        return this.toSafeUser(usuario);
    }

    private signToken(usuario: Usuario) {
        const payload = { sub: usuario.id, email: usuario.email, name: usuario.name };

        return {
            token: this.jwtService.sign(payload),
            user: this.toSafeUser(usuario),
        };
    }

    private toSafeUser(usuario: Usuario) {
        return {
            id: usuario.id,
            name: usuario.name,
            email: usuario.email,
            fecha_nacimiento: usuario.fecha_nacimiento ?? null,
            created_at: usuario.created_at ?? null,
            updated_at: usuario.updated_at ?? null,
        };
    }
}
