import { ILocation } from "../models/Location";
import { LocationRepository } from "../repositories/Location/LocationRepository";

export const LocationService = {
    create: async(location: ILocation) => {
        if (!location) return;
        return LocationRepository.create(location)
    }
};