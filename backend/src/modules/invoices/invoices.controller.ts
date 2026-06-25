import { Controller, Post, Body } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post('lookup')
    lookupInvoice(@Body('code') code: string) {
        return this.invoicesService.lookupInvoice(code);
    }
}