"use client";

import { DepartmentsType } from '../type/Departments';
import { useEffect, useState } from "react";
import { DepartementDatas } from "../data/departments";

const useDepartments = () => {
  const [departments, setDepartments] = useState<DepartmentsType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setIsLoading(true);

    try {
      setDepartments(DepartementDatas);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error loading dummy data Departments list");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { departments, isLoading, error };
};

export default useDepartments;
