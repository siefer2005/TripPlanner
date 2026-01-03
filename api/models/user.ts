import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

export interface IUser {
    id?: string;
    googleId: string;
    name: string;
    email: string;
    photo?: string;
    token?: string;
    password?: string;
    createdAt?: Date;
    updatedAt?: Date;
    _id?: string;
}

export default class User {
    data: IUser;
    _id?: string;
    email: string;

    constructor(data: IUser) {
        this.data = data;
        this.email = data.email;
        if (data._id) this._id = data._id;
    }

    static async findOne(queryObj: { googleId?: string; email?: string }) {
        if (queryObj.googleId) {
            const q = query(collection(db, 'users'), where("googleId", "==", queryObj.googleId));
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;
            const docSnap = snapshot.docs[0];
            const userData = docSnap.data() as IUser;
            return new User({ ...userData, _id: docSnap.id });
        }

        if (queryObj.email) {
            const q = query(collection(db, 'users'), where("email", "==", queryObj.email));
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;
            const docSnap = snapshot.docs[0];
            const userData = docSnap.data() as IUser;
            return new User({ ...userData, _id: docSnap.id });
        }

        return null;
    }

    static async findById(id: string) {
        const q = query(collection(db, 'users'), where("__name__", "==", id));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const docSnap = snapshot.docs[0];
        const userData = docSnap.data() as IUser;
        return new User({ ...userData, _id: docSnap.id });
    }

    async save() {
        if (this._id) {
            // Update logic if needed, but for google login usually creates new
            return this;
        }
        const usersRef = collection(db, 'users');
        const docRef = await addDoc(usersRef, {
            ...this.data,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        this._id = docRef.id;
        this.data._id = docRef.id;
        return this;
    }
}
