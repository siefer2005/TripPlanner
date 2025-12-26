import mongoose, { Document, Schema, Types } from 'mongoose';

/* ----------------------------------
   Interfaces
----------------------------------- */

export interface IReview {
  authorName?: string;
  rating?: number;
  text?: string;
}

export interface IGeometry {
  location: {
    lat: number;
    lng: number;
  };
  viewport: {
    northeast: {
      lat: number;
      lng: number;
    };
    southwest: {
      lat: number;
      lng: number;
    };
  };
}

export interface IActivity {
  date: string;
  name: string;
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
  photos?: string[];
  reviews?: IReview[];
  briefDescription?: string;
  geometry: IGeometry;
}

export interface IItinerary {
  date: string;
  activities: IActivity[];
}

export interface IPlace {
  name: string;
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
  photos?: string[];
  reviews?: IReview[];
  types?: string[];
  formatted_address: string;
  briefDescription?: string;
  geometry: IGeometry;
}

export interface IExpense {
  category: string;
  price: number;
  splitBy: string;
  paidBy: string;
}

export interface ITrip extends Document {
  tripName: string;
  startDate: string;
  endDate: string;
  startDay: string;
  endDay: string;
  timezone?: string;
  background: string;
  host: Types.ObjectId;
  travelers: Types.ObjectId[];
  budget?: number;
  expenses: IExpense[];
  placesToVisit: IPlace[];
  itinerary: IItinerary[];
  createdAt: Date;
}

/* ----------------------------------
   Schemas
----------------------------------- */

const reviewSchema = new Schema<IReview>(
  {
    authorName: String,
    rating: Number,
    text: String,
  },
  { _id: false },
);

const geometrySchema = new Schema<IGeometry>(
  {
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    viewport: {
      northeast: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
      southwest: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
  },
  { _id: false },
);

const activitySchema = new Schema<IActivity>({
  date: { type: String, required: true },
  name: { type: String, required: true },
  phoneNumber: String,
  website: String,
  openingHours: [String],
  photos: [String],
  reviews: [reviewSchema],
  briefDescription: String,
  geometry: { type: geometrySchema, required: true },
});

const itinerarySchema = new Schema<IItinerary>({
  date: { type: String, required: true },
  activities: [activitySchema],
});

const placeSchema = new Schema<IPlace>({
  name: { type: String, required: true },
  phoneNumber: String,
  website: String,
  openingHours: [String],
  photos: [String],
  reviews: [reviewSchema],
  types: [String],
  formatted_address: { type: String, required: true },
  briefDescription: String,
  geometry: { type: geometrySchema, required: true },
});

const expenseSchema = new Schema<IExpense>({
  category: { type: String, required: true },
  price: { type: Number, required: true },
  splitBy: { type: String, required: true },
  paidBy: { type: String, required: true },
});

const tripSchema = new Schema<ITrip>({
  tripName: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  startDay: { type: String, required: true },
  endDay: { type: String, required: true },
  timezone: String,
  background: { type: String, required: true },
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  travelers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  budget: Number,
  expenses: [expenseSchema],
  placesToVisit: [placeSchema],
  itinerary: [itinerarySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* ----------------------------------
   Model
----------------------------------- */

const Trip = mongoose.model<ITrip>('Trip', tripSchema);

export default Trip;
