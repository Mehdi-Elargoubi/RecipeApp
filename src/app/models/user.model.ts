export interface User {
  uid: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  photoURL?: string | null;
  photoBase64?: string; // Add this line

//   displayName?: string | null;
//   roles?: string[];
//   createdAt?: string | number | Date;
}

// auth.service.ts ou user-data.model.ts
export interface UserData {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  email: string;
  password: string;
  photoBase64?: string;

}

