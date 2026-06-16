import {
  NavLink, HeroSlide, Stat, Program, NewsItem, EventItem,
  GalleryImage, StaffMember, CoreValue, FAQ, Achievement, Testimonial
} from '@/types';

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Academics', href: '/academics' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'News & Events', href: '/news' },
  { label: 'Staff', href: '/staff' },
  { label: 'Contact', href: '/contact' },
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image: '/images/school-photo.jpeg',
    alt: 'Sunrise Academy Gombe campus entrance',
    title: 'Nurturing Minds,\nShaping Futures',
    subtitle: 'A premium nursery and primary school in Gombe State',
  },
  {
    id: 2,
    image: '/images/student.jpeg',
    alt: 'Sunrise Academy Gombe student',
    title: 'Excellence in\nEvery Classroom',
    subtitle: 'Experienced teachers dedicated to your child\'s academic success',
  },
  {
    id: 3,
    image: '/images/hero-3.png',
    alt: 'Sunrise Academy outdoor activities',
    title: 'Where Learning\nMeets Joy',
    subtitle: 'A holistic environment that develops brilliant, confident children',
  },
];

export const STATS: Stat[] = [
  { id: 1, value: '1,200+', label: 'Students Enrolled', icon: 'students' },
  { id: 2, value: '80+', label: 'Qualified Teachers', icon: 'teachers' },
  { id: 3, value: '40+', label: 'Classrooms', icon: 'classrooms' },
  { id: 4, value: '15+', label: 'Years of Excellence', icon: 'trophy' },
];

export const PROGRAMS: Program[] = [
  {
    id: 1,
    title: 'Nursery School',
    level: 'nursery',
    ages: 'Ages 2 – 5',
    description: 'Our nursery programme provides a warm, stimulating environment where young learners develop social skills, creativity, and a love for learning through play-based education.',
    icon: 'nursery',
    subjects: ['Literacy & Phonics', 'Numeracy', 'Creative Arts', 'Music & Movement', 'Social Development'],
  },
  {
    id: 2,
    title: 'Primary School',
    level: 'primary',
    ages: 'Ages 6 – 11',
    description: 'Our primary school builds a strong academic foundation with a rich curriculum that fosters critical thinking, problem solving, and a passion for knowledge.',
    icon: 'primary',
    subjects: ['English Language', 'Mathematics', 'Basic Science', 'Social Studies', 'Civic Education', 'Computer Studies'],
  },
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 1,
    title: 'Sunrise Academy Students Excel in State Science Competition',
    excerpt: 'Our brilliant students claimed top honours at the 2025 Gombe State Science and Technology Fair, winning gold in three categories.',
    date: '2025-05-15',
    category: 'Achievement',
    image: '/images/news-1.png',
    slug: 'students-excel-science-competition',
  },
  {
    id: 2,
    title: 'New Computer Laboratory Commissioned',
    excerpt: 'We are proud to unveil our state-of-the-art computer laboratory equipped with 50 modern workstations to enhance digital literacy.',
    date: '2025-04-20',
    category: 'News',
    image: '/images/news-2.png',
    slug: 'new-computer-laboratory-commissioned',
  },
  {
    id: 3,
    title: 'Annual Inter-House Sports Competition 2025',
    excerpt: 'The annual sports fiesta brought together all four houses in exciting competitions fostering teamwork, sportsmanship, and school pride.',
    date: '2025-03-10',
    category: 'Event',
    image: '/images/news-3.png',
    slug: 'annual-inter-house-sports-2025',
  },
  {
    id: 4,
    title: 'Parent-Teacher Forum Highlights Academic Progress',
    excerpt: 'The second-term parent-teacher forum showcased remarkable academic growth and outlined plans for further improving student outcomes.',
    date: '2025-02-28',
    category: 'News',
    image: '/images/news-4.png',
    slug: 'parent-teacher-forum',
  },
];

export const EVENTS: EventItem[] = [
  {
    id: 1,
    title: 'Third Term Resumption',
    date: '2025-09-08',
    time: '8:00 AM',
    location: 'Sunrise Academy Campus',
    description: 'Third term begins. All students are expected to resume punctually in full school uniform.',
    category: 'Academic',
  },
  {
    id: 2,
    title: 'Annual Day / Graduation Ceremony',
    date: '2025-11-22',
    time: '10:00 AM',
    location: 'School Assembly Hall',
    description: 'Celebrate academic achievements and graduation of our outstanding students across all levels.',
    category: 'Ceremony',
  },
  {
    id: 3,
    title: 'Open Day / School Tour',
    date: '2025-10-04',
    time: '9:00 AM – 2:00 PM',
    location: 'Sunrise Academy Campus',
    description: 'Prospective parents and students are invited to tour our facilities and meet our dedicated teachers.',
    category: 'Admissions',
  },
];

export const GALLERY_IMAGES: GalleryImage[] = [
  { id: 1, src: '/images/gallery-classroom-1.png', alt: 'Modern classroom at Sunrise Academy', category: 'classrooms', width: 800, height: 600 },
  { id: 2, src: '/images/gallery-classroom-2.png', alt: 'Computer lab session', category: 'classrooms', width: 800, height: 600 },
  { id: 3, src: '/images/gallery-event-1.png', alt: 'Annual Day ceremony', category: 'events', width: 800, height: 600 },
  { id: 4, src: '/images/gallery-event-2.png', alt: 'Inter-house sports competition', category: 'events', width: 800, height: 600 },
  { id: 5, src: '/images/gallery-activity-1.png', alt: 'Students in science lab', category: 'activities', width: 800, height: 600 },
  { id: 6, src: '/images/gallery-activity-2.png', alt: 'Art and craft session', category: 'activities', width: 800, height: 600 },
  { id: 7, src: '/images/gallery-classroom-3.png', alt: 'Library reading session', category: 'classrooms', width: 800, height: 600 },
  { id: 8, src: '/images/gallery-event-3.png', alt: 'Cultural day celebration', category: 'events', width: 800, height: 600 },
  { id: 9, src: '/images/gallery-activity-3.png', alt: 'Debate competition', category: 'activities', width: 800, height: 600 },
];

export const STAFF_MEMBERS: StaffMember[] = [
  {
    id: 1,
    name: 'Dr. Aisha Mohammed',
    role: 'Headmaster',
    department: 'Administration',
    image: '/images/staff-principal.svg',
    qualification: 'PhD in Educational Administration, ABU Zaria',
    bio: 'Dr. Aisha Mohammed brings over 20 years of experience in educational leadership, transforming Sunrise Academy into one of the leading schools in Gombe State.',
    isHeadmaster: true,
  },
  {
    id: 2,
    name: 'Mr. Ibrahim Aliyu',
    role: 'Deputy Headmaster (Academics)',
    department: 'Administration',
    image: '/images/staff-2.svg',
    qualification: 'M.Ed. Curriculum Studies, University of Maiduguri',
  },
  {
    id: 3,
    name: 'Mrs. Fatima Usman',
    role: 'Head of Primary School',
    department: 'Primary',
    image: '/images/staff-3.svg',
    qualification: 'B.Ed. Primary Education, Federal College of Education',
  },
  {
    id: 4,
    name: 'Mr. Yakubu Adamu',
    role: 'Mathematics Teacher',
    department: 'Primary',
    image: '/images/staff-4.svg',
    qualification: 'B.Sc. Mathematics, Gombe State University',
  },
  {
    id: 5,
    name: 'Mrs. Grace Tanko',
    role: 'English Language Teacher',
    department: 'Primary',
    image: '/images/staff-5.svg',
    qualification: 'B.A. English, University of Jos',
  },
  {
    id: 6,
    name: 'Mr. Hassan Bello',
    role: 'Basic Science Teacher',
    department: 'Primary',
    image: '/images/staff-6.svg',
    qualification: 'B.Sc. Biology, Bayero University Kano',
  },
  {
    id: 7,
    name: 'Miss Zainab Suleiman',
    role: 'Nursery Class Teacher',
    department: 'Nursery',
    image: '/images/staff-7.svg',
    qualification: 'NCE Early Childhood Education',
  },
  {
    id: 8,
    name: 'Mr. Emmanuel Danjuma',
    role: 'ICT Teacher',
    department: 'Primary',
    image: '/images/staff-8.svg',
    qualification: 'B.Sc. Computer Science, Gombe State University',
  },
];

export const CORE_VALUES: CoreValue[] = [
  { id: 1, title: 'Excellence', description: 'We pursue the highest standards in academics, character, and personal development.', icon: 'star' },
  { id: 2, title: 'Integrity', description: 'Honesty, transparency, and ethical conduct are at the heart of everything we do.', icon: 'integrity' },
  { id: 3, title: 'Innovation', description: 'We embrace creativity and technology to prepare students for a rapidly changing world.', icon: 'innovation' },
  { id: 4, title: 'Inclusivity', description: 'Every child is valued, respected, and given equal opportunity to flourish.', icon: 'inclusivity' },
  { id: 5, title: 'Discipline', description: 'We cultivate self-discipline, responsibility, and a strong work ethic in all students.', icon: 'discipline' },
  { id: 6, title: 'Community', description: 'We foster a strong partnership between students, parents, staff, and the wider community.', icon: 'community' },
];

export const FAQS: FAQ[] = [
  {
    id: 1,
    question: 'What are the admission requirements for new students?',
    answer: 'Requirements vary by level. For Nursery 1 & 2, children should be at least 2 years old with a birth certificate and immunisation card. For Primary, students also need their Nursery School Report (if applicable). All applicants must complete the admission form and may be required to sit an entrance assessment.',
  },
  {
    id: 2,
    question: 'What is the school fees structure?',
    answer: 'School fees vary by level and term. Please contact our admissions office or visit the school for the current fee schedule. We offer a transparent fee structure with no hidden charges.',
  },
  {
    id: 3,
    question: 'Does the school offer bursaries or scholarships?',
    answer: 'Yes, we offer merit-based scholarships to exceptionally talented students. We also consider partial bursaries for deserving cases. Please speak with our admissions office for details.',
  },
  {
    id: 4,
    question: 'What extracurricular activities are available?',
    answer: 'We offer a wide range of activities including football, basketball, volleyball, debate club, science club, drama, music, cultural dance, scouts, and more. We believe in holistic development.',
  },
  {
    id: 5,
    question: 'Is there a school bus service?',
    answer: 'Yes, we provide safe, reliable school bus services covering major areas in Gombe town and Akko LGA. Contact the school office for route details and fees.',
  },
  {
    id: 6,
    question: 'How do I track my child\'s academic progress?',
    answer: 'We issue detailed academic reports every term. We also hold parent-teacher forums each term. Parents can reach teachers directly via the school\'s communication channels for regular updates.',
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 1, title: 'Best School in Akko LGA', year: '2024', description: 'Awarded by Akko LGA Education Board for outstanding academic performance.', icon: 'trophy' },
  { id: 2, title: 'State Science Fair Gold Award', year: '2024', description: 'Our students clinched gold at the Gombe State Science and Technology Fair.', icon: 'science_fair' },
  { id: 3, title: 'Pupils\'s Excellence Award', year: '2023', description: 'Recognised for outstanding academic achievement across our nursery and primary pupils.', icon: 'waec' },
  { id: 4, title: 'ISO Certified School', year: '2022', description: 'Recognised for maintaining international standards in educational management and quality.', icon: 'iso' },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Alhaji Musa Adamu',
    role: 'Parent of Primary 6 Student',
    quote: 'Sunrise Academy has completely transformed my son. The teachers are dedicated, the environment is safe, and the academic results speak for themselves. I highly recommend this school.',
    avatar: '/images/testimonial-1.svg',
  },
  {
    id: 2,
    name: 'Mrs. Rebecca James',
    role: 'Parent of Primary 5 Student',
    quote: 'What I love most is how the school balances academics with character development. My daughter is not just brilliant — she is confident and kind. That\'s the Sunrise difference.',
    avatar: '/images/testimonial-2.svg',
  },
  {
    id: 3,
    name: 'Mr. Abdullahi Garba',
    role: 'Parent of Nursery Student',
    quote: 'From day one, the nursery staff made my child feel at home. The learning environment is colourful, safe, and engaging. My child actually looks forward to school every morning!',
    avatar: '/images/testimonial-3.svg',
  },
];
