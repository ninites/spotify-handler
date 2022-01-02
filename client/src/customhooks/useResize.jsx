import { useEffect, useState } from 'react';
// TODO
const useResize = (elements) => {
  const [sizes, setSizes] = useState([]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      console.log(entries[0].contentRect);
    });

    elements.forEach((element) => {
      observer.observe(element.current);
    });

    return () => {
      elements.forEach((element) => {
        observer.unobserve(element.current);
      });
    };
  }, [elements]);

  return sizes;
};

export default useResize;
