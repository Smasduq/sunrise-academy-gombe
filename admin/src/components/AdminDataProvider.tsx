'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import {
  adminApi,
  ApiError,
  ClassOption,
  StaffRecord,
  StudentRecord,
} from '@/lib/api';

type AdminDataContextValue = {
  students: StudentRecord[];
  staff: StaffRecord[];
  classes: ClassOption[];
  studentsLoading: boolean;
  staffLoading: boolean;
  studentsLoaded: boolean;
  staffLoaded: boolean;
  classesLoaded: boolean;
  error: string;
  clearError: () => void;
  loadStudents: (force?: boolean) => Promise<void>;
  loadStaff: (force?: boolean) => Promise<void>;
  loadClasses: (force?: boolean) => Promise<void>;
  setStudents: React.Dispatch<React.SetStateAction<StudentRecord[]>>;
  setStaff: React.Dispatch<React.SetStateAction<StaffRecord[]>>;
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [staffLoaded, setStaffLoaded] = useState(false);
  const [classesLoaded, setClassesLoaded] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [error, setError] = useState('');

  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (!isAuthenticated) {
      setStudents([]);
      setStaff([]);
      setClasses([]);
      setStudentsLoaded(false);
      setStaffLoaded(false);
      setClassesLoaded(false);
    }
  }, [isAuthenticated]);

  const loadClasses = useCallback(
    async (force = false) => {
      if (!isAuthenticated) return;
      if (classesLoaded && !force) return;

      try {
        const list = await adminApi().classes();
        setClasses(list);
        setClassesLoaded(true);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load classes');
      }
    },
    [isAuthenticated, classesLoaded]
  );

  const loadStudents = useCallback(
    async (force = false) => {
      if (!isAuthenticated) return;
      if (studentsLoaded && !force) return;

      setStudentsLoading(true);
      try {
        const list = await adminApi().students();
        setStudents(list);
        setStudentsLoaded(true);
        setError('');
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load students');
      } finally {
        setStudentsLoading(false);
      }
    },
    [isAuthenticated, studentsLoaded]
  );

  const loadStaff = useCallback(
    async (force = false) => {
      if (!isAuthenticated) return;
      if (staffLoaded && !force) return;

      setStaffLoading(true);
      try {
        const list = await adminApi().staff();
        setStaff(list);
        setStaffLoaded(true);
        setError('');
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load staff');
      } finally {
        setStaffLoading(false);
      }
    },
    [isAuthenticated, staffLoaded]
  );

  const value = useMemo(
    () => ({
      students,
      staff,
      classes,
      studentsLoading,
      staffLoading,
      studentsLoaded,
      staffLoaded,
      classesLoaded,
      error,
      clearError: () => setError(''),
      loadStudents,
      loadStaff,
      loadClasses,
      setStudents,
      setStaff,
    }),
    [
      students,
      staff,
      classes,
      studentsLoading,
      staffLoading,
      studentsLoaded,
      staffLoaded,
      classesLoaded,
      error,
      loadStudents,
      loadStaff,
      loadClasses,
    ]
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error('useAdminData must be used within AdminDataProvider');
  }
  return ctx;
}
