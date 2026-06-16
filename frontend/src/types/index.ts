// Navigation
export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

// Hero
export interface HeroSlide {
  id: number;
  image: string;
  alt: string;
  title: string;
  subtitle: string;
}

// Stats
export interface Stat {
  id: number;
  value: string;
  label: string;
  icon: string;
}

// Program / Academic
export interface Program {
  id: number;
  title: string;
  description: string;
  icon: string;
  level: 'nursery' | 'primary';
  ages: string;
  subjects: string[];
}

// News & Events
export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  slug: string;
}

export interface EventItem {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
}

// Gallery
export type GalleryCategory = 'all' | 'classrooms' | 'events' | 'activities' | 'campus';

export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: GalleryCategory;
  width: number;
  height: number;
}

// Staff
export interface StaffMember {
  id: number;
  name: string;
  role: string;
  department: string;
  image: string;
  qualification: string;
  bio?: string;
  isHeadmaster?: boolean;
}

// Testimonial
export interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

// Value
export interface CoreValue {
  id: number;
  title: string;
  description: string;
  icon: string;
}

// FAQ
export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

// Achievement
export interface Achievement {
  id: number;
  title: string;
  year: string;
  description: string;
  icon: string;
}

// Contact Form
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// Admission Form
export interface AdmissionFormData {
  studentName: string;
  dateOfBirth: string;
  gender: string;
  level: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  previousSchool: string;
  message: string;
}
