# CRM СИСТЕМА — ПОШАГОВЫЕ ПРОМПТЫ ДЛЯ КОДЕРА

> **Отрасль:** Продажа автомобилей под заказ (B2C)  
> **Масштаб:** До 20 пользователей, 200-700 клиентов/месяц  
> **Стек:** Next.js 14 + NestJS + PostgreSQL + Prisma + Redis

---

## 📋 ОБЩАЯ ИНСТРУКЦИЯ ДЛЯ КОДЕРА

Перед началом работы:
1. Изучи файлы `CRM_ARCHITECTURE.md`, `prisma-schema.prisma`, `API_SPECIFICATION.md`, `RBAC_SECURITY.md`
2. Следуй принципам SOLID, DRY, KISS
3. Пиши чистый, production-ready код с обработкой ошибок
4. Добавляй валидацию на всех уровнях (DTO, Service, Database)
5. Пиши комментарии для сложной бизнес-логики
6. Используй TypeScript strict mode
7. После каждого модуля тестируй API через Postman/Thunder Client

---

## 🚀 ПРОМПТ 1: ИНИЦИАЛИЗАЦИЯ ПРОЕКТА + DATABASE SETUP

### Цель модуля
Создать базовую структуру monorepo проекта с настроенной базой данных, Docker окружением и базовой конфигурацией.

### Задачи

#### 1.1 Создать структуру проекта
```bash
# Структура monorepo
crm-system/
├── apps/
│   ├── web/          # Next.js Frontend
│   └── api/          # NestJS Backend
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── utils/        # Shared utilities
├── docker-compose.yml
├── .env.example
└── README.md
```

#### 1.2 Инициализировать Backend (NestJS)
```bash
# Создать NestJS проект
cd apps/api
npm init -y
npm install @nestjs/common @nestjs/core @nestjs/platform-express
npm install @nestjs/config @nestjs/jwt @nestjs/passport
npm install @prisma/client
npm install -D @nestjs/cli typescript @types/node ts-node prisma

# Создать базовую структуру NestJS
nest new . --skip-git
```

**Требования:**
- TypeScript strict mode включен
- Настроить `tsconfig.json` с правильными paths
- Создать `.env` файл с переменными:
  ```env
  DATABASE_URL="postgresql://postgres:password@localhost:5432/crm_db?schema=public"
  JWT_SECRET="your-super-secret-jwt-key-change-in-production"
  JWT_EXPIRES_IN="1h"
  REDIS_URL="redis://localhost:6379"
  PORT=3001
  NODE_ENV="development"
  ```

#### 1.3 Настроить Prisma ORM
```bash
cd apps/api
npx prisma init
```

**Задача:** 
- Скопировать содержимое файла `prisma-schema.prisma` в `apps/api/prisma/schema.prisma`
- Создать PrismaService для NestJS:

```typescript
// apps/api/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

```typescript
// apps/api/src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

#### 1.4 Создать Docker окружение
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: crm_postgres
    restart: always
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: crm_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: crm_redis
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### 1.5 Запустить миграции
```bash
# Запустить Docker
docker-compose up -d

# Создать первую миграцию
cd apps/api
npx prisma migrate dev --name init

# Сгенерировать Prisma Client
npx prisma generate

# (Опционально) Создать seed данные
npx prisma db seed
```

**Создать seed файл:**
```typescript
// apps/api/prisma/seed.ts
import { PrismaClient, UserRole, LeadStatus, DealStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@crm.com' },
    update: {},
    create: {
      email: 'admin@crm.com',
      password: adminPassword,
      firstName: 'Админ',
      lastName: 'Система',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
    },
  });

  // Create Sales Manager
  const managerPassword = await bcrypt.hash('Manager123!', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@crm.com' },
    update: {},
    create: {
      email: 'manager@crm.com',
      password: managerPassword,
      firstName: 'Иван',
      lastName: 'Менеджер',
      role: UserRole.SALES_MANAGER,
      status: 'ACTIVE',
    },
  });

  // Create Sales Rep
  const repPassword = await bcrypt.hash('Rep123!', 10);
  const rep = await prisma.user.upsert({
    where: { email: 'rep@crm.com' },
    update: {},
    create: {
      email: 'rep@crm.com',
      password: repPassword,
      firstName: 'Петр',
      lastName: 'Продавец',
      role: UserRole.SALES_REP,
      status: 'ACTIVE',
    },
  });

  // Create Default Pipeline
  const pipeline = await prisma.pipeline.create({
    data: {
      name: 'Продажа автомобилей',
      description: 'Основная воронка продаж авто под заказ',
      isDefault: true,
      isActive: true,
    },
  });

  // Create Pipeline Stages
  const stages = await Promise.all([
    prisma.pipelineStage.create({
      data: {
        name: 'Новая заявка',
        probability: 10,
        order: 1,
        pipelineId: pipeline.id,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        name: 'Квалификация',
        probability: 25,
        order: 2,
        pipelineId: pipeline.id,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        name: 'Подбор авто',
        probability: 40,
        order: 3,
        pipelineId: pipeline.id,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        name: 'Расчет стоимости',
        probability: 60,
        order: 4,
        pipelineId: pipeline.id,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        name: 'Договор',
        probability: 80,
        order: 5,
        pipelineId: pipeline.id,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        name: 'Ожидание поставки',
        probability: 90,
        order: 6,
        pipelineId: pipeline.id,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        name: 'Сделка закрыта',
        probability: 100,
        order: 7,
        pipelineId: pipeline.id,
      },
    }),
  ]);

  console.log('✅ Seeding completed!');
  console.log('👤 Admin: admin@crm.com / Admin123!');
  console.log('👤 Manager: manager@crm.com / Manager123!');
  console.log('👤 Sales Rep: rep@crm.com / Rep123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Добавить в `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

#### 1.6 Настроить AppModule
```typescript
// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
  ],
})
export class AppModule {}
```

#### 1.7 Настроить main.ts
```typescript
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API Server running on http://localhost:${port}/api/v1`);
}
bootstrap();
```

### Проверка работы
```bash
# Запустить backend
cd apps/api
npm run start:dev

# Проверить здоровье API
curl http://localhost:3001/api/v1

# Проверить Prisma Studio
npx prisma studio
```

### Критерии готовности модуля
- ✅ Docker контейнеры (PostgreSQL, Redis) запущены
- ✅ База данных мигрирована
- ✅ Seed данные загружены
- ✅ NestJS сервер запускается без ошибок
- ✅ Prisma Studio открывается и показывает таблицы
- ✅ Логи показывают "✅ Database connected"

---

## 🔐 ПРОМПТ 2: AUTH MODULE + RBAC + JWT

### Цель модуля
Реализовать полную систему аутентификации и авторизации с JWT токенами, RBAC guards и middleware.

### Задачи

#### 2.1 Установить зависимости
```bash
cd apps/api
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt class-validator class-transformer
npm install -D @types/passport-jwt @types/bcrypt
```

#### 2.2 Создать Auth Module структуру
```bash
nest g module auth
nest g service auth
nest g controller auth
```

#### 2.3 Создать DTOs для Auth
```typescript
// apps/api/src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Пароль должен быть минимум 8 символов' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Пароль должен содержать заглавные, строчные буквы, цифры и спецсимволы' },
  )
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsString()
  phone?: string;
}
```

```typescript
// apps/api/src/auth/dto/login.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  password: string;
}
```

#### 2.4 Реализовать AuthService
```typescript
// apps/api/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        role: 'SALES_REP', // Default role
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      tokens,
    };
  }

  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Check status
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Аккаунт заблокирован');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const tokens = await this.generateTokens(payload.sub, payload.email, payload.role);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Невалидный refresh token');
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '1h' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        avatar: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return null;
    }

    return user;
  }
}
```

#### 2.5 Создать JWT Strategy
```typescript
// apps/api/src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

#### 2.6 Создать Guards
```typescript
// apps/api/src/common/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

```typescript
// apps/api/src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

#### 2.7 Создать Decorators
```typescript
// apps/api/src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

```typescript
// apps/api/src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

#### 2.8 Создать AuthController
```typescript
// apps/api/src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return { user };
  }
}
```

#### 2.9 Настроить Auth Module
```typescript
// apps/api/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### Тестирование Auth Module

#### Test 1: Register
```bash
POST http://localhost:3001/api/v1/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!@#",
  "firstName": "Тест",
  "lastName": "Пользователь",
  "phone": "+79991234567"
}
```

#### Test 2: Login
```bash
POST http://localhost:3001/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@crm.com",
  "password": "Admin123!"
}
```

#### Test 3: Get Profile
```bash
GET http://localhost:3001/api/v1/auth/me
Authorization: Bearer {accessToken}
```

### Критерии готовности модуля
- ✅ Регистрация работает и создает пользователя
- ✅ Логин возвращает access и refresh токены
- ✅ JWT Guard защищает эндпоинты
- ✅ Refresh token работает
- ✅ Валидация паролей работает корректно
- ✅ Ошибки возвращаются в правильном формате

---

## 🎯 ПРОМПТ 3: LEADS & DEALS ENGINE (CRUD + PIPELINE)

### Цель модуля
Реализовать полный CRUD для лидов (потенциальных клиентов) и сделок с drag-and-drop воронкой продаж.

### Задачи

#### 3.1 Создать Leads Module
```bash
nest g module leads
nest g service leads
nest g controller leads
```

#### 3.2 Создать DTOs для Leads
```typescript
// apps/api/src/leads/dto/create-lead.dto.ts
import { IsEmail, IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { LeadStatus, LeadSource } from '@prisma/client';

export class CreateLeadDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  ownerId?: string;
}
```

```typescript
// apps/api/src/leads/dto/update-lead.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadDto } from './create-lead.dto';
import { IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { LeadStatus } from '@prisma/client';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  score?: number;
}
```

```typescript
// apps/api/src/leads/dto/convert-lead.dto.ts
import { IsBoolean, IsOptional, ValidateNested, IsString, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class DealDataDto {
  @IsString()
  title: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  pipelineId: string;

  @IsString()
  stageId: string;

  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;
}

class CompanyDataDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  industry?: string;
}

export class ConvertLeadDto {
  @IsBoolean()
  createDeal: boolean;

  @ValidateNested()
  @Type(() => DealDataDto)
  @IsOptional()
  dealData?: DealDataDto;

  @IsBoolean()
  @IsOptional()
  createCompany?: boolean;

  @ValidateNested()
  @Type(() => CompanyDataDto)
  @IsOptional()
  companyData?: CompanyDataDto;
}
```

#### 3.3 Создать DTOs для Query
```typescript
// apps/api/src/common/dto/pagination.dto.ts
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

```typescript
// apps/api/src/leads/dto/query-leads.dto.ts
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { LeadStatus, LeadSource } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryLeadsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```

#### 3.4 Реализовать LeadsService
```typescript
// apps/api/src/leads/leads.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto, user: any) {
    const lead = await this.prisma.lead.create({
      data: {
        ...createLeadDto,
        ownerId: createLeadDto.ownerId || user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return lead;
  }

  async findAll(query: QueryLeadsDto, user: any) {
    const { page, limit, status, source, ownerId, search, sortBy, sortOrder } = query;

    // Build where clause based on user role
    const where: any = {};

    // Role-based filtering
    if (user.role === UserRole.SALES_REP) {
      where.ownerId = user.id;
    } else if (user.role === UserRole.SALES_MANAGER) {
      const teamMembers = await this.getTeamMembers(user.id);
      const teamUserIds = [user.id, ...teamMembers.map((m) => m.userId)];
      where.ownerId = { in: teamUserIds };
    }

    // Additional filters
    if (status) where.status = status;
    if (source) where.source = source;
    if (ownerId) where.ownerId = ownerId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string, user: any) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        tasks: {
          orderBy: { dueDate: 'asc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Лид не найден');
    }

    // Check access
    await this.checkAccess(lead, user);

    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto, user: any) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Лид не найден');
    }

    await this.checkAccess(lead, user);

    const updated = await this.prisma.lead.update({
      where: { id },
      data: updateLeadDto,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        type: 'STATUS_CHANGE',
        title: 'Лид обновлен',
        description: `Статус изменен на ${updateLeadDto.status}`,
        userId: user.id,
        leadId: id,
      },
    });

    return updated;
  }

  async remove(id: string, user: any) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Лид не найден');
    }

    // Only admins can delete
    if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      throw new ForbiddenException('Недостаточно прав для удаления');
    }

    await this.prisma.lead.delete({ where: { id } });
    return { message: 'Лид успешно удален' };
  }

  async convert(id: string, convertDto: ConvertLeadDto, user: any) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Лид не найден');
    }

    await this.checkAccess(lead, user);

    // Start transaction
    return this.prisma.$transaction(async (tx) => {
      // Create company if needed
      let companyId: string | undefined;
      if (convertDto.createCompany && convertDto.companyData) {
        const company = await tx.company.create({
          data: convertDto.companyData,
        });
        companyId = company.id;
      }

      // Create contact
      const contact = await tx.contact.create({
        data: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          jobTitle: lead.jobTitle,
          companyId,
          notes: lead.notes,
        },
      });

      // Create deal if needed
      let deal;
      if (convertDto.createDeal && convertDto.dealData) {
        deal = await tx.deal.create({
          data: {
            ...convertDto.dealData,
            ownerId: lead.ownerId,
            companyId,
            status: 'OPEN',
            probability: 30,
          },
        });

        // Link contact to deal
        await tx.dealContact.create({
          data: {
            dealId: deal.id,
            contactId: contact.id,
            isPrimary: true,
          },
        });
      }

      // Update lead status
      await tx.lead.update({
        where: { id },
        data: {
          status: 'CONVERTED',
          convertedToContactId: contact.id,
          convertedAt: new Date(),
        },
      });

      // Log activity
      await tx.activity.create({
        data: {
          type: 'DEAL_CREATED',
          title: 'Лид конвертирован',
          description: `Создан контакт ${contact.firstName} ${contact.lastName}${deal ? ` и сделка ${deal.title}` : ''}`,
          userId: user.id,
          leadId: id,
        },
      });

      return { contact, deal };
    });
  }

  private async checkAccess(lead: any, user: any) {
    if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      return true;
    }

    if (user.role === UserRole.SALES_MANAGER) {
      const teamMembers = await this.getTeamMembers(user.id);
      const teamUserIds = [user.id, ...teamMembers.map((m) => m.userId)];
      if (teamUserIds.includes(lead.ownerId)) {
        return true;
      }
    }

    if (lead.ownerId === user.id) {
      return true;
    }

    throw new ForbiddenException('Нет доступа к этому лиду');
  }

  private async getTeamMembers(userId: string) {
    return this.prisma.teamMember.findMany({
      where: {
        team: {
          members: {
            some: {
              userId,
              role: 'leader',
            },
          },
        },
      },
    });
  }
}
```

#### 3.5 Создать LeadsController
```typescript
// apps/api/src/leads/leads.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() createLeadDto: CreateLeadDto, @CurrentUser() user: any) {
    return this.leadsService.create(createLeadDto, user);
  }

  @Get()
  findAll(@Query() query: QueryLeadsDto, @CurrentUser() user: any) {
    return this.leadsService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @CurrentUser() user: any,
  ) {
    return this.leadsService.update(id, updateLeadDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.remove(id, user);
  }

  @Post(':id/convert')
  convert(
    @Param('id') id: string,
    @Body() convertDto: ConvertLeadDto,
    @CurrentUser() user: any,
  ) {
    return this.leadsService.convert(id, convertDto, user);
  }
}
```

### Продолжение: Deals Module (аналогично Leads)

**Задача:** Реализовать Deals Module по тому же паттерну:
- CreateDealDto, UpdateDealDto, QueryDealsDto
- DealsService с методами: create, findAll, findOne, update, remove, win, lose, changeStage
- DealsController с защищенными эндпоинтами
- Drag-and-drop логика для изменения stage

### Критерии готовности модуля
- ✅ CRUD для leads работает
- ✅ Фильтрация и поиск работают
- ✅ Роли корректно ограничивают доступ
- ✅ Конвертация лида создает контакт и сделку
- ✅ CRUD для deals работает
- ✅ Изменение этапа воронки работает

---

## ✉️ ПРОМПТ 4: TASKS, ACTIVITIES, NOTIFICATIONS & EMAIL

### Цель модуля
Реализовать систему задач, активностей, уведомлений и email интеграции.

### Задачи

#### 4.1 Создать Tasks Module
Аналогично Leads Module:
- DTOs: CreateTaskDto, UpdateTaskDto, QueryTasksDto
- TasksService с CRUD методами
- TasksController с эндпоинтами
- Логика назначения задач
- Автоматические напоминания о дедлайнах

#### 4.2 Создать Activities Module
- Автоматическое логирование всех действий
- Timeline для лидов/сделок
- ActivityInterceptor для автоматического логирования

#### 4.3 Создать Notifications Module
```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

**Реализовать:**
- Real-time уведомления через WebSocket
- NotificationsGateway для Socket.io
- Уведомления при назначении задач
- Уведомления о приближающихся дедлайнах
- Система пуш-уведомлений

#### 4.4 Email Integration
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

**Реализовать:**
- EmailService для отправки писем
- Email templates (Handlebars)
- Отправка при конвертации лида
- Отправка при win/lose сделки
- Email уведомления о задачах

### Критерии готовности модуля
- ✅ CRUD задач работает
- ✅ Timeline активностей отображается
- ✅ WebSocket уведомления доставляются
- ✅ Email отправляются при ключевых событиях

---

## 📊 ПРОМПТ 5: ANALYTICS DASHBOARD + REPORTS

### Цель модуля
Реализовать аналитические дашборды и отчеты для менеджеров.

### Задачи

#### 5.1 Создать Analytics Module
```bash
nest g module analytics
nest g service analytics
nest g controller analytics
```

#### 5.2 Реализовать AnalyticsService
```typescript
// apps/api/src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string, userRole: string, period: string) {
    const { startDate, endDate } = this.getPeriodDates(period);

    const [revenue, deals, leads, activities] = await Promise.all([
      this.getRevenueMetrics(startDate, endDate),
      this.getDealsMetrics(startDate, endDate),
      this.getLeadsMetrics(startDate, endDate),
      this.getActivitiesMetrics(startDate, endDate),
    ]);

    return {
      revenue,
      deals,
      leads,
      activities,
    };
  }

  private async getRevenueMetrics(startDate: Date, endDate: Date) {
    const wonDeals = await this.prisma.deal.findMany({
      where: {
        status: 'WON',
        actualCloseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const openDeals = await this.prisma.deal.findMany({
      where: {
        status: 'OPEN',
      },
    });

    const total = wonDeals.reduce((sum, deal) => sum + Number(deal.amount), 0);
    const pipeline = openDeals.reduce((sum, deal) => sum + Number(deal.amount), 0);

    return {
      total,
      won: total,
      pipeline,
      change: 15.5, // Calculate based on previous period
    };
  }

  private async getDealsMetrics(startDate: Date, endDate: Date) {
    const deals = await this.prisma.deal.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    const total = deals.reduce((sum, g) => sum + g._count, 0);
    const won = deals.find((g) => g.status === 'WON')?._count || 0;
    const lost = deals.find((g) => g.status === 'LOST')?._count || 0;
    const open = deals.find((g) => g.status === 'OPEN')?._count || 0;

    const winRate = won + lost > 0 ? (won / (won + lost)) * 100 : 0;

    return {
      total,
      open,
      won,
      lost,
      winRate: parseFloat(winRate.toFixed(2)),
      avgDealSize: 0, // Calculate average
    };
  }

  private async getLeadsMetrics(startDate: Date, endDate: Date) {
    const leads = await this.prisma.lead.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    const total = leads.reduce((sum, g) => sum + g._count, 0);
    const converted = leads.find((g) => g.status === 'CONVERTED')?._count || 0;
    const conversionRate = total > 0 ? (converted / total) * 100 : 0;

    return {
      total,
      new: leads.find((g) => g.status === 'NEW')?._count || 0,
      qualified: leads.find((g) => g.status === 'QUALIFIED')?._count || 0,
      converted,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    };
  }

  private async getActivitiesMetrics(startDate: Date, endDate: Date) {
    const activities = await this.prisma.activity.groupBy({
      by: ['type'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    return {
      calls: activities.find((a) => a.type === 'CALL')?._count || 0,
      meetings: activities.find((a) => a.type === 'MEETING')?._count || 0,
      emails: activities.find((a) => a.type === 'EMAIL')?._count || 0,
    };
  }

  private getPeriodDates(period: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    return {
      startDate,
      endDate: new Date(),
    };
  }
}
```

#### 5.3 Создать AnalyticsController
```typescript
// apps/api/src/analytics/analytics.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: any, @Query('period') period: string = 'month') {
    return this.analyticsService.getDashboard(user.id, user.role, period);
  }
}
```

### Критерии готовности модуля
- ✅ Dashboard API возвращает метрики
- ✅ Данные корректно фильтруются по периоду
- ✅ Расчеты метрик правильные
- ✅ Роли ограничивают доступ к данным

---

## 🎨 ФИНАЛЬНЫЙ ПРОМПТ: FRONTEND (Next.js)

### Цель
Создать современный React UI с Tailwind CSS и Shadcn UI.

### Задачи
1. Инициализировать Next.js 14 проект
2. Установить Shadcn UI компоненты
3. Создать страницы: Login, Dashboard, Leads, Deals, Tasks, Analytics
4. Реализовать API client с React Query
5. Создать Kanban board для deals
6. Responsive дизайн для всех страниц

---

## ✅ ЧЕКЛИСТ ПОЛНОЙ ГОТОВНОСТИ СИСТЕМЫ

### Backend
- ✅ Database мигрирована и seed данные загружены
- ✅ Auth API работает (register, login, refresh)
- ✅ Leads CRUD работает
- ✅ Deals CRUD работает
- ✅ Tasks CRUD работает
- ✅ Analytics API возвращает данные
- ✅ RBAC guards работают корректно
- ✅ Email отправляются
- ✅ WebSocket уведомления работают

### Frontend
- ✅ Login/Register страницы работают
- ✅ Dashboard отображает метрики
- ✅ Leads таблица с фильтрацией
- ✅ Deals Kanban board
- ✅ Tasks список
- ✅ Analytics графики

### Testing
- ✅ Все API эндпоинты протестированы
- ✅ RBAC permissions протестированы
- ✅ Edge cases обработаны

---

## 🚀 ЗАПУСК ГОТОВОГО ПРОЕКТА

```bash
# 1. Запустить Docker
docker-compose up -d

# 2. Запустить Backend
cd apps/api
npm run start:dev

# 3. Запустить Frontend
cd apps/web
npm run dev

# 4. Открыть браузер
# Frontend: http://localhost:3000
# Backend: http://localhost:3001/api/v1
# Prisma Studio: npx prisma studio
```

---

**Каждый промпт является самодостаточным и может быть скопирован напрямую в AI-кодер для генерации production-ready кода.**