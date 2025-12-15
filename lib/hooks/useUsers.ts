"use client";

import type { UsersType } from '../type/Users';
import { useEffect, useState } from "react";
import { USERS } from "../data/users";

const useUsers = () => {
  const [users, setUsers] = useState<UsersType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setIsLoading(true);

    try {
      setUsers(USERS);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error loading dummy data");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { users, isLoading, error };
};

export default useUsers;
