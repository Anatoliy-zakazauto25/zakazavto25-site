import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SendEmailDto } from './dto/send-email.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(this.configService.get<string>('SMTP_PORT') || '587'),
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }
  }

  async sendEmail(senderId: string, sendEmailDto: SendEmailDto) {
    const { toEmail, subject, body } = sendEmailDto;
    const fromEmail = this.configService.get<string>('FROM_EMAIL') || 'noreply@crm.com';

    // Save to database
    const emailRecord = await this.prisma.email.create({
      data: {
        senderId,
        fromEmail,
        toEmail,
        subject,
        body,
        status: this.transporter ? 'sent' : 'queued',
      },
    });

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: fromEmail,
          to: toEmail,
          subject,
          html: body,
        });

        await this.prisma.email.update({
          where: { id: emailRecord.id },
          data: { status: 'delivered' },
        });
      } catch (error) {
        await this.prisma.email.update({
          where: { id: emailRecord.id },
          data: { status: 'bounced' },
        });
        throw error;
      }
    } else {
      console.log('📧 Email (SMTP not configured):');
      console.log(`   To: ${toEmail}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Body: ${body}`);
    }

    return {
      success: true,
      data: emailRecord,
    };
  }

  async findAll(userId: string) {
    const emails = await this.prisma.email.findMany({
      where: { senderId: userId },
      orderBy: { sentAt: 'desc' },
    });

    return {
      success: true,
      data: emails,
    };
  }
}
