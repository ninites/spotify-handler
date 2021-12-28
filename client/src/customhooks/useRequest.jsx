import { useEffect, useState } from "react";
import axios from "axios";

const useRequest = (method, url, forceRefresh) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setisLoading] = useState(false);

  useEffect(() => {
    let isSubscribe = true;
    setisLoading(true);
    const fetchData = async () => {
      try {
        const result = await axios[method](url);
        if (isSubscribe) {
          setData(result.data);
          setisLoading(false);
        }
      } catch (err) {
        if (isSubscribe) {
          setError(err);
          setData([]);
        }
      }
    };

    if (isSubscribe) {
      fetchData();
    }

    return () => {
      isSubscribe = false;
    };
  }, [url, method, forceRefresh]);

  return { data, error, isLoading };
};

export default useRequest;
