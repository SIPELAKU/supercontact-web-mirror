import { useEffect, useState } from "react";
import { CompanyType } from "../types/Company";

const useCompany = () => {
  const [company, setCompany] = useState<CompanyType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/proxy/company");
      const data = await response.json();

      if (!response.ok) {
        setError("Error");
        throw new Error("Error");
      }

      setCompany(data?.data || []);
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

  return { company, isLoading, error };
};

export default useCompany;
