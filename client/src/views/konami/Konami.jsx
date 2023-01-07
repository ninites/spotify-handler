import axios from "axios";
import { Button } from "primereact/button";

const Konami = () => {
  const konamiList = [
    {
      label: "Unlike albums likés",
      id: "cb19f3cf-93f6-4ecd-ae90-cc08f293d68c",
    },
  ];

  const launchKonami = async (id) => {
    try {
      const url = "/spotify/konami/" + id;
      await axios.get(url);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {konamiList.map((konami, index) => {
        return (
          <Button
            key={index}
            label={konami.label}
            onClick={() => launchKonami(konami.id)}
          />
        );
      })}
    </div>
  );
};

export default Konami;
