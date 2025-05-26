import { SummaryFilterDto } from "src/tickets/dto/summary-filter.dto";

export const TICKET_SERVICE = 'TICKET_SERVICE';

export interface ITicketService {
    findSummary(filter: SummaryFilterDto): Promise<any>;
}
  