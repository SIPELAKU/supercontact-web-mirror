import { useEffect, useState } from "react";
import { CompaniesType } from "../type/Companies";

const useCompanies = () => {
  const [companies, setCompanies] = useState<CompaniesType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/companies");
      const data = await response.json();

      if (!response.ok) {
        setError("Error");
        throw new Error("Error");
      }

      setCompanies(data?.data);
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

  return { companies, isLoading, error };
};

export default useCompanies;
