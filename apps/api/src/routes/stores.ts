import { Router } from "express";

const stores = [
  {
    id: "1",
    name: "CHESHIRE Bandra",
    address: "14 Linking Road, Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400050",
    phone: "+91 22 4000 1101",
    openingHours: "11:00 AM – 9:00 PM",
    lat: 19.0596,
    lng: 72.8295,
  },
  {
    id: "2",
    name: "CHESHIRE Khan Market",
    address: "32 Khan Market",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110003",
    phone: "+91 11 4000 2202",
    openingHours: "11:00 AM – 9:00 PM",
    lat: 28.6002,
    lng: 77.2269,
  },
  {
    id: "3",
    name: "CHESHIRE Indiranagar",
    address: "100 Feet Road, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    phone: "+91 80 4000 3303",
    openingHours: "11:00 AM – 9:30 PM",
    lat: 12.9784,
    lng: 77.6408,
  },
];

export const storesRouter = Router();

storesRouter.get("/", (req, res) => {
  const city = req.query.city ? String(req.query.city) : null;
  res.json(city ? stores.filter((s) => s.city.toLowerCase() === city.toLowerCase()) : stores);
});
