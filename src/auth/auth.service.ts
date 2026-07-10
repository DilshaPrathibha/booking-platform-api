import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

/** Number of bcrypt salt rounds. 12 is the recommended production value.
 *  Higher = more secure but slower. 10-12 is the industry sweet spot. */
const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new admin/staff user.
   *
   * Fails with 409 Conflict if the email is already taken —
   * this is more informative than a generic 400 for duplicate key errors.
   *
   * Returns the access token immediately after registration so the client
   * does not need a separate login step.
   */
  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    // Check if email is already taken before hashing the password
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(), // Normalise to lowercase for consistency
        passwordHash,
      },
      select: { id: true, name: true }, // Never return passwordHash
    });

    return { accessToken: this.signToken(user.id, user.name) };
  }

  /**
   * Validates credentials and returns an access token.
   *
   * Always throws UnauthorizedException with the SAME message regardless of
   * whether the email doesn't exist or the password is wrong.
   * This prevents user enumeration attacks (attacker cannot tell which failed).
   */
  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true, name: true, passwordHash: true },
    });

    // Use bcrypt.compare even when user is null to prevent timing attacks.
    // bcrypt.compare against a dummy hash takes the same time as a real one.
    const passwordHash = user?.passwordHash ?? '$2b$12$invalidhashforuserenumeration';
    const isPasswordValid = await bcrypt.compare(dto.password, passwordHash);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return { accessToken: this.signToken(user.id, user.name) };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private signToken(userId: string, name: string): string {
    const payload: JwtPayload = { sub: userId, name };
    return this.jwtService.sign(payload);
  }
}
