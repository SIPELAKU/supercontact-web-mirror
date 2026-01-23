import { useEffect, useState } from "react";
import { RoleType } from "../type/Role";

const useRoles = () => {
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/proxy/roles");
      const data = await response.json();

      if (!response.ok) {
        setError("Error");
        throw new Error("Error");
      }

      setRoles(data?.data);
    } catch (error: unknown) {
      console.error(error);
      if (error) {
        throw new Error("Error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { roles, isLoading, error };
};

export default useRoles;
