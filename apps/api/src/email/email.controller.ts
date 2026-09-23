import { Controller, Post, Body, Get } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  send(@Body() sendEmailDto: SendEmailDto, @CurrentUser() user: any) {
    return this.emailService.sendEmail(user.id, sendEmailDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.emailService.findAll(user.id);
  }
}
