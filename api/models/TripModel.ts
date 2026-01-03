import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Interfaces
export interface IGeometry {
    lat: number;
    lng: number;
}
export interface IPlace {
    id: string;
    name: string;
    address: string;
    rating: number;
    userRatingCount: number;
    geometry: IGeometry;
    openingHours: any;
    photos: any[];
    website: string;
    reviews: any[];
    phoneNumber: string;
}
export interface IActivity {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    description: string;
    location: IPlace;
}
export interface IItinerary {
    date: string;
    activities: IActivity[];
}
export interface IExpense {
    id: string;
    category: string;
    price: number | string;
    paidBy: string;
    splitBy: string[];
}
export interface ITrip {
    _id?: string;
    tripName: string;
    startDate: string;
    endDate: string;
    startDay: string;
    endDay: string;
    duration: number;
    budget: number;
    travelers: string[]; // Stores IDs
    host: string; // Stores ID
    background: string;
    placesToVisit: IPlace[];
    itinerary: IItinerary[];
    expenses: IExpense[];
    timezone: string;
    createdAt?: Date;
}

export default class Trip {
    data: any;
    _id?: string;

    // Properties accessible on instance
    tripName: string;
    startDate: string;
    endDate: string;
    startDay: string;
    endDay: string;
    timezone: string;
    background: string;
    host: string;
    travelers: any[]; // Can be IDs or Objects
    itinerary: any[];
    expenses: any[];
    placesToVisit: any[];
    budget: any;

    constructor(data: any) {
        this.data = data;
        this._id = data._id;

        // Map properties to 'this' for direct access (e.g. trip.expenses.push)
        this.tripName = data.tripName;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.startDay = data.startDay;
        this.endDay = data.endDay;
        this.timezone = data.timezone;
        this.background = data.background;
        this.host = data.host;
        this.travelers = data.travelers || [];
        this.itinerary = data.itinerary || [];
        this.expenses = data.expenses || [];
        this.placesToVisit = data.placesToVisit || [];
        this.budget = data.budget;
    }

    // Instance Method: save()
    async save() {
        const plainData = {
            tripName: this.tripName,
            startDate: this.startDate,
            endDate: this.endDate,
            startDay: this.startDay,
            endDay: this.endDay,
            timezone: this.timezone,
            background: this.background,
            host: this.host,
            travelers: this.travelers, // NOTE: If populated, this might save full objects back to DB? Mongoose usually safeguards this via Schema. We must be careful.
            // Ideally we only save IDs.
            itinerary: this.itinerary,
            expenses: this.expenses,
            placesToVisit: this.placesToVisit,
            budget: this.budget || null,
        };

        // Ensure we store IDs for Host/Travelers, not full objects if they were populated
        if (Array.isArray(plainData.travelers) && plainData.travelers.length > 0 && typeof plainData.travelers[0] === 'object') {
            plainData.travelers = plainData.travelers.map((t: any) => t._id || t.id);
        }

        if (this._id) {
            // Update
            const docRef = doc(db, 'trips', this._id);
            await setDoc(docRef, plainData, { merge: true });
            return this;
        } else {
            // Create
            const tripsRef = collection(db, 'trips');
            const docRef = await addDoc(tripsRef, { ...plainData, createdAt: new Date() });
            this._id = docRef.id;
            this.data._id = docRef.id;
            return this;
        }
    }

    // Static Method: find(query) with populate support
    static find(queryObj: any) {
        // queryObj example: { $or: [{ host: userId }, { travelers: userId }] }

        return {
            populate: async (path: string, fields?: string) => {
                // 1. Build Firestore Query
                // Firestore doesn't support logical OR across different fields easily in one go for array-contains and equality
                // But we can try 'or()' if V9 SDK supports it (yes it does)
                // However, Mongoose syntax passed is $or: [{host: id}, {travelers: id}]

                let trips: ITrip[] = [];
                const tripsRef = collection(db, 'trips');
                let q;

                if (queryObj.$or) {
                    const conditions = queryObj.$or;
                    // Assuming structure: [{host: userId}, {travelers: userId}]
                    const userId = conditions[0]?.host || conditions[1]?.travelers; // Simplistic extraction

                    if (userId) {
                        // "travelers array-contains userId" covers BOTH cases if we ensure host is always in travelers (which we do in CreateTrip)
                        // But if we want to be strict:
                        q = query(tripsRef, where("travelers", "array-contains", userId));
                    } else {
                        q = query(tripsRef); // Fallback
                    }
                } else {
                    q = query(tripsRef);
                }

                if (q) {
                    const querySnapshot = await getDocs(q);
                    trips = querySnapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id } as ITrip));
                }

                // 2. Populate
                if (path === 'travelers') {
                    for (const trip of trips) {
                        const populatedTravelers = [];
                        if (trip.travelers && Array.isArray(trip.travelers)) {
                            for (const travelerId of trip.travelers) {
                                // travelerId might be string
                                if (typeof travelerId === 'string') {
                                    // Fetch user
                                    const userDocRef = doc(db, 'users', travelerId);
                                    const userSnap = await getDoc(userDocRef);
                                    if (userSnap.exists()) {
                                        const uData = userSnap.data();
                                        populatedTravelers.push({
                                            _id: userSnap.id,
                                            name: uData.name,
                                            email: uData.email,
                                            photo: uData.photo
                                        });
                                    }
                                } else {
                                    populatedTravelers.push(travelerId);
                                }
                            }
                        }
                        // Replace IDs with objects
                        (trip as any).travelers = populatedTravelers;
                    }
                }

                return trips;
            }
        };
    }

    // Static Method: findById
    static async findById(id: string) {
        const docRef = doc(db, 'trips', id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) return null;
        return new Trip({ ...snap.data(), _id: snap.id });
    }

    // Static Method: findByIdAndUpdate
    static async findByIdAndUpdate(id: string, update: any, options: any) {
        const docRef = doc(db, 'trips', id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) return null;

        let data = snap.data() as ITrip; // Current data

        // Handle $push
        if (update.$push) {
            // Case 1: Simple push (placesToVisit)
            if (update.$push.placesToVisit) {
                const newItem = update.$push.placesToVisit;
                if (!data.placesToVisit) data.placesToVisit = [];
                data.placesToVisit.push(newItem);
            }

            // Case 2: Nested Array push: 'itinerary.$[entry].activities': newActivity
            // Key is like: 'itinerary.$[entry].activities'
            const complexKey = Object.keys(update.$push).find(k => k.includes('$[entry]'));
            if (complexKey) {
                const newActivity = update.$push[complexKey];
                // Filter value: arrayFilters: [{ 'entry.date': date }]
                const filter = options.arrayFilters ? options.arrayFilters[0] : null;

                if (filter && filter['entry.date']) {
                    const targetDate = filter['entry.date'];
                    // Find index
                    if (data.itinerary) {
                        const dayIndex = data.itinerary.findIndex((d: any) => d.date === targetDate);
                        if (dayIndex !== -1) {
                            if (!data.itinerary[dayIndex].activities) data.itinerary[dayIndex].activities = [];
                            data.itinerary[dayIndex].activities.push(newActivity);
                        }
                    }
                }
            }
        }

        // Handle $pull
        if (update.$pull) {
            if (update.$pull.placesToVisit) {
                const condition = update.$pull.placesToVisit;
                // condition might be { name: "PlaceName" }
                if (data.placesToVisit) {
                    data.placesToVisit = data.placesToVisit.filter((place: any) => {
                        // Check if place matches condition
                        // Simple equality check for now based on 'name'
                        if (condition.name) {
                            return place.name !== condition.name;
                        }
                        return true;
                    });
                }
            }
        }

        // Save backend
        await setDoc(docRef, data, { merge: true });

        // populate return if needed?
        // Method usually returns the document.
        return new Trip({ ...data, _id: id });
    }

    // Static Method: findByIdAndDelete
    static async findByIdAndDelete(id: string) {
        const docRef = doc(db, 'trips', id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) return null;

        await deleteDoc(docRef);
        return { _id: id, ...snap.data() };
    }
}
