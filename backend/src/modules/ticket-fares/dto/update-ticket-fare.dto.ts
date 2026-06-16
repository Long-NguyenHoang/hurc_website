import { PartialType } from "@nestjs/mapped-types";
import { CreateTicketFareDto } from "./create-ticket-fare.dto";

export class UpdateTicketFareDto extends PartialType(CreateTicketFareDto) { }