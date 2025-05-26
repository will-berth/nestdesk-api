

export class SummaryFilterDto {
    start_date?: string;
    end_date?: string;
    assigne_public_id?: string;
    project_public_id?: string;
    sort?: 'ASC' | 'DESC';
    sort_by?: string;
}