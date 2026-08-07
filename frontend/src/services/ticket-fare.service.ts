import axiosClient from './axiosClient';
import { Media } from './media.service';
import { Station } from './station.service';

export interface TicketFare {
    id: string;
    price: number;
    from_station: Station;
    to_station: Station;
}

export const ticketFareService = {
    getTicketFare: async (from: string, to: string) => {
        return await axiosClient.get('/ticket-fares', { params: { from, to } });
    },
};