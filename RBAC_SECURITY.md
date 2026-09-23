# CRM SYSTEM — RBAC & SECURITY MODEL

> **Version:** 1.0  
> **Security Level:** Enterprise Grade

---

## 1. ROLE-BASED ACCESS CONTROL (RBAC)

### User Roles Hierarchy

```
SUPER_ADMIN (System Level)
    ↓
ADMIN (Organization Level)
    ↓
SALES_MANAGER (Team Level)
    ↓
SALES_REP (Individual Level)
    ↓
CLIENT (External Access - Optional)
```

### Role Definitions

#### SUPER_ADMIN
- **Purpose:** System administration and multi-tenant management
- **Scope:** All organizations, all data, system configuration
- **Use Case:** SaaS platform administrators

#### ADMIN
- **Purpose:** Organization administration
- **Scope:** All data within organization
- **Use Case:** Company administrators, CRM admins

#### SALES_MANAGER
- **Purpose:** Team management and oversight
- **Scope:** Own data + team members' data
- **Use Case:** Sales directors, team leaders

#### SALES_REP
- **Purpose:** Individual sales work
- **Scope:** Own data only (leads, deals, tasks assigned to them)
- **Use Case:** Sales representatives, account executives

#### CLIENT
- **Purpose:** Limited external access (optional)
- **Scope:** Own contact info, deals they're involved in
- **Use Case:** Customer portal access

---

## 2. PERMISSIONS MATRIX

### Leads Module

| Action | SUPER_ADMIN | ADMIN | SALES_MANAGER | SALES_REP | CLIENT |
|--------|-------------|-------|---------------|-----------|--------|
| View All Leads | ✅ | ✅ | ✅ (Team only) | ❌ | ❌ |
| View Own Leads | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create Lead | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit Any Lead | ✅ | ✅ | ✅ (Team only) | ❌ | ❌ |
| Edit Own Lead | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete Any Lead | ✅ | ✅ | ✅ (Team only) | ❌ | ❌ |
| Delete Own Lead | ✅ | ✅ | ✅ | ✅ | ❌ |
| Assign Lead | ✅ | ✅ | ✅ | ❌ | ❌ |
| Convert Lead | ✅ | ✅ | ✅ | ✅ | ❌ |
| Import Leads | ✅ | ✅ | ✅ | ❌ | ❌ |
| Export Leads | ✅ | ✅ | ✅ | ✅ (Own only) | ❌ |

### Deals Module

| Action | SUPER_ADMIN | ADMIN | SALES_MANAGER | SALES_REP | CLIENT |
|--------|-------------|-------|---------------|-----------|--------|
| View All Deals | ✅ | ✅ | ✅ (Team only) | ❌ | ❌ |
| View Own Deals | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Related Deals | ❌ | ❌ | ❌ | ❌ | ✅ (As contact) |
| Create Deal | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit Any Deal | ✅ | ✅ | ✅ (Team only) | ❌ | ❌ |
| Edit Own Deal | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete Any Deal | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Own Deal | ✅ | ✅ | ✅ | ❌ | ❌ |
| Win/Lose Deal | ✅ | ✅ | ✅ | ✅ (Own only) | ❌ |
| Change Deal Stage | ✅ | ✅ | ✅ | ✅ (Own only) | ❌ |
| Reassign Deal | ✅ | ✅ | ✅ | ❌ | ❌ |

### Contacts & Companies Module

| Action | SUPER_ADMIN | ADMIN | SALES_MANAGER | SALES_REP | CLIENT |
|--------|-------------|-------|---------------|-----------|--------|
| View All Contacts | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Own Contact | ❌ | ❌ | ❌ | ❌ | ✅ |
| Create Contact | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit Any Contact | ✅ | ✅ | ✅ (Team related) | ❌ | ❌ |
| Edit Own Contact | ❌ | ❌ | ❌ | ❌ | ✅ (Limited fields) |
| Delete Contact | ✅ | ✅ | ❌ | ❌ | ❌ |
| Merge Contacts | ✅ | ✅ | ✅ | ❌ | ❌ |
| Import Contacts | ✅ | ✅ | ✅ | ✅ | ❌ |
| Export Contacts | ✅ | ✅ | ✅ | ✅ | ❌ |

### Tasks & Activities Module

| Action | SUPER_ADMIN | ADMIN | SALES_MANAGER | SALES_REP | CLIENT |
|--------|-------------|-------|---------------|-----------|--------|
| View All Tasks | ✅ | ✅ | ✅ (Team only) | ❌ | ❌ |
| View Assigned Tasks | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create Task | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit Any Task | ✅ | ✅ | ✅ (Team only) | ❌ | ❌ |
| Edit Assigned Task | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete Task | ✅ | ✅ | ✅ (Created by self) | ✅ (Created by self) | ❌ |
| Assign Task | ✅ | ✅ | ✅ | ✅ | ❌ |
| Log Activity | ✅ | ✅ | ✅ | ✅ | ❌ |

### Analytics & Reports Module

| Action | SUPER_ADMIN | ADMIN | SALES_MANAGER | SALES_REP | CLIENT |
|--------|-------------|-------|---------------|-----------|--------|
| View Company Dashboard | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Team Dashboard | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Personal Dashboard | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Sales Funnel | ✅ | ✅ | ✅ | ✅ (Own only) | ❌ |
| View Revenue Reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Team Performance | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create Custom Reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| Export Reports | ✅ | ✅ | ✅ | ✅ (Own data) | ❌ |

### Settings & Configuration Module

| Action | SUPER_ADMIN | ADMIN | SALES_MANAGER | SALES_REP | CLIENT |
|--------|-------------|-------|---------------|-----------|--------|
| Manage Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Roles | ✅ | ✅ | ❌ | ❌ | ❌ |
| Configure Pipelines | ✅ | ✅ | ❌ | ❌ | ❌ |
| Configure Fields | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Teams | ✅ | ✅ | ✅ (Own team) | ❌ | ❌ |
| Email Templates | ✅ | ✅ | ✅ | ❌ | ❌ |
| Webhooks | ✅ | ✅ | ❌ | ❌ | ❌ |
| API Keys | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 3. PERMISSION IMPLEMENTATION (NestJS)

### Guard Implementation

```typescript
// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### Decorator Implementation

```typescript
// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

### Resource Ownership Guard

```typescript
// src/common/guards/resource-owner.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;
    const resourceType = this.getResourceType(context);

    // Super admins and admins can access anything
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role)) {
      return true;
    }

    // Check resource ownership
    const isOwner = await this.checkOwnership(resourceType, resourceId, user.id);

    // Sales managers can access team members' resources
    if (user.role === UserRole.SALES_MANAGER) {
      const isTeamResource = await this.checkTeamAccess(resourceType, resourceId, user.id);
      return isOwner || isTeamResource;
    }

    // Sales reps can only access their own resources
    if (!isOwner) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }

  private getResourceType(context: ExecutionContext): string {
    const controller = context.getClass().name;
    return controller.replace('Controller', '').toLowerCase();
  }

  private async checkOwnership(
    resourceType: string,
    resourceId: string,
    userId: string,
  ): Promise<boolean> {
    const resource = await this.prisma[resourceType].findUnique({
      where: { id: resourceId },
      select: { ownerId: true },
    });

    return resource?.ownerId === userId;
  }

  private async checkTeamAccess(
    resourceType: string,
    resourceId: string,
    managerId: string,
  ): Promise<boolean> {
    // Get team members
    const teamMembers = await this.prisma.teamMember.findMany({
      where: {
        team: {
          members: {
            some: {
              userId: managerId,
              role: 'leader',
            },
          },
        },
      },
      select: { userId: true },
    });

    const teamUserIds = teamMembers.map((m) => m.userId);

    // Check if resource belongs to team member
    const resource = await this.prisma[resourceType].findUnique({
      where: { id: resourceId },
      select: { ownerId: true },
    });

    return teamUserIds.includes(resource?.ownerId);
  }
}
```

### Usage Example

```typescript
// src/modules/leads/leads.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ResourceOwnerGuard } from 'src/common/guards/resource-owner.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { LeadsService } from './leads.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  // All authenticated users can view their leads
  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.leadsService.findAll(user);
  }

  // All authenticated users can create leads
  @Post()
  async create(@Body() createLeadDto: any, @CurrentUser() user: any) {
    return this.leadsService.create(createLeadDto, user);
  }

  // Only resource owner or managers/admins can view specific lead
  @Get(':id')
  @UseGuards(ResourceOwnerGuard)
  async findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  // Only resource owner or managers/admins can update
  @Patch(':id')
  @UseGuards(ResourceOwnerGuard)
  async update(@Param('id') id: string, @Body() updateLeadDto: any) {
    return this.leadsService.update(id, updateLeadDto);
  }

  // Only admins can delete leads
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }

  // Only managers and admins can assign leads
  @Post(':id/assign')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES_MANAGER)
  async assign(@Param('id') id: string, @Body() assignDto: { ownerId: string }) {
    return this.leadsService.assign(id, assignDto.ownerId);
  }
}
```

---

## 4. DATA FILTERING BY ROLE

### Service Layer Implementation

```typescript
// src/modules/leads/leads.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: any, filters: any = {}) {
    const where: any = {};

    // Apply role-based filtering
    if (user.role === UserRole.SALES_REP) {
      // Sales reps see only their own leads
      where.ownerId = user.id;
    } else if (user.role === UserRole.SALES_MANAGER) {
      // Managers see their own + team members' leads
      const teamMembers = await this.getTeamMembers(user.id);
      const teamUserIds = [user.id, ...teamMembers.map(m => m.userId)];
      where.ownerId = { in: teamUserIds };
    }
    // Admins and super admins see all leads (no filter)

    // Apply additional filters
    if (filters.status) where.status = filters.status;
    if (filters.source) where.source = filters.source;
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.lead.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });
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

---

## 5. SECURITY BEST PRACTICES

### Authentication Security

1. **Password Requirements**
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 number
   - At least 1 special character
   - Bcrypt hashing with salt rounds = 10

2. **JWT Token Security**
   - Access token expiry: 1 hour
   - Refresh token expiry: 7 days
   - Tokens stored in HTTP-only cookies (preferred) or secure storage
   - Token rotation on refresh

3. **Rate Limiting**
   - Login attempts: 5 per 15 minutes per IP
   - API requests: 1000 per hour per user
   - Password reset: 3 requests per hour per email

### API Security

1. **Request Validation**
   - Use class-validator for all DTOs
   - Sanitize user inputs to prevent XSS
   - Use parameterized queries (Prisma handles this)

2. **CORS Configuration**
   ```typescript
   app.enableCors({
     origin: process.env.FRONTEND_URL,
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
   });
   ```

3. **Helmet Security Headers**
   ```typescript
   app.use(helmet());
   ```

4. **Request Size Limits**
   ```typescript
   app.use(express.json({ limit: '10mb' }));
   app.use(express.urlencoded({ extended: true, limit: '10mb' }));
   ```

### Data Security

1. **Soft Deletes**
   - Implement soft deletes for sensitive data
   - Add `deletedAt` field to models
   - Filter out deleted records by default

2. **Audit Logging**
   - Log all CRUD operations
   - Track who did what and when
   - Store IP addresses and user agents

3. **Data Encryption**
   - Encrypt sensitive fields at rest
   - Use TLS/SSL for data in transit
   - Secure file storage (S3 with encryption)

4. **PII Protection**
   - Mask sensitive data in logs
   - Implement data export controls
   - GDPR compliance (data deletion, export)

### Session Security

1. **Session Management**
   - Invalidate tokens on logout
   - Implement token blacklist in Redis
   - Detect concurrent sessions (optional)

2. **2FA Support (Optional Enhancement)**
   - TOTP-based 2FA
   - Backup codes
   - Recovery email

---

## 6. AUDIT LOGGING

### Audit Log Schema (Add to Prisma)

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  action      String   // "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"
  resource    String   // "lead", "deal", "contact", etc.
  resourceId  String?
  changes     Json?    // Before/after values
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@index([resource])
  @@index([createdAt])
  @@map("audit_logs")
}
```

### Audit Interceptor

```typescript
// src/common/interceptors/audit.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const url = request.url;

    return next.handle().pipe(
      tap(async (data) => {
        if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
          await this.prisma.auditLog.create({
            data: {
              userId: user.id,
              action: method,
              resource: this.getResourceFromUrl(url),
              resourceId: request.params.id || data?.id,
              changes: { body: request.body, response: data },
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
            },
          });
        }
      }),
    );
  }

  private getResourceFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[2] || 'unknown';
  }
}
```

---

## 7. MIDDLEWARE CHAIN

```typescript
// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global guards
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalGuards(new RolesGuard(reflector));

  // Global interceptors
  app.useGlobalInterceptors(new AuditInterceptor(app.get(PrismaService)));

  await app.listen(3000);
}
```

---

## 8. TESTING RBAC

### Unit Test Example

```typescript
// src/common/guards/roles.guard.spec.ts
describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockExecutionContext({ role: UserRole.SALES_REP });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = createMockExecutionContext({ role: UserRole.ADMIN });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if user does not have required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = createMockExecutionContext({ role: UserRole.SALES_REP });
    expect(guard.canActivate(context)).toBe(false);
  });
});
```

---

This RBAC model provides enterprise-grade security with clear separation of concerns, extensible permission system, and production-ready implementation patterns.